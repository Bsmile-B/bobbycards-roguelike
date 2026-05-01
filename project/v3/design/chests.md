# Coffres V3 — 5 tiers vivants

> Skills appliqués : `motion-performance-guardian` (idle anims légères, particules max 8 simultanées, halos en box-shadow), `reduced-motion-accessibility-guardian` (idle désactivable, ouverture conserve la transition d'état).

## 0. Structure commune

Le coffre V2 est rendu via `.chest` + `.chest-lid` + `.chest-body` + `.chest-tier--{tier}`. V3 enrichit ces classes avec :
- Idle anim distincte par tier (avant clic).
- Particules ambiantes par tier.
- Animation d'ouverture commune en 4 phases : shake → flash → ouverture couvercle → faisceau de lumière.

Le composant `ChestOpening` (nouveau) wraps le coffre existant et orchestre l'ouverture. La V2 `FinalChest` continue de fonctionner ; on lui injecte les nouvelles classes par tier.

## 1. Damaged — bois fendu gris

**Apparence** : bois gris foncé fissuré, ferrures rouillées brunies. Pas de glow.
**Palette** : base `#3a2e26`, accent `rgba(120, 90, 70, 0.3)`, glow `rgba(70, 60, 50, 0.18)` (très faible).
**Idle** : léger souffle de poussière toutes les 4s. Pas de particules continues.
**Animation idle** :

```css
.chest-tier--damaged {
  animation: chest-damaged-breath 4000ms ease-in-out infinite;
}
@keyframes chest-damaged-breath {
  0%, 100% { box-shadow: 0 0 8px rgba(70, 60, 50, 0.18); }
  50%      { box-shadow: 0 0 14px rgba(70, 60, 50, 0.28); }
}
```

**Particules** : 0 en idle. Au moment de l'ouverture, petite poussière (3 particules grises courtes durée 400ms).
**ASCII** :

```
   ┌────────────┐
  /  ░░░░░░░░░  \      ← bois fendu
  │  ░ ▒▒░░ ▒░  │      ← ferrures rouillées
  └─[==========]─┘
        damaged
```

## 2. Bronze — bois ferré cuivré

**Apparence** : bois sombre + ferrures cuivre tiède.
**Palette** : base `#8b5a2b`, accent `rgba(206, 158, 71, 0.6)`, glow chaud `rgba(187, 110, 50, 0.28)`.
**Idle** : lueur cuivre pulsant en 3s + 2 particules orange ambrées qui montent.
**Animation idle** :

```css
.chest-tier--bronze {
  animation: chest-bronze-glow 3000ms ease-in-out infinite alternate;
}
@keyframes chest-bronze-glow {
  from { box-shadow: 0 0 12px rgba(187, 110, 50, 0.22); }
  to   { box-shadow: 0 0 22px rgba(187, 110, 50, 0.45); }
}
.chest-particle--bronze {
  position: absolute;
  width: 3px; height: 3px;
  border-radius: 50%;
  background: rgba(220, 140, 70, 0.85);
  box-shadow: 0 0 6px rgba(220, 140, 70, 0.6);
  animation: chest-particle-rise 4200ms ease-in-out infinite;
}
@keyframes chest-particle-rise {
  0%   { opacity: 0; transform: translateY(0) translateX(var(--p-x, 0)); }
  20%  { opacity: 0.8; }
  100% { opacity: 0; transform: translateY(-80px) translateX(var(--p-x, 0)); }
}
```

**Particules** : 2 (`chest-particle--bronze`), positions X fixées au mount.

## 3. Silver — métal froid argenté

**Apparence** : métal poli gris-bleu, reflets cycliques.
**Palette** : base `#b6c2cc`, accent `rgba(170, 200, 220, 0.7)`, glow argenté `rgba(180, 200, 220, 0.32)`.
**Idle** : scintillement subtil aléatoire (un sparkle toutes les 2-3s en position aléatoire) + 2-3 particules blanches lentes.
**Animation idle** : pas de pulsation continue (le scintillement remplace), juste glow statique.

```css
.chest-tier--silver {
  box-shadow: 0 0 16px rgba(180, 200, 220, 0.30);
}
.chest-sparkle--silver {
  position: absolute;
  width: 4px; height: 4px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 10px rgba(220, 230, 240, 0.85);
  border-radius: 50%;
  animation: chest-sparkle 800ms ease-out forwards;
}
@keyframes chest-sparkle {
  0%   { opacity: 0; transform: scale(0.4); }
  35%  { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0; transform: scale(1.6); }
}
.chest-particle--silver {
  width: 3px; height: 3px;
  background: rgba(220, 230, 240, 0.7);
  /* même keyframe chest-particle-rise */
  animation: chest-particle-rise 5000ms ease-in-out infinite;
}
```

**Sparkles déclenchés en JS** : `setInterval 2200ms` aléatoirisé, 1 sparkle vivant max, position aléatoire dans le rect du coffre.

## 4. Royal — or profond

**Apparence** : or chaud profond, bois rouge sang en dessous, gemme rouge centrale.
**Palette** : base `#d8b452`, accent `rgba(245, 205, 140, 0.85)`, gemme `--stage-3-accent-blood` (#8E2A2A), glow doré `rgba(216, 180, 80, 0.55)`.
**Idle** : lueur dorée pulsante 2.5s + 5 particules dorées + sparks ponctuels (mêmes sparks que rareté légendaire).

```css
.chest-tier--royal {
  animation: chest-royal-glow 2500ms ease-in-out infinite alternate;
}
@keyframes chest-royal-glow {
  from { box-shadow: 0 0 22px rgba(216, 180, 80, 0.40); }
  to   { box-shadow: 0 0 38px rgba(216, 180, 80, 0.70); }
}
.chest-particle--royal {
  width: 4px; height: 4px;
  background: rgba(245, 205, 140, 0.9);
  box-shadow: 0 0 8px rgba(245, 205, 140, 0.7);
  animation: chest-particle-rise 4200ms ease-in-out infinite;
}
.chest-spark--royal {
  /* Même classe que rarity-spark--legendary, déclenché aléatoirement */
}
```

**Particules** : 5 dorées, 1 spark toutes les 1000-1800ms (cap 2 sparks vivants simultanés).

## 5. Runic — bois noir + runes lumineuses

**Apparence** : bois noir charbon, ferrures noires, **runes** gravées dans le bois qui s'illuminent en pattern (4 runes positionnées sur le couvercle, qui s'allument tour à tour : 1 → 2 → 3 → 4 → 1, cycle 4s, chaque rune visible 1s).
**Palette** : base `#1a1518` (noir profond), accent `#6FB3D2` (cyan glacé) + `#E0B450` (or chaud), glow `rgba(120, 200, 220, 0.50)`.
**Idle** : pattern de runes + halo bleu glacé/or alterné (pulse lent 5s) + 8 particules mixtes (4 cyan + 4 or).

```css
.chest-tier--runic {
  animation: chest-runic-aura 5000ms ease-in-out infinite alternate;
}
@keyframes chest-runic-aura {
  from { box-shadow: 0 0 22px rgba(120, 200, 220, 0.35); }
  to   { box-shadow: 0 0 36px rgba(216, 180, 80, 0.45); }
}
.chest-rune--runic {
  position: absolute;
  width: 14px; height: 14px;
  border: 1px solid rgba(120, 200, 220, 0.85);
  /* glyph dessiné en CSS clip-path ou pseudo-element */
  opacity: 0.2;
  animation: chest-rune-pulse 4000ms ease-in-out infinite;
}
.chest-rune--runic:nth-child(1) { animation-delay: 0ms; }
.chest-rune--runic:nth-child(2) { animation-delay: 1000ms; }
.chest-rune--runic:nth-child(3) { animation-delay: 2000ms; }
.chest-rune--runic:nth-child(4) { animation-delay: 3000ms; }
@keyframes chest-rune-pulse {
  0%, 80%, 100% { opacity: 0.2; box-shadow: none; }
  20%, 50%      { opacity: 1; box-shadow: 0 0 10px rgba(120, 200, 220, 0.85); }
}
.chest-particle--runic {
  width: 3px; height: 3px;
  animation: chest-particle-rise 4500ms ease-in-out infinite;
}
.chest-particle--runic.cyan { background: rgba(120, 200, 220, 0.9); box-shadow: 0 0 8px rgba(120, 200, 220, 0.7); }
.chest-particle--runic.gold { background: rgba(245, 205, 140, 0.9); box-shadow: 0 0 8px rgba(245, 205, 140, 0.7); }
```

**Particules** : 8 (4 cyan + 4 or alternées). C'est le tier visuel le plus chargé (réservé fin de run runic).

## 6. Animation d'ouverture — séquence commune

L'ouverture suit toujours la même séquence (320 + 90 + 400 + 600 = 1410ms, hors faisceau persistant). Le composant `ChestOpening` orchestre :

| Phase | Durée | Effet |
|-------|-------|-------|
| 1. Shake | 320ms | tremblement (translate ±2-4px X, rotate ±2°) — amplitude scale par tier (damaged ×0.6, runic ×1.4) |
| 2. Flash | 90ms | flash blanc plein écran (`.chest-flash` overlay opacity 0 → 0.85 → 0) |
| 3. Lid open | 400ms | rotation du couvercle (transform rotate(60deg) ease-out, origine "haut du body") |
| 4. Light beam | 600ms (apparition) + persistant 1200ms | faisceau vertical depuis l'intérieur du coffre vers le haut, gradient rareté |

```css
@keyframes chest-shake-soft {
  0%, 100% { transform: translate(0, 0) rotate(0); }
  20%      { transform: translate(-2px, 0) rotate(-1deg); }
  40%      { transform: translate(2px, 0) rotate(1deg); }
  60%      { transform: translate(-1px, 1px) rotate(-0.5deg); }
  80%      { transform: translate(1px, 0) rotate(0.5deg); }
}
.chest.is-shaking--damaged  { animation: chest-shake-soft 320ms linear; --shake-mult: 0.6; }
.chest.is-shaking--bronze   { animation: chest-shake-soft 320ms linear; --shake-mult: 0.8; }
.chest.is-shaking--silver   { animation: chest-shake-soft 320ms linear; --shake-mult: 1.0; }
.chest.is-shaking--royal    { animation: chest-shake-soft 320ms linear; --shake-mult: 1.2; }
.chest.is-shaking--runic    { animation: chest-shake-soft 320ms linear; --shake-mult: 1.4; }
/* Le multiplicateur applique en JS via style inline transform pour amplifier les translations. */

@keyframes chest-flash {
  0%   { opacity: 0; }
  35%  { opacity: 0.85; }
  100% { opacity: 0; }
}
.chest-flash {
  position: fixed;
  inset: 0;
  background: white;
  pointer-events: none;
  opacity: 0;
  z-index: 60;
  animation: chest-flash 90ms ease-out forwards;
}

@keyframes chest-lid-open {
  0%   { transform: rotateX(0deg); }
  100% { transform: rotateX(-60deg); }
}
.chest-lid.is-opening {
  transform-origin: 50% 100%;
  animation: chest-lid-open 400ms cubic-bezier(.18,.7,.32,1) forwards;
}

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
  filter: blur(4px); /* OK ici car élément petit, ponctuel, hors combat */
  animation: chest-beam-rise 600ms cubic-bezier(.18,.7,.32,1) forwards;
}
.chest-beam--damaged   { --beam-color: rgba(180, 170, 160, 0.6); }
.chest-beam--bronze    { --beam-color: rgba(220, 140, 70, 0.8); }
.chest-beam--silver    { --beam-color: rgba(220, 230, 240, 0.85); }
.chest-beam--royal     { --beam-color: rgba(245, 205, 140, 0.9); }
.chest-beam--runic     { --beam-color: rgba(120, 200, 220, 0.85); }
```

**Note perf** : `filter: blur` est utilisé sur le beam parce que l'élément est petit (60×180), bref (~600ms apparition) et hors combat. C'est un cas précis où le coût est acceptable.

## 7. Reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  .chest-tier--damaged,
  .chest-tier--bronze,
  .chest-tier--silver,
  .chest-tier--royal,
  .chest-tier--runic {
    animation: none !important;
  }
  .chest-rune--runic { animation: none !important; opacity: 0.6 !important; }
  .chest-particle--bronze,
  .chest-particle--silver,
  .chest-particle--royal,
  .chest-particle--runic { animation: none !important; opacity: 0 !important; }
  .chest.is-shaking--damaged,
  .chest.is-shaking--bronze,
  .chest.is-shaking--silver,
  .chest.is-shaking--royal,
  .chest.is-shaking--runic { animation: none !important; }
  .chest-lid.is-opening {
    /* Conservé : la transition d'état est informative */
    animation: none !important;
    transform: rotateX(-60deg);
    transition: transform 200ms linear;
  }
  .chest-beam {
    animation: none !important;
    opacity: 0.5;
    filter: none;
    /* Le composant retire l'élément après 400ms */
  }
  .chest-flash {
    animation: none !important;
    display: none !important;
  }
}
```

## 8. Mapping props composant `ChestOpening`

```ts
type ChestOpeningProps = {
  tier: 'damaged' | 'bronze' | 'silver' | 'royal' | 'runic';
  onOpened: () => void;            // appelé après la fin de chest-lid-open
  reducedMotion?: boolean;         // si true, séquence raccourcie (200ms total avant onOpened)
  testId?: string;                 // ex. `chest-open-${tier}`
};
```

## 9. IDs Playwright

- `#chest-open-damaged`, `#chest-open-bronze`, `#chest-open-silver`, `#chest-open-royal`, `#chest-open-runic` — boutons d'ouverture du coffre par tier (selon le coffre actuel).
- Hook : `__game_test_skip_chest_anim()` (à exposer si nécessaire ; sinon le timing 1410ms est court enough pour `advanceTime`).

## 10. Pile visuelle (z-index récap)

| Élément | z-index |
|---------|---------|
| `.chest` (base) | 1 |
| `.chest-rune--runic`, `.chest-particle--*` | 2 |
| `.chest-beam` | 3 |
| `.chest-flash` | 60 (fullscreen overlay) |
