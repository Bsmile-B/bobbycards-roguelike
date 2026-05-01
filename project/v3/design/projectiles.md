# Projectiles V3 — 5 trajectoires

> Skills appliqués : `motion-performance-guardian` (transform/opacity, pas de filter sur grand élément), `reduced-motion-accessibility-guardian` (alternative statique pour chaque type).

## 0. Principe commun

Les projectiles vivent dans `.combat-anim-layer` (position absolute par-dessus `.battlefield`, pointer-events: none). Le composant React `Projectile` reçoit `{ origin: {x,y}, target: {x,y}, kind, durationMs, isSpecial }` et :

1. Calcule `--proj-distance-x = target.x - origin.x`, `--proj-distance-y = target.y - origin.y`.
2. Pose l'élément à `left: origin.x; top: origin.y;`.
3. Applique la classe `.projectile--{kind}` (et `.projectile--special` si `isSpecial`).
4. Au `animationend`, dispatch `target-hit` (le layer enchaîne sur le flash impact + floating number).

**Compétences spéciales** : même type de projectile mais classe `.projectile--special` qui applique :
- `transform: scale(1.4)` sur l'élément projectile (taille +40%)
- glow renforcé : box-shadow doublé
- particules de trail +50%

Les coordonnées source/cible sont prises au `mount` du projectile via les `ref` que le dev expose sur chaque `.combat-hero` et `.enemy-card`. Si les cartes bougent (shake en cours sur la source), on lock les coordonnées au moment du `attack-started` event, pas du `projectile-launched`.

## 1. Physical — trait blanc/argent rapide

**Forme** : trait étiré (24px × 4px), bordures arrondies, gradient blanc → argent.
**Couleur** : `linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(220,220,210,0.9) 70%, transparent 100%)`.
**Durée** : 240ms (base) — `var(--anim-projectile-physical)`.
**Easing** : `var(--ease-impact)` (cubic-bezier(.18,.7,.32,1)).
**Particules** : 0. Le coût visuel est dans le tracé propre + l'éclat blanc à l'impact.
**Z-index** : 5 (au-dessus des cartes, sous le HUD).

**Halo** : un pseudo-élément `::before` qui étend une box-shadow pré-calculée (pas de filter blur).

```css
.projectile--physical {
  width: 24px;
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(90deg, rgba(255,255,255,0.95), rgba(220,220,210,0.9) 70%, transparent);
  box-shadow: 0 0 8px rgba(255,250,235,0.6);
  /* keyframe : cf. animations.md §3.2 */
}
.projectile--physical.projectile--special {
  width: 34px;
  height: 5px;
  box-shadow: 0 0 14px rgba(255,250,235,0.85);
}
```

**ASCII render** (source en S, cible en T, projectile = `==`) :

```
S [hero]   ==>            [enemy] T
            240ms straight
```

**Reduced-motion** : pas de translation. L'élément est rendu invisible (opacity 0). Le flash blanc sur la cible (impact-flash-bright) suffit à signaler le hit.

## 2. Magic — projectile runique violet/cyan

**Forme** : ovale 16×8px avec halo plus large via `::after`. Couleur dominante = stage-accent (cyan stage 1, violet stage 2, or stage 3) en fallback violet par défaut hors stage.
**Couleur** : center `#a988ff` (violet) ou `#79c8e0` (cyan stage 1) avec opacity 0.95, ring de halo `rgba(140, 90, 220, 0.45)` 12px.
**Durée** : 320ms — `var(--anim-projectile-magic)`.
**Easing** : `var(--ease-projectile)` (cubic-bezier(.42,0,.58,1)).
**Particules** : 3 particules de trail rendues par le layer en parallèle (positions interpolées sur la trajectoire à 25%, 50%, 75% de la durée, durée propre 200ms, fade-out individuel).
**Z-index** : 5.

