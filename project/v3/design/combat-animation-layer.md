# CombatAnimationLayer V3

> Skills appliqués : `motion-performance-guardian` (cap 12 events, cleanup au TICK, transform/opacity uniquement), `reduced-motion-accessibility-guardian` (events traduits en alternatives statiques).

## 0. Rôle

Couche de rendu unique qui consomme `state.run.animQueue` et matérialise visuellement les events combat (projectiles, impacts, floating numbers). Position absolute par-dessus la `.battlefield`, **pointer-events: none**.

C'est le seul consommateur de la queue. Les producteurs (`advanceCombat`, `useSpecial`, `applyConsumable`) appendent ; le layer rend.

## 1. Structure DOM

```html
<div class="battlefield">
  <!-- cartes héros + ennemis (existant V2) -->
  <div class="combat-anim-layer" aria-hidden="true">
    <!-- éphémères : projectiles, particules, flashs, floating numbers -->
  </div>
</div>
```

## 2. Position + z-index

```css
.combat-anim-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 5; /* au-dessus des cartes (z-index: 1-2), sous le HUD (z-index: 10+) */
}
```

## 3. Coordonnées

Le layer doit calculer la position en pixels (relative à lui-même) du **centre** de chaque carte source/cible, à partir des refs DOM exposées par `CombatHero` et `EnemyCard`.

```ts
function getCenterRelativeToLayer(el: HTMLElement, layer: HTMLElement): { x: number; y: number } {
  const elRect = el.getBoundingClientRect();
  const layerRect = layer.getBoundingClientRect();
  return {
    x: (elRect.left + elRect.right) / 2 - layerRect.left,
    y: (elRect.top + elRect.bottom) / 2 - layerRect.top,
  };
}
```

**Mesure timing** : la mesure est faite **au mount d'un nouveau projectile/effet**, pas chaque frame. Si la cible bouge (shake en cours), on lock la position au moment du `attack-started`.

**Cache de refs** : le layer maintient `Map<targetId, HTMLElement>` mis à jour par les composants `CombatHero`/`EnemyCard` au mount/unmount via context. Ces refs sont stables.

## 4. Consommation de la queue

### 4.1 Mapping event → effet visuel

| Event kind | Effet rendu |
|------------|-------------|
| `attack-started` | classe `.is-attacking` ajoutée à la source pour `--anim-attack-pulse` ms |
| `projectile-launched` | élément `<Projectile>` monté (cf. `projectiles.md`), animation jouée |
| `target-hit` | classe `.is-hit` ajoutée à la cible pour `--anim-impact-shake-*` ms ; flash overlay rendu |
| `damage-number` | élément `<FloatingNumber>` monté (cf. `floating-numbers.md`) |
| `heal-number` | idem variant `heal` |
| `shield-number` | idem variant `shield` |
| `ko` | classe `.is-ko` ajoutée à la cible (fade + croix runique) |
| `boss-phase` | classe `.boss-phase-1-trigger` (phase 1) ou `.boss-phase-2` (phase 2) ajoutée à la carte boss + texte "Phase II" |

### 4.2 Logique de rendu

```tsx
function CombatAnimationLayer() {
  const animQueue = useSelector(s => s.run.animQueue);
  const layerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useCardRefs(); // context exposé par CombatHero/EnemyCard

  // Cap : n'en rendre que les 12 plus récents
  const visibleEvents = useMemo(() => animQueue.slice(-12), [animQueue]);

  return (
    <div ref={layerRef} className="combat-anim-layer" aria-hidden="true">
      {visibleEvents.map(ev => renderEvent(ev, cardRefs, layerRef))}
    </div>
  );
}
```

### 4.3 TTL et purge

Les events vivent 800 ms maximum (specs §4.13). La purge est faite **dans le reducer au TICK** (pas dans le layer) :

```ts
// reducer TICK
state.run.animQueue = state.run.animQueue.filter(ev => now - ev.ts < 800);
```

Le layer ne purge rien lui-même — il rend ce que la queue contient.

### 4.4 Cap simultané

Le specs §9 cap à 12 events simultanés. Mécaniques :
- Le layer ne rend que les 12 plus récents (slice).
- Le reducer peut aussi limiter l'append (si `animQueue.length >= 12`, il pop le plus vieux avant d'append le nouveau).

C'est la garde-fou perf. En combat 5 ennemis ×1.5, on attend ~6-8 events simultanés en pic.

