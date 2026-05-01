# Passation Designer → Dev — V3

> Skills à charger côté dev avant l'implémentation : `anthropic-skills:reduced-motion-accessibility-guardian`, `anthropic-skills:motion-performance-guardian`.

## 1. Composants React à créer ou refondre

| Composant | Statut | Props clés | Fichier source |
|-----------|--------|------------|----------------|
| `CombatAnimationLayer` | NOUVEAU | aucune (lit state via context/hook `useGameState`) | `combat-animation-layer.md` |
| `Projectile` | NOUVEAU | `{ origin, target, kind, durationMs, isSpecial?, onComplete }` | `projectiles.md` |
| `FloatingNumber` | NOUVEAU | `{ variant, value, extras?, isCumul?, isCrit?, isSpecial?, position, zigzagSlot, onComplete }` | `floating-numbers.md` |
| `CharacterCardDetailed` | NOUVEAU | `{ character, mode?, size?, isSelected?, isLocked?, onClick?, fragments?, rank?, showRoleBadge?, showRarityBadge? }` | `character-card-detailed.md` |
| `LootRoulette` | NOUVEAU | `{ items, finalIndex, reducedMotion, onComplete, testHook? }` | `lootbox-roulette.md` |
| `RarityReveal` | NOUVEAU | `{ rarity, card, reducedMotion, onContinue }` | `rarity-reveal.md` |
| `ChestOpening` | NOUVEAU | `{ tier, onOpened, reducedMotion?, testId? }` | `chests.md` |
| `BossIntroOverlay` | NOUVEAU | `{ boss, stageNum, reducedMotion, onDone }` | `boss-intro.md` |
| `SpeedSelector` | NOUVEAU | `{ current: CombatSpeed, onChange: (s: CombatSpeed) => void }` | (composant simple, dans `CombatFooter`) |
| `CardRefsProvider` | NOUVEAU | wraps `CombatScene`, expose `Map<id, HTMLElement>` aux enfants | `combat-animation-layer.md` |
| `CombatHero` | EXTENSION | classes `.is-attacking`, `.is-attacking--special`, `.is-hit`, `.aura-low` (déclenchées via animQueue) | non touché visuellement majeur |
| `EnemyCard` | EXTENSION | classes `.is-attacking`, `.is-hit`, `.aura-low`, `.enemy-card--boss`, `.boss-phase-1-trigger`, `.boss-phase-2`, `.is-dying`, `.is-ko` | extension légère |
| `LootboxScreen` | REFONTE locale | phase étendue `idle → shake → roulette → reveal → opened` (cf. décision V3 [phases]) | hosting `LootRoulette` + `RarityReveal` |
| `FinalChest` | EXTENSION | wraps `ChestOpening` pour l'animation tier-aware au game over | non touché V2 |

**Total composants nouveaux : 11** (+ extensions sur 4 existants).

## 2. Mapping wireframes/specs → fichiers design

| Doc | Couvre |
|-----|--------|
| `animations.md` | Tokens durées, scaling vitesse, keyframes pulses/shakes/flashes/auras, checklist reduced-motion |
| `projectiles.md` | 5 types de projectiles (physical / magic / heal / shield / poison) + variant burn |
| `floating-numbers.md` | 7 variants, regroupement <120ms, zigzag anti-superposition |
| `character-card-detailed.md` | Layout 220×320, hiérarchie, badges, états, bordure animée légendaire |
| `rarities.md` | Tokens 5 raretés + classes + particules idle |
| `chests.md` | 5 tiers idle anims + séquence d'ouverture commune |
| `lootbox-roulette.md` | Strip 18 items, easing 2500ms, marqueur, hook test skip |
| `rarity-reveal.md` | 5 effets de révélation, particules burst, micro-shake légendaire |
| `boss-intro.md` | Séquence 1600ms + présence boss en combat |
| `combat-animation-layer.md` | Composant pivot qui consomme animQueue |
| `css-tokens.md` | Bloc CSS complet prêt à coller dans `src/styles.css` |

