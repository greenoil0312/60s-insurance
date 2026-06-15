import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '60비추보 | 60대 추정 질병 보험 매칭 서비스',
  description: '건강검진 결과와 보험증권을 AI로 분석하여 60대 이후 예상 질병 및 보험 보장 공백(Gap)을 진단해 드립니다.',
  keywords: ['60대 보험', '질병 예측', '보험 매칭', '건강검진 분석', '보험 보장 공백'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-white antialiased">
        {children}
      </body>
    </html>
  );
}
