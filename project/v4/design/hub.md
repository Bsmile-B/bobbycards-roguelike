# Hub — Spec V4

## Architecture écran

```
.hub-screen.stage-{N}                <-- skybox stage-aware en ::before
├─ .hub-header
│   ├─ .hub-header__title            <-- Lilita One stage name
│   └─ .hub-header__resources
│       ├─ .cres.cres--gold
│       └─ .cres.cres--frag
├─ .hub-tabs                         <-- 5 onglets pill, active coral
│   ├─ .hub-tab (Boutique)
│   ├─ .hub-tab (Lootbox)
│   ├─ .hub-tab (Recyclage)
│   ├─ .hub-tab (Équipe)
│   └─ .hub-tab (Stats)
└─ .hub-content                      <-- carte cream sticker
    ├─ .shop-grid (Boutique)
    ├─ .lootbox-grid (Lootbox)
    ├─ .recycle-list (Recyclage)
    ├─ .team-current + .team-grid (Équipe)
    └─ .stats-table (Stats)
```

## Tabs

5 onglets pills. Inactive = paper, hover translateY -1px, active = coral + sticker shadow large. Focus-visible = outline brand-sky.

## Boutique

Items en grille auto-fill 220px. Chaque item :
- Background `var(--rcream)` selon rareté
- Border ink + sticker shadow
- Nom Lilita One, desc Nunito
- Prix en pill grape
- Bouton `.btn--primary` ou `.btn--gold` selon devise

## Lootbox

4 cards lootbox en grille. Chaque card :
- Background bg-cream
- Halo radial `::before` couleur `--rcolor` (selon rareté max), blur 4px, opacity 0.40
- Nom Lilita One rdeep
- Prix en pill sun
- Bouton ouvrir `.btn--primary`

## Recyclage

Liste de lignes paper avec nom Lilita One + yield (couleur grape) + bouton recycle coral.
Modal : carte cream sticker avec titre + texte + actions (`.btn--primary` confirm, `.btn--ghost` cancel).

## Équipe

`.team-current` : 3 mascottes (HeroMascot lg) actives.
`.team-grid` : héros disponibles.
Indicateur swap : `.team-swap-cost` pill grape (payant) ou mint (`.is-free` gratuit).

## Stats

Tableau Nunito 700 + valeurs Lilita One color coral à droite.

## Mapping V2/V3 → V4

| Classe V2/V3 | Action V4 |
|--|--|
| `.hub-screen` | Refonte : skybox stage-aware en `::before`. DOM inchangé sauf classe stage-N à poser. |
| `.hub-tabs` / `.hub-tab` | Refonte CSS, DOM inchangé |
| `.hub-content` / `.hub-tab-content` | Refonte |
| `.shop-tab` items | DOM doit migrer vers `.shop-item` BEM |
| `.lootbox-tab` cards | Refonte vers `.lootbox-card` |
| `.recycle-tab` | Refonte vers `.recycle-list` + `.recycle-row` |
| `.recycle-confirm-modal` | Refonte CSS, structure préservée |
| `.replace-consumable-modal` | Refonte CSS, structure préservée |
| `.team-tab` | Refonte avec HeroMascot lg + grid |
| `.stats-tab` | Refonte tableau |
