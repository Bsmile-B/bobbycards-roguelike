# Combat — Wireframe + spec V4

## Architecture écran

```
.combat-screen.stage-{N}              <-- pose le ::before skybox
├─ .combat-top                         <-- glassmorphisme ink violet 55%
│   ├─ .combat-stage-pill              <-- "STAGE 1 — CRYPTES FROIDES" grape pill
│   ├─ .run-progress                   <-- 30 dots (3 stages × 10 vagues)
│   ├─ .cres.cres--gold                <-- ressource or
│   └─ .cres.cres--frag                <-- ressource fragments
├─ .boss-hp-bar (visible si boss actif)
│   ├─ __name (Lilita One mythic glow)
│   └─ __track > __fill                <-- gradient mythic→coral
├─ .combat-field                       <-- grid 2 colonnes
│   ├─ .combat-field__heroes           <-- 3 .combat-hero
│   └─ .combat-field__enemies          <-- 1-3 .enemy-card / .enemy-card--boss
├─ Projectiles + fnum (position absolute par-dessus)
└─ .combat-footer
    ├─ .combat-footer__skills          <-- N .sk
    ├─ .combat-footer__cons            <-- N .cons
    └─ .combat-speed (×1, ×1.25, ×1.5)
```

## Skyboxes (3 stages)

- **Stage 1 (Cryptes Froides)** : `bg-sky-day` adouci, gradient `#b8e3ff → #e8f4ff → #ffd6c2` bottom — *ciel pâle givré*.
- **Stage 2 (Sanctuaire du Vide)** : `bg-sky-dusk-magic` violet → coral → sun. Étoiles ponctuelles 1px en radial.
- **Stage 3 (Salle du Roi Brisé)** : `bg-sky-dusk-royal` orange → or → cream — *couronnement doré*.

Le `::before` est en `z-index: -1`, jamais cliquable. Aucun filter blur (le grad est compositable GPU sans coût).

## RunProgress — 30 dots

Le rendu :
- Dots 10×10 paper-line de base
- `.is-stage-1/2/3` colorisent quand wave ≤ stage
- `.is-boss` carré 14×14 (radius 4px)
- `.is-current` 14×14 cercle coral pulsant (1s)
- `.is-boss.is-done` carré or avec glow

## Cap boucles infinite combat

Compte typique avec 3 héros + 2 ennemis + 1 boss :
- 3 `combat-hero` float-y → translate-only, **non comptés** (cap GPU)
- 2 `enemy-card` float-y → translate-only, **non comptés**
- 1 `enemy-card--boss` float-y + ::before pulse-halo → **1 boucle coûteuse** (filter blur + opacity)
- 1 `run-progress__dot.is-current` pulse-halo → **1 boucle coûteuse**
- 1 boss-hp-bar fill (transition seulement, pas de loop)

**Total coûteux : 2 simultanées**. Sous le cap 4. OK.

## Floating numbers

- Position absolute calculée par React au moment du tick combat
- `fnum-rise` 1.6s + auto-suppression (`forwards` → React unmount après animation)
- Variantes : `--special` (26px), `--crit` (32px or), `--heal` (vert), `--shield`, `--poison`

## Mapping V2/V3 → V4

| Classe V2/V3 | Action V4 |
|--|--|
| `.hero-card` | Reste (alias de `.combat-hero` via sélecteur combiné) |
| `.enemy-card` | Refonte CSS, **DOM doit insérer `<HeroMascot variant size="md" />`** |
| `.boss-hp-bar` | Refonte CSS, DOM inchangé |
| `.run-progress` | Refonte CSS — DOM doit poser `is-stage-N`, `is-current`, `is-boss`, `is-done` sur chaque dot |
| `.skill-card` | Refonte CSS, alias `.sk` ajouté |
| `.consumable-slot` | Refonte CSS, alias `.cons` |
| Projectiles | Couleurs nouvelles via classes `--physical/magic/heal/shield/poison` |
| Floating numbers | Refonte police Lilita One + stroke ink |

## Reduced motion

Float-y, pulse-halo boss, dot pulsant : tous désactivés. Les `fnum` gardent un `rise` court (200ms) pour rester lisibles (sinon disparaissent immédiatement).

## Risques perf

- **Les 2 boucles filter-blur en combat** (boss halo + dot current) sont sous le cap 4. Marge : 2 boucles supplémentaires possibles si besoin.
- **Backdrop-filter blur sur `.combat-top`** : appliqué une seule fois, pas animé. OK.
