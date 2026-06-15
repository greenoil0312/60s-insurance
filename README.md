# 60비추보 — 시작 가이드

## 🚀 빠른 시작

### 1. Node.js 설치 (필수)
아직 설치되지 않은 경우 [nodejs.org](https://nodejs.org)에서 LTS 버전을 설치하세요.

### 2. 패키지 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 열어 실제 값으로 교체하세요:

```
# GAS Web App 배포 URL (구글 앱스 스크립트 배포 후 발급)
NEXT_PUBLIC_GAS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# GAS 요청 인증용 API Key (GAS 코드의 API_KEY 변수와 동일값)
GAS_API_KEY=60s_INSURANCE_SECRET_KEY

# Google AI Studio에서 발급한 Gemini API Key
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

### 4. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 📋 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── gemini/route.ts      # Gemini API 프록시 (API Key 보호)
│   │   └── gas-proxy/route.ts   # GAS 프록시 (API Key 서버 주입)
│   ├── layout.tsx               # 루트 레이아웃 (SEO 메타태그)
│   ├── page.tsx                 # 메인 4단계 진단 플로우
│   └── globals.css              # 글로벌 CSS + 디자인 시스템
├── components/
│   ├── TabletLayout.tsx         # 태블릿 최적화 레이아웃 컨테이너
│   ├── StepIndicator.tsx        # 진행 단계 인디케이터
│   ├── ImageUpload.tsx          # 이미지 업로드 + 카메라 촬영
│   ├── ScoreRing.tsx            # 애니메이션 점수 링
│   └── LoadingOverlay.tsx       # AI 분석 중 로딩 화면
├── lib/
│   ├── session.ts               # UUID 세션 관리
│   ├── gas.ts                   # Google Sheets API 클라이언트
│   └── prompts.ts               # Gemini 프롬프트 빌더
└── types/
    └── index.ts                 # TypeScript 타입 정의
```

---

## 🔧 구글 시트 + GAS 설정

1. 구글 스프레드시트 새로 생성
2. 탭 2개: `User_Health_Log`, `Insurance_Match_Log`
3. `확장 프로그램` → `Apps Script` → GAS 코드 붙여넣기
4. `배포` → `새 배포` → 웹 앱 → 액세스: **모든 사용자**
5. 발급된 URL을 `.env.local`의 `NEXT_PUBLIC_GAS_WEB_APP_URL`에 입력

---

## ☁️ Vercel 배포

```bash
# GitHub에 Push 후 Vercel에서 레포지토리 연결
# Vercel 환경 변수에 .env.local 값들 동일하게 입력
```