```css
.projectile--magic {
  width: 16px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(ellipse, var(--stage-accent, #a988ff) 0%, rgba(80,40,140,0.4) 70%, transparent);
  box-shadow: 0 0 12px var(--stage-accent-glow, rgba(140,90,220,0.4));
}
.projectile--magic::after {
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: radial-gradient(ellipse, transparent 35%, var(--stage-accent-glow) 60%, transparent 80%);
  opacity: 0.6;
}
.projectile--magic.projectile--special {
  width: 22px;
  height: 11px;
  box-shadow: 0 0 22px var(--stage-accent);
}
.projectile-trail--magic {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--stage-accent, #a988ff);
  opacity: 0.5;
  animation: projectile-trail-fade 200ms ease-out forwards;
}
@keyframes projectile-trail-fade {
  0%   { opacity: 0.7; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.4); }
}
```

**ASCII render** :

```
S [hero]  o · ·                   [enemy] T
             ·  ·  ·
                    o·>
            320ms in-out + 3 trail particles
```

**Reduced-motion** : invisible, pas de trail. Flash impact-flash-bright sur cible.

## 3. Heal — flux ascendant vert vers allié

**Forme** : 4 particules vertes qui s'élèvent de la source (l'allié-source du soin, ou directement la cible si auto-heal) vers la cible. Pas un projectile rectiligne — c'est un flux.
**Couleur** : `#7DBE65` (vert toxic existant V2) à `#b3dab3` (vert clair healing).
**Durée** : 380ms — `var(--anim-projectile-heal)`.
**Easing** : `cubic-bezier(.22,1,.36,1)` (ease-out doux).
**Particules** : 4, tailles 6-10px, positions de départ légèrement étalées (±8px en X), trajectoire courbée vers la cible (translateY négatif léger).
**Z-index** : 5.

```css
.projectile-heal-particle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle, #d2efbf 0%, #7DBE65 60%, transparent);
  box-shadow: 0 0 10px rgba(125, 190, 100, 0.5);
}
@keyframes heal-flow {
  0%   { transform: translate(0, 0) scale(0.6); opacity: 0; }
  20%  { opacity: 1; }
  80%  { opacity: 1; transform: translate(calc(var(--proj-distance-x) * 0.9), calc(var(--proj-distance-y) * 0.9 - 6px)) scale(1); }
  100% { transform: translate(var(--proj-distance-x), var(--proj-distance-y)) scale(0.4); opacity: 0; }
}
.projectile-heal-particle {
  animation: heal-flow var(--anim-projectile-heal) cubic-bezier(.22,1,.36,1) forwards;
  animation-duration: calc(var(--anim-projectile-heal) / var(--combat-speed));
}
```

**ASCII render** :

```
S [healer]    o · o ·                  [ally] T
                · o ·
                  · o · >
            380ms ease-out, 4 particules
```

**Reduced-motion** : pas de translation. Sur la cible, on déclenche `floating-num` `+18 SOIN` directement, sans flux. C'est suffisant pour comprendre.

## 4. Shield — cercle de runes autour de l'allié (pas de translation)

