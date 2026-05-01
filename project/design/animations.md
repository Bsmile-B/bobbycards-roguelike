# Animations & Transitions — V2

Toutes les durées sont **bornées par la contrainte test** : aucune animation bloquante > 800ms. La plupart sont sous 320ms. Easings repris du système : `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)` (sortie naturelle), `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)` (entrée-sortie symétrique).

**Règle universelle reduced-motion** : toute classe d'animation V2 a un override `@media (prefers-reduced-motion: reduce)` qui :
1. Soit annule l'animation (`animation: none; transition: none;`).
2. Soit la remplace par un fade simple ≤ 120ms sur `opacity`.
3. Pas de `transform`, pas de `box-shadow` animé, pas de `scale` quand reduced-motion.

---

## 1. Stage Intro — fade-in + sigil breathe

### Standard

```css
.stage-intro {
  animation: stage-intro-mount var(--dur-narr) var(--ease-out) both;
}

@keyframes stage-intro-mount {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.stage-intro__sigil {
  animation: sigil-breathe 5200ms ease-in-out infinite; /* reuse existing */
}

.stage-intro__cta {
  transition:
    transform var(--dur-base) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out);
}
.stage-intro__cta:hover { transform: translateY(-1px); box-shadow: 0 16px 38px var(--stage-accent-glow); }
```

### Reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  .stage-intro { animation: stage-intro-mount-rm 200ms ease both; }
  .stage-intro__sigil { animation: none; }
  .stage-intro__cta:hover { transform: none; }
}
@keyframes stage-intro-mount-rm { from { opacity: 0; } to { opacity: 1; } }
```

### Total perçu
600ms à l'arrivée + click utilisateur. Standard ; rien de bloquant pour les tests Playwright (qui cliquent sur `#stage-intro-enter` immédiatement).

---

## 2. Hub — Tab cross-fade

### Standard

Le content actuel fade-out, le nouveau fade-in en chevauchement court. Pas de slide.

```css
.hub-content {
  animation: hub-content-in var(--dur-base) var(--ease-out) both;
}

@keyframes hub-content-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.hub-tab {
  transition:
    background-color var(--dur-fast) ease,
    border-color var(--dur-fast) ease;
}
.hub-tab--active {
  background: var(--stage-accent-soft);
  box-shadow: inset 0 -2px 0 var(--stage-accent);
}
```

Implémentation côté React : `key={activeTab}` sur le wrapper de content force le re-mount donc l'animation se rejoue à chaque switch. Durée 200ms total — perçu instantané et propre.

### Reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  .hub-content { animation: none; }
}
```

Pas de transition de fond, juste swap CSS state pour le tab actif (color/border).

---

## 3. Shop — Achat (flash + dépense or animée)

### Flash de la card achetée

```css
.shop-item.buy-flash {
  animation: shop-buy-flash var(--dur-slow) var(--ease-out) forwards;
}

@keyframes shop-buy-flash {
  0%   { background: var(--color-surface); border-color: var(--color-border); }
  30%  { background: var(--stage-accent-soft); border-color: var(--stage-accent-deep); transform: scale(1.02); }
  100% { background: var(--color-surface); border-color: var(--color-border); transform: scale(1); opacity: 0.5; filter: grayscale(0.8); }
}
```

À 360ms la card a basculé en `--locked` final (opacité 0.5, grayscale).

### Or animé (compteur qui descend)

JS-side, pas CSS pur — le composant `HubResource` doit interpoler la valeur affichée sur 320ms quand `gold` change. Implémentation : `requestAnimationFrame` qui tick de l'ancienne valeur à la nouvelle en fonction `easeOutCubic`. Le frontend-dev gère.

```js
// pseudo
animateNumber(prev, next, 320, easeOutCubic, setDisplay);
```

À éviter : transition sur `content` en CSS — ne marche pas cross-browser proprement.

### Reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  .shop-item.buy-flash { animation: shop-buy-flash-rm 200ms ease forwards; }
}
@keyframes shop-buy-flash-rm {
  to { opacity: 0.5; filter: grayscale(0.8); }
}
```

