# Animations V3 — Tokens, scaling, keyframes

> Skills appliqués : `reduced-motion-accessibility-guardian` (chaque animation a son alternative), `motion-performance-guardian` (transform + opacity uniquement, pas de filter sur grand élément animé en continu, cap GPU layers).

## 1. Principe de scaling combat

Une **seule** variable CSS `--combat-speed` (default `1`) injectée par le dev sur le sélecteur `.combat-screen`. Elle prend les valeurs `1`, `1.25` ou `1.5` selon le sélecteur de vitesse.

Toutes les animations qui se jouent **pendant un combat** (attack-pulse, projectiles, shakes, floating-rise, impact-flash, aura instable boss) écrivent leur durée :

```css
animation-duration: calc(<base> / var(--combat-speed));
```

ou pour les `transition` :

```css
transition-duration: calc(<base> / var(--combat-speed));
```

Hors combat (lootbox, coffre, boss intro pré-tick, hub) les durées sont **brutes**. Le sélecteur de vitesse ne doit pas accélérer une roulette ou une intro boss. Périmètre du scaling = la `.battlefield` et la couche `.combat-anim-layer`.

Pour les durées injectées en JS (ex. dans le composant `Projectile` qui reçoit `durationMs` en prop), le dev calcule `Math.round(base / combatSpeed)` côté React. Les keyframes CSS du projectile elles-mêmes restent en `0%–100%`, c'est `animation-duration` qui scale.

## 2. Tokens de durée — ajouter dans `:root`

```css
:root {
  /* === V3 — tokens d'animation combat === */
  --combat-speed: 1;

  /* Durations base (avant scaling) */
  --anim-attack-pulse: 220ms;          /* pulse héros avant tir */
  --anim-attack-pulse-special: 280ms;  /* pulse pour compétence spéciale (1.27×) */
  --anim-projectile-physical: 240ms;   /* trait/slash horizontal */
  --anim-projectile-magic: 320ms;      /* projectile runique avec trail */
  --anim-projectile-heal: 380ms;       /* flux ascendant vers allié */
  --anim-projectile-shield: 300ms;     /* cercle de runes autour allié */
  --anim-projectile-poison: 600ms;     /* nuage particulaire persistant */
  --anim-impact-flash: 90ms;           /* flash blanc bref sur ennemi */
  --anim-impact-flash-dark: 120ms;     /* flash rouge sombre sur allié */
  --anim-impact-flash-shield: 100ms;   /* flash bleuté bouclier consommé */
  --anim-impact-shake-enemy: 180ms;    /* shake ±3px ennemi */
  --anim-impact-shake-ally: 180ms;     /* shake ±2px allié */
  --anim-floating-rise: 720ms;         /* monte -28px et fade */
  --anim-aura-low-pulse: 2000ms;       /* boucle <30% HP */
  --anim-boss-card-vibrate: 1200ms;    /* boucle vibration boss <30% HP */

  /* Easings */
  --ease-impact: cubic-bezier(.18,.7,.32,1);    /* ease-out punchy pour impacts */
  --ease-projectile: cubic-bezier(.42,0,.58,1); /* smooth in-out projectiles */
  --ease-floating: cubic-bezier(.22,1,.36,1);   /* ease-out doux pour numbers */
  --ease-roulette: cubic-bezier(.12,.85,.25,1); /* ralentissement lootbox */
  --ease-boss-mount: cubic-bezier(.16,1.04,.3,1); /* léger overshoot boss intro */

  /* Hors combat (jamais scalées) */
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
}

.combat-screen {
  --combat-speed: 1;
}
.combat-screen.speed-125 { --combat-speed: 1.25; }
.combat-screen.speed-150 { --combat-speed: 1.5; }
```

Le dev injecte `.speed-125` / `.speed-150` selon `state.settings.combatSpeed`. La classe par défaut `.combat-screen` (sans modifier) garde `--combat-speed: 1`.

## 3. Keyframes V3

### 3.1 `attack-pulse`
Pulse léger sur la carte du héros juste avant l'envoi du projectile. Aucun déplacement (le combat doit rester compact).

```css
@keyframes attack-pulse {
  0%   { transform: scale(1); box-shadow: 0 0 0 0 var(--stage-accent-glow); }
  45%  { transform: scale(1.045); box-shadow: 0 0 18px 4px var(--stage-accent-glow); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 transparent; }
}
.combat-hero.is-attacking {
  animation: attack-pulse var(--anim-attack-pulse) var(--ease-impact) both;
  animation-duration: calc(var(--anim-attack-pulse) / var(--combat-speed));
}
.combat-hero.is-attacking--special {
  animation: attack-pulse var(--anim-attack-pulse-special) var(--ease-impact) both;
  animation-duration: calc(var(--anim-attack-pulse-special) / var(--combat-speed));
}
```

