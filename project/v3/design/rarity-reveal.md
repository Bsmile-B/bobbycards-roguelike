# RarityReveal V3 — 5 effets de révélation

> Skills appliqués : `motion-performance-guardian` (effets ponctuels, particules max 16, micro-shake écran 180ms unique), `reduced-motion-accessibility-guardian` (fallback bordure colorée + opacity step 200ms pour tous).

## 0. Quand le composant joue

Phase `reveal` du `LootboxScreen`, déclenchée par `onComplete` de `LootRoulette`. Joue son effet selon la rareté de la carte gagnée, puis enchaîne sur la phase `opened` (carte détaillée + boutons).

Aussi utilisé pour :
- Coffre final tier-aware (récompense de fin de run) — la rareté de l'effet correspond à la rareté de la carte révélée.

## 1. Effets par rareté

### 1.1 Commun
- **Durée** : 220 ms.
- **Effet** : flash gris léger + scale 1.05 sur la carte qui apparaît.
- **Particules** : 0.
- **Micro-shake écran** : non.

```css
@keyframes reveal-common {
  0%   { opacity: 0; transform: scale(1); box-shadow: 0 0 0 0 transparent; }
  40%  { opacity: 1; transform: scale(1.05); box-shadow: 0 0 16px rgba(180,170,160,0.4); }
  100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 transparent; }
}
.rarity-reveal--common .reveal-card {
  animation: reveal-common 220ms cubic-bezier(.18,.7,.32,1) forwards;
}
```

### 1.2 Rare
- **Durée** : 280 ms.
- **Effet** : flash bleu froid + scale 1.06.
- **Particules** : 6 bleues qui partent du centre vers l'extérieur (radial burst).
- **Micro-shake écran** : non.

```css
@keyframes reveal-rare {
  0%   { opacity: 0; transform: scale(1); box-shadow: 0 0 0 0 transparent; }
  40%  { opacity: 1; transform: scale(1.06); box-shadow: 0 0 24px var(--rarity-rare-glow); }
  100% { opacity: 1; transform: scale(1); box-shadow: 0 0 14px var(--rarity-rare-glow); }
}
.rarity-reveal--rare .reveal-card {
  animation: reveal-rare 280ms cubic-bezier(.18,.7,.32,1) forwards;
}
.reveal-particle--rare {
  position: absolute;
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--rarity-rare-particle);
  box-shadow: 0 0 8px var(--rarity-rare-particle);
  animation: reveal-particle-burst 600ms cubic-bezier(.22,1,.36,1) forwards;
}
@keyframes reveal-particle-burst {
  0%   { opacity: 0; transform: translate(0, 0) scale(0.3); }
  20%  { opacity: 1; }
  100% { opacity: 0; transform: translate(var(--burst-x, 0), var(--burst-y, 0)) scale(1.2); }
}
```

