export interface UserHealthData {
  sessionId: string;
  age: number;
  gender: '남성' | '여성';
  healthText: string;       // 건강검진 OCR 텍스트 or 수기 입력
  imageBase64?: string;     // 건강검진지 이미지 (optional)
}

export interface DiseaseResult {
  rank: number;
  name: string;             // 질병명 (한국어)
  kcdCode: string;          // KCD 코드
  risk: 'high' | 'medium' | 'low';
  riskScore: number;        // 0-100
  description: string;
  preventionTips: string[];
}

export interface InsuranceGap {
  diseaseName: string;
  kcdCode: string;
  covered: boolean;
  coverageAmount?: string;
  gap?: string;             // 미보장 내용
}

export interface InsuranceAnalysisResult {
  sessionId: string;
  overallScore: number;     // 0-100 (높을수록 보장 잘 됨)
  diseases: DiseaseResult[];
  gaps: InsuranceGap[];
  recommendations: string[];
  summary: string;
}

export interface AnalysisStep {
  id: number;
  label: string;
  sublabel: string;
  completed: boolean;
  active: boolean;
}
