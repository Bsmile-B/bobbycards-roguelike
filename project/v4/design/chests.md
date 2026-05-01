# Coffres + Roulette — Spec V4

## Coffre — DOM cible

```html
<div class="chest chest--{tier}">
  <div class="chest__body">
    <div class="chest__band"></div>
    <div class="chest__lock"></div>
  </div>
  <div class="chest__lid">
    <div class="chest__lid-band"></div>
    <div class="chest__keyhole"></div>
    <div class="chest__stud chest__stud--l"></div>
    <div class="chest__stud chest__stud--c"></div>
    <div class="chest__stud chest__stud--r"></div>
  </div>
  <!-- Si tier=runic uniquement -->
  <div class="chest__rune chest__rune--1"></div>
  <div class="chest__rune chest__rune--2"></div>
  <div class="chest__rune chest__rune--3"></div>
  <!-- Présent en permanence pour réutilisation à l'ouverture -->
  <div class="chest__burst"></div>
</div>
```

## Tiers

| Tier | Body | Aura | Idle |
|--|--|--|--|
| `damaged` | wood `#c0894d` | aucune | rotate -3deg statique, **pas** de float |
| `bronze` | bronze `#d97a3c` | bronze 0.55 | float + aura pulse-halo 4s |
| `silver` | silver `#b8c4d4` | silver 0.65 | float + aura pulse-halo 4s |
| `royal` | royal `#ffc845` | royal 0.75 | float + aura pulse-halo 3s |
| `runic` | runic `#5fdfff` | runic 0.80 | float + aura pulse-halo 3s + 3 runes glow staggerées |

## Animation d'ouverture

1. À `.is-opening` ajouté → `.chest__lid` rotateX -100deg (700ms ease-impact).
2. Simultanément `.chest__burst` joue `chest-burst` 1.2s (radial scaleY 0.4→2.4, opacity 0→1→0).
3. Une fois fini, le React peut afficher la roulette / le contenu du coffre.

## Roulette — DOM cible

```html
<div class="loot-roulette" data-state="spinning">
  <div class="rou__marker"></div>
  <div class="rou__fade-l"></div>
  <div class="rou__fade-r"></div>
  <div class="rou__strip" style="transform: translateX(-{X}px)">
    <div class="rou__item rarity-{kind}">
      <div class="rou__item-portrait">
        <HeroMascot variant size="xs" />
      </div>
      <p class="rou__item-name">Bobby</p>
    </div>
    <!-- ...N items, dont 1 .is-winner... -->
  </div>
</div>
<div class="rou-status rou-status--spin">SPIN…</div>
```

## Easing

- Strip : `transform: translateX(...)` avec `transition: transform 2700ms cubic-bezier(.12,.85,.25,1)` (ou rAF V3).
- Marker : statique, glow constant.
- Winner : `pulse-halo` 1.5s à l'arrêt.

## États rou-status

- défaut : "Prêt à tirer" (ink-soft)
- `--spin` : "Tirage en cours…" (grape)
- `--done` : "Récompense !" (legendary-deep + glow)

## Mapping V2/V3 → V4

| Classe V3 existante | Action V4 |
|--|--|
| `.chest-tier--damaged/bronze/silver/royal/runic` | Conservées (alias de `.chest--{tier}`) |
| `.chest-shake-shake` | Reste, applique `chest-shake 320ms` |
| `.chest-flash-fullscreen` | Conservé (V3) — déclenché à l'ouverture |
| `.chest-lid-rotate` | Remplacé par `.is-opening .chest__lid` |
| `.chest-beam-rise` | Remplacé par `.chest__burst` + chest-burst |
| `.loot-roulette__strip` | Refonte : `.rou__strip` avec easing roulette |
| `.loot-roulette__item` | Refonte BEM, alias `.rou__item` |
| `.loot-roulette__status` | Refonte, alias `.rou-status` |

Le DOM doit être migré : nouveaux sous-éléments (band, keyhole, studs, runes, burst). Le frontend-dev change le JSX du `FinalChest` et `LootRoulette`.

## Reduced motion

Coffres : pas de float, pas de pulse-halo aura, pas de runes glow. État ouvert préservé (lid rotateX -100deg garde sa position finale via classe).

Roulette : transition désactivée → le strip apparaît directement à la position finale (pas de spin animé). C'est une dégradation acceptable.
