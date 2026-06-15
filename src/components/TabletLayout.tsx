'use client';

import { ReactNode } from 'react';

interface TabletLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * 태블릿 PC에 최적화된 중앙 정렬 레이아웃 컨테이너.
 * 768px~1280px 해상도 범위에서 최적의 현시 비율을 유지합니다.
 */
export default function TabletLayout({ children, className = '' }: TabletLayoutProps) {
  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col">
      {/* 모바일/태블릿 모두에서 중심 700px 컴테이너 */}
      <div className={`mx-auto w-full max-w-[900px] tablet:px-8 px-4 flex-1 flex flex-col ${className}`}>
        {children}
      </div>
    </div>
  );
}
