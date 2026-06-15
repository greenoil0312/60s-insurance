'use client';

import { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;   // 0-100
  size?: number;   // px
  strokeWidth?: number;
}

export default function ScoreRing({ score, size = 160, strokeWidth = 12 }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 70) return '#2dd4bf';   // teal-400
    if (s >= 40) return '#f59e0b';   // amber
    return '#f87171';                // red
  };

  const getLabel = (s: number) => {
    if (s >= 80) return { text: '우수', bg: 'text-teal-400' };
    if (s >= 60) return { text: '양호', bg: 'text-brand-400' };
    if (s >= 40) return { text: '보통', bg: 'text-amber-400' };
    return { text: '취약', bg: 'text-red-400' };
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 2;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(interval);
        } else {
          setAnimatedScore(current);
        }
      }, 16);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  const label = getLabel(score);
  const color = getColor(animatedScore);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* 내부 글로 효과 */}
        <div
          className="absolute inset-0 rounded-full opacity-20"
          style={{ boxShadow: `0 0 40px ${color}` }}
        />
        <svg width={size} height={size} className="-rotate-90">
          {/* 배경 원 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2d3048"
            strokeWidth={strokeWidth}
          />
          {/* 진행 원 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.05s ease' }}
          />
        </svg>
        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${label.bg}`}>{animatedScore}</span>
          <span className="text-white/40 text-xs mt-1">점 / 100</span>
        </div>
      </div>
      <div className={`text-lg font-semibold ${label.bg}`}>{label.text}</div>
    </div>
  );
}
