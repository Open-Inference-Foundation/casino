export default function FlywheelSection() {
  // Flywheel nodes positioned in a circle
  const nodes = [
    { label: 'More Members', angle: 270 },
    { label: 'More Volume', angle: 0 },
    { label: 'Better Rates', angle: 90 },
    { label: 'Cheaper AGENT', angle: 180 },
  ];

  const R = 130; // radius for desktop
  const CX = 200;
  const CY = 200;

  return (
    <section className="px-6 py-16 sm:py-24 max-w-5xl mx-auto">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-3 text-center">
        The Co-op Flywheel
      </h2>
      <p className="text-[var(--color-text-secondary)] text-center mb-12 max-w-xl mx-auto">
        A virtuous cycle where growth makes the system better for everyone.
      </p>

      {/* Mobile: vertical flow */}
      <div className="flex flex-col items-center gap-0 sm:hidden">
        {nodes.map((node, i) => (
          <div key={node.label}>
            <div className="flex items-center gap-3 py-3">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    i % 2 === 0
                      ? 'var(--color-accent)'
                      : 'var(--color-accent-2)',
                }}
              />
              <span className="text-sm font-semibold text-[var(--color-text)]">
                {node.label}
              </span>
            </div>
            {i < nodes.length - 1 && (
              <div className="flex justify-center">
                <svg
                  width="20"
                  height="24"
                  viewBox="0 0 20 24"
                  fill="none"
                  className="text-[var(--color-text-tertiary)]"
                >
                  <path
                    d="M10 2v16M5 14l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
        {/* Loop-back arrow */}
        <div className="flex justify-center">
          <svg
            width="20"
            height="24"
            viewBox="0 0 20 24"
            fill="none"
            className="text-[var(--color-accent)] rotate-180"
          >
            <path
              d="M10 2v16M5 14l5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)] italic mt-4 text-center">
          The more people join, the cheaper it gets.
        </p>
      </div>

      {/* Desktop: SVG circular diagram */}
      <div className="hidden sm:flex justify-center">
        <svg
          viewBox="0 0 400 400"
          width="400"
          height="400"
          className="max-w-full"
        >
          {/* Circular track */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />

          {/* Curved arrows between nodes */}
          {nodes.map((_, i) => {
            const a1 = (nodes[i].angle * Math.PI) / 180;
            const a2 = (nodes[(i + 1) % nodes.length].angle * Math.PI) / 180;
            // Midpoint angle for arc
            const midAngle = a1 + ((a2 - a1 + 2 * Math.PI) % (2 * Math.PI)) / 2;
            const arrowR = R - 8;
            const ax = CX + Math.cos(midAngle) * arrowR;
            const ay = CY + Math.sin(midAngle) * arrowR;
            // Arrow direction tangent
            const tangentAngle = midAngle + Math.PI / 2;
            const arrowSize = 6;
            return (
              <polygon
                key={`arrow-${i}`}
                points={`
                  ${ax + Math.cos(tangentAngle) * arrowSize},${ay + Math.sin(tangentAngle) * arrowSize}
                  ${ax - Math.cos(tangentAngle) * arrowSize},${ay - Math.sin(tangentAngle) * arrowSize}
                  ${ax + Math.cos(midAngle) * arrowSize * 0.8},${ay + Math.sin(midAngle) * arrowSize * 0.8}
                `}
                fill={
                  i % 2 === 0
                    ? 'var(--color-accent)'
                    : 'var(--color-accent-2)'
                }
                opacity="0.6"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node, i) => {
            const a = (node.angle * Math.PI) / 180;
            const x = CX + Math.cos(a) * R;
            const y = CY + Math.sin(a) * R;
            const fillColor =
              i % 2 === 0 ? 'var(--color-accent)' : 'var(--color-accent-2)';
            return (
              <g key={node.label}>
                {/* Node circle */}
                <circle
                  cx={x}
                  cy={y}
                  r="36"
                  fill="var(--color-surface)"
                  stroke={fillColor}
                  strokeWidth="2"
                />
                {/* Label — split into lines if needed */}
                <text
                  x={x}
                  y={y - 5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--color-text)"
                  fontSize="11"
                  fontWeight="600"
                >
                  {node.label.split(' ')[0]}
                </text>
                <text
                  x={x}
                  y={y + 9}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--color-text)"
                  fontSize="11"
                  fontWeight="600"
                >
                  {node.label.split(' ')[1]}
                </text>
              </g>
            );
          })}

          {/* Center tagline */}
          <text
            x={CX}
            y={CY - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--color-text-tertiary)"
            fontSize="11"
            fontStyle="italic"
          >
            The more people join,
          </text>
          <text
            x={CX}
            y={CY + 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--color-text-tertiary)"
            fontSize="11"
            fontStyle="italic"
          >
            the cheaper it gets.
          </text>
        </svg>
      </div>
    </section>
  );
}
