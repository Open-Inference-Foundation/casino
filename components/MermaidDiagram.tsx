'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidDiagramProps {
  code: string;
}

let mermaidInitialized = false;

export default function MermaidDiagram({ code }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !code.trim()) return;

    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;

        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'neutral',
            securityLevel: 'loose',
            fontFamily: 'inherit',
          });
          mermaidInitialized = true;
        }

        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, code.trim());

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Invalid diagram syntax');
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [code]);

  if (error) {
    return (
      <div className="my-3 p-3 rounded bg-[var(--color-error-light)] text-[var(--color-error)] text-xs font-mono">
        <div className="font-semibold mb-1">Diagram syntax error</div>
        <pre className="whitespace-pre-wrap">{error}</pre>
        <pre className="mt-2 opacity-70 whitespace-pre-wrap">{code}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-3 overflow-x-auto rounded-lg bg-[var(--color-surface)] p-4 [&>svg]:max-w-full [&>svg]:h-auto"
    />
  );
}