Variante symétrique `enemy-pulse` pour les attaques ennemies (mêmes timings, scale 1→1.04, glow `--stage-accent-deep`).

### 3.2 `projectile-physical`
Trait blanc/argent qui glisse en X. Le composant `Projectile` calcule `--proj-distance-x` (et `--proj-distance-y`) en pixels depuis `getBoundingClientRect`.

```css
@keyframes projectile-physical {
  0%   { transform: translate(0, 0) scaleX(1);    opacity: 0; }
  10%  { opacity: 1; }
  85%  { transform: translate(calc(var(--proj-distance-x) * 0.92), calc(var(--proj-distance-y) * 0.92)) scaleX(1.1); opacity: 1; }
  100% { transform: translate(var(--proj-distance-x), var(--proj-distance-y)) scaleX(0.6); opacity: 0; }
}
.projectile--physical {
  animation: projectile-physical var(--anim-projectile-physical) var(--ease-impact) forwards;
  animation-duration: calc(var(--anim-projectile-physical) / var(--combat-speed));
}
```

### 3.3 `projectile-magic`
Projectile runique avec scale + opacity (les particules de trail sont des éléments séparés rendus par le layer).

```css
@keyframes projectile-magic {
  0%   { transform: translate(0, 0) scale(0.4);  opacity: 0; filter: none; }
  18%  { opacity: 1; transform: translate(calc(var(--proj-distance-x) * 0.18), calc(var(--proj-distance-y) * 0.18)) scale(1); }
  82%  { transform: translate(calc(var(--proj-distance-x) * 0.92), calc(var(--proj-distance-y) * 0.92)) scale(1.05); opacity: 1; }
  100% { transform: translate(var(--proj-distance-x), var(--proj-distance-y)) scale(0.6); opacity: 0; }
}
.projectile--magic {
  animation: projectile-magic var(--anim-projectile-magic) var(--ease-projectile) forwards;
  animation-duration: calc(var(--anim-projectile-magic) / var(--combat-speed));
}
```

> Note perf : pas de `filter: blur` — le halo est un pseudo-élément `::after` avec `box-shadow` pré-calculé. Voir `projectiles.md`.

### 3.4 `enemy-shake`

```css
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
```

### 3.5 `ally-shake` (amplitude réduite, plus subtile)

```css
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
```

### 3.6 `impact-flash-bright` (ennemi touché)
Flash blanc rapide via opacité d'un overlay `::after` (pas de `filter: brightness` sur grand élément).

```css
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
```

### 3.7 `impact-flash-dark` (allié touché)

```css
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
```

### 3.8 `impact-flash-shield` (bouclier consommé)

```css
@keyframes impact-flash-shield {
  0%   { opacity: 0; transform: scale(1); }
  40%  { opacity: 0.85; transform: scale(1.06); }
  100% { opacity: 0; transform: scale(1.12); }
}
```

Joué via un `::before` overlay bleu `rgba(120, 180, 220, 0.7)`.

### 3.9 `floating-rise-fade`
Le floating number monte de -28px et disparaît sur les 250 dernières ms.

```css
@keyframes floating-rise-fade {
  0%   { transform: translate(var(--fnum-offset-x, 0), 0) scale(var(--fnum-scale, 1)); opacity: 0; }
  10%  { opacity: 1; }
  65%  { opacity: 1; transform: translate(var(--fnum-offset-x, 0), -22px) scale(var(--fnum-scale, 1)); }
  100% { opacity: 0; transform: translate(var(--fnum-offset-x, 0), -28px) scale(var(--fnum-scale, 1)); }
}
.floating-num {
  animation: floating-rise-fade var(--anim-floating-rise) var(--ease-floating) forwards;
  animation-duration: calc(var(--anim-floating-rise) / var(--combat-speed));
}
```

### 3.10 `aura-low-pulse` (cible <30% HP, hors boss)

```css
@keyframes aura-low-pulse {
  0%, 100% { box-shadow: 0 0 14px rgba(180, 30, 40, 0.35); opacity: 0.85; }
  50%      { box-shadow: 0 0 22px rgba(180, 30, 40, 0.55); opacity: 1; }
}
.enemy-card.aura-low,
.combat-hero.aura-low {
  animation: aura-low-pulse var(--anim-aura-low-pulse) ease-in-out infinite;
}
```

> Note perf : `box-shadow` pulsant est tolérable sur une carte 100×140px (pas un grand élément). Cap : 4 boucles infinite max simultanées en combat (cf. handoff architect).

