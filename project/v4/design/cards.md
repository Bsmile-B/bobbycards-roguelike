# Cards — CharacterCardDetailed + raretés (V4)

## Structure cible

```
.character-card-detailed.rarity-{kind}     <-- pose --rcolor / --rdeep / --rcream / --rblur
  ::before  (halo radial extérieur, opacity selon rareté, blur selon rareté)
  .character-card-detailed__top
    .character-card-detailed__rank-pill
    .character-card-detailed__rarity-badge
  .character-card-detailed__portrait
    <HeroMascot variant size="lg" />        <-- inséré par React
    ::after  (shimmer rare uniquement)
  .character-card-detailed__name             <-- Lilita One stroke
  .character-card-detailed__role             <-- Nunito italic
  .character-card-detailed__stats            <-- grid 2×2
    .character-card-detailed__stat--hp/atk/mag/def
  .character-card-detailed__skill            <-- bloc rcream
    .character-card-detailed__skill-icon
    .character-card-detailed__skill-name
    .character-card-detailed__skill-desc
  .character-card-detailed__trait            <-- pill ink
  .character-card-detailed__foot
    .character-card-detailed__frags          <-- pill grape
    .character-card-detailed__stars          <-- étoiles or
  .character-card-detailed__sparkle×0..2     <-- légendaire/mythique seulement
  .character-card-detailed__locked-tag       <-- visible si is-locked
```

## Idle anims par rareté

| Rareté | Halo opacity | Halo blur | Halo anim | Frame anim | Sparkles |
|--|--|--|--|--|--|
| common | 0 | 0 | — | float-y 4s | 0 |
| rare | 0.45 | 2px | — | float-y 4s + shimmer-x portrait 4s | 0 |
| epic | 0.55 | 3px | pulse-halo 3s | float-y 4s | 0 |
| legendary | 0.70 | 4px | — | float-y + breathe 6s | 1 |
| mythic | 0.85 | 6px | — | float-y + wobble 5s | 2 |

**Cap boucles infinite par carte mythique** : 1 (float-y) + 1 (wobble) + 2 (sparkles) = **4** simultanées. Sous le budget. Le halo n'a pas d'anim sur mythique (juste opacity statique blur 6px) pour rester sous cap.

## Hover

`translateY(-3px)` + `box-shadow-lg` + glow rareté en outer shadow. Pas de scale (évite jitter de la carte voisine).

## Selected

Outline 4px rcolor + offset 6px. Ne touche pas aux insets (préservés).

## Locked

`filter: grayscale(0.6) brightness(0.75)` global + le portrait affiche `?` géant via `::before`. Name/role hidden, `__locked-tag` visible avec texte "VERROUILLÉ — débloquer dans la collection".

## Sparkles — placement

Les 1-2 instances sont créées par React. Chacun reçoit un style inline :
```jsx
<span className="character-card-detailed__sparkle"
  style={{ '--sx': '15%', '--sy': '25%', '--delay': '0s' }} />
<span className="character-card-detailed__sparkle"
  style={{ '--sx': '85%', '--sy': '60%', '--delay': '1.5s' }} />
```

Positions recommandées (mythique) :
- (15%, 25%) delay 0s
- (85%, 60%) delay 1.5s

Pour légendaire (1 sparkle) :
- (75%, 30%) delay 0s

## Mapping V2/V3

`.character-card-detailed` est la **classe V3** existante. Le DOM React change peu : il faut **ajouter** l'élément `<HeroMascot />` dans le portrait (en remplacement du `bobby-card-portrait` SVG actuel) et **ajouter** les 0-2 spans `__sparkle` selon rareté.

Les noms de classes BEM (`__top`, `__portrait`, `__name`, `__stats`, `__skill`, `__foot`) sont nouveaux. Le dev devra **migrer** la structure DOM (ce sont les classes que je livre — il les remplace dans le JSX). Les classes legacy `.character-card-detailed-stat-row` etc. peuvent être supprimées au passage ou laissées en transition.

## Compat raretés FR/EN

Toutes les règles sont écrites avec sélecteurs combinés `.rarity-epic, .rarity-epique` etc. — aucune migration nécessaire côté React. Les classes posées dans App.tsx restent.