Et JS : si reduced-motion, le compteur jump directement à la valeur finale (pas d'interpolation).

```js
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) setDisplay(next); else animateNumber(...);
```

---

## 4. Hub Resource pill — micro-feedback

Quand l'or, fragments, conso change : la pill clignote brièvement.

```css
.hub-resource.tick {
  animation: resource-tick 400ms var(--ease-out);
}

@keyframes resource-tick {
  0%   { background: var(--color-surface); }
  35%  { background: var(--stage-accent-soft); transform: translateY(-1px); }
  100% { background: var(--color-surface); transform: translateY(0); }
}
```

### Reduced-motion : annulé pur et simple.

---

## 5. Lootbox — séquence d'ouverture (séquence détaillée)

C'est le moment-clé. **Total ≤ 800ms**.

| Étape | Élément | Propriété | De → À | Durée | Easing |
|-------|---------|-----------|--------|-------|--------|
| 0. Mount | `.lootbox-screen` | opacity | 0 → 1 | 200ms | ease-out |
| Idle | `.lootbox-chest` | transform: rotate | -1.5deg ↔ 1.5deg | 1600ms | ease-in-out infinite alternate |
| 1. Click | `.lootbox-chest--opening` triggered | scale | 1 → 1.04 | 100ms | ease-out |
| 2. Flash | `.lootbox-flash` | opacity | 0 → 1 | 80ms | ease-out |
| 3. Flash sortie | `.lootbox-flash` | opacity | 1 → 0 | 120ms | ease-in |
| 4. Lid | `.chest-lid` (existant) | rotate + translateY | 0 → -16deg, 0 → -24px | 320ms | ease-out (déjà existant) |
| 5. Reveal | `.lootbox-reveal` | opacity + translateY | 0,+8px → 1,0 | 280ms | ease-out (delay 200ms) |
| 6. CTA | `.lootbox-close` | opacity | 0 → 1 | 200ms | ease (delay 400ms) |

Phases 1+2+3 = 300ms ; phase 4 démarre à 200ms (chevauchement) → fin à 520ms ; reveal de 200 à 480ms ; CTA visible à 600ms. **Total animation : 600ms** + idle. Tout est terminé avant 800ms.

### Implémentation simplifiée

Côté React : 3 états — `closed`, `opening`, `revealed`. Click déclenche `opening` (300ms via setTimeout) puis `revealed`. Toutes les transitions sont CSS, le JS ne fait que swap de classes.

```css
.lootbox-flash {
  position: fixed; inset: 0;
  background: white;
  opacity: 0;
  pointer-events: none;
  transition: opacity 80ms ease-out;
}
.lootbox-chest.opening + .lootbox-flash {
  opacity: 1;
  transition: opacity 80ms ease-out;
}
.lootbox-chest.opened + .lootbox-flash {
  opacity: 0;
  transition: opacity 120ms ease-in;
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
```

### Reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  .lootbox-chest { animation: none; transition: none; }
  .lootbox-chest.opening,
  .lootbox-chest.opened { transform: none; }
  .lootbox-flash { display: none !important; }
  .lootbox-reveal {
    transition: opacity 200ms ease;
    transform: none;
  }
}
```

Total reduced-motion : **200ms** simple fade. Le résultat apparaît, point.

---

## 6. Recycle confirm modale — slide-up

```css
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0);
  backdrop-filter: blur(0px);
  transition: background 200ms ease, backdrop-filter 200ms ease;
  z-index: 50;
}
.modal-backdrop.open {
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
}

.recycle-confirm-modal {
  opacity: 0;
  transform: translate(-50%, -42%);
  transition:
    opacity 200ms var(--ease-out),
    transform 200ms var(--ease-out);
}
.recycle-confirm-modal.open {
  opacity: 1;
  transform: translate(-50%, -50%);
}
```

### Reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  .recycle-confirm-modal {
    transition: opacity 120ms ease;
    transform: translate(-50%, -50%);
  }
  .modal-backdrop { transition: background 120ms ease; backdrop-filter: none !important; }
}
```

---

## 7. Run progress — pulse current step

```css
.run-progress__step--current {
  animation: step-pulse 1400ms ease-in-out infinite alternate;
}
@keyframes step-pulse {
  from { box-shadow: 0 0 6px var(--stage-accent-glow); opacity: 0.85; }
  to   { box-shadow: 0 0 14px var(--stage-accent); opacity: 1; }
}
```

### Step transition (passage à passé)

```css
.run-progress__step {
  transition:
    background-color 240ms var(--ease-out),
    border-color 240ms var(--ease-out);
}
```

### Reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  .run-progress__step--current {
    animation: none;
    outline: 2px solid var(--stage-accent);
    outline-offset: 2px;
  }
  .run-progress__step { transition: none; }
}
```

---

## 8. Final chest reveal

### Standard (s'ajoute au comportement `.chest.opened` existant)

```css
.chest-tier--royal,
.chest-tier--runic {
  animation: chest-glow-idle 2400ms ease-in-out infinite alternate;
}
@keyframes chest-glow-idle {
  from { filter: drop-shadow(0 22px 36px rgba(0,0,0,0.4)) drop-shadow(0 0 18px var(--stage-accent-glow)); }
  to   { filter: drop-shadow(0 22px 36px rgba(0,0,0,0.4)) drop-shadow(0 0 32px var(--stage-accent)); }
}

