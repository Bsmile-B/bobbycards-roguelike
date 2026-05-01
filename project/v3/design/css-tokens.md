# CSS Tokens & Skeleton — V3

> Skills appliqués : `motion-performance-guardian` (transform/opacity, cap layers), `reduced-motion-accessibility-guardian` (bloc reduced-motion exhaustif).

Bloc CSS prêt à coller dans `src/styles.css`. **Étend** les tokens V2 (`project/design/css-tokens.md`). À ajouter en deux endroits :

1. **Nouveaux tokens V3** : à la suite des tokens V2 dans le `:root`. Les tokens V2 (`--rarity-commune`, `--chest-damaged`, etc.) restent en place pour compat.
2. **Skeletons V3** : à la fin du fichier, **avant** la media query `@media (prefers-reduced-motion: reduce)` V2 (qu'on étend dans la même media query).

---

## 1. Tokens V3 — bloc à ajouter dans `:root`

```css
/* === V3 — tokens (à ajouter après les tokens V2) === */
:root {
  /* === Vitesse combat === */
  --combat-speed: 1;

  /* === Durations base (combat — scalées par --combat-speed) === */
  --anim-attack-pulse: 220ms;
  --anim-attack-pulse-special: 280ms;
  --anim-projectile-physical: 240ms;
  --anim-projectile-magic: 320ms;
  --anim-projectile-heal: 380ms;
  --anim-projectile-shield: 300ms;
  --anim-projectile-poison: 600ms;
  --anim-impact-flash: 90ms;
  --anim-impact-flash-dark: 120ms;
  --anim-impact-flash-shield: 100ms;
  --anim-impact-shake-enemy: 180ms;
  --anim-impact-shake-ally: 180ms;
  --anim-floating-rise: 720ms;
  --anim-aura-low-pulse: 2000ms;
  --anim-boss-card-vibrate: 1200ms;

  /* === Durations hors combat (jamais scalées) === */
  --anim-lootbox-shake: 320ms;
  --anim-lootbox-roulette: 2500ms;
  --anim-rarity-flash-common: 220ms;
  --anim-rarity-flash-rare: 280ms;
  --anim-rarity-flash-epic: 380ms;
  --anim-rarity-flash-legendary: 600ms;
  --anim-rarity-flash-mythic: 900ms;
  --anim-boss-intro-total: 1600ms;
  --anim-chest-shake: 320ms;
  --anim-chest-lid-open: 400ms;
  --anim-chest-beam: 600ms;

  /* === Easings === */
  --ease-impact: cubic-bezier(.18,.7,.32,1);
  --ease-projectile: cubic-bezier(.42,0,.58,1);
  --ease-floating: cubic-bezier(.22,1,.36,1);
  --ease-roulette: cubic-bezier(.12,.85,.25,1);
  --ease-boss-mount: cubic-bezier(.16,1.04,.3,1);

  /* === Raretés enrichies V3 (les tokens V2 restent en parallèle) === */
  --rarity-common-border: #6b6e75;
  --rarity-common-bg: rgba(28, 26, 30, 0.75);
  --rarity-common-glow: transparent;
  --rarity-common-text: #d8d2c4;
  --rarity-common-particle: transparent;

  --rarity-rare-border: #5BA3D0;
  --rarity-rare-bg: rgba(18, 26, 38, 0.78);
  --rarity-rare-glow: rgba(91, 163, 208, 0.30);
  --rarity-rare-text: #aac8df;
  --rarity-rare-particle: rgba(91, 163, 208, 0.7);

  --rarity-epic-border: #9C6BD9;
  --rarity-epic-bg: rgba(26, 18, 36, 0.80);
  --rarity-epic-glow: rgba(156, 107, 217, 0.40);
  --rarity-epic-text: #cbafe2;
  --rarity-epic-particle: rgba(156, 107, 217, 0.75);

  --rarity-legendary-border: #E0B450;
  --rarity-legendary-border-deep: #c79438;
  --rarity-legendary-bg: rgba(36, 26, 14, 0.82);
  --rarity-legendary-glow: rgba(224, 180, 80, 0.55);
  --rarity-legendary-glow-strong: rgba(224, 180, 80, 0.75);
  --rarity-legendary-text: #f0d99a;
  --rarity-legendary-particle: rgba(224, 180, 80, 0.85);
  --rarity-legendary-spark: rgba(255, 235, 180, 0.95);

  --rarity-mythic-border: #F5E6D8;
  --rarity-mythic-bg: rgba(40, 36, 28, 0.85);
  --rarity-mythic-glow: rgba(245, 230, 216, 0.65);
  --rarity-mythic-text: #f7efe2;
  --rarity-mythic-particle: rgba(245, 230, 216, 0.9);

  /* === Floating numbers === */
  --fnum-size-base: 18px;
  --fnum-size-special: 22px;
  --fnum-size-crit: 28px;
  --fnum-weight: 600;
  --fnum-font: Georgia, "Times New Roman", serif;
}

/* === Vitesse combat === */
.combat-screen          { --combat-speed: 1; }
.combat-screen.speed-125 { --combat-speed: 1.25; }
.combat-screen.speed-150 { --combat-speed: 1.5; }
```

---

## 2. Skeletons V3 — à ajouter avant la media query reduced-motion V2

```css
/* =========================================================================
 * V3 — COMBAT ANIMATION LAYER
 * ========================================================================= */
.combat-anim-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 5;
}

/* === Pulses & shakes sur cartes === */
@keyframes attack-pulse {
  0%   { transform: scale(1); box-shadow: 0 0 0 0 var(--stage-accent-glow); }
  45%  { transform: scale(1.045); box-shadow: 0 0 18px 4px var(--stage-accent-glow); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 transparent; }
}
.combat-hero.is-attacking,
.enemy-card.is-attacking {
  animation: attack-pulse var(--anim-attack-pulse) var(--ease-impact) both;
  animation-duration: calc(var(--anim-attack-pulse) / var(--combat-speed));
}
.combat-hero.is-attacking--special {
  animation-duration: calc(var(--anim-attack-pulse-special) / var(--combat-speed));
}

@keyframes enemy-shake {
  0%, 100% { transform: translate3d(0, 0, 0); }
  20%      { transform: translate3d(-3px, 0, 0); }
  40%      { transform: translate3d(3px, -1px, 0); }
  60%      { transform: translate3d(-2px, 1px, 0); }
  80%      { transform: translate3d(2px, 0, 0); }
}
.enemy-card.is-hit {
  animation: enemy-shake var(--anim-impact-shake-enemy) linear both;
  animation-duration: calc(var(--anim-impact-shake-enemy) / var(--combat-speed));
}

@keyframes ally-shake {
  0%, 100% { transform: translate3d(0, 0, 0); }
  25%      { transform: translate3d(-2px, 0, 0); }
  50%      { transform: translate3d(2px, 0, 0); }
  75%      { transform: translate3d(-1px, 1px, 0); }
}
.combat-hero.is-hit {
  animation: ally-shake var(--anim-impact-shake-ally) linear both;
  animation-duration: calc(var(--anim-impact-shake-ally) / var(--combat-speed));
}

@keyframes impact-flash-bright {
  0%   { opacity: 0; }
  35%  { opacity: 0.9; }
  100% { opacity: 0; }
}
.enemy-card.is-hit::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(255, 250, 235, 0.85);
  mix-blend-mode: screen;
  pointer-events: none;
  animation: impact-flash-bright var(--anim-impact-flash) linear forwards;
  animation-duration: calc(var(--anim-impact-flash) / var(--combat-speed));
}

@keyframes impact-flash-dark {
  0%   { opacity: 0; }
  40%  { opacity: 0.55; }
  100% { opacity: 0; }
}
.combat-hero.is-hit::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(140, 30, 40, 0.7);
  mix-blend-mode: multiply;
  pointer-events: none;
  animation: impact-flash-dark var(--anim-impact-flash-dark) linear forwards;
  animation-duration: calc(var(--anim-impact-flash-dark) / var(--combat-speed));
}

@keyframes aura-low-pulse {
  0%, 100% { box-shadow: 0 0 14px rgba(180, 30, 40, 0.35); opacity: 0.85; }
  50%      { box-shadow: 0 0 22px rgba(180, 30, 40, 0.55); opacity: 1; }
}
.enemy-card.aura-low,
.combat-hero.aura-low {
  animation: aura-low-pulse var(--anim-aura-low-pulse) ease-in-out infinite;
}

/* === Projectiles === */
.projectile {
  position: absolute;
  pointer-events: none;
  will-change: transform, opacity;
}
@keyframes projectile-physical {
  0%   { transform: translate(0, 0) scaleX(1);    opacity: 0; }
  10%  { opacity: 1; }
  85%  { transform: translate(calc(var(--proj-distance-x) * 0.92), calc(var(--proj-distance-y) * 0.92)) scaleX(1.1); opacity: 1; }
  100% { transform: translate(var(--proj-distance-x), var(--proj-distance-y)) scaleX(0.6); opacity: 0; }
}
.projectile--physical {
  width: 24px; height: 4px;
  border-radius: 2px;
  background: linear-gradient(90deg, rgba(255,255,255,0.95), rgba(220,220,210,0.9) 70%, transparent);
  box-shadow: 0 0 8px rgba(255,250,235,0.6);
  animation: projectile-physical var(--anim-projectile-physical) var(--ease-impact) forwards;
  animation-duration: calc(var(--anim-projectile-physical) / var(--combat-speed));
}
.projectile--physical.projectile--special {
  width: 34px; height: 5px;
  box-shadow: 0 0 14px rgba(255,250,235,0.85);
}

@keyframes projectile-magic {
  0%   { transform: translate(0, 0) scale(0.4);  opacity: 0; }
  18%  { opacity: 1; transform: translate(calc(var(--proj-distance-x) * 0.18), calc(var(--proj-distance-y) * 0.18)) scale(1); }
  82%  { transform: translate(calc(var(--proj-distance-x) * 0.92), calc(var(--proj-distance-y) * 0.92)) scale(1.05); opacity: 1; }
  100% { transform: translate(var(--proj-distance-x), var(--proj-distance-y)) scale(0.6); opacity: 0; }
}
.projectile--magic {
  width: 16px; height: 8px;
  border-radius: 50%;
  background: radial-gradient(ellipse, var(--stage-accent, #a988ff) 0%, rgba(80,40,140,0.4) 70%, transparent);
  box-shadow: 0 0 12px var(--stage-accent-glow, rgba(140,90,220,0.4));
  animation: projectile-magic var(--anim-projectile-magic) var(--ease-projectile) forwards;
  animation-duration: calc(var(--anim-projectile-magic) / var(--combat-speed));
}
.projectile--magic.projectile--special {
  width: 22px; height: 11px;
  box-shadow: 0 0 22px var(--stage-accent);
}

@keyframes heal-flow {
  0%   { transform: translate(0, 0) scale(0.6); opacity: 0; }
  20%  { opacity: 1; }
  80%  { opacity: 1; transform: translate(calc(var(--proj-distance-x) * 0.9), calc(var(--proj-distance-y) * 0.9 - 6px)) scale(1); }
  100% { transform: translate(var(--proj-distance-x), var(--proj-distance-y)) scale(0.4); opacity: 0; }
}
.projectile-heal-particle {
  position: absolute;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle, #d2efbf 0%, #7DBE65 60%, transparent);
  box-shadow: 0 0 10px rgba(125, 190, 100, 0.5);
  animation: heal-flow var(--anim-projectile-heal) cubic-bezier(.22,1,.36,1) forwards;
  animation-duration: calc(var(--anim-projectile-heal) / var(--combat-speed));
}

@keyframes shield-rune-form {
  0%   { transform: translate(-50%, -50%) scale(0.4) rotate(-30deg); opacity: 0; }
  60%  { opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1) rotate(0deg);     opacity: 0.9; }
}
.projectile--shield {
  width: 96px; height: 96px;
  border-radius: 50%;
  border: 2px solid rgba(120, 200, 220, 0.7);
  box-shadow: 0 0 18px rgba(120, 200, 220, 0.4), inset 0 0 12px rgba(120, 200, 220, 0.3);
  animation: shield-rune-form var(--anim-projectile-shield) cubic-bezier(.22,1,.36,1) forwards;
  animation-duration: calc(var(--anim-projectile-shield) / var(--combat-speed));
}

@keyframes poison-drift {
  0%   { transform: translate(0, 0) scale(0.5);    opacity: 0; }
  20%  { opacity: 0.8; transform: translate(var(--p-drift-x), -4px) scale(1); }
  100% { transform: translate(var(--p-drift-x), -22px) scale(0.6); opacity: 0; }
}
.projectile-poison-particle,
.projectile-burn-particle {
  position: absolute;
  width: 6px; height: 6px;
  border-radius: 50%;
  animation: poison-drift var(--anim-projectile-poison) ease-out forwards;
  animation-duration: calc(var(--anim-projectile-poison) / var(--combat-speed));
}
.projectile-poison-particle { background: rgba(140, 70, 180, 0.75); box-shadow: 0 0 6px rgba(140, 70, 180, 0.4); }
.projectile-burn-particle   { background: rgba(220, 110, 60, 0.8);  box-shadow: 0 0 6px rgba(220, 110, 60, 0.45); }

@keyframes attack-wave-expand {
  0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(8); opacity: 0; }
}
.attack-wave {
  position: absolute;
  width: 60px; height: 60px;
  border-radius: 50%;
  border: 2px solid var(--stage-accent);
  background: radial-gradient(circle, var(--stage-accent-glow) 0%, transparent 70%);
  pointer-events: none;
  animation: attack-wave-expand 480ms cubic-bezier(.18,.7,.32,1) forwards;
}

/* === Floating numbers === */
@keyframes floating-rise-fade {
  0%   { transform: translate(calc(-50% + var(--fnum-offset-x, 0px)), 0) scale(var(--fnum-scale, 1)); opacity: 0; }
  10%  { opacity: 1; }
  65%  { opacity: 1; transform: translate(calc(-50% + var(--fnum-offset-x, 0px)), -22px) scale(var(--fnum-scale, 1)); }
  100% { opacity: 0; transform: translate(calc(-50% + var(--fnum-offset-x, 0px)), -28px) scale(var(--fnum-scale, 1)); }
}
.floating-num {
  position: absolute;
  pointer-events: none;
  font-family: var(--fnum-font);
  font-weight: var(--fnum-weight);
  font-size: var(--fnum-size-base);
  text-shadow: 0 1px 2px rgba(0,0,0,0.7);
  white-space: nowrap;
  z-index: 6;
  animation: floating-rise-fade var(--anim-floating-rise) var(--ease-floating) forwards;
  animation-duration: calc(var(--anim-floating-rise) / var(--combat-speed));
}
.floating-num--damage-physical { color: #f5e6d8; }
.floating-num--damage-magic    { color: #cbafe2; text-shadow: 0 1px 2px rgba(40,20,60,0.7); }
.floating-num--heal            { color: #b3dab3; text-shadow: 0 1px 2px rgba(20,50,30,0.7); }
.floating-num--shield          { color: #aac8df; text-shadow: 0 1px 2px rgba(20,40,60,0.7); }
.floating-num--poison          { color: #a880c8; text-shadow: 0 1px 2px rgba(50,20,70,0.8); }
.floating-num--burn            { color: #e08a55; text-shadow: 0 1px 2px rgba(60,30,15,0.8); }
.floating-num--crit {
  color: #f0d99a;
  font-size: var(--fnum-size-crit);
  letter-spacing: 0.02em;
  padding: 2px 6px;
  border: 1px solid rgba(206,158,71,0.85);
  border-radius: 4px;
  background: rgba(40, 28, 12, 0.55);
  box-shadow: 0 0 14px rgba(206,158,71,0.45);
}
.floating-num--special { font-size: var(--fnum-size-special); }

/* =========================================================================
 * V3 — CHARACTER CARD DETAILED
 * ========================================================================= */
.character-card-detailed {
  width: 220px;
  height: 320px;
  display: grid;
  grid-template-rows: auto auto 1fr auto auto auto auto;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-surface-card);
  position: relative;
  cursor: pointer;
  transition: transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out);
}
.character-card-detailed:hover { transform: translateY(-3px); }
.character-card-detailed.is-selected { outline: 2px solid var(--stage-accent); outline-offset: 4px; }
.character-card-detailed.is-locked { filter: saturate(0.5) brightness(0.7); pointer-events: none; }

@keyframes card-reveal-mount {
  0%   { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1);   opacity: 1; }
}
.character-card-detailed--reveal { animation: card-reveal-mount 380ms var(--ease-impact) both; }

.character-card-detailed--sm { width: 200px; height: 280px; }
.character-card-detailed__header { display: flex; justify-content: space-between; align-items: flex-start; }
.character-card-detailed__name {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.05rem;
  text-align: center;
  color: var(--color-text-strong);
}
.character-card-detailed__portrait {
  width: 140px; height: 140px;
  margin: 0 auto;
}
.character-card-detailed__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-1);
  font-size: 0.72rem;
}
.character-card-detailed__stat {
  display: grid;
  grid-template-rows: auto auto;
  text-align: center;
  color: var(--color-text-muted);
}
.character-card-detailed__stat strong {
  color: var(--color-text-strong);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1rem;
}
.character-card-detailed__skill {
  border: 1px solid var(--color-border);
  background: rgba(0,0,0,0.25);
  border-radius: var(--radius-sm);
  padding: var(--space-2);
  display: grid;
  gap: 2px;
}
.character-card-detailed__skill-title { font-size: 0.78rem; font-weight: 600; color: var(--color-text-strong); }
.character-card-detailed__skill-desc  { font-size: 0.72rem; font-style: italic; color: var(--color-text-muted); line-height: 1.3; }
.character-card-detailed__trait       { font-size: 0.72rem; font-style: italic; color: var(--color-text); }
.character-card-detailed__footer      { display: flex; gap: var(--space-2); justify-content: space-between; font-size: 0.7rem; }
.character-card-detailed__fragments   { color: var(--color-text-gold); }
.character-card-detailed__rank        { color: var(--color-text-muted); }

/* =========================================================================
 * V3 — RARITÉS (classes pour CharacterCardDetailed et reveals)
 * ========================================================================= */
.rarity-common {
  border: 1px solid var(--rarity-common-border);
  background: var(--rarity-common-bg);
}
.rarity-common .character-card-detailed__name { color: var(--rarity-common-text); }

.rarity-rare {
  border: 2px solid var(--rarity-rare-border);
  background: var(--rarity-rare-bg);
  box-shadow: 0 0 16px var(--rarity-rare-glow);
}
.rarity-rare .character-card-detailed__name { color: var(--rarity-rare-text); }

.rarity-epic {
  border: 2px solid var(--rarity-epic-border);
  background: var(--rarity-epic-bg);
  box-shadow: 0 0 22px var(--rarity-epic-glow);
  animation: rarity-epic-pulse 3000ms ease-in-out infinite alternate;
}
.rarity-epic .character-card-detailed__name { color: var(--rarity-epic-text); }
@keyframes rarity-epic-pulse {
  from { box-shadow: 0 0 18px rgba(156, 107, 217, 0.30); }
  to   { box-shadow: 0 0 28px rgba(156, 107, 217, 0.55); }
}

.rarity-legendary {
  border: 3px solid transparent;
  background:
    linear-gradient(var(--rarity-legendary-bg), var(--rarity-legendary-bg)) padding-box,
    linear-gradient(135deg, var(--rarity-legendary-border-deep), var(--rarity-legendary-border) 35%, var(--rarity-legendary-spark) 50%, var(--rarity-legendary-border) 65%, var(--rarity-legendary-border-deep)) border-box;
  background-size: 100% 100%, 220% 220%;
  background-position: 0 0, 0 0;
  box-shadow: 0 0 30px var(--rarity-legendary-glow);
  animation: rarity-legendary-border 6000ms linear infinite;
}
.rarity-legendary .character-card-detailed__name { color: var(--rarity-legendary-text); }
@keyframes rarity-legendary-border {
  0%   { background-position: 0 0, 0% 50%; }
  100% { background-position: 0 0, 220% 50%; }
}

.rarity-mythic-placeholder {
  border: 3px solid var(--rarity-mythic-border);
  background: var(--rarity-mythic-bg);
  box-shadow: 0 0 36px var(--rarity-mythic-glow);
  opacity: 0; /* RESERVED — non rendu visible en V3 */
}

.rarity-particle {
  position: absolute;
  width: 4px; height: 4px;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  bottom: 8px;
}
.rarity-particle--rare       { background: var(--rarity-rare-particle);       box-shadow: 0 0 6px var(--rarity-rare-particle);       animation: rarity-particle-rise 4000ms ease-in-out infinite; }
.rarity-particle--epic       { background: var(--rarity-epic-particle);       box-shadow: 0 0 8px var(--rarity-epic-particle);       animation: rarity-particle-rise 3500ms ease-in-out infinite; }
.rarity-particle--legendary  { background: var(--rarity-legendary-particle);  box-shadow: 0 0 10px var(--rarity-legendary-particle); animation: rarity-particle-rise 3200ms ease-in-out infinite; }
@keyframes rarity-particle-rise {
  0%   { opacity: 0; transform: translate(var(--p-x, 0), 0) scale(0.5); }
  20%  { opacity: 0.85; }
  80%  { opacity: 0.85; }
  100% { opacity: 0; transform: translate(var(--p-x, 0), -120%) scale(1); }
}

@keyframes rarity-spark {
  0%   { opacity: 0; transform: scale(0.4); }
  30%  { opacity: 1; }
  100% { opacity: 0; transform: scale(1.4); }
}
.rarity-spark--legendary {
  position: absolute;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--rarity-legendary-spark);
  box-shadow: 0 0 10px var(--rarity-legendary-spark);
  pointer-events: none;
  animation: rarity-spark 720ms ease-out forwards;
}

/* =========================================================================
 * V3 — RARITY REVEAL
 * ========================================================================= */
.rarity-reveal { position: relative; display: grid; place-items: center; }

@keyframes reveal-common {
  0%   { opacity: 0; transform: scale(1); box-shadow: 0 0 0 0 transparent; }
  40%  { opacity: 1; transform: scale(1.05); box-shadow: 0 0 16px rgba(180,170,160,0.4); }
  100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 transparent; }
}
@keyframes reveal-rare {
  0%   { opacity: 0; transform: scale(1); box-shadow: 0 0 0 0 transparent; }
  40%  { opacity: 1; transform: scale(1.06); box-shadow: 0 0 24px var(--rarity-rare-glow); }
  100% { opacity: 1; transform: scale(1); box-shadow: 0 0 14px var(--rarity-rare-glow); }
}
@keyframes reveal-epic {
  0%   { opacity: 0; transform: scale(1); box-shadow: 0 0 0 0 transparent; }
  35%  { opacity: 1; transform: scale(1.08); box-shadow: 0 0 36px var(--rarity-epic-glow); }
  70%  { transform: scale(1.04); box-shadow: 0 0 28px var(--rarity-epic-glow); }
  100% { opacity: 1; transform: scale(1); box-shadow: 0 0 22px var(--rarity-epic-glow); }
}
@keyframes reveal-legendary {
  0%   { opacity: 0; transform: scale(1); box-shadow: 0 0 0 0 transparent; }
  25%  { opacity: 1; transform: scale(1.12); box-shadow: 0 0 48px var(--rarity-legendary-glow-strong); }
  60%  { transform: scale(1.04); box-shadow: 0 0 36px var(--rarity-legendary-glow); }
  100% { opacity: 1; transform: scale(1); box-shadow: 0 0 30px var(--rarity-legendary-glow); }
}
.rarity-reveal--common .reveal-card    { animation: reveal-common    var(--anim-rarity-flash-common)    var(--ease-impact) forwards; }
.rarity-reveal--rare .reveal-card      { animation: reveal-rare      var(--anim-rarity-flash-rare)      var(--ease-impact) forwards; }
.rarity-reveal--epic .reveal-card      { animation: reveal-epic      var(--anim-rarity-flash-epic)      var(--ease-impact) forwards; }
.rarity-reveal--legendary .reveal-card { animation: reveal-legendary var(--anim-rarity-flash-legendary) var(--ease-impact) forwards; }

@keyframes reveal-particle-burst {
  0%   { opacity: 0; transform: translate(0, 0) scale(0.3); }
  20%  { opacity: 1; }
  100% { opacity: 0; transform: translate(var(--burst-x, 0), var(--burst-y, 0)) scale(1.2); }
}
.reveal-particle             { position: absolute; width: 5px; height: 5px; border-radius: 50%; pointer-events: none; }
.reveal-particle--rare       { background: var(--rarity-rare-particle);      box-shadow: 0 0 8px var(--rarity-rare-particle);  animation: reveal-particle-burst 600ms cubic-bezier(.22,1,.36,1) forwards; }
.reveal-particle--epic       { background: var(--rarity-epic-particle);      box-shadow: 0 0 10px var(--rarity-epic-particle); animation: reveal-particle-burst 800ms cubic-bezier(.22,1,.36,1) forwards; }
.reveal-particle--legendary  { background: var(--rarity-legendary-particle); box-shadow: 0 0 12px var(--rarity-legendary-particle); animation: reveal-particle-burst 1000ms cubic-bezier(.22,1,.36,1) forwards; }

@keyframes legendary-screen-shake {
  0%, 100% { transform: translate3d(0, 0, 0); }
  20%      { transform: translate3d(-2px, 0, 0); }
  40%      { transform: translate3d(2px, 0, 0); }
  60%      { transform: translate3d(-1px, 1px, 0); }
  80%      { transform: translate3d(1px, 0, 0); }
}
.lootbox-screen.is-revealing-legendary { animation: legendary-screen-shake 180ms linear; }

/* =========================================================================
 * V3 — LOOTBOX ROULETTE
 * ========================================================================= */
.loot-roulette {
  position: relative;
  width: 1280px;
  max-width: 100%;
  height: 200px;
  margin: var(--space-4) auto;
  overflow: hidden;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(180deg, transparent, rgba(0,0,0,0.4), transparent);
}
.loot-roulette__strip {
  position: absolute;
  top: 10px;
  left: 0;
  display: flex;
  gap: 16px;
  will-change: transform;
}
.loot-roulette__item {
  width: 140px; height: 180px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: var(--color-surface-card);
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 4px;
  padding: 8px;
  transition: transform 50ms linear, box-shadow 50ms linear, opacity 50ms linear;
}
.loot-roulette__item.is-hovered { transform: scale(1.05); }
.loot-roulette__item.is-hovered.rarity-rare      { box-shadow: 0 0 14px var(--rarity-rare-glow); }
.loot-roulette__item.is-hovered.rarity-epic      { box-shadow: 0 0 18px var(--rarity-epic-glow); transform: scale(1.07); }
.loot-roulette__item.is-hovered.rarity-legendary { box-shadow: 0 0 24px var(--rarity-legendary-glow); transform: scale(1.08); }
.loot-roulette__item.is-near-marker { opacity: 0.9; }
.loot-roulette__item--decoy { opacity: 0.95; }

@keyframes roulette-winner-pulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.10); }
  100% { transform: scale(1); }
}
.loot-roulette__item.is-winner { animation: roulette-winner-pulse 220ms cubic-bezier(.18,.7,.32,1) forwards; }

.loot-roulette__marker {
  position: absolute;
  top: 0; bottom: 0; left: 50%;
  transform: translateX(-50%);
  width: 2px;
  background: linear-gradient(180deg, transparent, var(--rarity-legendary-border) 30%, var(--rarity-legendary-border) 70%, transparent);
  box-shadow: 0 0 14px var(--rarity-legendary-glow);
  pointer-events: none;
  z-index: 5;
}

/* =========================================================================
 * V3 — CHESTS (extension V2)
 * ========================================================================= */
.chest-tier--damaged { animation: chest-damaged-breath 4000ms ease-in-out infinite; }
@keyframes chest-damaged-breath {
  0%, 100% { box-shadow: 0 0 8px rgba(70, 60, 50, 0.18); }
  50%      { box-shadow: 0 0 14px rgba(70, 60, 50, 0.28); }
}
.chest-tier--bronze { animation: chest-bronze-glow 3000ms ease-in-out infinite alternate; }
@keyframes chest-bronze-glow {
  from { box-shadow: 0 0 12px rgba(187, 110, 50, 0.22); }
  to   { box-shadow: 0 0 22px rgba(187, 110, 50, 0.45); }
}
.chest-tier--silver { box-shadow: 0 0 16px rgba(180, 200, 220, 0.30); }
.chest-tier--royal  { animation: chest-royal-glow 2500ms ease-in-out infinite alternate; }
@keyframes chest-royal-glow {
  from { box-shadow: 0 0 22px rgba(216, 180, 80, 0.40); }
  to   { box-shadow: 0 0 38px rgba(216, 180, 80, 0.70); }
}
.chest-tier--runic  { animation: chest-runic-aura 5000ms ease-in-out infinite alternate; }
@keyframes chest-runic-aura {
  from { box-shadow: 0 0 22px rgba(120, 200, 220, 0.35); }
  to   { box-shadow: 0 0 36px rgba(216, 180, 80, 0.45); }
}

@keyframes chest-particle-rise {
  0%   { opacity: 0; transform: translateY(0) translateX(var(--p-x, 0)); }
  20%  { opacity: 0.8; }
  100% { opacity: 0; transform: translateY(-80px) translateX(var(--p-x, 0)); }
}
.chest-particle--bronze { position: absolute; width: 3px; height: 3px; border-radius: 50%; background: rgba(220, 140, 70, 0.85); box-shadow: 0 0 6px rgba(220, 140, 70, 0.6); animation: chest-particle-rise 4200ms ease-in-out infinite; }
.chest-particle--silver { position: absolute; width: 3px; height: 3px; border-radius: 50%; background: rgba(220, 230, 240, 0.7); animation: chest-particle-rise 5000ms ease-in-out infinite; }
.chest-particle--royal  { position: absolute; width: 4px; height: 4px; border-radius: 50%; background: rgba(245, 205, 140, 0.9); box-shadow: 0 0 8px rgba(245, 205, 140, 0.7); animation: chest-particle-rise 4200ms ease-in-out infinite; }
.chest-particle--runic  { position: absolute; width: 3px; height: 3px; border-radius: 50%; animation: chest-particle-rise 4500ms ease-in-out infinite; }
.chest-particle--runic.cyan { background: rgba(120, 200, 220, 0.9); box-shadow: 0 0 8px rgba(120, 200, 220, 0.7); }
.chest-particle--runic.gold { background: rgba(245, 205, 140, 0.9); box-shadow: 0 0 8px rgba(245, 205, 140, 0.7); }

@keyframes chest-rune-pulse {
  0%, 80%, 100% { opacity: 0.2; box-shadow: none; }
  20%, 50%      { opacity: 1; box-shadow: 0 0 10px rgba(120, 200, 220, 0.85); }
}
.chest-rune--runic { position: absolute; width: 14px; height: 14px; border: 1px solid rgba(120, 200, 220, 0.85); opacity: 0.2; animation: chest-rune-pulse 4000ms ease-in-out infinite; }

@keyframes chest-shake-soft {
  0%, 100% { transform: translate(0, 0) rotate(0); }
  20%      { transform: translate(-2px, 0) rotate(-1deg); }
  40%      { transform: translate(2px, 0) rotate(1deg); }
  60%      { transform: translate(-1px, 1px) rotate(-0.5deg); }
  80%      { transform: translate(1px, 0) rotate(0.5deg); }
}
.chest.is-shaking { animation: chest-shake-soft var(--anim-chest-shake) linear; }

@keyframes chest-flash {
  0%   { opacity: 0; }
  35%  { opacity: 0.85; }
  100% { opacity: 0; }
}
.chest-flash {
  position: fixed; inset: 0;
  background: white; pointer-events: none; opacity: 0; z-index: 60;
  animation: chest-flash 90ms ease-out forwards;
}

@keyframes chest-lid-open {
  0%   { transform: rotateX(0deg); }
  100% { transform: rotateX(-60deg); }
}
.chest-lid.is-opening { transform-origin: 50% 100%; animation: chest-lid-open var(--anim-chest-lid-open) cubic-bezier(.18,.7,.32,1) forwards; }

@keyframes chest-beam-rise {
  0%   { opacity: 0; transform: translateX(-50%) scaleY(0.2); }
  60%  { opacity: 0.85; }
  100% { opacity: 0.7; transform: translateX(-50%) scaleY(1); }
}
.chest-beam {
  position: absolute;
  top: -120px; left: 50%;
  width: 60px; height: 180px;
  transform-origin: 50% 100%;
  background: linear-gradient(180deg, transparent, var(--beam-color, rgba(245,205,140,0.85)), transparent);
  pointer-events: none;
  filter: blur(4px);
  animation: chest-beam-rise var(--anim-chest-beam) cubic-bezier(.18,.7,.32,1) forwards;
}
.chest-beam--damaged { --beam-color: rgba(180, 170, 160, 0.6); }
.chest-beam--bronze  { --beam-color: rgba(220, 140, 70, 0.8); }
.chest-beam--silver  { --beam-color: rgba(220, 230, 240, 0.85); }
.chest-beam--royal   { --beam-color: rgba(245, 205, 140, 0.9); }
.chest-beam--runic   { --beam-color: rgba(120, 200, 220, 0.85); }

/* =========================================================================
 * V3 — BOSS INTRO + PRESENCE
 * ========================================================================= */
.boss-intro-overlay {
  position: fixed; inset: 0; z-index: 70;
  background: radial-gradient(circle at 50% 40%, rgba(0,0,0,0.6), rgba(0,0,0,0.92) 70%);
  opacity: 0;
  pointer-events: auto;
  animation: boss-intro-darken 400ms cubic-bezier(.18,.7,.32,1) forwards;
}
@keyframes boss-intro-darken { 0% { opacity: 0; } 100% { opacity: 1; } }
.boss-intro-overlay.is-leaving { animation: boss-intro-leave 100ms linear forwards; }
@keyframes boss-intro-leave { 0% { opacity: 1; } 100% { opacity: 0; } }

.boss-intro__name {
  position: absolute;
  top: 28%; left: 50%;
  transform: translateX(-50%);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 56px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.04em;
  color: var(--boss-accent);
  text-shadow: 0 4px 16px rgba(0,0,0,0.8), 0 0 32px var(--boss-accent-glow);
  opacity: 0;
  animation: boss-intro-name 600ms cubic-bezier(.18,.7,.32,1) 400ms forwards;
}
@keyframes boss-intro-name {
  0%   { opacity: 0; transform: translate(-50%, -8px); }
  100% { opacity: 1; transform: translate(-50%, 0); }
}
.boss-intro__subtitle {
  position: absolute;
  top: calc(28% + 70px); left: 50%;
  transform: translateX(-50%);
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-gold);
  opacity: 0;
  animation: boss-intro-subtitle 500ms cubic-bezier(.18,.7,.32,1) 600ms forwards;
}
@keyframes boss-intro-subtitle {
  0%   { opacity: 0; transform: translate(-50%, 4px); }
  100% { opacity: 1; transform: translate(-50%, 0); }
}
.boss-intro__phrase {
  position: absolute;
  top: 44%; left: 50%;
  transform: translateX(-50%);
  font-style: italic;
  font-size: 18px;
  color: var(--color-text-muted);
  opacity: 0;
  animation: boss-intro-phrase 400ms cubic-bezier(.18,.7,.32,1) 1000ms forwards;
}
@keyframes boss-intro-phrase { 0% { opacity: 0; } 100% { opacity: 0.9; } }

.boss-intro__aura {
  position: absolute;
  top: 60%; left: 50%;
  width: 360px; height: 360px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--boss-accent-glow) 0%, transparent 70%);
  transform: translate(-50%, -50%) scale(0.6);
  opacity: 0;
  animation: boss-intro-aura 1100ms cubic-bezier(.18,.7,.32,1) 400ms forwards;
}
@keyframes boss-intro-aura {
  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
  40%  { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.05); }
}

.boss-intro__card {
  position: absolute;
  top: 60%; left: 50%;
  transform: translate(-50%, -50%) translateX(60px) scale(0.95);
  opacity: 0;
  animation: boss-intro-card 400ms cubic-bezier(.16,1.04,.3,1) 1000ms forwards;
}
@keyframes boss-intro-card {
  0%   { opacity: 0; transform: translate(-50%, -50%) translateX(60px) scale(0.95); }
  100% { opacity: 1; transform: translate(-50%, -50%) translateX(0) scale(1); }
}

/* === Présence boss en combat === */
.enemy-card--boss {
  transform: scale(1.4);
  transform-origin: center top;
  border: 2px solid transparent;
  background:
    var(--color-surface-card) padding-box,
    linear-gradient(135deg, var(--boss-accent-deep, var(--stage-accent-deep)), var(--boss-accent, var(--stage-accent)) 50%, var(--boss-accent-deep, var(--stage-accent-deep))) border-box;
  background-size: 100% 100%, 220% 220%;
  animation: boss-card-border 8000ms linear infinite;
  box-shadow: 0 0 24px var(--boss-accent-glow, var(--stage-accent-glow));
}
@keyframes boss-card-border {
  0%   { background-position: 0 0, 0% 50%; }
  100% { background-position: 0 0, 220% 50%; }
}

.boss-hp-bar {
  position: absolute; top: 0; left: 0; right: 0;
  height: 14px;
  background: rgba(0,0,0,0.5);
  border-bottom: 1px solid var(--boss-accent-deep, var(--stage-accent-deep));
  overflow: hidden;
}
.boss-hp-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--boss-accent), var(--boss-accent-glow));
  transition: width 240ms cubic-bezier(.18,.7,.32,1);
}
.boss-hp-bar__shimmer {
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%);
  animation: boss-hp-shimmer 3000ms linear infinite;
}
@keyframes boss-hp-shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes boss-phase-flash {
  0%, 100% { box-shadow: 0 0 24px var(--boss-accent-glow); }
  35%      { box-shadow: 0 0 64px rgba(220, 80, 50, 0.85), 0 0 24px var(--boss-accent-glow); }
}
.enemy-card--boss.boss-phase-1-trigger { animation: boss-phase-flash 1000ms cubic-bezier(.18,.7,.32,1) forwards; }
@keyframes boss-phase-text-anim {
  0%, 100% { opacity: 0; }
  30%, 70% { opacity: 1; }
}
.boss-phase-text {
  position: absolute;
  top: -28px; left: 50%;
  transform: translateX(-50%);
  font-family: Georgia, serif;
  font-size: 22px;
  color: rgba(220, 80, 50, 0.95);
  text-shadow: 0 0 12px rgba(220, 80, 50, 0.6);
  opacity: 0;
  animation: boss-phase-text-anim 1000ms ease-in-out forwards;
}

@keyframes boss-card-vibrate {
  0%, 100% { transform: scale(1.4) translate3d(0, 0, 0); }
  25%      { transform: scale(1.4) translate3d(-1px, 0, 0); }
  50%      { transform: scale(1.4) translate3d(1px, 0, 0); }
  75%      { transform: scale(1.4) translate3d(0, -1px, 0); }
}
.enemy-card--boss.boss-phase-2 {
  animation: boss-card-border 8000ms linear infinite, boss-card-vibrate var(--anim-boss-card-vibrate) ease-in-out infinite;
}

@keyframes boss-die {
  0%   { opacity: 1; transform: scale(1.4); }
  35%  { opacity: 1; transform: scale(1.4); }
  60%  { opacity: 0.85; transform: scale(1.45); box-shadow: 0 0 80px var(--boss-accent-glow); }
  100% { opacity: 0; transform: scale(1.6); box-shadow: 0 0 0 0 transparent; }
}
.enemy-card--boss.is-dying { animation: boss-die 800ms cubic-bezier(.18,.7,.32,1) forwards; }

/* =========================================================================
 * V3 — REDUCED MOTION (extension du bloc V2)
 * ========================================================================= */
@media (prefers-reduced-motion: reduce) {
  /* Combat — pulses */
  .combat-hero.is-attacking,
  .combat-hero.is-attacking--special,
  .enemy-card.is-attacking {
    animation: none !important;
    outline: 2px solid var(--stage-accent);
    outline-offset: 2px;
  }

  /* Combat — projectiles invisibles, on garde l'impact */
  .projectile--physical,
  .projectile--magic,
  .projectile-heal-particle,
  .projectile-poison-particle,
  .projectile-burn-particle,
  .attack-wave {
    animation: none !important;
    opacity: 0;
  }
  .projectile--shield {
    animation: none !important;
    opacity: 0.6;
    transform: translate(-50%, -50%);
  }

  /* Combat — shakes désactivés */
  .enemy-card.is-hit,
  .combat-hero.is-hit { animation: none !important; }

  /* Combat — auras infinites désactivées */
  .enemy-card.aura-low,
  .combat-hero.aura-low {
    animation: none !important;
    box-shadow: 0 0 14px rgba(180, 30, 40, 0.4);
  }

  /* Floating numbers — pas de translation */
  .floating-num {
    animation: none !important;
    opacity: 1;
    transform: translate(calc(-50% + var(--fnum-offset-x, 0px)), -8px);
  }

  /* Cartes détaillées */
  .character-card-detailed:hover { transform: none !important; }
  .character-card-detailed--reveal { animation: none !important; opacity: 1; }
  .rarity-epic, .rarity-legendary { animation: none !important; }
  .rarity-particle--rare,
  .rarity-particle--epic,
  .rarity-particle--legendary,
  .rarity-spark--legendary { animation: none !important; opacity: 0 !important; }
  .rarity-legendary {
    background:
      linear-gradient(var(--rarity-legendary-bg), var(--rarity-legendary-bg)) padding-box,
      linear-gradient(135deg, var(--rarity-legendary-border-deep), var(--rarity-legendary-border)) border-box;
  }

  /* Reveals */
  .rarity-reveal--common .reveal-card,
  .rarity-reveal--rare .reveal-card,
  .rarity-reveal--epic .reveal-card,
  .rarity-reveal--legendary .reveal-card {
    animation: none !important;
    transform: none !important;
    opacity: 1;
    transition: opacity 200ms linear, box-shadow 200ms linear;
  }
  .rarity-reveal--common .reveal-card    { box-shadow: 0 0 0 1px var(--rarity-common-border); }
  .rarity-reveal--rare .reveal-card      { box-shadow: 0 0 0 2px var(--rarity-rare-border), 0 0 18px var(--rarity-rare-glow); }
  .rarity-reveal--epic .reveal-card      { box-shadow: 0 0 0 2px var(--rarity-epic-border), 0 0 22px var(--rarity-epic-glow); }
  .rarity-reveal--legendary .reveal-card { box-shadow: 0 0 0 3px var(--rarity-legendary-border), 0 0 30px var(--rarity-legendary-glow); }
  .reveal-particle { display: none !important; }
  .lootbox-screen.is-revealing-legendary { animation: none !important; }

  /* Roulette */
  .loot-roulette__strip { transition: opacity 200ms linear; }
  .loot-roulette__item.is-hovered,
  .loot-roulette__item.is-winner { animation: none !important; transform: none !important; }

  /* Coffres */
  .chest-tier--damaged,
  .chest-tier--bronze,
  .chest-tier--silver,
  .chest-tier--royal,
  .chest-tier--runic { animation: none !important; }
  .chest-rune--runic { animation: none !important; opacity: 0.6 !important; }
  .chest-particle--bronze,
  .chest-particle--silver,
  .chest-particle--royal,
  .chest-particle--runic { animation: none !important; opacity: 0 !important; }
  .chest.is-shaking { animation: none !important; }
  .chest-lid.is-opening {
    animation: none !important;
    transform: rotateX(-60deg);
    transition: transform 200ms linear;
  }
  .chest-beam { animation: none !important; opacity: 0.5; filter: none; }
  .chest-flash { animation: none !important; display: none !important; }

  /* Boss intro */
  .boss-intro-overlay { animation: none !important; opacity: 1; }
  .boss-intro__name,
  .boss-intro__subtitle,
  .boss-intro__phrase,
  .boss-intro__card { animation: none !important; opacity: 1; transform: translate(-50%, 0); }
  .boss-intro__aura { display: none !important; }
  .enemy-card--boss { animation: none !important; }
  .boss-hp-bar__shimmer { animation: none !important; opacity: 0; }
  .enemy-card--boss.boss-phase-1-trigger { animation: none !important; }
  .boss-phase-text { animation: none !important; opacity: 1; }
  .enemy-card--boss.boss-phase-2 { animation: none !important; }
  .enemy-card--boss.is-dying { animation: none !important; opacity: 0; transition: opacity 200ms linear; }
}
```

---

## 3. Notes pour le frontend-dev

- **Ne pas remplacer** les tokens V2 (`--rarity-commune`, `--chest-damaged`, etc.). Les V3 (`--rarity-common-border`, etc.) s'**ajoutent**. Les classes V2 (`.shop-item.rarity-rare`) continuent d'utiliser les tokens V2.
- **Mapping rareté FR → EN** : V2 utilise `commune/rare/epique/legendaire`, V3 utilise `common/rare/epic/legendary`. Le dev pose **les deux classes** sur les CharacterCardDetailed (V3) pour compat : `<div className={`character-card-detailed rarity-${rarityV3} rarity-${rarityV2Original}`}>`.
- **`will-change`** : à poser uniquement par les composants React au mount (transform, opacity), retirer au unmount. Pas en CSS statique sur les classes de base.
- **Cap layers** : maximum 4 boucles `infinite` simultanées en combat. Compteurs : aura-low (1-3), boss-card-border (1), boss-card-vibrate (1, en phase 2), boss-hp-shimmer (1). Tester en revue.
