import { BuildStage, StageStatus } from '@/lib/build-stages';

interface PipelineStageProps {
  stage: BuildStage;
  isLast?: boolean;
}

const icons: Record<StageStatus, React.ReactNode> = {
  pending: (
    <span className="w-4 h-4 rounded-full border-2 border-[var(--color-border)]" />
  ),
  active: (
    <span className="w-4 h-4 rounded-full border-2 border-[var(--color-accent)] border-t-transparent spin" />
  ),
  complete: (
    <span className="w-4 h-4 rounded-full bg-[var(--color-success)] flex items-center justify-center">
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  ),
  error: (
    <span className="w-4 h-4 rounded-full bg-[var(--color-error)] flex items-center justify-center">
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <path d="M2 2l4 4M6 2l-4 4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </span>
  ),
  retrying: (
    <span className="w-4 h-4 rounded-full border-2 border-[var(--color-warning,#f59e0b)] border-t-transparent spin" />
  ),
};

export default function PipelineStage({ stage, isLast }: PipelineStageProps) {
  const isActive = stage.status === 'active' || stage.status === 'retrying';
  const isComplete = stage.status === 'complete';
  const isPending = stage.status === 'pending';
  const isRetrying = stage.status === 'retrying';

  return (
    <div className="flex gap-4">
      {/* Left: icon + connector line */}
      <div className="flex flex-col items-center">
        <div className={isActive ? 'stage-pulse' : ''}>{icons[stage.status]}</div>
        {!isLast && (
          <div
            className={`w-0.5 flex-1 mt-1 rounded-full ${
              isComplete ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border)]'
            }`}
            style={{ minHeight: '32px' }}
          />
        )}
      </div>

      {/* Right: label + detail */}
      <div className="pb-6">
        <p
          className={`text-sm font-semibold leading-none mb-1 ${
            isRetrying
              ? 'text-[var(--color-warning,#f59e0b)]'
              : isActive
              ? 'text-[var(--color-accent)]'
              : isComplete
              ? 'text-[var(--color-success)]'
              : isPending
              ? 'text-[var(--color-text-tertiary)]'
              : 'text-[var(--color-error)]'
          }`}
        >
          {stage.label}
        </p>
        <p
          className={`text-xs ${
            isActive || isComplete ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-tertiary)]'
          }`}
        >
          {stage.detail ?? stage.description}
          {isActive && <span className="ml-0.5 stage-pulse">...</span>}
        </p>
      </div>
    </div>
  );
}
