import { BuildStage } from '@/lib/build-stages';
import PipelineStage from './PipelineStage';

interface BuildProgressProps {
  stages: BuildStage[];
}

export default function BuildProgress({ stages }: BuildProgressProps) {
  const activeStage = stages.find((s) => s.status === 'active');

  return (
    <div className="flex flex-col items-center justify-center h-full px-10">
      <div className="w-full max-w-xs">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-light)] flex items-center justify-center mx-auto mb-3">
            <span className="w-5 h-5 rounded-full border-2 border-[var(--color-accent)] border-t-transparent spin" />
          </div>
          <h3 className="text-base font-semibold text-[var(--color-text)]">Building your app</h3>
          {activeStage && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {activeStage.label} — {activeStage.detail ?? activeStage.description}
            </p>
          )}
        </div>

        {/* Stages */}
        <div>
          {stages.map((stage, i) => (
            <PipelineStage key={stage.id} stage={stage} isLast={i === stages.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