## 3. Tokens à implémenter (récap)

Tous dans `:root` via `css-tokens.md` §1 (à ajouter après les tokens V2). Catégories :
- `--combat-speed: 1` (scalable via `.speed-125` / `.speed-150`).
- 14 durées d'anim combat (scalées par `--combat-speed`).
- 11 durées d'anim hors combat (jamais scalées).
- 5 easings (`--ease-impact`, `--ease-projectile`, `--ease-floating`, `--ease-roulette`, `--ease-boss-mount`).
- Tokens raretés enrichis × 5 raretés × 5 props = 25 tokens.
- Tokens floating numbers (4 tokens).

## 4. Animations attendues — récap pour audit

| Animation | Trigger | Intention | Timing base | Easing | Reduced-motion |
|-----------|---------|-----------|-------------|--------|----------------|
| `attack-pulse` | event `attack-started` | héros pulse avant tir | 220ms | `--ease-impact` | outline statique |
| `attack-pulse-special` | spécial déclenché | héros pulse renforcé | 280ms | `--ease-impact` | outline statique |
| `enemy-pulse` | event ennemi `attack-started` | ennemi se contracte | 220ms | `--ease-impact` | outline |
| `projectile-physical` | `projectile-launched kind=physical` | trait blanc rapide | 240ms | `--ease-impact` | invisible (impact suffit) |
| `projectile-magic` | kind=magic | projectile runique | 320ms | `--ease-projectile` | invisible |
| `heal-flow` | kind=heal | flux vert vers allié | 380ms | ease-out | invisible (floating-num suffit) |
| `shield-rune-form` | kind=shield | cercle runes autour allié | 300ms | ease-out | statique opacity 0.6 |
| `poison-drift` | kind=poison/burn | nuage particules | 600ms | ease-out | particule statique 400ms |
| `attack-wave-expand` | onde de zone | onde radiale pour hex | 480ms | `--ease-impact` | invisible |
| `enemy-shake` | event `target-hit` (cible ennemi) | ennemi encaisse | 180ms | linear | désactivée |
| `ally-shake` | event `target-hit` (cible allié) | allié encaisse | 180ms | linear | désactivée |
| `impact-flash-bright` | hit ennemi | flash blanc bref | 90ms | linear | conservé |
| `impact-flash-dark` | hit allié | flash rouge sombre | 120ms | linear | conservé |
| `impact-flash-shield` | bouclier consommé | flash bleuté | 100ms | linear | conservé |
| `floating-rise-fade` | floating-num | monte et fade | 720ms | `--ease-floating` | opacity step sans translation |
| `aura-low-pulse` | hp/max < 0.30 | pulse rouge | 2000ms infinite | ease-in-out | box-shadow statique |
| `boss-card-vibrate` | boss phase 2 | vibration subtile | 1200ms infinite | ease-in-out | désactivée |
| `boss-intro-darken` | bossIntroAt set | overlay noircit | 400ms | `--ease-impact` | static opacity 1 |
| `boss-intro-name` | intro phase 2 | nom apparaît | 600ms (delay 400) | `--ease-impact` | static opacity 1 |
| `boss-intro-subtitle` | intro phase 2 | sous-titre apparaît | 500ms (delay 600) | `--ease-impact` | static |
| `boss-intro-aura` | intro phase 2 | aura derrière carte | 1100ms (delay 400) | `--ease-impact` | masquée |
| `boss-intro-phrase` | intro phase 3 | phrase d'ambiance | 400ms (delay 1000) | `--ease-impact` | static |
| `boss-intro-card` | intro phase 3 | carte boss entre | 400ms (delay 1000) | `--ease-boss-mount` | static |
| `boss-intro-leave` | intro phase 5 | fade-out | 100ms (à 1500) | linear | délai 200ms total |
| `boss-card-border` | combat boss | bordure animée gradient | 8000ms infinite | linear | désactivée |
| `boss-hp-shimmer` | combat boss | shimmer barre PV | 3000ms infinite | linear | désactivée |
| `boss-phase-flash` | hp/max franchit 50% | flash unique | 1000ms forwards | `--ease-impact` | désactivée |
| `boss-phase-text-anim` | hp/max franchit 50% | texte "Phase II" | 1000ms forwards | ease-in-out | static 800ms |
| `boss-die` | boss hp <= 0 | mort dramatique | 800ms forwards | `--ease-impact` | fade 200ms |
| `chest-damaged-breath` | idle | souffle coffre damaged | 4000ms infinite | ease-in-out | désactivée |
| `chest-bronze-glow` | idle | pulse cuivré | 3000ms infinite alt | ease-in-out | désactivée |
| `chest-royal-glow` | idle | pulse doré | 2500ms infinite alt | ease-in-out | désactivée |
| `chest-runic-aura` | idle | pulse cyan/or | 5000ms infinite alt | ease-in-out | désactivée |
| `chest-particle-rise` | idle | particules ascendantes | 4000-5000ms infinite | ease-in-out | désactivée |
| `chest-rune-pulse` | idle (runic) | runes s'allument | 4000ms infinite | ease-in-out | static opacity 0.6 |
| `chest-shake-soft` | clic ouvrir | tremblement | 320ms | linear | désactivée |
| `chest-flash` | post-shake | flash blanc plein écran | 90ms | ease-out | masquée |
| `chest-lid-open` | post-flash | rotation couvercle | 400ms | `--ease-impact` | conservée 200ms |
| `chest-beam-rise` | post-lid | faisceau lumineux | 600ms | `--ease-impact` | static opacity 0.5 |
| `roulette translate3d` (JS) | phase roulette | strip défile | 2500ms | `--ease-roulette` (manuel) | skip 200ms fade |
| `roulette-winner-pulse` | fin roulette | item gagnant pulse | 220ms | `--ease-impact` | désactivée |
| `reveal-common/rare/epic/legendary` | phase reveal | flash + scale par rareté | 220/280/380/600ms | `--ease-impact` | bordure statique |
| `reveal-particle-burst` | phase reveal | particules radiales | 600/800/1000ms | ease-out | masquées |
| `legendary-screen-shake` | reveal légendaire | shake écran ±2px | 180ms | linear | désactivée |
| `rarity-epic-pulse` | carte épique idle | pulse halo violet | 3000ms infinite alt | ease-in-out | désactivée |
| `rarity-legendary-border` | carte légendaire idle | bordure or animée | 6000ms infinite | linear | static gradient |
| `rarity-particle-rise` | carte rare/épique/lég idle | particules ascendantes | 3200-4000ms infinite | ease-in-out | désactivée |
| `rarity-spark` | carte légendaire idle | spark ponctuel | 720ms forwards | ease-out | désactivée |
| `card-reveal-mount` | mode reveal | carte apparaît | 380ms | `--ease-impact` | static |

