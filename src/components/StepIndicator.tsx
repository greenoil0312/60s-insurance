'use client';

interface Step {
  id: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 py-6" role="navigation" aria-label="진행 단계">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          {/* 단계 연결선 */}
          {idx > 0 && (
            <div
              className={`h-[2px] w-12 tablet:w-20 transition-all duration-500 ${
                currentStep > step.id
                  ? 'bg-gradient-to-r from-teal-500 to-brand-500'
                  : 'bg-surface-border'
              }`}
            />
          )}

          {/* 단계 원 + 라벨 */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`step-indicator ${
                currentStep === step.id
                  ? 'active'
                  : currentStep > step.id
                  ? 'completed'
                  : 'pending'
              }`}
              aria-current={currentStep === step.id ? 'step' : undefined}
            >
              {currentStep > step.id ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.id
              )}
            </div>
            <span
              className={`text-xs font-medium whitespace-nowrap transition-colors duration-300 ${
                currentStep === step.id ? 'text-brand-400' : currentStep > step.id ? 'text-teal-400' : 'text-white/25'
              }`}
            >
              {step.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
