# BossIntroOverlay V3

> Skills appliqués : `motion-performance-guardian` (overlay 1600ms ponctuel, transform/opacity uniquement), `reduced-motion-accessibility-guardian` (séquence raccourcie à 200ms, pas de scale ni d'aura).

## 1. Quand l'overlay joue

À l'apparition d'un boss (waves 10/20/30 d'un run) :
1. L'ennemi boss est créé côté reducer (`enemy.boss === true`).
2. `state.run.bossIntroAt = Date.now()` est posé.
3. `advanceCombat` ne tick **pas** le combat tant que `Date.now() - bossIntroAt < 1600`.
4. Le composant React `BossIntroOverlay` se rend en surimpression et joue la séquence 1600 ms.
5. À la fin, `bossIntroAt = null` est posé (par `advanceCombat` qui constate l'expiration au prochain TICK), et le combat reprend.

Hook test : `__game_test_skip_boss_intro()` force `bossIntroAt = null` immédiatement.

ID Playwright : `#boss-intro-skip` (un bouton invisible mais focus-trapable derrière l'overlay, qui appelle le hook au clic).

## 2. Layout

Overlay plein écran, `position: fixed; inset: 0; z-index: 70` (au-dessus du combat, sous les modaux). Centré.

```
┌──────────────────────────────── écran ────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░ vignette darken 88% noir ░░                                       │
│                                                                       │
│                         GARDIEN DES CENDRES                           │
│                         ─────────────────────                         │
│                         BOSS DE STAGE 1                               │
│                                                                       │
│                  Les cendres dansent dans l'air...                    │
│                                                                       │
│                       ┌──────────────────┐                            │
│                       │                  │                            │
│                       │   Carte boss     │  ← entre par la droite     │
│                       │   1.4× taille    │     scale 0.7 → 1          │
│                       │                  │                            │
│                       └──────────────────┘                            │
│                       (aura colorée derrière)                         │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## 3. Séquence frame-by-frame

| Phase | Plage | Effet |
|-------|-------|-------|
| **1. Darken** | 0–400 ms | overlay noir 0% → 88%, vignette se forme (radial-gradient) |
| **2. Nom + sous-titre** | 400–1000 ms | nom du boss fade-in + slight translateY(-8 → 0), aura accent stage commence à pulser derrière |
| **3. Phrase d'ambiance** | 1000–1400 ms | phrase italique 18px fade-in + carte boss entre par la droite (translateX 60 → 0, scale 0.95 → 1) |
| **4. Maintien** | 1400–1500 ms | tout reste visible (100ms de respiration) |
| **5. Fade-out** | 1500–1600 ms | tout fade vers 0 opacity, le combat reprend |

### 3.1 Phase 1 — Darken (0–400 ms)

```css
.boss-intro-overlay {
  position: fixed;
  inset: 0;
  z-index: 70;
  background: radial-gradient(circle at 50% 40%, rgba(0,0,0,0.6), rgba(0,0,0,0.92) 70%);
  opacity: 0;
  pointer-events: auto;
  animation: boss-intro-darken 400ms cubic-bezier(.18,.7,.32,1) forwards;
}
@keyframes boss-intro-darken {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}
```

### 3.2 Phase 2 — Nom (400–1000 ms)

Le nom apparaît en grand, police Georgia 56px, couleur = accent du stage.

```css
.boss-intro__name {
  position: absolute;
  top: 28%;
  left: 50%;
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
.boss-intro__subtitle {
  position: absolute;
  top: calc(28% + 70px);
  left: 50%;
  transform: translateX(-50%);
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-gold);
  opacity: 0;
  animation: boss-intro-subtitle 500ms cubic-bezier(.18,.7,.32,1) 600ms forwards;
}
@keyframes boss-intro-name {
  0%   { opacity: 0; transform: translate(-50%, -8px); }
  100% { opacity: 1; transform: translate(-50%, 0); }
}
@keyframes boss-intro-subtitle {
  0%   { opacity: 0; transform: translate(-50%, 4px); }
  100% { opacity: 1; transform: translate(-50%, 0); }
}
```

### 3.3 Aura derrière la carte (400–1500 ms)

Aura colorée pulsante (couleur = stage-accent) qui apparaît derrière l'emplacement futur de la carte boss.

```css
.boss-intro__aura {
  position: absolute;
  top: 60%;
  left: 50%;
  width: 360px;
  height: 360px;
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
```

### 3.4 Phase 3 — Phrase + carte (1000–1400 ms)

```css
.boss-intro__phrase {
  position: absolute;
  top: 44%;
  left: 50%;
  transform: translateX(-50%);
  font-style: italic;
  font-size: 18px;
  color: var(--color-text-muted);
  opacity: 0;
  animation: boss-intro-phrase 400ms cubic-bezier(.18,.7,.32,1) 1000ms forwards;
}
@keyframes boss-intro-phrase {
  0%   { opacity: 0; }
  100% { opacity: 0.9; }
}

.boss-intro__card {
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%) translateX(60px) scale(0.95);
  opacity: 0;
  animation: boss-intro-card 400ms cubic-bezier(.16,1.04,.3,1) 1000ms forwards;
}
@keyframes boss-intro-card {
  0%   { opacity: 0; transform: translate(-50%, -50%) translateX(60px) scale(0.95); }
  100% { opacity: 1; transform: translate(-50%, -50%) translateX(0) scale(1); }
}
```

> Easing `cubic-bezier(.16,1.04,.3,1)` donne un léger overshoot quand la carte arrive (effet "thump").

### 3.5 Phase 5 — Fade-out (1500–1600 ms)

```css
.boss-intro-overlay.is-leaving {
  animation: boss-intro-leave 100ms linear forwards;
}
@keyframes boss-intro-leave {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}
```

Le composant React applique `.is-leaving` à 1500ms puis se démonte à 1600ms.

## 4. Palette par boss

Les 3 boss V2 reçoivent leur accent propre. Le composant pose `style={{ '--boss-accent': ..., '--boss-accent-glow': ... }}`.

| Boss | Stage | `--boss-accent` | `--boss-accent-glow` | Phrase d'ambiance |
|------|-------|-----------------|----------------------|-------------------|
| **Gardien des Cendres** | 1 (Cryptes) | `#C9A24A` (or chaud) | `rgba(201,162,74,0.45)` | "Les cendres dansent dans l'air..." |
| **Sorcière du Vide** | 2 (Vide) | `#8E5BD5` (violet) | `rgba(142,91,213,0.45)` | "Le vide murmure son nom oublié..." |
| **Roi Brisé** | 3 (Roi Brisé) | `#D5512F` (or-rouge) | `rgba(213,81,47,0.50)` | "Sa couronne saigne encore..." |

Le dev mappe `enemy.id` (ou `enemy.bossId`) vers le triplet `{accent, glow, phrase}` dans une table dans `App.tsx`.

## 5. Présence boss en combat (post-intro)

Une fois l'intro finie, la carte boss reste visible en combat avec la classe `.enemy-card--boss` :

| Élément | Effet |
|---------|-------|
| Carte ennemi | scale 1.4× la taille normale, bordure animée gradient stage-accent |
| Barre de vie | full-width au-dessus du battlefield, graduée, shimmer subtil, accent stage |
| Intent | icône + texte 1.2× |
| À 50% PV | flash spécial unique (fade orange/rouge sur la carte boss + texte "Phase II" 1s) |
| Sous 30% PV | aura instable rouge sombre permanente + particules de rage + vibration carte (animations.md §3.11) |

```css
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
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 14px;
  background: rgba(0,0,0,0.5);
  border-bottom: 1px solid var(--boss-accent-deep, var(--stage-accent-deep));
}
.boss-hp-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--boss-accent), var(--boss-accent-glow));
  transition: width 240ms cubic-bezier(.18,.7,.32,1);
}
.boss-hp-bar__shimmer {
  position: absolute;
  top: 0; bottom: 0; left: 0; right: 0;
  background: linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%);
  animation: boss-hp-shimmer 3000ms linear infinite;
}
@keyframes boss-hp-shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Phase II — flash unique à 50% */
.enemy-card--boss.boss-phase-1-trigger {
  animation: boss-phase-flash 1000ms cubic-bezier(.18,.7,.32,1) forwards;
}
@keyframes boss-phase-flash {
  0%, 100% { box-shadow: 0 0 24px var(--boss-accent-glow); }
  35%      { box-shadow: 0 0 64px rgba(220, 80, 50, 0.85), 0 0 24px var(--boss-accent-glow); }
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
  animation: boss-phase-text 1000ms ease-in-out forwards;
}
@keyframes boss-phase-text {
  0%, 100% { opacity: 0; }
  30%, 70% { opacity: 1; }
}

/* Phase finale — aura instable + vibration (cf. animations.md §3.11) */
.enemy-card--boss.boss-phase-2 {
  /* aura-low + boss-card-vibrate déjà définis */
}
```

## 6. Mort boss — séquence dramatique

Quand `enemy.hp <= 0` :
1. Le combat tick s'arrête (déjà géré V2).
2. Le composant `EnemyCard` reçoit la classe `.is-dying` qui joue 800 ms :
   - 0–300 ms : ralentissement (tout reste visible mais immobile, aucune anim)
   - 300–600 ms : la carte se brise (scale 0.95 → 1.05, opacity 1 → 0.4)
   - 600–800 ms : explosion de particules stage-accent (8 particules radiales)

```css
.enemy-card--boss.is-dying {
  animation: boss-die 800ms cubic-bezier(.18,.7,.32,1) forwards;
}
@keyframes boss-die {
  0%   { opacity: 1; transform: scale(1.4); }
  35%  { opacity: 1; transform: scale(1.4); }
  60%  { opacity: 0.85; transform: scale(1.45); box-shadow: 0 0 80px var(--boss-accent-glow); }
  100% { opacity: 0; transform: scale(1.6); box-shadow: 0 0 0 0 transparent; }
}
.boss-death-particle {
  /* 8 particules dispersées radialement */
  animation: reveal-particle-burst 700ms cubic-bezier(.22,1,.36,1) forwards 600ms;
}
```

## 7. Reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  .boss-intro-overlay {
    animation: none !important;
    opacity: 1;
    /* Le composant React limite la durée totale à 200ms */
  }
  .boss-intro__name,
  .boss-intro__subtitle,
  .boss-intro__phrase,
  .boss-intro__card {
    animation: none !important;
    opacity: 1;
    transform: translate(-50%, 0);
  }
  .boss-intro__aura { display: none !important; }

  /* Présence boss */
  .enemy-card--boss { animation: none !important; }
  .boss-hp-bar__shimmer { animation: none !important; opacity: 0; }
  .enemy-card--boss.boss-phase-1-trigger { animation: none !important; }
  .boss-phase-text {
    animation: none !important;
    opacity: 1;
    /* Le composant retire l'élément après 800ms en JS */
  }
  .enemy-card--boss.is-dying {
    animation: none !important;
    opacity: 0;
    transition: opacity 200ms linear;
  }
  .boss-death-particle { display: none !important; }
}
```

En reduced-motion, la durée totale de l'intro doit être limitée à **200 ms** côté composant (paramètre injecté). Le bandeau du nom apparaît statique, puis l'overlay se retire 200 ms plus tard. C'est un overlay informatif, pas un spectacle.

## 8. Accessibilité

- L'overlay reçoit `role="dialog" aria-modal="true" aria-labelledby="boss-intro-name"`.
- Le focus est piégé dans l'overlay le temps de la séquence (focus-trap simple). Le bouton skip `#boss-intro-skip` est focusable et appelle `__game_test_skip_boss_intro()` au clic ou Enter.
- `<h1 id="boss-intro-name">` pour le nom du boss (sémantique forte, lu par le screen reader).
- ARIA live region : annonce "Boss : Gardien des Cendres, stage 1" pour les SR (écouter `state.run.bossIntroAt` côté composant).

## 9. Props composant

```ts
type BossIntroOverlayProps = {
  boss: {
    id: string;
    name: string;
    accent: string;       // CSS color
    accentGlow: string;   // CSS color
    accentDeep?: string;
    phrase: string;
  };
  stageNum: 1 | 2 | 3;
  reducedMotion: boolean;
  onDone: () => void;     // appelé après 1600ms (ou 200ms reduced)
};
```

## 10. Notes pour le dev

- L'overlay `BossIntroOverlay` se monte conditionnellement quand `state.run.bossIntroAt !== null && elapsed < 1600` (ou 200 reduced).
- `advanceCombat` doit vérifier `bossIntroAt` au début et early-return si `Date.now() - bossIntroAt < 1600`. La queue d'animation continue d'âger normalement (purge des events expirés).
- Au montage de l'overlay, le composant pose `body.dataset.bossIntro = "active"` pour permettre à un éventuel sound/feedback global de réagir (V3 ne le fait pas, mais V4 oui).
- Le bouton `#boss-intro-skip` est un `<button>` invisible (opacity 0, position absolute couvrant l'overlay) qui appelle `__game_test_skip_boss_intro()`. Le focus visible reste invisible (trap mais skip-only).