**Total : 41 keyframes V3** (en plus des V1/V2 existantes).

## 5. Composants prioritaires (ordre d'implémentation suggéré)

L'ordre des tasks V3-T6 → V3-T29 dans `tasks.json` suit déjà la priorité. Ordre design :

1. **`CombatAnimationLayer` + `Projectile` + `FloatingNumber`** (V3-T6, T7, T8, T9, T11) — débloque toute la sensation combat.
2. **`CharacterCardDetailed`** (V3-T13) — débloque collection + reveals.
3. **Tokens raretés CSS** (V3-T15) — habille CharacterCardDetailed + reveals.
4. **`LootboxScreen` refonte** + `LootRoulette` + `RarityReveal` (V3-T17, T19, T21).
5. **`BossIntroOverlay` + présence boss** (V3-T24, T25).
6. **Audit reduced-motion + perf** (V3-T27, T28).

## 6. Pièges à éviter

### 6.1 Pièges responsive
- La grille collection (4 colonnes × 220px = 880px + gaps) doit gérer le shrink sous 1280px. Sous 960px, passer à 3 colonnes ; sous 720px, 2 colonnes. La `CharacterCardDetailed` ne doit jamais déborder horizontalement.
- Le strip de la roulette est fixé à 1280px max-width, mais peut overflow sur mobile. **V3 ne cible pas mobile** (specs §2 : 1280×720 desktop). Ne pas optimiser, juste éviter le crash visuel : `overflow: hidden` sur `.loot-roulette`.

