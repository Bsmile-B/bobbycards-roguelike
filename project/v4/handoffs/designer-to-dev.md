# Passation Designer → Frontend-Dev V4

## Contexte

Tous les fichiers CSS livrés sont dans `project/v4/design/`. Ils sont prêts à coller dans `src/styles.css`. Aucun build step. Tout en CSS pur, 0 SVG, 0 dépendance.

## Ordre de collage recommandé

1. **`tokens.css`** : remplace le bloc `:root` actuel + ajoute les utilitaires `.bg-sky-day/dusk-magic/dusk-royal/night/meadow`, `.btn`, `.pill`, `.sticker-shadow*`, `.ink-stroke*` et le `@media (prefers-reduced-motion)` final.
2. **`mascots.css`** : nouveau bloc, à coller juste après les tokens.
3. **`cards.css`** : refonte de `.character-card-detailed`. Les classes legacy peuvent être supprimées au passage si elles ne sont plus référencées.
4. **`combat.css`** : refonte combat-screen, hero-card/combat-hero, enemy-card, boss-hp-bar, run-progress, projectiles, fnum, footer.
5. **`chests.css`** : refonte FinalChest + LootRoulette.
6. **`hub.css`** : refonte HubScreen + 5 onglets.
7. **`boss-intro.css`** : refonte overlay boss intro.

À la fin, `src/styles.css` devrait gagner ~+1500 / -800 lignes.

## Fichiers livrés

| Fichier | Lignes (~) | Composant React parent |
|--|--|--|
| `tokens.css` | 280 | (global, `:root`) |
| `mascots.css` | 460 | `<HeroMascot>` (V4-T4 — frontend-dev crée ce composant) |
| `cards.css` | 240 | `CharacterCardDetailed`, `RarityReveal` |
| `combat.css` | 360 | `CombatHero`, `EnemyCard`, `BossHpBar`, `RunProgress`, `CombatScreen` |
| `chests.css` | 280 | `FinalChest`, `LootRoulette` |
| `hub.css` | 220 | `HubScreen`, `ShopTab`, `LootboxTab`, `RecycleTab`, `TeamTab`, `StatsTab` |
| `boss-intro.css` | 90 | `BossIntroOverlay` |

## Ce qui n'est pas évident à la lecture seule

1. **`--rcolor` / `--rdeep` / `--rcream` / `--rblur`** sont posées par les classes `.rarity-{kind}` dans `tokens.css`. Toutes les autres règles (cards, lootbox, sparkle, etc.) lisent ces variables. Tu n'as **rien à passer en style inline**, sauf pour les sparkles (`--sx`, `--sy`, `--delay`).
2. **Float-y est l'idle global** sur cartes/héros/coffres. Il est désactivé automatiquement par `.is-ko`, `.is-dead`, `.chest--damaged`, et globalement en `prefers-reduced-motion`.
3. **Sticker shadow signature** : `box-shadow: 0 6px 0 rgba(38,26,61,0.45)`. Pas de blur. C'est l'identité DA. Si tu animes une carte au hover, garde le sticker shadow (passe juste à `--lg`).
4. **Skybox via `::before` z-index -1** : ne jamais en faire un parent direct cliquable. Le `.combat-screen` reste le container principal, le `::before` est purement décoratif.
5. **Cap 4 boucles infinite combat** : 2 prises par défaut (boss halo pulse + run-progress dot pulsant). Tu as encore 2 slots dispo si tu ajoutes des effets. Float-y ne compte pas (translate-only).
6. **Mascotte React** : le composant pose `data-mascot-variant` sur l'élément racine. **Toutes** les couleurs/formes sont gérées par le CSS via cet attribut. Pas de logique conditionnelle dans le composant React.
7. **Mythique activée visuellement** mais aucun perso mythique n'est introduit (decision V4). Les classes `.rarity-mythic` / `.rarity-runique` sont prêtes mais ne reçoivent jamais de carte du jeu en V4.

## Tokens à implémenter en CSS variables

Tous les tokens vivent dans `tokens.css`. Aucun token nouveau à inventer. Les classes V2/V3 (`.rarity-commune`, `--accent`, `--color-bg`, etc.) sont préservées par alias et reçoivent automatiquement les nouvelles valeurs candy.

