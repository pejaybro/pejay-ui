// @ts-ignore
import "./spinner.css";

export type SpinnerVariant =
  | "ring"
  | "dots"
  | "pulse"
  | "bars"
  | "orbit"
  | "ripple"
  | "dots-ring"
  | "dots-step"
  | "text-dots";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  className?: string;
}

const sizeMap: Record<SpinnerSize, number> = {
  sm: 16,
  md: 24,
  lg: 36,
};

export function Spinner({ variant = "ring", size = "md", className }: SpinnerProps) {
  const px = sizeMap[size];

  /* ── [1] Ring ──────────────────────────────────────────────── */
  if (variant === "ring") {
    return (
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        style={{ animation: "spinner-ring 0.8s linear infinite" }}
      >
        <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" />
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="30 57"
        />
      </svg>
    );
  }

  /* ── [2] Dots ──────────────────────────────────────────────── */
  if (variant === "dots") {
    const dotPx = px * 0.22;
    return (
      <div
        className={className}
        style={{ display: "flex", gap: px * 0.22, alignItems: "center" }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: dotPx,
              height: dotPx,
              borderRadius: "50%",
              background: "currentColor",
              animation: `spinner-dot-fade 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    );
  }

  /* ── [3] Pulse ─────────────────────────────────────────────── */
  if (variant === "pulse") {
    return (
      <div
        className={className}
        style={{
          width: px,
          height: px,
          borderRadius: "50%",
          background: "currentColor",
          animation: "spinner-pulse 1s ease-in-out infinite",
        }}
      />
    );
  }

  /* ── [4] Bars ──────────────────────────────────────────────── */
  if (variant === "bars") {
    const barW = Math.max(2, px * 0.14);
    const barH = px * 0.7;
    return (
      <div
        className={className}
        style={{ display: "flex", gap: barW * 0.9, alignItems: "center", height: px }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: barW,
              height: barH,
              borderRadius: barW,
              background: "currentColor",
              transformOrigin: "center",
              animation: `spinner-bar 1s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
    );
  }

  /* ── [5] Orbit ─────────────────────────────────────────────── */
  if (variant === "orbit") {
    const r = px / 2;
    const orbitR = r * 0.62;
    const dotR = r * 0.18;
    return (
      <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} fill="none" className={className}>
        <circle cx={r} cy={r} r={orbitR} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <g
          style={{
            transformOrigin: `${r}px ${r}px`,
            animation: "spinner-orbit 1s linear infinite",
          }}
        >
          <circle cx={r} cy={r - orbitR} r={dotR} fill="currentColor" />
        </g>
      </svg>
    );
  }

  /* ── [6] Ripple ────────────────────────────────────────────── */
  if (variant === "ripple") {
    const r = px / 2;
    return (
      <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} fill="none" className={className}>
        {[0, 0.5].map((delay, i) => (
          <circle
            key={i}
            cx={r}
            cy={r}
            r={r * 0.9}
            stroke="currentColor"
            strokeWidth="1.5"
            style={{
              transformOrigin: `${r}px ${r}px`,
              animation: `spinner-ripple 1.4s ease-out ${delay}s infinite`,
            }}
          />
        ))}
      </svg>
    );
  }

  /* ── [7] Dots Ring ─────────────────────────────────────────── */
  if (variant === "dots-ring") {
    const dots = [
      { cx: 20, cy: 12 },
      { cx: 17.66, cy: 17.66 },
      { cx: 12, cy: 20 },
      { cx: 6.34, cy: 17.66 },
      { cx: 4, cy: 12 },
      { cx: 6.34, cy: 6.34 },
      { cx: 12, cy: 4 },
      { cx: 17.66, cy: 6.34 },
    ];
    return (
      <svg width={px} height={px} viewBox="0 0 24 24" fill="none" className={className}>
        {dots.map((dot, i) => (
          <circle
            key={i}
            cx={dot.cx}
            cy={dot.cy}
            r="2"
            fill="currentColor"
            style={{
              transformOrigin: `${dot.cx}px ${dot.cy}px`,
              animation: "spinner-dots-ring-fade 1.2s infinite ease-in-out",
              animationDelay: `${i * 0.15 - 1.2}s`,
            }}
          />
        ))}
      </svg>
    );
  }

  /* ── [8] Dots Step ─────────────────────────────────────────── */
  if (variant === "dots-step") {
    const dotPx = px * 0.22;
    const anims = [
      "spinner-dots-step-one",
      "spinner-dots-step-two",
      "spinner-dots-step-three",
    ];
    return (
      <div
        className={className}
        style={{ display: "flex", gap: px * 0.22, alignItems: "center" }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: dotPx,
              height: dotPx,
              borderRadius: "50%",
              background: "currentColor",
              animation: `${anims[i]} 1.0s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
    );
  }

  /* ── [9] Text Dots ─────────────────────────────────────────── */
  if (variant === "text-dots") {
    const anims = [
      "spinner-dots-step-one",
      "spinner-dots-step-two",
      "spinner-dots-step-three",
    ];
    return (
      <span
        className={className}
        style={{
          display: "inline-flex",
          gap: "1px",
          height: "fit-content",
          verticalAlign: "baseline",
          lineHeight: 1,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: "currentColor",
              animation: `${anims[i]} 1.0s ease-in-out infinite`,
              transformOrigin: "bottom center",
            }}
          >
            .
          </span>
        ))}
      </span>
    );
  }

  return null;
}
