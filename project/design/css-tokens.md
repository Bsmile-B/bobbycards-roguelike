# CSS Tokens & Skeleton — V2

Bloc CSS prêt à coller dans `src/styles.css`. **À ajouter en deux endroits** :
1. Tokens et bascules de stage : juste après le `:root { ... }` existant (ligne 1–8 de styles.css), en **étendant** le `:root` (pas en le remplaçant).
2. Skeletons des nouveaux composants : à la fin du fichier, **avant** la media query `@media (max-width: 760px)` (ligne 1197).

Les classes existantes (`.combat-card`, `.hud-primary`, `.chest`, `.menu-sigil`, etc.) **ne sont pas touchées**.

---

## 1. Bloc à ajouter dans `:root` (extension)

```css
/* === V2 tokens — à ajouter dans :root === */
:root {
  /* ⬇ Conserver les 4 propriétés existantes (color/background/font-family/...) */
  /* ⬇ AJOUTER ce qui suit ⬇ */

  /* Surfaces */
  --color-bg: #0b0a0c;
  --color-surface: rgba(18, 16, 19, 0.78);
  --color-surface-deep: rgba(14, 13, 16, 0.78);
  --color-surface-card: rgba(16, 15, 18, 0.88);
  --color-border: rgba(237, 231, 220, 0.12);
  --color-border-hot: rgba(187, 157, 100, 0.28);

  /* Texte */
  --color-text: #f3eadb;
  --color-text-strong: #f7efe2;
  --color-text-muted: #a99f91;
  --color-text-faint: #91887c;
  --color-text-gold: #bb9d64;

  /* Accent générique */
  --accent: #bb9d64;
  --accent-soft: rgba(187, 157, 100, 0.28);
  --accent-glow: rgba(187, 157, 100, 0.16);
  --on-accent: #1a1410;

  /* Stage accent — overridé par .stage-N */
  --stage-accent: var(--accent);
  --stage-accent-soft: var(--accent-soft);
  --stage-accent-glow: var(--accent-glow);
  --stage-accent-deep: rgba(187, 157, 100, 0.7);
  --stage-on-accent: var(--on-accent);

  /* Stage 1 — Cryptes froides */
  --stage-1-accent: #6FB3D2;
  --stage-1-accent-soft: rgba(111, 179, 210, 0.28);
  --stage-1-accent-glow: rgba(111, 179, 210, 0.18);
  --stage-1-accent-deep: rgba(48, 84, 92, 0.78);
  --stage-1-on-accent: #061018;

  /* Stage 2 — Sanctuaire du Vide */
  --stage-2-accent: #8E5BD5;
  --stage-2-accent-soft: rgba(142, 91, 213, 0.28);
  --stage-2-accent-glow: rgba(142, 91, 213, 0.20);
  --stage-2-accent-deep: rgba(72, 38, 110, 0.78);
  --stage-2-accent-toxic: #7DBE65;
  --stage-2-on-accent: #0e0816;

  /* Stage 3 — Salle du Roi Brisé */
  --stage-3-accent: #C9A24A;
  --stage-3-accent-soft: rgba(201, 162, 74, 0.30);
  --stage-3-accent-glow: rgba(201, 162, 74, 0.22);
  --stage-3-accent-deep: rgba(142, 42, 42, 0.82);
  --stage-3-accent-blood: #8E2A2A;
  --stage-3-on-accent: #14100a;

  /* Raretés */
  --rarity-commune: rgba(173, 174, 165, 0.55);
  --rarity-rare: rgba(91, 141, 168, 0.78);
  --rarity-epique: rgba(142, 92, 170, 0.82);
  --rarity-legendaire: rgba(206, 158, 71, 0.92);
  --rarity-runique: rgba(120, 200, 220, 0.92);

  /* Coffres */
  --chest-damaged: #4a3a30;
  --chest-bronze: #8b5a2b;
  --chest-silver: #b6c2cc;
  --chest-royal: #d8b452;
  --chest-runic: #6FB3D2;

  /* Espacements */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-8: 48px;

  /* Rayons */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-pill: 999px;

  /* Ombres */
  --shadow-card: 0 16px 42px rgba(0, 0, 0, 0.32);
  --shadow-deep: 0 20px 60px rgba(0, 0, 0, 0.28);
  --shadow-hot: 0 14px 32px rgba(88, 18, 31, 0.34);

  /* Anim */
  --dur-fast: 120ms;
  --dur-base: 200ms;
  --dur-slow: 360ms;
  --dur-narr: 600ms;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}

/* === Bascule de stage === */
.app-shell.stage-1, .hub-screen.stage-1, .stage-intro.stage-1 {
  --stage-accent: var(--stage-1-accent);
  --stage-accent-soft: var(--stage-1-accent-soft);
  --stage-accent-glow: var(--stage-1-accent-glow);
  --stage-accent-deep: var(--stage-1-accent-deep);
  --stage-on-accent: var(--stage-1-on-accent);
}

.app-shell.stage-2, .hub-screen.stage-2, .stage-intro.stage-2 {
  --stage-accent: var(--stage-2-accent);
  --stage-accent-soft: var(--stage-2-accent-soft);
  --stage-accent-glow: var(--stage-2-accent-glow);
  --stage-accent-deep: var(--stage-2-accent-deep);
  --stage-on-accent: var(--stage-2-on-accent);
}

.app-shell.stage-3, .hub-screen.stage-3, .stage-intro.stage-3 {
  --stage-accent: var(--stage-3-accent);
  --stage-accent-soft: var(--stage-3-accent-soft);
  --stage-accent-glow: var(--stage-3-accent-glow);
  --stage-accent-deep: var(--stage-3-accent-deep);
  --stage-on-accent: var(--stage-3-on-accent);
}
```