`--burst-x` et `--burst-y` sont calculés en JS pour distribuer les 6 particules en cercle (60° d'écart, distance 80–120px).

### 1.3 Épique
- **Durée** : 380 ms.
- **Effet** : aura violette + scale pulse 1.08.
- **Particules** : 10 violettes (radial burst).
- **Micro-shake écran** : non.

```css
@keyframes reveal-epic {
  0%   { opacity: 0; transform: scale(1); box-shadow: 0 0 0 0 transparent; }
  35%  { opacity: 1; transform: scale(1.08); box-shadow: 0 0 36px var(--rarity-epic-glow); }
  70%  { transform: scale(1.04); box-shadow: 0 0 28px var(--rarity-epic-glow); }
  100% { opacity: 1; transform: scale(1); box-shadow: 0 0 22px var(--rarity-epic-glow); }
}
.rarity-reveal--epic .reveal-card {
  animation: reveal-epic 380ms cubic-bezier(.18,.7,.32,1) forwards;
}
.reveal-particle--epic {
  background: var(--rarity-epic-particle);
  box-shadow: 0 0 10px var(--rarity-epic-particle);
  animation: reveal-particle-burst 800ms cubic-bezier(.22,1,.36,1) forwards;
}
```

### 1.4 Légendaire
- **Durée** : 600 ms (effet principal) + halo persistant 2 s (statique après).
- **Effet** : explosion dorée + scale pulse 1.12 + halo doré persistant.
- **Particules** : 16 dorées (radial burst large) + sparks aléatoires pendant 1.5s.
- **Micro-shake écran** : OUI ±2 px sur 180 ms (seul cas de shake écran de tout le jeu).

```css
@keyframes reveal-legendary {
  0%   { opacity: 0; transform: scale(1); box-shadow: 0 0 0 0 transparent; }
  25%  { opacity: 1; transform: scale(1.12); box-shadow: 0 0 48px var(--rarity-legendary-glow-strong); }
  60%  { transform: scale(1.04); box-shadow: 0 0 36px var(--rarity-legendary-glow); }
  100% { opacity: 1; transform: scale(1); box-shadow: 0 0 30px var(--rarity-legendary-glow); }
}
.rarity-reveal--legendary .reveal-card {
  animation: reveal-legendary 600ms cubic-bezier(.18,.7,.32,1) forwards;
}
.reveal-particle--legendary {
  background: var(--rarity-legendary-particle);
  box-shadow: 0 0 12px var(--rarity-legendary-particle);
  animation: reveal-particle-burst 1000ms cubic-bezier(.22,1,.36,1) forwards;
}
.reveal-spark--legendary {
  position: absolute;
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--rarity-legendary-spark);
  box-shadow: 0 0 14px var(--rarity-legendary-spark);
  animation: rarity-spark 720ms ease-out forwards;
  /* rarity-spark défini dans rarities.md */
}

/* Micro-shake écran ±2px sur 180ms */
@keyframes legendary-screen-shake {
  0%, 100% { transform: translate3d(0, 0, 0); }
  20%      { transform: translate3d(-2px, 0, 0); }
  40%      { transform: translate3d(2px, 0, 0); }
  60%      { transform: translate3d(-1px, 1px, 0); }
  80%      { transform: translate3d(1px, 0, 0); }
}
.lootbox-screen.is-revealing-legendary {
  animation: legendary-screen-shake 180ms linear;
}
```

Le shake s'applique sur `.lootbox-screen` (le conteneur entier de l'écran lootbox), pas sur `body`. C'est ce qui donne l'impact "j'ai eu une légendaire".

### 1.5 Mythique (placeholder, RESERVED — non actif V3)
- **Durée** : 900 ms (faisceau lent).
- **Effet** : faisceau blanc-or vertical depuis le centre, ralenti dramatique (effet de zoom léger sur la carte).
- **Particules** : 24 blanc-or (réservé).
- **Micro-shake écran** : non (le ralenti remplace).

```css
@keyframes reveal-mythic {
  0%   { opacity: 0; transform: scale(0.95); }
  20%  { opacity: 1; transform: scale(1.05); box-shadow: 0 0 64px var(--rarity-mythic-glow); }
  100% { opacity: 1; transform: scale(1); box-shadow: 0 0 36px var(--rarity-mythic-glow); }
}
.rarity-reveal--mythic .reveal-card {
  animation: reveal-mythic 900ms cubic-bezier(.42,0,.58,1) forwards;
}
/* Faisceau */
.reveal-beam--mythic {
  position: absolute;
  top: 0; bottom: 0; left: 50%;
  width: 80px;
  transform: translateX(-50%) scaleY(0);
  background: linear-gradient(180deg, transparent, var(--rarity-mythic-glow), transparent);
  filter: blur(6px);
  animation: mythic-beam 900ms cubic-bezier(.42,0,.58,1) forwards;
}
@keyframes mythic-beam {
  0%   { transform: translateX(-50%) scaleY(0); opacity: 0; }
  60%  { transform: translateX(-50%) scaleY(1); opacity: 0.85; }
  100% { transform: translateX(-50%) scaleY(1); opacity: 0.4; }
}
/* En V3 : la classe .rarity-reveal--mythic ne doit jamais être appliquée. Tokens prêts pour V4. */
```

## 2. Particules — implémentation

Les particules de burst sont rendues par le composant `RarityReveal` au mount. Pour 16 particules (légendaire) :