### 6.2 Pièges accessibilité
- L'overlay boss intro **piège le focus**. Bien retirer le focus-trap au `onDone` (`bossIntroAt = null`).
- L'`#boss-intro-skip` est un bouton invisible mais focusable. Sans hook `__game_test_skip_boss_intro`, le user peut presser Tab+Enter pour skipper. C'est OK ; c'est même un bonus a11y (l'utilisateur réduit-motion ou impatient peut skip).
- Les ARIA live regions :
  - `<div aria-live="polite" aria-atomic="true">` dans `CombatScene` annonce KO, boss-phase, fin de combat.
  - `<div aria-live="assertive">` annonce le nom du boss à l'intro.
  - **Ne pas multiplier** les live regions, sinon le SR sature. Une `polite` + une `assertive` suffisent.
- Le composant `CharacterCardDetailed` a un `aria-label` long (cf. `character-card-detailed.md` §9). Le générer automatiquement à partir de `character`.
- Tous les boutons CTA (`Ouvrir`, `Continuer`, `Ajouter à la collection`) doivent avoir un focus visible (outline `--stage-accent`).

### 6.3 Pièges perf
- Cap **12 events** simultanés dans `CombatAnimationLayer`. Si plus, le reducer pop le plus ancien avant d'append.
- Cap **4 boucles infinite** en combat (cf. animations.md §4).
- `getBoundingClientRect` **uniquement au mount** des projectiles, jamais en boucle.
- `will-change: transform, opacity` posé au mount, retiré au unmount.
- Pas de `filter: blur` ni `filter: drop-shadow` sur grand élément animé. Halos = `box-shadow` ou pseudo-element.
- Tester en revue (V3-T28) : combat boss ×1.5, 5 ennemis, recording 10s, jank < 5%.

## 7. Ce que le dev NE DOIT PAS toucher

- **`CombatHero` compact en combat** : aucun changement visuel majeur. Seules ajouts autorisés : poser/retirer des classes (`.is-attacking`, `.is-hit`, `.aura-low`) déclenchées par animQueue. **Ne pas** appliquer `CharacterCardDetailed` en combat (décision V3 [CharacterCardDetailed séparé]).
- **V2 entière** : HubScreen, ShopTab, RecycleTab, LootboxTab, ConsumableRail, RunProgress, StageIntro, FinalChest base — aucun changement de layout. Seules extensions autorisées : ajout des nouvelles classes V3 qui s'additionnent.
- **`advanceTime`** : reste un outil temps-virtuel pur (delta brut). Pas de scaling vitesse côté `advanceTime` (cf. décision V3 [vitesse double scaling]).
- **`render_game_to_text`** : étendu en V3-T26 mais **backward-compat** obligatoire — les champs V1/V2 inchangés, les nouveaux ajoutés en append.
- **Reducer V2** (`advanceCombat`, `useSpecial`, `applyReward`, `resolveTeamDefeat`, `pickShopItems`, `rollLootbox`) : extensions pour appender à `animQueue` et lire `combatSpeed`, mais **pas de réécriture** de la logique. La V2 doit jouer identiquement.
- **Save key localStorage** : `runebound-cards-save-v1` reste la clé. Seul `saveVersion` passe à 3.

## 8. IDs Playwright à exposer

