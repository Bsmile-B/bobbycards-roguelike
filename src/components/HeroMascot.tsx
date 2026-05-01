// === Bobbycard — HeroMascot component (extrait de App.tsx, Phase 1 V5.1) ===
// Composant CSS paramétrable. Préserve strictement les classes, data-* et
// la structure DOM (cf. test-actions/ et selectors render_game_to_text).

import * as React from "react";
import {
  MASCOT_VARIANT_LABEL,
  MASCOT_MOOD_LABEL,
} from "../utils/mascotMapping";
import type {
  MascotVariant,
  MascotSize,
  MascotMood,
  MascotSide,
} from "../utils/mascotMapping";

export type { MascotVariant, MascotSize, MascotMood, MascotSide };

export function HeroMascot({
  variant,
  size = "md",
  mood = "idle",
  side,
  className = "",
  style,
  ariaLabel,
}: {
  variant: MascotVariant;
  size?: MascotSize;
  mood?: MascotMood;
  side?: MascotSide;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}): React.ReactElement {
  const finalAria = ariaLabel ?? `${MASCOT_VARIANT_LABEL[variant]}, ${MASCOT_MOOD_LABEL[mood]}`;
  return (
    <div
      className={`hero-mascot hero-mascot--${size} hero-mascot--mood-${mood} ${className}`}
      data-mascot-variant={variant}
      data-mascot-size={size}
      data-mascot-mood={mood}
      data-mascot-side={side}
      style={style}
      role="img"
      aria-label={finalAria}
    >
      <div className="hero-mascot__cape" aria-hidden="true" />
      <div className="hero-mascot__head" aria-hidden="true">
        <div className="hero-mascot__hat">
          <div className="hero-mascot__hat-band" />
          <div className="hero-mascot__hat-pom" />
        </div>
        <div className="hero-mascot__eyes">
          <span className="hero-mascot__eye hero-mascot__eye--l">
            <span className="hero-mascot__pupil" />
          </span>
          <span className="hero-mascot__eye hero-mascot__eye--r">
            <span className="hero-mascot__pupil" />
          </span>
        </div>
        <div className="hero-mascot__cheek hero-mascot__cheek--l" />
        <div className="hero-mascot__cheek hero-mascot__cheek--r" />
        <div className="hero-mascot__mouth" />
        <div className="hero-mascot__accessory" />
      </div>
    </div>
  );
}