---

## 2. Skeleton des nouveaux composants

À ajouter à la fin de `styles.css`, **avant** `@media (max-width: 760px)`. Le frontend-dev complétera les détails fins (espacement précis, polish hover) ; les structures et les noms de classes sont fixes.

```css
/* =========================================================================
 * V2 — RUN PROGRESS
 * ========================================================================= */
.run-progress {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto var(--space-2);
  display: grid;
  gap: var(--space-2);
}
.run-progress__legend {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  color: var(--color-text-muted);
  font-size: 0.84rem;
}
.run-progress__legend strong {
  color: var(--color-text-strong);
  font-family: Georgia, "Times New Roman", serif;
}
.run-progress__bar {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-wrap: nowrap;
  justify-content: center;
}
.run-progress__stage {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
.run-progress__step {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid var(--color-border);
  background: transparent;
  transition:
    background-color 240ms var(--ease-out),
    border-color 240ms var(--ease-out);
}
.run-progress__step--passed {
  background: var(--stage-accent-soft);
  border-color: var(--stage-accent-deep);
}
.run-progress__step--current {
  background: var(--stage-accent);
  border-color: var(--stage-accent);
  animation: step-pulse 1400ms ease-in-out infinite alternate;
}
.run-progress__step--future {
  /* default — bordure neutre, fond transparent */
}
.run-progress__step--boss {
  width: 18px;
  height: 18px;
  transform: rotate(45deg);
  border-color: var(--accent);
}
.run-progress__step--boss.run-progress__step--passed {
  background: var(--accent);
}
.run-progress__step--boss.run-progress__step--current {
  background: var(--stage-accent);
  box-shadow: 0 0 14px var(--stage-accent-glow);
}
.run-progress__step--hub {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border-color: var(--color-text-gold);
  background: var(--color-surface);
  position: relative;
}
.run-progress__step--hub::before {
  content: "";
  position: absolute;
  inset: 4px;
  border-radius: 2px;
  background: var(--color-text-gold);
  opacity: 0.6;
}

@keyframes step-pulse {
  from { box-shadow: 0 0 6px var(--stage-accent-glow); opacity: 0.85; }
  to   { box-shadow: 0 0 14px var(--stage-accent); opacity: 1; }
}

/* =========================================================================
 * V2 — STAGE INTRO
 * ========================================================================= */
.stage-intro {
  min-height: calc(100vh - 112px);
  display: grid;
  place-items: center;
  text-align: center;
  position: relative;
  animation: stage-intro-mount var(--dur-narr) var(--ease-out) both;
}
.stage-intro::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 50% 35%, var(--stage-accent-glow), transparent 38rem);
}
.stage-intro__sigil {
  width: 200px;
  aspect-ratio: 1;
  position: relative;
  border: 1px solid var(--stage-accent-deep);
  border-radius: 50%;
  margin: 0 auto var(--space-5);
  animation: sigil-breathe 5200ms ease-in-out infinite;
}
.stage-intro__sigil span {
  position: absolute;
  inset: 18%;
  border: 1px solid var(--stage-accent);
  transform: rotate(45deg);
}
.stage-intro__sigil span:nth-child(2) { inset: 31%; }
.stage-intro__sigil span:nth-child(3) { inset: 44%; border-radius: 50%; }
.stage-intro__title {
  margin: 0 0 var(--space-3);
  color: var(--color-text-strong);
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2.4rem, 6vw, 4.6rem);
  font-weight: 500;
  line-height: 0.95;
}
.stage-intro__eyebrow {
  color: var(--color-text-gold);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.stage-intro__atmosphere {
  max-width: 520px;
  margin: 0 auto var(--space-5);
  color: var(--color-text-muted);
  font-style: italic;
  font-size: 1.1rem;
}
.stage-intro__boss {
  color: var(--color-text);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.4rem;
  margin-bottom: var(--space-5);
}
.stage-intro__cta {
  min-height: 44px;
  min-width: 220px;
  border-radius: var(--radius-sm);
  padding: 0 var(--space-5);
  border: 1px solid var(--stage-accent-soft);
  background: linear-gradient(180deg, var(--stage-accent-deep), rgba(0,0,0,0.4));
  color: var(--color-text-strong);
  box-shadow: 0 14px 32px var(--stage-accent-glow);
  transition: transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out);
}
.stage-intro__cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 38px var(--stage-accent-glow);
}

@keyframes stage-intro-mount {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* =========================================================================
 * V2 — HUB
 * ========================================================================= */
.hub-screen {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: var(--space-3);
  min-height: calc(100vh - 112px);
}
.hub-header {
  display: grid;
  gap: var(--space-2);
}
.hub-header__eyebrow {
  color: var(--color-text-gold);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.hub-header__resources {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
.hub-resource {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-pill);
  padding: 6px 12px;
  color: var(--color-text-muted);
  font-size: 0.84rem;
  transition: background var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out);
}
.hub-resource strong {
  color: var(--color-text-strong);
  margin-left: 4px;
}
.hub-resource.tick {
  animation: resource-tick 400ms var(--ease-out);
}
@keyframes resource-tick {
  0%   { background: var(--color-surface); }
  35%  { background: var(--stage-accent-soft); transform: translateY(-1px); }
  100% { background: var(--color-surface); transform: translateY(0); }
}

.hub-tabs {
  display: flex;
  gap: var(--space-1);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-1);
}
.hub-tab {
  min-height: 38px;
  padding: 0 14px;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  background: transparent;
  border: 1px solid transparent;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  transition: background-color var(--dur-fast) ease, color var(--dur-fast) ease;
}
.hub-tab:hover { background: var(--color-surface); color: var(--color-text); }
.hub-tab--active {
  background: var(--stage-accent-soft);
  color: var(--color-text-strong);
  box-shadow: inset 0 -2px 0 var(--stage-accent);
}

.hub-content {
  min-height: 440px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  animation: hub-content-in var(--dur-base) var(--ease-out) both;
}
@keyframes hub-content-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.hub-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
.hub-continue {
  min-height: 44px;
  border-radius: var(--radius-sm);
  padding: 0 var(--space-5);
  border: 1px solid var(--stage-accent-soft);
  background: linear-gradient(180deg, var(--stage-accent-deep), rgba(0,0,0,0.4));
  color: var(--color-text-strong);
  box-shadow: 0 14px 32px var(--stage-accent-glow);
}

/* =========================================================================
 * V2 — SHOP
 * ========================================================================= */
.shop-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}
.shop-item {
  min-height: 180px;
  display: grid;
  align-content: space-between;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 1px solid var(--rarity-commune);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  position: relative;
  transition: transform var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
}
.shop-item:hover {
  transform: translateY(-1px);
}
.shop-item.rarity-rare { border-color: var(--rarity-rare); }
.shop-item.rarity-epique { border-color: var(--rarity-epique); }
.shop-item.rarity-legendaire { border-color: var(--rarity-legendaire); }
.shop-item__title {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.05rem;
  color: var(--color-text-strong);
}
.shop-item__detail {
  color: var(--color-text-muted);
  font-size: 0.86rem;
  flex: 1;
}
.shop-item__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.shop-item__price {
  color: var(--color-text-gold);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.2rem;
}
.btn-shop {
  min-height: 32px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--stage-accent-soft);
  background: var(--stage-accent-soft);
  color: var(--color-text-strong);
  transition: background var(--dur-fast) ease, transform var(--dur-fast) ease;
}
.btn-shop:hover { background: var(--stage-accent); color: var(--stage-on-accent); }
.btn-shop--disabled,
.btn-shop:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.shop-item--locked {
  opacity: 0.5;
  filter: grayscale(0.8);
}
.shop-item--unaffordable .shop-item__price {
  color: var(--stage-3-accent-blood);
}
.shop-item.buy-flash {
  animation: shop-buy-flash var(--dur-slow) var(--ease-out) forwards;
}
@keyframes shop-buy-flash {
  0%   { background: var(--color-surface); }
  30%  { background: var(--stage-accent-soft); transform: scale(1.02); }
  100% { background: var(--color-surface); transform: scale(1); opacity: 0.5; filter: grayscale(0.8); }
}

.tier-badge {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.tier-badge--commune { background: rgba(173, 174, 165, 0.16); color: #d8d2c4; }
.tier-badge--rare { background: rgba(91, 141, 168, 0.18); color: #aac8df; }
.tier-badge--epique { background: rgba(142, 92, 170, 0.20); color: #cbafe2; }
.tier-badge--legendaire { background: rgba(206, 158, 71, 0.20); color: #f0d99a; }

.shop-reroll {
  min-height: 32px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
}
.shop-reroll:hover { color: var(--color-text); border-color: var(--color-border-hot); }

/* =========================================================================
 * V2 — LOOTBOX
 * ========================================================================= */
.lootbox-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
}
.lootbox-card {
  min-height: 380px;
  display: grid;
  align-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-align: center;
  transition: border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out);
}
.lootbox-card--small { border-color: var(--stage-1-accent-deep); }
.lootbox-card--small:hover { box-shadow: 0 0 32px var(--stage-1-accent-glow); }
.lootbox-card--rare { border-color: var(--rarity-rare); }
.lootbox-card--rare:hover { box-shadow: 0 0 32px rgba(91, 141, 168, 0.3); }
.lootbox-card--epic { border-color: var(--rarity-epique); }
.lootbox-card--epic:hover { box-shadow: 0 0 32px rgba(142, 92, 170, 0.3); }
.lootbox-card--runic { border-color: var(--rarity-runique); animation: chest-glow-idle 2400ms ease-in-out infinite alternate; }
.lootbox-card--locked { opacity: 0.4; }

.lootbox-card__title {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.4rem;
  color: var(--color-text-strong);
}
.lootbox-card__chest-mini {
  width: 80px;
  height: 60px;
  margin: 0 auto;
  /* réutilise pseudo-style .chest mais en miniature */
}
.lootbox-probas {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 4px;
  text-align: left;
  color: var(--color-text-muted);
  font-size: 0.84rem;
}
.lootbox-card__price {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.6rem;
  color: var(--color-text-gold);
}

/* Lootbox screen */
.lootbox-screen {
  min-height: calc(100vh - 112px);
  display: grid;
  place-items: center;
  text-align: center;
  position: relative;
  animation: hub-content-in var(--dur-base) var(--ease-out) both;
}
.lootbox-flash {
  position: fixed;
  inset: 0;
  background: white;
  opacity: 0;
  pointer-events: none;
  z-index: 10;
}
.lootbox-chest {
  width: 200px;
  height: 140px;
  position: relative;
  margin: 0 auto var(--space-5);
  cursor: pointer;
  filter: drop-shadow(0 22px 36px rgba(0, 0, 0, 0.4));
  animation: lootbox-wobble 1600ms ease-in-out infinite alternate;
}
.lootbox-chest.opening { animation: lootbox-opening 100ms ease-out forwards; }
.lootbox-chest.opening ~ .lootbox-flash { animation: lootbox-flash-anim 200ms ease forwards; }
@keyframes lootbox-wobble {
  from { transform: rotate(-1.5deg); }
  to   { transform: rotate(1.5deg); }
}
@keyframes lootbox-opening {
  to { transform: scale(1.04); }
}
@keyframes lootbox-flash-anim {
  0%   { opacity: 0; }
  40%  { opacity: 1; }
  100% { opacity: 0; }
}
.lootbox-reveal {
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 280ms var(--ease-out) 200ms,
    transform 280ms var(--ease-out) 200ms;
}
.lootbox-chest.opened ~ .lootbox-reveal {
  opacity: 1;
  transform: translateY(0);
}
.lootbox-reveal__line {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.6rem;
  color: var(--color-text-strong);
  margin-bottom: var(--space-3);
}
.lootbox-close {
  /* réutilise btn-shop ou primary-action variant */
}

/* =========================================================================
 * V2 — RECYCLE
 * ========================================================================= */
.recycle-list {
  display: grid;
  gap: var(--space-2);
  max-height: 380px;
  overflow-y: auto;
}
.recycle-row {
  display: grid;
  grid-template-columns: 48px 1fr auto auto auto;
  align-items: center;
  gap: var(--space-3);
  min-height: 56px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
}
.recycle-row__name {
  font-family: Georgia, "Times New Roman", serif;
  color: var(--color-text-strong);
}
.recycle-row__refund {
  color: var(--color-text-gold);
  font-size: 0.86rem;
}
.recycle-empty {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-8);
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  backdrop-filter: blur(0);
  z-index: 50;
  transition: background var(--dur-base) ease, backdrop-filter var(--dur-base) ease;
}
.modal-backdrop.open {
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
}
.recycle-confirm-modal {
  position: fixed;
  top: 50%; left: 50%;
  width: min(360px, calc(100vw - 32px));
  border: 1px solid var(--color-border-hot);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  box-shadow: var(--shadow-deep);
  z-index: 51;
  opacity: 0;
  transform: translate(-50%, -42%);
  transition: opacity var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out);
}
.recycle-confirm-modal.open {
  opacity: 1;
  transform: translate(-50%, -50%);
}
.recycle-confirm-modal__title {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.3rem;
  color: var(--color-text-strong);
  margin: 0 0 var(--space-2);
}
.recycle-confirm-modal__warn {
  color: var(--stage-3-accent-blood);
  font-size: 0.9rem;
  margin-bottom: var(--space-4);
}
.recycle-confirm-modal__actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

/* =========================================================================
 * V2 — TEAM HUB
 * ========================================================================= */
.hub-team-current {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
.hub-team-card {
  min-height: 120px;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: var(--space-3);
  align-items: center;
}
.hub-team-card.swap-target {
  border-color: var(--stage-accent);
  box-shadow: 0 0 18px var(--stage-accent-glow);
}
.hub-team-card__hp-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  background: var(--stage-accent-soft);
  color: var(--color-text-strong);
  font-size: 0.72rem;
}
.hub-team-roster {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--space-2);
}
.swap-cost-tag {
  color: var(--color-text-gold);
  font-size: 0.86rem;
}

/* =========================================================================
 * V2 — STATS HUB
 * ========================================================================= */
.hub-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}
.stats-block {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  padding: var(--space-4);
}
.stats-block__title {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.2rem;
  color: var(--color-text-strong);
  margin: 0 0 var(--space-3);
}
.stats-block dl {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-2) var(--space-4);
}
.stats-block dt { color: var(--color-text-muted); font-size: 0.86rem; }
.stats-block dd {
  margin: 0;
  color: var(--color-text-strong);
  font-family: Georgia, "Times New Roman", serif;
  text-align: right;
}

/* =========================================================================
 * V2 — CONSUMABLE RAIL
 * ========================================================================= */
.consumable-rail {
  width: min(1120px, calc(100vw - 32px));
  margin: var(--space-2) auto 0;
  height: 56px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}
.consumable-slot {
  display: grid;
  grid-template-columns: 48px 1fr;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  cursor: pointer;
  transition: box-shadow var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
}
.consumable-slot--empty {
  border-style: dashed;
  cursor: not-allowed;
  opacity: 0.55;
}
.consumable-slot--empty .consumable-slot__icon::before {
  content: "+";
  color: var(--color-text-faint);
  font-size: 1.6rem;
}
.consumable-slot--filled {
  animation: conso-pulse 1800ms ease-in-out infinite alternate;
}
.consumable-slot--filled:hover {
  border-color: var(--stage-accent);
  box-shadow: 0 0 18px var(--stage-accent-glow);
}
.consumable-slot.using {
  animation: conso-use 240ms ease-out forwards;
}
.consumable-slot__icon {
  width: 48px; height: 48px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(0,0,0,0.3);
}
.consumable-slot__label {
  display: grid;
}
.consumable-slot__label strong {
  color: var(--color-text-strong);
  font-size: 0.84rem;
}
.consumable-slot__label span {
  color: var(--color-text-muted);
  font-size: 0.72rem;
}
@keyframes conso-pulse {
  from { box-shadow: 0 0 0 1px var(--color-border); }
  to   { box-shadow: 0 0 14px var(--stage-accent-glow); }
}
@keyframes conso-use {
  0%   { transform: scale(1); opacity: 1; }
  40%  { transform: scale(1.18); box-shadow: 0 0 24px var(--stage-accent); }
  100% { transform: scale(0.6); opacity: 0; }
}

/* Icônes consommables — pures CSS */
.consumable-icon-potion-heal {
  width: 28px; height: 28px;
  border-radius: 50% 50% 38% 38%;
  background: radial-gradient(circle at 50% 35%, #b3dab3, #2e5a32 70%);
  border: 1px solid rgba(141, 191, 141, 0.4);
}
.consumable-icon-bomb-runic {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 35%, #d05060, #500818 80%);
  position: relative;
}
.consumable-icon-bomb-runic::before {
  content: "";
  position: absolute;
  top: -4px; left: 50%;
  width: 4px; height: 6px;
  background: var(--color-text-faint);
  transform: translateX(-50%);
}
.consumable-icon-shield-emergency {
  width: 28px; height: 28px;
  background: linear-gradient(180deg, var(--accent), #5a4626);
  clip-path: polygon(50% 0, 100% 30%, 80% 100%, 50% 100%, 20% 100%, 0 30%);
  border: 1px solid rgba(206, 158, 71, 0.6);
}
.consumable-icon-vial-antipoison {
  width: 14px; height: 30px;
  border-radius: 4px 4px 8px 8px;
  background: linear-gradient(180deg, #8E5BD5 0%, #7DBE65 100%);
  border: 1px solid rgba(142, 91, 213, 0.6);
}

/* =========================================================================
 * V2 — FINAL CHEST TIERS
 * ========================================================================= */
.final-chest {
  position: relative;
  margin: 0 auto var(--space-5);
}
.chest-tier--damaged .chest-lid,
.chest-tier--damaged .chest-body {
  background: linear-gradient(135deg, #3a2e26, #1a130f 74%);
  border-color: rgba(120, 90, 70, 0.3);
}
.chest-tier--damaged { filter: saturate(0.6) brightness(0.85); }
.chest-tier--bronze .chest-lid,
.chest-tier--bronze .chest-body {
  background: linear-gradient(135deg, #8b5a2b, #2a1a0e 74%);
  border-color: rgba(206, 158, 71, 0.6);
}
.chest-tier--silver .chest-lid,
.chest-tier--silver .chest-body {
  background: linear-gradient(135deg, #b6c2cc, #1a2026 74%);
  border-color: rgba(170, 200, 220, 0.7);
}
.chest-tier--silver { filter: drop-shadow(0 0 14px rgba(150, 180, 200, 0.25)); }
.chest-tier--royal .chest-lid,
.chest-tier--royal .chest-body {
  background: linear-gradient(135deg, #d8b452, #4a3210 74%);
  border-color: rgba(245, 205, 140, 0.85);
}
.chest-tier--royal { animation: chest-glow-idle 2400ms ease-in-out infinite alternate; }
.chest-tier--royal::before {
  content: "";
  position: absolute;
  top: 32px; left: 50%;
  width: 14px; height: 14px;
  transform: translateX(-50%) rotate(45deg);
  background: var(--stage-3-accent-blood);
  box-shadow: 0 0 16px rgba(142, 42, 42, 0.7);
  z-index: 2;
}
.chest-tier--runic .chest-lid,
.chest-tier--runic .chest-body {
  background: linear-gradient(135deg, #6FB3D2, #1a2840 74%);
  border-color: rgba(120, 200, 220, 0.85);
}
.chest-tier--runic { animation: chest-glow-idle 2400ms ease-in-out infinite alternate; }
.chest-tier--runic::after {
  content: "";
  position: absolute;
  inset: -16px;
  border: 1px solid rgba(120, 200, 220, 0.3);
  border-radius: 50%;
  animation: chest-runes 8000ms linear infinite;
  pointer-events: none;
}

@keyframes chest-glow-idle {
  from { filter: drop-shadow(0 22px 36px rgba(0,0,0,0.4)) drop-shadow(0 0 18px var(--stage-accent-glow)); }
  to   { filter: drop-shadow(0 22px 36px rgba(0,0,0,0.4)) drop-shadow(0 0 32px var(--stage-accent)); }
}
@keyframes chest-runes {
  to { transform: rotate(360deg); }
}

/* =========================================================================
 * V2 — REDUCED MOTION (audit unique)
 * ========================================================================= */
@media (prefers-reduced-motion: reduce) {
  .stage-intro,
  .hub-content,
  .lootbox-screen,
  .recycle-confirm-modal,
  .lootbox-reveal,
  .shop-item.buy-flash,
  .hub-resource.tick,
  .consumable-slot.using {
    animation-duration: 200ms !important;
    transition-duration: 120ms !important;
  }
  .stage-intro__sigil,
  .lootbox-chest,
  .run-progress__step--current,
  .consumable-slot--filled,
  .lootbox-card--runic,
  .chest-tier--royal,
  .chest-tier--runic,
  .chest-tier--runic::after {
    animation: none !important;
  }
  .run-progress__step--current {
    outline: 2px solid var(--stage-accent);
    outline-offset: 2px;
  }
  .lootbox-flash { display: none !important; }
  .stage-intro__cta:hover,
  .shop-item:hover,
  .lootbox-card:hover {
    transform: none !important;
  }
}
```