**Forme** : cercle de runes (4 ou 6 petits glyphes positionnés en cercle) qui apparaissent **autour de la cible**, pas un projectile qui voyage. Le composant React rend l'élément directement à la position de la cible (`origin = target`).
**Couleur** : bleu doux `#79b9d6` (proche stage-1-accent), border `rgba(120, 200, 220, 0.7)`.
**Durée** : 300ms à apparaître + 200ms à disparaître (total 500ms visible) — `var(--anim-projectile-shield)` couvre la phase principale.
**Easing** : ease-out (apparition) / ease-in (disparition).
**Particules** : 0 (le cercle de runes est l'élément central).

```css
.projectile--shield {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 2px solid rgba(120, 200, 220, 0.7);
  box-shadow: 0 0 18px rgba(120, 200, 220, 0.4), inset 0 0 12px rgba(120, 200, 220, 0.3);
  /* center sur la cible : translate(-50%, -50%) appliqué au mount */
}
.shield-rune {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 1px solid rgba(120, 200, 220, 0.85);
  /* 4 ou 6 runes positionnées via transform: rotate(N) translate(0, -48px) */
}
@keyframes shield-rune-form {
  0%   { transform: scale(0.4) rotate(-30deg); opacity: 0; }
  60%  { opacity: 1; }
  100% { transform: scale(1) rotate(0deg);     opacity: 0.9; }
}
.projectile--shield {
  animation: shield-rune-form var(--anim-projectile-shield) cubic-bezier(.22,1,.36,1) forwards;
  animation-duration: calc(var(--anim-projectile-shield) / var(--combat-speed));
}
```

**ASCII render** :

```
        ◇   ◇
       ┌───────┐
   ◇  │ ally  │  ◇
       └───────┘
        ◇   ◇
   300ms apparition, persiste 200ms
```

**Reduced-motion** : pas de scale, pas de rotation. Le cercle apparaît directement opacity 0.6, statique. Disparaît après 400ms en JS.

## 5. Poison / Burn — nuage particulaire persistant

**Forme** : nuage de 5–7 particules qui apparaît **sur la cible** (origin = target), monte légèrement, opacité diminue.
**Couleur** : poison = `rgba(140, 70, 180, 0.7)` (violet sombre), burn = `rgba(220, 110, 60, 0.75)` (orange sombre).
**Durée** : 600ms — `var(--anim-projectile-poison)`.
**Easing** : ease-out.
**Particules** : 5 à 7, tailles 4–8px, dispersées en X (±18px) avec dérive verticale 20px.
**Z-index** : 5.

```css
.projectile-poison-particle {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(140, 70, 180, 0.75); /* poison */
  box-shadow: 0 0 6px rgba(140, 70, 180, 0.4);
}
.projectile-burn-particle {
  background: rgba(220, 110, 60, 0.8);
  box-shadow: 0 0 6px rgba(220, 110, 60, 0.45);
}
@keyframes poison-drift {
  0%   { transform: translate(0, 0) scale(0.5);    opacity: 0; }
  20%  { opacity: 0.8; transform: translate(var(--p-drift-x), -4px) scale(1); }
  100% { transform: translate(var(--p-drift-x), -22px) scale(0.6); opacity: 0; }
}
.projectile-poison-particle,
.projectile-burn-particle {
  animation: poison-drift var(--anim-projectile-poison) ease-out forwards;
  animation-duration: calc(var(--anim-projectile-poison) / var(--combat-speed));
}
```

`--p-drift-x` est posé en style inline par le composant (random ±18px par particule).

**ASCII render** :

```
       . ° . °
      ° . ° . °  ← 5–7 particules dérivent vers le haut
       [target]
       600ms persistant
```

**Reduced-motion** : pas de translation, pas d'animation. Une seule particule statique opacité 0.6 visible 400ms puis retirée. La couleur signale le statut (violet = poison, orange = brûlure). Combiné au `floating-num` `POISON -5` ou `BRÛLURE -6`, l'info est lisible.

## 6. Mapping `kind` → trajectoire

Le dev (V3-T6) calcule le `kind` du projectile à partir de l'event `projectile-launched.trajectory`. Mapping:

| Event trajectory | Classe CSS | Visuel |
|------------------|-----------|--------|
| `physical` | `.projectile--physical` | trait blanc |
| `magic` | `.projectile--magic` | ovale runique |
| `heal` | (4 × `.projectile-heal-particle`) | flux vert |
| `shield` | `.projectile--shield` | cercle de runes |
| `poison` | (5–7 × `.projectile-poison-particle`) | nuage violet |
| `burn` | (5–7 × `.projectile-burn-particle`) | nuage orange |

Pour `physical` vs `magic` sur attaque de base, la sélection est dérivée de `member.magic > member.physical ? 'magic' : 'physical'` (cf. specs §4.2).

Pour les compétences spéciales, le mapping vient du `specialType` du héros (le dev extrait le mapping dans une table dans `App.tsx` — pas de nouveau fichier data, simple `const specialToTrajectory: Record<SpecialType, AnimTrajectory>`).

## 7. Performance — checklist

- [ ] Pas de `filter: blur` sur les projectiles. Halos = `box-shadow` ou pseudo-element.
- [ ] `will-change: transform, opacity` posé par le composant React au mount, retiré au unmount.
- [ ] Cap 12 events simultanés dans `CombatAnimationLayer` (cf. animations.md).
- [ ] Particules de trail = éléments DOM légers, retirés après leur fin d'anim. Pas de `setInterval` qui les laisse vivre.
- [ ] Coordonnées source/cible mesurées **une fois** au mount, pas à chaque frame.
- [ ] Pas de `getBoundingClientRect` dans une boucle d'anim.