**Migration TS éventuelle** : aucune. Aucune valeur de token n'est lue par le TS (tout est lu par le CSS).

## Animations attendues

Toutes les keyframes sont dans les fichiers CSS livrés. Récap des principales :

| Keyframe | Trigger | Intention | Timing | Easing | Reduced-motion |
|--|--|--|--|--|--|
| `float-y` | idle cards/héros/coffres | Vie permanente, légèreté DA | 3-4s infinite | ease-in-out | OFF (statique) |
| `chero-attack` | héros lance attaque | Le héros s'élance vers l'avant | 450ms | ease-impact | OFF |
| `enemy-attack` | ennemi attaque | Symétrique | 450ms | ease-impact | OFF |
| `chero-attack-special` | héros skill spécial | Amplitude majorée | 520ms | ease-impact | OFF |
| `proj-fly` / `proj-fly-heal` | projectile lancé | Trajectoire arc | 500-600ms | ease-projectile | (raccourci) |
| `fnum-rise` | dégât/heal/shield | Floating number monte et fade | 1.6s | ease-floating | rise court 200ms |
| `pulse-halo` | epic cards, boss aura, runic runes, dot current | Battement vivant | 3s infinite (1s pour dot) | ease-in-out | OFF |
| `shimmer-x` | rare card portrait | Reflet | 4s linear infinite | linear | OFF |
| `breathe` | legendary card frame | Inspiration | 6s infinite | ease-in-out | OFF |
| `wobble` | mythic card frame | Instable / surnaturel | 5s infinite | ease-in-out | OFF |
| `spark` | sparkles legendary/mythic | Étincelle traverse | 3s infinite | ease-in-out | OFF |
| `chest-burst` | coffre ouvert | Faisceau d'éclat | 1.2s forwards | ease-impact | état final immédiat |
| `boss-intro-fade` + `boss-intro-name` + `boss-intro-phrase` | boss intro | Apparition cinématique | 1.6s total | ease-boss-mount | bandeau static 800ms |
| `bat-flap` | mascotte bat | Battement d'ailes | 0.6s infinite | ease-in-out | OFF |
| `hurt-shake` | mascotte hurt mood | Choc | 320ms | ease-in-out | OFF |

## Composants prioritaires (ordre de construction)

1. **HeroMascot React + mascots.css** — bloque tout le reste (cartes, combat, hub).
2. **tokens.css collé en premier** — les autres règles dépendent.
3. **cards.css** + intégration `<HeroMascot size="lg">` dans `CharacterCardDetailed`.
4. **combat.css** + intégration `<HeroMascot size="sm">` dans `CombatHero`, `<HeroMascot size="md">` dans `EnemyCard`, `<HeroMascot size="md">` (×1.4 via `.enemy-card--boss`) dans le boss.
5. **chests.css** + refonte JSX `FinalChest` (nouveaux sous-éléments) et `LootRoulette` (mascotte xs dans chaque item).
6. **hub.css** + refonte JSX onglets.
7. **boss-intro.css** + intégration `<HeroMascot size="xl" variant={bossVariant}>` dans `BossIntroOverlay`.

## Pièges responsive

- **1280×720 reste la cible**. Aucune query mobile demandée.
- Les grilles `.shop-grid`, `.lootbox-grid`, `.team-grid` utilisent `auto-fill`/`auto-fit` minmax → s'adaptent gracieusement si la résolution change.
- La `.combat-field` est `grid-template-columns: 1fr 1fr` fixe. Si l'écran rétrécit, les cartes peuvent se chevaucher — surveiller en revue.

## Pièges accessibilité

- **`<HeroMascot>`** doit recevoir un `aria-label` calculé : `"<variantLabel>, <moodLabel>"`. Le composant peut accepter `ariaLabel` en prop, ou calculer en interne via une lookup table.
- **Les modales** (`.recycle-confirm-modal`, `.replace-consumable-modal`) doivent garder leur focus trap V3.
- **Boutons** (`.btn`, `.hub-tab`, `.combat-speed__btn`) ont déjà `:focus-visible { outline: 3px solid var(--brand-sky) }` ou équivalent. Vérifier qu'aucun reset ne les écrase.
- **Contraste** : ink `#261a3d` sur cream `#fff5e1` ≈ 13:1, paper `#fffbf0` sur bg-deep `#1a1530` ≈ 14:1. WCAG AA OK.
- **Reduced-motion** : bloc global dans `tokens.css` + overrides ciblés dans chaque fichier CSS.

