'use client';

interface LoadingOverlayProps {
  message?: string;
  subMessage?: string;
}

export default function LoadingOverlay({
  message = 'AI가 분석 중입니다...',
  subMessage = '걱강검진 결과와 보험증권을 비교하고 있습니다',
}: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-lg">
      <div className="glass-card p-10 flex flex-col items-center gap-6 max-w-sm w-full mx-4">
        {/* 로딩 애니메이션 */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-surface-border" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-teal-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🧠</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-white font-semibold text-lg mb-1">{message}</p>
          <p className="text-white/50 text-sm">{subMessage}</p>
        </div>

        {/* 애니마특 도트 */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
