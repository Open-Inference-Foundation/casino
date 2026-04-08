export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-light)] flex items-center justify-center mb-4 text-2xl">
        🏗️
      </div>
      <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">
        Your preview will appear here
      </h3>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-xs leading-relaxed">
        Describe the app you want to build in the chat, and Casino will deploy it live.
      </p>
    </div>
  );
}
