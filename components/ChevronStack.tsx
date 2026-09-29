const CHEVRON = "M -22 12 L 0 -14 L 22 12";

const steps = [
  { transform: "translate(70,330) scale(1)", tone: "#2E2E2C" },
  { transform: "translate(150,250) scale(1.4)", tone: "#4A4A48" },
  { transform: "translate(250,160) scale(1.9)", tone: "#7A7A76" },
  { transform: "translate(360,60) rotate(-6) scale(2.6)", tone: "var(--accent)" },
];

/** The ascending-chevron motif. `mono` renders the grey steps white (for the faint background version). */
export function ChevronStack({
  mono = false,
  className,
  width = "100%",
  height = "100%",
}: {
  mono?: boolean;
  className?: string;
  width?: number | string;
  height?: number | string;
}) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 480 420"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      style={{ display: "block", overflow: "visible" }}
    >
      {steps.map((s, i) => (
        <g key={i} transform={s.transform}>
          <path
            d={CHEVRON}
            stroke={mono && i < steps.length - 1 ? "#FFFFFF" : s.tone}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}
    </svg>
  );
}