```tsx
{Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2;
  const distance = 80 + Math.random() * 40;
  return (
    <span
      key={i}
      className="reveal-particle reveal-particle--legendary"
      style={{
        left: '50%',
        top: '50%',
        '--burst-x': `${Math.cos(angle) * distance}px`,
        '--burst-y': `${Math.sin(angle) * distance}px`,
      } as React.CSSProperties}
    />
  );
})}
```

Les particules sont retirées au `animationend` (cleanup automatique). Cap absolu : 16 simultanées (légendaire). 10 (épique). 6 (rare). 0 (commun).

## 3. Sparks légendaires

Pendant les 1500ms suivant le reveal légendaire, le composant déclenche un spark toutes les 200-400ms (timing aléatoire borné). Position aléatoire dans un rect 240×240 centré sur la carte. Cap : 3 sparks vivants simultanés.

```ts
useEffect(() => {
  if (rarity !== 'legendary' || reducedMotion) return;
  let sparks = 0;
  const id = setInterval(() => {
    if (sparks >= 3) return;
    sparks++;
    spawnSpark(() => sparks--);
  }, 200 + Math.random() * 200);
  setTimeout(() => clearInterval(id), 1500);
  return () => clearInterval(id);
}, [rarity, reducedMotion]);
```

## 4. Halo persistant

Pour épique et légendaire, après l'animation principale, le `.reveal-card` conserve un halo statique permanent (cf. keyframes finales `100%`). Pour légendaire spécifiquement, le halo a une intensité de 30px à 55%. C'est ce qui donne l'impression "cette carte continue de briller même après la révélation".

## 5. Reduced-motion — alternative pour TOUS

```css
@media (prefers-reduced-motion: reduce) {
  .rarity-reveal--common .reveal-card,
  .rarity-reveal--rare .reveal-card,
  .rarity-reveal--epic .reveal-card,
  .rarity-reveal--legendary .reveal-card,
  .rarity-reveal--mythic .reveal-card {
    animation: none !important;
    transform: none !important;
    opacity: 1;
    transition: opacity 200ms linear, box-shadow 200ms linear;
  }
  /* Bordure rareté distincte mais statique */
  .rarity-reveal--common .reveal-card    { box-shadow: 0 0 0 1px var(--rarity-common-border); }
  .rarity-reveal--rare .reveal-card      { box-shadow: 0 0 0 2px var(--rarity-rare-border), 0 0 18px var(--rarity-rare-glow); }
  .rarity-reveal--epic .reveal-card      { box-shadow: 0 0 0 2px var(--rarity-epic-border), 0 0 22px var(--rarity-epic-glow); }
  .rarity-reveal--legendary .reveal-card { box-shadow: 0 0 0 3px var(--rarity-legendary-border), 0 0 30px var(--rarity-legendary-glow); }

  .reveal-particle,
  .reveal-spark--legendary,
  .reveal-beam--mythic { display: none !important; }

  .lootbox-screen.is-revealing-legendary { animation: none !important; }
}
```

L'info "rareté" reste visible **par la bordure et le halo statique**, qui sont distincts par rareté. C'est l'essentiel.

## 6. Props composant

```ts
type RarityRevealProps = {
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'; // mythic non utilisé V3
  card: Character;        // la carte à afficher après le reveal
  reducedMotion: boolean;
  onContinue: () => void; // appelé quand l'utilisateur clique "Ajouter à la collection" / "Continuer"
};
```

## 7. Layout du screen pendant reveal

```
┌──────────────────────────────── écran ────────────────────────────────┐
│                                                                       │
│              ✦  particules de burst  ✦                                │
│                                                                       │
│                  ┌──────────────────┐                                 │
│                  │   CharacterCard  │   ← carte détaillée révélée    │
│                  │     Detailed     │      (mode='reveal')            │
│                  │                  │                                 │
│                  └──────────────────┘                                 │
│                                                                       │
│           [ Ajouter à la collection ]   [ Continuer ]                 │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

Le composant `RarityReveal` wrappe le `CharacterCardDetailed` (mode='reveal') et superpose les particules/sparks/halo via z-index.

## 8. Z-index récap

| Élément | z-index |
|---------|---------|
| `.reveal-card` (CharacterCardDetailed) | 2 |
| `.reveal-particle` | 3 |
| `.reveal-spark--legendary` | 4 |
| `.reveal-beam--mythic` | 5 |
| Boutons CTA | 6 |