## 5. Cleanup

Quand un event sort de la fenêtre (TTL ou cap), le composant React qui le rendait reçoit un unmount. Cleanup automatique :
- Les particules HTML disparaissent (DOM removed).
- Les `setTimeout` éventuels sont cleared via `useEffect` cleanup.
- Les classes `.is-attacking`, `.is-hit`, etc. sur les cartes source/cible sont retirées par leur propre timer (cf. §4.1 durations).

## 6. Reduced-motion

Le layer continue de consommer la queue, mais :
- Les `Projectile` rendent leur version statique (cf. `projectiles.md` §6).
- Les `FloatingNumber` sans translation (cf. `floating-numbers.md` §8).
- Les flashes d'impact sont conservés (durée < 200ms, sous le seuil).
- Les classes `.is-attacking`/`.is-hit` sont remplacées par des outlines statiques retirés après 200ms.

## 7. Cas particulier — attaques de zone (intent.kind === 'hex')

Pour une attaque de zone ennemie, l'event `projectile-launched` a un `targetId` spécial (ex. `'all-allies'`). Le layer rend une **onde** plutôt qu'un projectile :

```css
.attack-wave {
  position: absolute;
  width: 60px; height: 60px;
  border-radius: 50%;
  border: 2px solid var(--stage-accent);
  background: radial-gradient(circle, var(--stage-accent-glow) 0%, transparent 70%);
  transform: translate(-50%, -50%) scale(1);
  pointer-events: none;
  animation: attack-wave-expand 480ms cubic-bezier(.18,.7,.32,1) forwards;
}
@keyframes attack-wave-expand {
  0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(8); opacity: 0; }
}
```

Et déclenche un flash léger sur **chaque** allié visé.

## 8. Cas particulier — soin ennemi

Si `projectile-launched.kind === 'heal'` côté ennemi, on rend un flux ascendant doux vers l'ennemi soigné (cf. `projectiles.md` §3, mais couleur tirée vers le rouge sombre/violet pour signaler "ennemi qui soigne ennemi" au lieu du vert classique).

## 9. Performance — checklist

- [ ] **Pas** de `getBoundingClientRect` à chaque frame. Mesure unique au mount.
- [ ] **Pas** de re-render React quand la queue ne change pas (selector mémoïsé).
- [ ] **Cap absolu** 12 events rendus.
- [ ] **`will-change: transform, opacity`** posé par les composants enfants au mount, retiré au unmount.
- [ ] **Cleanup** systématique au unmount (timers, refs, listeners).
- [ ] **Pas** de `filter: blur` ou `filter: drop-shadow` sur les éléments du layer.
- [ ] **Pas** de boucle `setInterval` qui tourne en continu côté layer (les particules ont leur fin via `animationend`).
- [ ] **Pas** de mutation directe du DOM côté layer (tout via React state/refs).

## 10. ARIA / accessibilité

- `.combat-anim-layer` est `aria-hidden="true"` : les events visuels ne sont pas annoncés (sinon le SR est saturé).
- Les **événements importants** (KO d'un héros, boss-phase) sont annoncés par une **ARIA live region** ailleurs (pas dans le layer) :

```html
<div class="combat-aria-live" aria-live="polite" aria-atomic="true">
  <!-- "Phase II" / "Tu es vaincu" / "Le boss change de phase" -->
</div>
```

Le dev gère cette live region dans `CombatScene` (pas le layer).

## 11. Props composant

```tsx
type CombatAnimationLayerProps = {
  // Pas de props : le composant lit la queue via context/hook (useGameState).
};
```

C'est délibérément sans props pour éviter le couplage. Le composant est autonome.

## 12. Mise en place côté React

Le composant se monte une fois dans `CombatScene`, juste après le `<div class="battlefield">`. Le dev expose les refs des cartes via un context (`CardRefsProvider`) qui wraps `CombatScene` :

```tsx
<CardRefsProvider>
  <div className="battlefield">
    {heroes.map(h => <CombatHero ref={...} key={h.id} hero={h} />)}
    {enemies.map(e => <EnemyCard ref={...} key={e.id} enemy={e} />)}
    <CombatAnimationLayer />
  </div>
</CardRefsProvider>
```

`CardRefsProvider` maintient `Map<id, HTMLElement>` mis à jour par les composants enfants.
