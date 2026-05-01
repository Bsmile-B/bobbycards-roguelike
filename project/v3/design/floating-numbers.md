# Floating numbers V3

> Skills appliqués : `reduced-motion-accessibility-guardian` (translation supprimée, info conservée), `motion-performance-guardian` (transform + opacity uniquement).

## 1. Variants

| Variant | Couleur principale | Couleur secondaire (border/glow) | Format affiché |
|---------|--------------------|----------------------------------|----------------|
| `damage-physical` (PH) | `#f5e6d8` (blanc cassé) | text-shadow `rgba(0,0,0,0.65)` | `-24 PH` |
| `damage-magic` (MAG) | `#cbafe2` (violet clair) | text-shadow `rgba(40,20,60,0.7)` | `-31 MAG` |
| `heal` (SOIN) | `#b3dab3` (vert clair) | text-shadow `rgba(20,50,30,0.7)` | `+18 SOIN` |
| `shield` (BCL) | `#aac8df` (bleu clair) | text-shadow `rgba(20,40,60,0.7)` | `+12 BCL` |
| `crit` (CRIT) | `#f0d99a` (or) | border 1px `rgba(206,158,71,0.85)`, padding 2/6, taille ×1.6 | `CRIT -48` |
| `poison` (POISON) | `#a880c8` (violet acide) | text-shadow `rgba(50,20,70,0.8)` | `POISON -5` |
| `burn` (BRULURE) | `#e08a55` (orange terre) | text-shadow `rgba(60,30,15,0.8)` | `BRÛLURE -6` |

Tous lisibles sur fond `#0b0a0c` (contrastes vérifiés AA : blanc cassé ≥ 14:1, vert clair ≥ 9:1, or ≥ 8:1, violet clair ≥ 6:1, orange ≥ 5.2:1).

## 2. Tokens taille

```css
:root {
  --fnum-size-base: 18px;
  --fnum-size-special: 22px;  /* compétences spéciales */
  --fnum-size-crit: 28px;     /* crit ×1.6 environ */
  --fnum-weight: 600;
  --fnum-font: Georgia, "Times New Roman", serif; /* aligné avec le ton premium dark fantasy */
}
```

Le crit applique aussi `letter-spacing: 0.02em` pour la respiration et un petit border doré (cf. classe ci-dessous).

## 3. Format texte — règles

- Toujours préfixer par `-` (dégât) ou `+` (heal/shield).
- Le **type** est en suffixe en majuscules (PH / MAG / SOIN / BCL / POISON / BRÛLURE).
- `CRIT` est un **préfixe** : `CRIT -48` (taille ×1.6, gold border).
- Les status (POISON, BRÛLURE) ont leur préfixe en début de label : `POISON -5`, `BRÛLURE -6`.
- Ne pas mélanger crit + status visuellement (priorité crit > status si les deux arrivent : crit l'emporte sur l'apparence).

## 4. Position

Le composant `FloatingNumber` reçoit `position: { x, y }` calculée par le layer (centre de la carte cible ±4% écran). Il pose l'élément en `position: absolute; left: x; top: y;` avec `transform: translate(-50%, -100%)` (centré horizontalement, ancré au-dessus de la cible).

## 5. Anti-superposition — zigzag déterministe

Quand plusieurs floating numbers vivent simultanément sur la même cible, on évite l'empilement par offset horizontal alterné en fonction du `flash.id` (ou `event.ts`) :

```ts
const zigzagX = (id: number): number => {
  const slot = id % 3; // 0, 1, 2
  return slot === 0 ? 0 : slot === 1 ? -16 : 16; // px
};
```

L'offset est appliqué via la CSS variable `--fnum-offset-x` (consommée par la keyframe `floating-rise-fade`).

## 6. Règle de regroupement

**Trigger** : 2+ floating numbers du même variant sur la même cible à <120 ms d'écart.

**Comportement** :
- 2 valeurs proches : fusionner en un seul label `-24 / -8`.
- 3 valeurs proches : `-24 / -8 / -12`.
- 4+ valeurs proches : `-32 (cumul)` où 32 = somme. Rebasculer sur cumul après 3 valeurs.

**Implémentation** : le layer maintient un buffer `pendingFloats: Map<targetId+variant, FloatingItem[]>`. À chaque event `damage-number`/`heal-number`/`shield-number`, on push dans le buffer et on (re)déclenche un timer 120ms. À l'expiration du timer, on flush :
- 1 item → render simple.
- 2 ou 3 → render concaténé `-24 / -8 / -12`.
- 4+ → render cumulé `-32 (cumul)`.

Si pendant les 120ms un autre event arrive, on reset le timer (debounce). Le buffer ne dépasse jamais 200ms total même si rafale continue (timeout de garde).

**Exception** : `CRIT` et statuts (`POISON`, `BRULURE`) ne se groupent **jamais** — chaque crit reste son propre label.

## 7. Animation

Cf. `animations.md` §3.9 (`floating-rise-fade`). Récapitulatif :
- TranslateY 0 → -28px sur 720ms.
- Opacity 0 → 1 (sur les 70 premiers ms) → 1 (palier) → 0 (250 dernières ms).
- Easing : `var(--ease-floating)` (cubic-bezier(.22,1,.36,1)).
- Durée scalée par `--combat-speed`.

## 8. Classes CSS prêtes à coller

```css
.floating-num {
  position: absolute;
  pointer-events: none;
  font-family: var(--fnum-font);
  font-weight: var(--fnum-weight);
  font-size: var(--fnum-size-base);
  text-shadow: 0 1px 2px rgba(0,0,0,0.7);
  white-space: nowrap;
  z-index: 6; /* au-dessus des projectiles */
  transform: translate(-50%, -100%);
  /* keyframe floating-rise-fade injectée par .combat-anim-layer */
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

.floating-num--special {
  font-size: var(--fnum-size-special);
}

@media (prefers-reduced-motion: reduce) {
  .floating-num {
    animation: none !important;
    opacity: 1;
    transform: translate(calc(-50% + var(--fnum-offset-x, 0px)), calc(-100% - 8px));
    /* Le composant React retire l'élément après 500ms */
  }
}
```

## 9. Props attendues côté composant

```ts
type FloatingNumberProps = {
  variant: 'damage-physical' | 'damage-magic' | 'heal' | 'shield' | 'crit' | 'poison' | 'burn';
  value: number;          // valeur principale (ou cumul)
  extras?: number[];      // valeurs additionnelles si grouped (max 2)
  isCumul?: boolean;      // true si 4+ valeurs cumulées
  isCrit?: boolean;       // applique classe --crit
  isSpecial?: boolean;    // applique classe --special (taille +)
  position: { x: number; y: number };  // px relatifs au layer
  zigzagSlot: 0 | 1 | 2;  // pour anti-superposition
  onComplete: () => void; // appelé à la fin de l'anim
};
```

## 10. Examples concrets

| Situation | Output |
|-----------|--------|
| Coup physique simple | `-24 PH` |
| Coup magique critique | `CRIT -48 MAG` (taille +60%) |
| Soin sur allié | `+18 SOIN` |
| Bouclier accordé | `+12 BCL` |
| Tick poison | `POISON -5` |
| Tick brûlure | `BRÛLURE -6` |
| Rafale 2 coups <120ms | `-24 / -8 PH` |
| Rafale 4+ coups <120ms | `-58 PH (cumul)` |
| Spécial Ronan Festin noir | `+22 SOIN` (taille `--fnum-size-special`) |