## Ce que le dev NE DOIT PAS toucher

- **Reducer** (`gameReducer`, `combatReducer`, etc.) : intouchable.
- **Hooks de test** : `__game_test_*`, `render_game_to_text`, `advanceTime` : intouchables.
- **Save schema** : `runebound-cards-save-v1` reste `saveVersion: 3`, aucun nouveau champ.
- **Mécaniques V1/V2/V3** : pas de changement de balance, pas de nouveaux items/persos/skills.
- **STAGE_CONFIGS.name** : reste "Les Cryptes Froides", "Sanctuaire du Vide", "Salle du Roi Brisé". Ne pas renommer.
- **LOOTBOX_TABLES** : mythic reste à 0%. Pas de drop mythique en V4.
- **`bobby-card-portrait` SVG** : peut être conservé en fallback si HeroMascot rencontre un variant inconnu, mais idéalement remplacé partout.

## Règles de migration par classe

| Classe | Type de migration | Action React |
|--|--|--|
| `.character-card-detailed` | DOM modifié (insère `<HeroMascot>` + `__sparkle` ×0-2) | JSX à refondre |
| `.combat-hero` / `.hero-card` | DOM modifié (insère `<HeroMascot size="sm">`) | JSX à refondre |
| `.enemy-card` | DOM modifié (insère `<HeroMascot variant size="md">`) | JSX à refondre |
| `.boss-hp-bar` | CSS only | rien |
| `.run-progress` | DOM modifié (chaque dot reçoit `is-stage-N`, `is-current`, `is-boss`, `is-done`) | logique `RunProgress` à étendre |
| `.skill-card` | CSS only | rien |
| `.consumable-slot` | CSS only | rien |
| `.combat-stage-pill` | DOM modifié (ajout `__icon`) | rien si déjà BEM |
| `.combat-resource` / `.cres` | DOM modifié (ajout `__icon`) | mineur |
| `.boss-intro-overlay` | DOM modifié (mascotte XL + name + phrase 3 niveaux) | refonte JSX |
| `.chest` (FinalChest) | DOM **complètement** modifié (body, lid, band, keyhole, studs, runes, burst) | refonte JSX complète |
| `.loot-roulette` | DOM modifié (marker, fades, strip, items avec mascotte xs) | refonte JSX |
| `.hub-tab` | CSS only | rien |
| `.hub-content` | CSS only | rien |
| `.shop-item` | DOM modifié (BEM) | refonte JSX |
| `.lootbox-card` | DOM modifié | refonte JSX |
| `.recycle-confirm-modal` | CSS only (DOM préservé) | rien |
| `.replace-consumable-modal` | CSS only (DOM préservé) | rien |

## Composants React à créer/modifier

| Composant | Action | Priorité |
|--|--|--|
| `<HeroMascot variant size mood />` | **CRÉER** (nouveau) | P0 — bloque le reste |
| `CharacterCardDetailed` | Refonte JSX (insère HeroMascot lg + sparkles selon rareté) | P1 |
| `CombatHero` | Refonte JSX (insère HeroMascot sm) | P1 |
| `EnemyCard` | Refonte JSX (insère HeroMascot md, dérive variant depuis nom) | P1 |
| `BossHpBar` | CSS only | P2 |
| `RunProgress` | Étendre props pour `isCurrent`, `isBoss`, `isDone` par dot | P2 |
| `FinalChest` | Refonte JSX complète | P2 |
| `LootRoulette` | Refonte JSX (items avec mascotte xs) | P2 |
| `BossIntroOverlay` | Refonte JSX (mascotte xl + name + phrase) | P2 |
| `HubScreen` + tabs | Refonte JSX | P3 |
| `BOSS_PHRASES` constant | Remplacer par phrases V4 (cf. `boss-phrases.md`) | P3 |

## Questions ouvertes

Aucune bloquante. Si en intégration le dev trouve un cas non spécifié (ex: variant ennemi inconnu au moment du `createEnemy`), il peut fallback sur `bobby` et logger.

## Fin

Tout est tokenisé, tout est en CSS pur, tout est reduced-motion-safe. Bon code.