| ID / hook | Localisation | Effet |
|-----------|--------------|-------|
| `#speed-1` | bouton dans `CombatFooter` | sélectionne ×1 |
| `#speed-1-25` | idem | sélectionne ×1.25 |
| `#speed-1-5` | idem | sélectionne ×1.5 |
| `#boss-intro-skip` | bouton invisible dans `BossIntroOverlay` | appelle `__game_test_skip_boss_intro()` |
| `#lootbox-skip-roulette` | bouton dans `LootboxScreen` (visible uniquement si `?dev=1`) | appelle `__game_test_skip_roulette()` |
| `#loot-roulette-strip` | strip de la roulette | sélectionnable pour assertions |
| `#chest-open-{tier}` | bouton "Ouvrir" du coffre selon tier | clic ouvre le coffre |
| `#hub-tab-cards` | onglet Collection | navigation hub |
| `__game_test_skip_roulette()` | global window | force la fin de roulette en 1 frame |
| `__game_test_skip_boss_intro()` | global window | force `bossIntroAt = null` |

## 9. Hooks accessibilité — ARIA live regions à câbler

Le dev pose dans `CombatScene` :

```tsx
<div className="combat-aria-live" aria-live="polite" aria-atomic="true">
  {currentAriaMessage}
</div>
```

`currentAriaMessage` est mis à jour quand :
- Un héros est KO : "Hero <nom> est tombé."
- Le boss change de phase : "Le boss change de phase."
- Le combat se termine : "Combat terminé. Victoire / Défaite."

Pour le boss intro, une autre live region `aria-live="assertive"` annonce : "Boss : <nom>, stage <N>."

## 10. CSS tokens prêts à coller — où

Cf. `css-tokens.md`. Deux endroits dans `src/styles.css` :
1. **Dans `:root`** : nouveaux tokens V3 (juste après les tokens V2 existants ligne ~110).
2. **À la fin du fichier** (avant `@media (prefers-reduced-motion: reduce)` V2 ligne ~2169) : tous les skeletons V3 + l'extension du bloc `@media reduced-motion`.

Aucune classe V2 existante n'est modifiée. Les classes V3 utilisent des préfixes non-collisionnels :
- `combat-anim-layer`, `combat-hero.is-*`, `enemy-card.is-*`
- `projectile`, `projectile--*`, `projectile-*-particle`
- `floating-num`, `floating-num--*`
- `character-card-detailed`, `character-card-detailed__*`
- `rarity-common/rare/epic/legendary/mythic-placeholder`, `rarity-particle--*`, `rarity-spark--*`
- `loot-roulette`, `loot-roulette__*`
- `rarity-reveal`, `rarity-reveal--*`, `reveal-card`, `reveal-particle--*`
- `chest-tier--*` (extension V2), `chest-particle--*`, `chest-rune--*`, `chest-flash`, `chest-beam`
- `boss-intro-overlay`, `boss-intro__*`, `enemy-card--boss`, `boss-hp-bar*`, `boss-phase-*`, `boss-card-vibrate`

## 11. Checklist de revue rapide

- [ ] 41 keyframes V3 ajoutées au CSS.
- [ ] Tous les keyframes ont une alternative reduced-motion (cf. animations.md §6).
- [ ] Aucune classe V2 modifiée.
- [ ] Tous les nouveaux composants ont des props typés strict.
- [ ] `CombatAnimationLayer` cap 12 events.
- [ ] Roulette skip hook exposé.
- [ ] Boss intro skip hook exposé.
- [ ] CharacterCardDetailed responsive (4 → 3 → 2 cols).
- [ ] Bordure animée légendaire désactivée si plus de 3 visibles (optimisation tier 2 OK).
- [ ] ARIA live regions câblées.
- [ ] Build clean, 0 warning bloquant.
- [ ] `npm run build` passe.
- [ ] `render_game_to_text` étendu sans casser V1/V2.