### 3.11 `boss-card-vibrate` (boss <30% HP)
Vibration extrêmement subtile (2px d'amplitude, 1.2s cycle) qui se superpose à `aura-low-pulse`.

```css
@keyframes boss-card-vibrate {
  0%, 100% { transform: translate3d(0, 0, 0); }
  25%      { transform: translate3d(-1px, 0, 0); }
  50%      { transform: translate3d(1px, 0, 0); }
  75%      { transform: translate3d(0, -1px, 0); }
}
.enemy-card--boss.boss-phase-2 {
  animation: boss-card-vibrate var(--anim-boss-card-vibrate) ease-in-out infinite;
}
```

## 4. Cap simultané et perf

- Maximum **12 events** rendus simultanément par `CombatAnimationLayer` (specs §9 risques).
- Maximum **4 boucles `infinite`** simultanées en combat (handoff architect) :
  1. `aura-low-pulse` sur ennemi (et/ou boss)
  2. `boss-card-vibrate` sous 30% HP
  3. `sigil-breathe` (existant, en stage-intro uniquement, jamais en combat tick)
  4. réservé pour `step-pulse` (run-progress, hors battlefield)
- `will-change` à n'utiliser que sur les éléments en cours d'animation (le composant React le pose au mount, retire au cleanup) — pas en CSS statique.
- Pas de `filter: blur` ni `filter: drop-shadow` sur les cartes héros/ennemis qui s'animent. Halos = `box-shadow` ou pseudo-élément.

## 5. Reduced-motion — alternatives obligatoires

```css
@media (prefers-reduced-motion: reduce) {
  /* Pulses → bordure statique */
  .combat-hero.is-attacking,
  .combat-hero.is-attacking--special,
  .enemy-card.is-attacking {
    animation: none !important;
    outline: 2px solid var(--stage-accent);
    outline-offset: 2px;
    /* Le composant React retire l'outline après --anim-attack-pulse * 2 ms */
  }

  /* Projectiles → pas de translation, juste flash sur la cible */
  .projectile--physical,
  .projectile--magic,
  .projectile--heal,
  .projectile--poison {
    animation: none !important;
    transform: translate(var(--proj-distance-x), var(--proj-distance-y));
    opacity: 0; /* invisible — on s'appuie sur le flash sur la cible pour signaler le hit */
  }
  .projectile--shield {
    animation: none !important;
    opacity: 0.6;
    transform: none;
  }

  /* Shakes → opacity step (tap visible) */
  .enemy-card.is-hit,
  .combat-hero.is-hit {
    animation: none !important;
    /* Le composant React applique une classe `.flash-step` en JS, retirée après 200ms */
  }
  .flash-step {
    transition: opacity 80ms linear;
    opacity: 0.6;
  }

  /* Floating numbers → pas de translation, opacity step plus longue */
  .floating-num {
    animation: none !important;
    opacity: 1;
    transform: translate(var(--fnum-offset-x, 0), -8px);
    /* Le composant retire l'élément après 500ms en fade JS si possible, sinon step */
  }

  /* Auras infinites → désactivées */
  .enemy-card.aura-low,
  .combat-hero.aura-low,
  .enemy-card--boss.boss-phase-2 {
    animation: none !important;
    box-shadow: 0 0 14px rgba(180, 30, 40, 0.4); /* statique */
  }
}
```

## 6. Liste exhaustive — checklist reduced-motion

| Animation | Reduced-motion |
|-----------|----------------|
| `attack-pulse` | outline statique |
| `enemy-pulse` | outline statique |
| `projectile-physical/magic/heal/poison` | invisible, flash impact suffit |
| `projectile-shield` | cercle statique 600ms |
| `enemy-shake` | opacity step `.flash-step` |
| `ally-shake` | opacity step `.flash-step` |
| `impact-flash-bright` | conservé (90ms = sous le seuil) |
| `impact-flash-dark` | conservé (120ms = sous le seuil) |
| `impact-flash-shield` | conservé |
| `floating-rise-fade` | opacity step, sans translation |
| `aura-low-pulse` | box-shadow statique |
| `boss-card-vibrate` | désactivée |
| `roulette-spin` (JS) | skipped, fade-in 200ms |
| `boss-intro-mount` | fade-in 200ms |
| `chest-shake` | désactivée |
| `chest-lid-open` | conservée (transition d'état utile) |
| `rarity-flash-*` | bordure colorée + opacity step 200ms |
| `legendary-screen-shake` | désactivée (pas de shake écran) |

> **Règle d'or** : tout `prefers-reduced-motion` doit garder l'**information** (qui a tapé qui, combien de dégâts) tout en supprimant le mouvement. Aucune anim n'est invisible "pour faire propre" — chacune a sa version statique informative.