---

## 3. Notes pour le frontend-dev

- **Ne pas wrapper** les composants combat existants (`CombatHud`, `CombatFooter`, `.hero-card`, `.enemy-card`) avec une classe `.stage-N`. La classe va sur `.app-shell` global, et seuls les nouveaux composants V2 consomment `var(--stage-accent)`. Le combat reste à son or/rouge sang habituel.
- **Le HubScreen** porte sa propre classe `.stage-N` dérivée du **stage suivant** (cf. handoff architect). Donc : hub stage 1→2 a `<div class="hub-screen stage-2">`.
- **Les icônes consommables** sont 100% CSS (gradients + clip-path). Aucun SVG, aucune image. Si une icône paraît trop sommaire, garder telle quelle pour V2 — un asset designer V3 les redessinera.
- **Les classes BEM** (`.shop-item__title`, `.recycle-row__refund`, etc.) ne sont pas obligatoires si elles cassent l'auto-complétion — le dev peut basculer en flat (`.shop-item-title`) tant que la conformité avec les sélecteurs ci-dessus est maintenue (par cohérence).
- **Toutes les classes V2 démarrent par un préfixe non-collisionnel** : `hub-`, `shop-`, `lootbox-`, `recycle-`, `run-progress`, `stage-intro`, `consumable-`, `chest-tier`. Aucune collision avec l'existant.
