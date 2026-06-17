'use client';

import { useState, useCallback, useEffect } from 'react';
import TabletLayout from '@/components/TabletLayout';
import StepIndicator from '@/components/StepIndicator';
import ImageUpload from '@/components/ImageUpload';
import ScoreRing from '@/components/ScoreRing';
import LoadingOverlay from '@/components/LoadingOverlay';
import { getOrCreateSessionId } from '@/lib/session';
import { buildDiseasePrompt, buildInsurancePrompt, extractJsonFromText } from '@/lib/prompts';
import { appendToSheet } from '@/lib/gas';
import type { DiseaseResult, InsuranceAnalysisResult } from '@/types';

const STEPS = [
  { id: 1, label: '정보입력' },
  { id: 2, label: '건강검진' },
  { id: 3, label: '보험증권' },
  { id: 4, label: '분석결과' },
];

const RISK_COLOR: Record<string, string> = {
  high: 'text-red-400 bg-red-500/10 border-red-500/30',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  low: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
};
const RISK_LABEL: Record<string, string> = { high: '높음', medium: '보통', low: '낮음' };

export default function HomePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState({ msg: '', sub: '' });

  // Gemini API Key 설정 상태
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Step 1
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'남성' | '여성' | ''>('');

  // Step 2
  const [healthImage, setHealthImage] = useState('');
  const [healthImageMime, setHealthImageMime] = useState('image/jpeg');
  const [healthTextInput, setHealthTextInput] = useState('');
  const [diseases, setDiseases] = useState<DiseaseResult[]>([]);

  // Step 3
  const [insuranceImage, setInsuranceImage] = useState('');
  const [insuranceImageMime, setInsuranceImageMime] = useState('image/jpeg');

  // Step 4
  const [result, setResult] = useState<InsuranceAnalysisResult | null>(null);

  // API Key 마운트 시 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gemini_api_key') || '';
      setGeminiKeyInput(saved);
      // 키가 없으면 자동으로 설정 패널 열기
      if (!saved) {
        setShowSettings(true);
      }
    }
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem('gemini_api_key', geminiKeyInput);
    alert('Gemini API Key가 저장되었습니다.');
    setShowSettings(false);
  };

  /** Gemini API 호출 공통 함수 */
  const callGemini = useCallback(async (prompt: string, imageBase64?: string, mimeType?: string) => {
    const customKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '';
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gemini-key': customKey
      },
      body: JSON.stringify({ prompt, imageBase64, mimeType }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.text as string;
  }, []);

  /** Step 2 → Step 3: 질병 예측 분석 */
  const analyzeDisease = useCallback(async () => {
    if (!age || !gender) return;
    setLoading(true);
    setLoadingMsg({ msg: 'AI가 건강 데이터를 분석 중입니다', sub: '60대 위험 질환 예측을 구성하고 있습니다' });
    try {
      const inputText = healthTextInput || (healthImage ? '(이미지 첨부 참조)' : '입력된 건강검진 데이터 없음');
      const prompt = buildDiseasePrompt(inputText, Number(age), gender);
      const text = await callGemini(prompt, healthImage || undefined, healthImageMime);
      const parsed = extractJsonFromText<DiseaseResult[]>(text);
      if (parsed) {
        setDiseases(parsed);
        const sessionId = getOrCreateSessionId();
        await appendToSheet({
          sheetName: 'User_Health_Log',
          payload: [new Date().toISOString(), sessionId, `${age}세 ${gender}`, inputText, JSON.stringify(parsed)],
        });
      }
      setStep(3);
    } catch (e) {
      alert('분석 중 오류가 발생했습니다: ' + String(e));
    } finally {
      setLoading(false);
    }
  }, [age, gender, healthImage, healthImageMime, healthTextInput, callGemini]);

  /** Step 3 → Step 4: 보험 매칭 분석 */
  const analyzeInsurance = useCallback(async () => {
    setLoading(true);
    setLoadingMsg({ msg: 'AI가 보험증권을 분석 중입니다', sub: '보장 공백(Gap)을 찾고 평가 점수를 산정하고 있습니다' });
    try {
      const insuranceText = insuranceImage ? '(보험증권 이미지 첨부 참조)' : '보험증권 업로드 없음';
      const prompt = buildInsurancePrompt(insuranceText, diseases);
      const text = await callGemini(prompt, insuranceImage || undefined, insuranceImageMime);
      const parsed = extractJsonFromText<Omit<InsuranceAnalysisResult, 'sessionId' | 'diseases'>>(text);
      if (parsed) {
        const sessionId = getOrCreateSessionId();
        const full: InsuranceAnalysisResult = { ...parsed, sessionId, diseases };
        setResult(full);
        await appendToSheet({
          sheetName: 'Insurance_Match_Log',
          payload: [new Date().toISOString(), sessionId, insuranceText, JSON.stringify(parsed.gaps), parsed.overallScore],
        });
      }
      setStep(4);
    } catch (e) {
      alert('보험 분석 중 오류: ' + String(e));
    } finally {
      setLoading(false);
    }
  }, [insuranceImage, insuranceImageMime, diseases, callGemini]);

  const handleRestart = () => {
    setStep(1); setAge(''); setGender('');
    setHealthImage(''); setHealthTextInput('');
    setInsuranceImage(''); setDiseases([]); setResult(null);
  };

  return (
    <TabletLayout>
      {loading && <LoadingOverlay message={loadingMsg.msg} subMessage={loadingMsg.sub} />}

      {/* 헤더 */}
      <header className="pt-8 pb-2 text-center relative">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="absolute right-2 top-8 text-white/50 hover:text-white transition-colors p-2"
          aria-label="설정"
          title="API 키 설정"
        >
          ⚙️
        </button>

        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-4">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow" />
          <span className="text-brand-300 text-xs font-medium">무료 AI 헬스 진단</span>
        </div>
        <h1 className="text-3xl tablet:text-4xl font-extrabold tracking-tight">
          <span className="text-gradient">60비추보</span>
        </h1>
        <p className="text-white/50 text-sm mt-2">60대 예상 질병 · 보험 보장 공백 진단</p>

        {/* API Key 입력 패널 */}
        {showSettings && (
          <div className="glass-card p-5 mt-4 text-left border-brand-500/30">
            <h3 className="text-sm font-bold text-brand-300 mb-2">⚙️ 개발자 환경 설정</h3>
            <p className="text-xs text-white/60 mb-3">AI 기능을 실행하기 위해 Gemini API Key를 입력하세요. 브라우저에만 안전하게 보관됩니다.</p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="AI Studio에서 발급받은 Gemini API Key 입력"
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                className="flex-1 bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={handleSaveKey}
                className="bg-brand-600 hover:bg-brand-500 text-xs text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                저장
              </button>
            </div>
            <p className="text-[10px] text-teal-400/80 mt-2">💡 Gemini API Key는 여기에 직접 입력하시고, 구글 시트 연동 설정(Service Account)은 백엔드 서버 환경에 자동으로 세팅되어 구글 시트에 바로 기록됩니다.</p>
          </div>
        )}
      </header>

      <StepIndicator steps={STEPS} currentStep={step} />


      {/* ===== STEP 1: 기본 정보 ===== */}
      {step === 1 && (
        <section className="flex-1 flex flex-col justify-center gap-6 pb-10 animate-step-in">
          <div className="glass-card p-6 tablet:p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-2xl">👤</span> 기본 정보 입력
            </h2>
            <div className="mb-6">
              <label htmlFor="age-input" className="block text-sm font-medium text-white/70 mb-2">나이</label>
              <input
                id="age-input"
                type="number"
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="나이를 입력하세요 (ex: 52)"
                className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-white/25"
              />
            </div>
            <div className="mb-8">
              <p className="text-sm font-medium text-white/70 mb-3">성별</p>
              <div className="grid grid-cols-2 gap-3">
                {(['남성', '여성'] as const).map((g) => (
                  <button
                    key={g}
                    id={`gender-${g}`}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-4 rounded-xl text-lg font-semibold transition-all duration-200 active:scale-95 ${
                      gender === g
                        ? 'bg-brand-500 text-white shadow-glow'
                        : 'bg-surface-elevated border border-surface-border text-white/60 hover:border-brand-500'
                    }`}
                  >
                    {g === '남성' ? '♂ 남성' : '♀ 여성'}
                  </button>
                ))}
              </div>
            </div>
            <button
              id="step1-next"
              type="button"
              disabled={!age || !gender}
              onClick={() => setStep(2)}
              className="btn-primary w-full"
            >
              다음 단계로 →
            </button>
          </div>
        </section>
      )}

      {/* ===== STEP 2: 건강 데이터 ===== */}
      {step === 2 && (
        <section className="flex-1 flex flex-col gap-5 pb-10 animate-step-in">
          <div className="glass-card p-6 tablet:p-8">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <span className="text-2xl">🏥</span> 건강검진 데이터
            </h2>
            <p className="text-white/50 text-sm mb-6">AI가 이미지를 읽어 분석하거나, 직접 텍스트로 입력하세요</p>
            <ImageUpload
              id="health-image-upload"
              label="건강검진지 사진 업로드"
              sublabel="JPG, PNG 등 이미지 파일을 업로드하거나 카메라로 직접 촬영하세요"
              onCapture={(b64, mime) => { setHealthImage(b64); setHealthImageMime(mime); }}
              preview={healthImage}
            />
            <div className="mt-4">
              <p className="text-white/40 text-xs mb-2 text-center">또는 직접 텍스트 입력</p>
              <textarea
                id="health-text-input"
                value={healthTextInput}
                onChange={(e) => setHealthTextInput(e.target.value)}
                placeholder="예: 혈당 108, 콜레스테롤 230, 고혈압 1단계, 3개월 전 위염 진단..."
                className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500 transition-all placeholder:text-white/25 resize-none min-h-[100px]"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button id="step2-back" type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← 이전</button>
            <button
              id="step2-analyze"
              type="button"
              disabled={!healthImage && !healthTextInput}
              onClick={analyzeDisease}
              className="btn-primary flex-[2]"
            >
              질환 예측 분석하기
            </button>
          </div>
        </section>
      )}

      {/* ===== STEP 3: 보험증권 ===== */}
      {step === 3 && (
        <section className="flex-1 flex flex-col gap-5 pb-10 animate-step-in">
          {diseases.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">AI 예측 60대 위험 질환</h3>
              <div className="space-y-3">
                {diseases.map((d) => (
                  <div key={d.kcdCode} className={`flex items-start gap-3 p-3 rounded-xl border ${RISK_COLOR[d.risk]}`}>
                    <div className="min-w-[28px] h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-white/10">{d.rank}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{d.name}</span>
                        <span className="text-xs opacity-60">{d.kcdCode}</span>
                        <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-white/10">{RISK_LABEL[d.risk]}</span>
                      </div>
                      <p className="text-xs opacity-70 mt-1">{d.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="glass-card p-6 tablet:p-8">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <span className="text-2xl">📜</span> 보험증권 업로드
            </h2>
            <p className="text-white/50 text-sm mb-6">현재 보유 중인 보험증권을 AI가 분석합니다. 없으시면 건너뛰고 간략 분석만 받으실 수 있습니다.</p>
            <ImageUpload
              id="insurance-image-upload"
              label="보험증권 사진 업로드 (선택)"
              sublabel="보험증권 또는 보장내역서 핵심 부분을 촬영해 업로드해 주세요"
              onCapture={(b64, mime) => { setInsuranceImage(b64); setInsuranceImageMime(mime); }}
              preview={insuranceImage}
            />
          </div>
          <div className="flex gap-3">
            <button id="step3-back" type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">← 이전</button>
            <button
              id="step3-analyze"
              type="button"
              onClick={analyzeInsurance}
              className="btn-primary flex-[2]"
            >
              보장 공백 분석하기
            </button>
          </div>
        </section>
      )}

      {/* ===== STEP 4: 결과 ===== */}
      {step === 4 && result && (
        <section className="flex-1 flex flex-col gap-5 pb-12 animate-step-in">
          <div className="glass-card p-6 tablet:p-8 flex flex-col items-center">
            <h2 className="text-xl font-bold mb-6">보장 종합 평가</h2>
            <ScoreRing score={result.overallScore} />
            <p className="text-white/60 text-sm mt-6 text-center max-w-sm">{result.summary}</p>
          </div>

          {result.gaps.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">⚠️ 미보장 항목 (Gap)</h3>
              <div className="space-y-3">
                {result.gaps.map((g, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${g.covered ? 'border-teal-500/30 bg-teal-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-bold ${g.covered ? 'text-teal-400' : 'text-red-400'}`}>
                        {g.covered ? '✔ 보장' : '✖ 미보장'}
                      </span>
                      <span className="text-white font-medium text-sm">{g.diseaseName}</span>
                      <span className="text-white/30 text-xs">{g.kcdCode}</span>
                    </div>
                    {!g.covered && g.gap && <p className="text-red-300/70 text-xs mt-1">{g.gap}</p>}
                    {g.covered && g.coverageAmount && <p className="text-teal-300/70 text-xs mt-1">보장 금액: {g.coverageAmount}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.recommendations.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">💡 추천 사항</h3>
              <ul className="space-y-2">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-brand-400 mt-0.5">›</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            id="restart-btn"
            type="button"
            onClick={handleRestart}
            className="btn-secondary w-full"
          >
            ↺ 다시 진단하기
          </button>
        </section>
      )}
    </TabletLayout>
  );
}