.chest-tier--runic::after {
  /* runes rotation (definit dans wireframes.md §11) */
  animation: chest-runes 8000ms linear infinite;
}
@keyframes chest-runes {
  to { transform: rotate(360deg); }
}

.chest.opened {
  /* lid rotation existante 360ms — on ne touche pas */
}

.chest-tier--royal.opened ~ .chest-flash,
.chest-tier--runic.opened ~ .chest-flash {
  animation: chest-final-flash 320ms ease-out forwards;
}
@keyframes chest-final-flash {
  0%   { opacity: 0; }
  30%  { opacity: 0.6; }
  100% { opacity: 0; }
}
```

### Reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  .chest-tier--royal,
  .chest-tier--runic { animation: none; }
  .chest-tier--runic::after { animation: none; }
  .chest-flash { display: none; }
}
```

---

## 9. Consumable slot — pulse + use flash

### Pulse (slot rempli)

```css
.consumable-slot--filled {
  animation: conso-pulse 1800ms ease-in-out infinite alternate;
}
@keyframes conso-pulse {
  from { box-shadow: 0 0 0 1px var(--color-border); }
  to   { box-shadow: 0 0 14px var(--stage-accent-glow); }
}
```

### Use (clic en combat)

```css
.consumable-slot.using {
  animation: conso-use 240ms ease-out forwards;
}
@keyframes conso-use {
  0%   { transform: scale(1); opacity: 1; }
  40%  { transform: scale(1.18); opacity: 1; box-shadow: 0 0 24px var(--stage-accent); }
  100% { transform: scale(0.6); opacity: 0; box-shadow: none; }
}
```

Après 240ms, le state passe à `--empty` et le slot revient instantanément à l'état empty.

### Reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  .consumable-slot--filled { animation: none; }
  .consumable-slot.using {
    animation: conso-use-rm 160ms ease forwards;
  }
}
@keyframes conso-use-rm { to { opacity: 0; } }
```

---

## 10. Récapitulatif des durées

| Élément | Standard | Reduced |
|---------|----------|---------|
| Stage intro mount | 600ms | 200ms |
| Hub content cross-fade | 200ms | 0 |
| Hub tab hover | 120ms | 0 |
| Shop buy flash | 360ms | 200ms |
| Resource tick | 400ms | 0 |
| Lootbox total | 600ms | 200ms |
| Modal slide-up | 200ms | 120ms |
| Run progress pulse | 1400ms infini | 0 (outline statique) |
| Run step transition | 240ms | 0 |
| Chest idle glow | 2400ms infini (royal/runic) | 0 |
| Chest open | 320ms (existant) | 320ms (existant, gardé) |
| Conso pulse | 1800ms infini | 0 |
| Conso use | 240ms | 160ms |

Toutes les animations bloquantes (flash, swap, reveal) sont **≤ 600ms**. Aucune ne bloque l'input utilisateur (les boutons restent cliquables pendant l'animation grâce à `pointer-events` non-modifié sauf sur la `.lootbox-flash` qui est `pointer-events: none`).

---

## 11. Audit prefers-reduced-motion (checklist dev)

Lors de l'implémentation, vérifier que **chaque** classe d'animation V2 a sa contrepartie reduced-motion :

- [ ] `.stage-intro` mount
- [ ] `.stage-intro__sigil` rotation
- [ ] `.stage-intro__cta:hover` transform
- [ ] `.hub-content` cross-fade
- [ ] `.hub-tab` transition
- [ ] `.shop-item.buy-flash`
- [ ] `.hub-resource.tick`
- [ ] `.lootbox-chest` idle wobble
- [ ] `.lootbox-chest.opening` scale
- [ ] `.lootbox-flash` opacity
- [ ] `.lootbox-reveal` translateY
- [ ] `.recycle-confirm-modal` slide-up
- [ ] `.modal-backdrop` blur transition
- [ ] `.run-progress__step--current` pulse
- [ ] `.run-progress__step` transition
- [ ] `.chest-tier--royal/runic` glow
- [ ] `.chest-tier--runic::after` runes rotation
- [ ] `.chest-flash` final flash
- [ ] `.consumable-slot--filled` pulse
- [ ] `.consumable-slot.using` flash
- [ ] Number animations (gold counter) gérés JS-side avec branchement reduced

Tester avec : DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`. Aucun élément ne doit bouger ou clignoter en continu. Les transitions instantanées sont OK.
