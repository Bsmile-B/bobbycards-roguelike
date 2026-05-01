# LootRoulette V3

> Skills appliqués : `motion-performance-guardian` (translate3d sur un seul élément strip, easing manuel rAF, pas de filter), `reduced-motion-accessibility-guardian` (skip vers reveal direct).

## 1. Layout

Strip horizontal centré écran. Au-dessus, le coffre déjà **ouvert** (couvercle relevé) reste visible. En dessous, le strip qui défile.

**Dimensions cibles (1280×720)** :
- Conteneur strip : largeur 1280px, hauteur 200px, centré horizontalement.
- Item : 140×180 px (portrait runique compact + badge rareté + nom court).
- Espacement entre items : 16 px.
- Items visibles partiellement : 9–10 (`(140+16) × 9 = 1404` ≈ largeur conteneur + débord).

```
┌────────────────────────────────────────────────────────────┐  ← .loot-roulette (overflow hidden)
│        [item][item][item][item]│[item][item][item][item]   │
│                                ║ ← marqueur central (or)   │
│        ▓▓ ▓▓ ▓▓ ▓▓ ▓▓ ▓▓ ▓▓ ▓▓ │                            │
└────────────────────────────────────────────────────────────┘
```

## 2. Items du strip

**Total** : 18 items. Index final fixe : **14** (sur 18, indexés 0..17).
- Items 0..13 : leurres aléatoires (raretés mixtes commune/rare).
- Item 14 : **résultat réel** (déjà tiré par `OPEN_LOOTBOX` avant la phase roulette).
- Items 15..17 : leurres avec rareté **≥ rareté finale** (effet "presque mieux"). Si `finale = légendaire` : leurres = légendaires (cap, pas besoin d'aller plus haut puisque mythique réservé).

**Génération** :
```ts
function buildStrip(finalCard: Card, allCards: Card[]): Card[] {
  const strip: Card[] = [];
  for (let i = 0; i < 14; i++) strip.push(pickRandomDecoy(allCards));      // décor
  strip.push(finalCard);                                                    // index 14 = result
  const finalRarity = finalCard.rarity;
  for (let i = 0; i < 3; i++) strip.push(pickDecoyAtLeast(allCards, finalRarity)); // tension
  return strip;
}
```

`pickDecoyAtLeast` choisit dans le pool des cartes de rareté ≥ finale. Si finale = légendaire, on tire dans les légendaires. Si une seule légendaire existe (le résultat lui-même), on duplique le visuel mais en grisant légèrement (variant `--decoy`) pour éviter "j'ai eu cette carte 4 fois".

## 3. Marqueur central

Curseur vertical fixe au centre du conteneur. Couleur or, glow doux. Z-index au-dessus du strip mais sous l'overlay reveal final.

```css
.loot-roulette__marker {
  position: absolute;
  top: 0; bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  background: linear-gradient(180deg, transparent, var(--rarity-legendary-border) 30%, var(--rarity-legendary-border) 70%, transparent);
  box-shadow: 0 0 14px var(--rarity-legendary-glow);
  pointer-events: none;
  z-index: 5;
}
.loot-roulette__marker::before,
.loot-roulette__marker::after {
  /* triangles haut + bas pour signaler le marqueur */
  content: "";
  position: absolute;
  left: 50%;
  width: 0; height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  transform: translateX(-50%);
}
.loot-roulette__marker::before {
  top: -4px;
  border-top: 8px solid var(--rarity-legendary-border);
}
.loot-roulette__marker::after {
  bottom: -4px;
  border-bottom: 8px solid var(--rarity-legendary-border);
}
```

## 4. Mécanique de défilement

### 4.1 Calcul de la translation

Les items sont placés en flex sur la strip (`display: flex; gap: 16px`). On calcule la translation totale `targetX` pour que le **centre du item 14** tombe exactement sur le marqueur central :

```ts
const ITEM_W = 140;
const GAP = 16;
const FINAL_INDEX = 14;
const containerWidth = 1280;
const itemCenterAtIndex = (i: number) => i * (ITEM_W + GAP) + ITEM_W / 2;
const targetX = -(itemCenterAtIndex(FINAL_INDEX) - containerWidth / 2);
// targetX ≈ -(14 * 156 + 70 - 640) = -(2184 + 70 - 640) = -1614 px
```

Le strip `translate3d(targetX, 0, 0)` à la fin de l'animation.

### 4.2 Easing et timing

- **Durée** : 2500 ms (impératif specs §4.9).
- **Easing** : `cubic-bezier(.12, .85, .25, 1)` — démarre vite, ralentit nettement en fin. C'est l'ease-out cubique fort attendu.
- **Implémentation** : rAF + interpolation manuelle (pas de transition CSS). À chaque frame :
  ```ts
  const t = Math.min(1, (now - startTs) / 2500);
  const eased = bezier(.12, .85, .25, 1)(t);
  const x = targetX * eased;
  strip.style.transform = `translate3d(${x}px, 0, 0)`;
  ```
- À `t === 1`, on déclenche l'arrêt + le pulse final (cf. §6).

## 5. Effets pendant la course

À chaque frame, le composant calcule quel item est sous le marqueur (`hoveredIndex = round((containerWidth/2 - currentX) / (ITEM_W + GAP))`). Quand l'index change :

1. L'item précédent perd la classe `.is-hovered`.
2. Le nouveau prend `.is-hovered` (mini flash 50ms scale 1.05).
3. Si l'item est rare+ : flash plus marqué (50ms scale 1.08 + glow rareté).
4. Les voisins immédiats reçoivent `.is-near-marker` (opacité 0.9, brightness légèrement réduite via `box-shadow` inset négatif).

```css
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
.loot-roulette__item.is-hovered {
  transform: scale(1.05);
}
.loot-roulette__item.is-hovered.rarity-rare      { box-shadow: 0 0 14px var(--rarity-rare-glow); }
.loot-roulette__item.is-hovered.rarity-epic      { box-shadow: 0 0 18px var(--rarity-epic-glow); transform: scale(1.07); }
.loot-roulette__item.is-hovered.rarity-legendary { box-shadow: 0 0 24px var(--rarity-legendary-glow); transform: scale(1.08); }
.loot-roulette__item.is-near-marker { opacity: 0.9; }
.loot-roulette__item--decoy        { opacity: 0.95; }
```

## 6. Arrêt sur l'item gagnant

À `t === 1` :
1. Strip s'immobilise pile sur l'item 14 centré.
2. L'item 14 reçoit `.is-winner` qui déclenche un pulse 220ms `scale(1) → scale(1.1) → scale(1)`.
3. Au `animationend`, le composant émet `onComplete()` → la phase passe à `reveal`.

```css
.loot-roulette__item.is-winner {
  animation: roulette-winner-pulse 220ms cubic-bezier(.18,.7,.32,1) forwards;
}
@keyframes roulette-winner-pulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.10); }
  100% { transform: scale(1); }
}
```

## 7. Hook test : skip

Si `prefers-reduced-motion: reduce` OU si `window.__game_test_skip_roulette()` est appelé :
1. Le strip se positionne **directement** sur la translation finale (pas d'animation).
2. Au lieu du pulse 220ms, on déclenche un fade de 200ms : opacity 0 → 1 du strip déjà en position.
3. `onComplete()` appelé après 200ms.

```ts
function skipRoulette() {
  strip.style.transform = `translate3d(${targetX}px, 0, 0)`;
  strip.style.opacity = '0';
  strip.style.transition = 'opacity 200ms linear';
  requestAnimationFrame(() => {
    strip.style.opacity = '1';
    setTimeout(onComplete, 200);
  });
}
```

Le hook `window.__game_test_skip_roulette()` est exposé par le composant au mount, retiré au unmount.

## 8. Overlay et placement vis-à-vis du coffre

```
┌──────────────────────────── écran 1280×720 ──────────────────────────┐
│                                                                      │
│                          [coffre ouvert]              ← y ≈ 120-280  │
│                          (lid relevé)                                │
│                                                                      │
│  ─────────────────────────────────────────────                       │
│  ░░ strip 200px haut, items qui défilent ░░          ← y ≈ 320-520  │
│              ║ marker ║                                              │
│  ─────────────────────────────────────────────                       │
│                                                                      │
│                   "Récompense à venir..."           ← y ≈ 580        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

Pendant la roulette, le coffre reste visible mais légèrement **fade** (opacity 0.6) pour ne pas concurrencer le strip. Au moment du `reveal`, le coffre fade out totalement et la carte détaillée apparaît à la place du strip.

## 9. Reduced-motion

- Pas de strip rendu. À `roulette` start, on passe directement à `reveal` après un fade-in 200ms du résultat.
- Pas de pulse winner.
- Pas de marker animé.

## 10. Classes CSS prêtes à coller

```css
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
  /* La translation est gérée en JS via transform: translate3d */
}
/* Item, marker : cf. §3, §5 */

@media (prefers-reduced-motion: reduce) {
  .loot-roulette__strip { transition: opacity 200ms linear; }
  .loot-roulette__item.is-hovered,
  .loot-roulette__item.is-winner { animation: none !important; transform: none !important; }
}
```

## 11. Props composant

```ts
type LootRouletteProps = {
  items: LootItem[];                      // 18 items pré-générés (résultat à index 14)
  finalIndex: number;                     // 14 par défaut, exposé pour test
  reducedMotion: boolean;
  onComplete: (winnerItem: LootItem) => void;
  testHook?: boolean;                     // si true, expose __game_test_skip_roulette
};
```

## 12. Notes pour le dev

- `bezier()` peut être implémentée à la main (snippet 20 lignes Newton-Raphson) ou via une lib utilitaire si déjà présente. Pas de nouvelle dépendance npm.
- La classe `.is-hovered` doit être appliquée **uniquement à l'item présent sous le marqueur**. Quand le strip ralentit, l'item peut rester sous le marqueur 200ms+ — c'est OK, le pulse ne se rejoue pas (la classe persiste).
- Pour la mémoire : 18 items DOM seulement, retirés au unmount du strip. Pas de leak.
- Le calcul `targetX` est fait au mount et stable. Pas de recalcul en cours d'anim.
