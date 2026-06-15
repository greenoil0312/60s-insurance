import type { DiseaseResult } from '@/types';

/**
 * 건강검진 결과 텍스트를 기반으로 60대 위험 직환 TOP 3을 예측하는 Gemini 프롬프트
 */
export function buildDiseasePrompt(healthText: string, age: number, gender: string): string {
  return `당신은 경험 많은 한국 의료 진단 전문 AI입니다.

[환자 정보]
- 나이: ${age}세
- 성별: ${gender}

[건강검진 결과 / 자연어 병력]
${healthText}

[지시사항]
1. 위 정보를 분석하여 이 환자가 60대 이후 걸릴 가능성이 높은 질환 TOP 3를 예측하세요.
2. 반드시 다음 JSON 형식으로만 응답하세요 (다른 텍스트 추가 금지):

\`\`\`json
[
  {
    "rank": 1,
    "name": "질병명 (한국어)",
    "kcdCode": "KCD 코드 (ex: I20)",
    "risk": "high | medium | low",
    "riskScore": 85,
    "description": "예측 근거 (단라지 1~2문장)",
    "preventionTips": ["예방법 1문장", "예방법 2문장"]
  }
]
\`\`\`

답변은 잘못된 형식 없이 JSON 배열만 출력하세요.`;
}

/**
 * 보험증권 OCR 텍스트와 예측 질환 목록을 비교하여 Gap 분석
 */
export function buildInsurancePrompt(insuranceText: string, diseases: DiseaseResult[]): string {
  const diseaseList = diseases.map(d => `- ${d.name} (${d.kcdCode})`).join('\n');

  return `당신은 대한민국 보험 보장 분석 전문 AI입니다.

[예측된 60대 위험 질환 목록]
${diseaseList}

[보험증권 내용 (OCR 텍스트)]
${insuranceText}

[지시사항]
1. 보험증권은 한국어이지만 분석 결과는 한국어로 작성하세요.
2. 예측 질환별로 보험이 커버하는지 확인하고, 미보장(Gap)이 있으면 명확히 발견하세요.
3. 종합 보장 점수를 0~100 사이로 산정하세요 (100점 = 완벽 보장).
4. 반드시 다음 JSON 형식으로만 응답하세요:

\`\`\`json
{
  "overallScore": 72,
  "gaps": [
    {
      "diseaseName": "질병명",
      "kcdCode": "KCD코드",
      "covered": false,
      "gap": "미보장 상세 설명"
    }
  ],
  "recommendations": ["추가 가입 권고 보험 유형", "갱 해소 방법"],
  "summary": "종합 평가 요약 (한국어, 2~3문장)"
}
\`\`\`

JSON만 출력하세요.`;
}

/**
 * Gemini 응답에서 JSON 블록을 추출합니다.
 */
export function extractJsonFromText<T>(text: string): T | null {
  try {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) return JSON.parse(match[1]);
    return JSON.parse(text);
  } catch {
    return null;
  }
}
