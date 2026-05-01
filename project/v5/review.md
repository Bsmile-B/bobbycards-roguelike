# Revue V5 — Bobbycard DA pixel-perfect (itération 1)

## Résumé
Globalement OK avec réserves sérieuses. Le DOM des écrans cibles (cartes détaillées, combat hero/enemy/boss, coffre, roulette, run progress, combat-bg layers) émet bien les classes du bundle. Conservation V2/V3 propre (saveVersion=3, IDs Playwright, hooks `__game_test_*`, `STORAGE_KEY=runebound-cards-save-v1`, reducer intact). **Mais** : (1) `combat-footer` n'émet pas le markup bundle `.combat-skills/.sk/.combat-consumables/.cons/.combat-speed/.speed-btn` — tout le footer reste en V3 legacy ; (2) `@keyframes spin-slow` est référencé (cbb-star, chero-rays) mais jamais déclaré ; (3) `@keyframes spark/breathe/wobble/pulse-halo` V4 divergent du bundle (le `spark` V4 hardcode translate au lieu de lire `--dx`/`--dy`, donc Sparkles ne tracent pas leurs orbites). Trois écarts visuels concrets bloquent la conformité pixel-perfect.

## Audit checklist

### CSS Append (V5-T2 à V5-T6)

**Tokens.css (V5-T2)** : ✓ — `:root` complet (bg-deep #1a1530, brand-* OKLCH, --rarity-*, --chest-*, --hp-good/warn/low, --shield/mana/rage/poison, --r-sm/md/lg/xl/pill, --stroke, --shadow-stick*, --font-display Lilita One, --font-body Nunito, --combat-speed). Identique au bundle (vérifié styles.css L≈1-110 ou plus haut, et tokens.css bundle L1-110).

**_shared.css (V5-T3)** :
- ✓ `.btn`/`.btn--primary/--gold/--mint/--grape` (styles.css L6230-6252, identiques bundle).
- ✓ `.pill` (L6254-6268).
- ✓ `.bg-sky-day/dusk/meadow/night` (L6205-6228).
- ⚠ Keyframes `float-y, shimmer-x, pulse-halo, breathe, wobble, spark` présents (V4, L5786-5813) mais **divergents du bundle** : `spark` V4 hardcode `translate(2px,-3px)` alors que bundle utilise `translate(var(--dx,0), var(--dy,0))` → les Sparkles V5 (qui posent `--dx`/`--dy` inline) ne suivent pas leur orbite. `breathe` V4 = scale(1.018) sans rotate ; bundle = scale(1.04) rotate(0.5deg). `wobble` V4 = translate+rotate ; bundle = rotate(-1.5deg/+1.5deg) seul. `pulse-halo` V4 = scale 1.06 ; bundle = scale 1.08. **Majeur** — divergence visuelle directe sur sparkles + animations idle des cartes.
- ✗ `@keyframes spin-slow` **non déclaré** (cherché ligne par ligne) — référencé par `.cbb-star` (L6785) et `.chero-rays` (L6867). **Blocker mineur** : star boss et rays héros ne tournent pas.
- ✓ `@media (prefers-reduced-motion: reduce)` global présent (multiple instances V4 — au moins 9 occurrences).

**cards.css (V5-T4)** : ✓ — bloc bundle complet (L6273-6429). `.pcard` + variants rarity, `.pcard-halo`, `.pcard-frame`, `.pcard-top`, `.pcard-rank`, `.pcard-rarity-badge`, `.rrb-dot`, `.pcard-portrait` + idle variants, `.hp-wrap`, `.hp-spotlight`, `.hp-body`, `.hp-head`, `.hp-hat`, `.hp-hat-band`, `.hp-hat-pom`, `.hp-eyes`, `.hp-eye`, `.hp-pupil`, `.hp-cheek--l/r`, `.hp-mouth`, `.hp-cape`, `.hp-cape-shine`, `.pcard-locked/-q/-locked-tag`, `.pcard-name`, `.pcard-role`, `.pcard-stats`, `.stat`, `.stat-icon`, `.stat-meta`, `.stat-v`, `.stat-l`, `.pcard-skill/-skill-head/-skill-icon/-skill-name/-skill-desc`, `.pcard-trait/-trait-tag/-trait-name`, `.pcard-foot/-foot-l/-frag/-frag-lbl/-rank-stars`, `.rs/.rs--on`, `.sparkles`, `.sparkle`. ⚠ Limite secondaire : `.sparkle` utilise `animation: spark 3s` qui rentre dans le keyframe V4 défaillant.

**chests.css (V5-T5)** : ✓ — bloc bundle complet (L6437-6659). `.chest`, `.chest-aura/-shadow/-body/-lid/-lid-band-top/-lid-keyhole/-lid-stud--l/r/-box/-box-band/-box-lock/-rune--1/2/3/-burst/-name`. `.rou`, `.rou-frame`, `.rou-marker` (avec ::before/::after pour la flèche corail bidirectionnelle), `.rou-fade--l/r`, `.rou-strip`, `.rou-strip--idle`, `.rou-item` + variants `--rare/--epic/--legendary/--mythic`, `.rou-item.is-winner`, `.mini-portrait`, `.mini-head`, `.mini-hat`, `.mini-eye--l/r`, `.mini-mouth`, `.rou-item-name`, `.rou-status/-status--spin/-status--done`. `@keyframes chest-burst-v5` déclaré localement. ⚠ Note : `pulse-halo` reste référencé par `.chest--runic .chest-aura` et est divergent du bundle (cf. _shared).

**combat.css (V5-T6)** : ✓ — bloc complet (L6664-7236). `.combat-screen` (1232×720, fond #1a1530), 4 layers `.combat-bg--{sky,clouds,mist,specks}` avec keyframes `cloud-drift`, `mist-pulse`, `specks-drift` déclarés (L6693, L6702, L6715). `.combat-top` (rgba(15,10,30,0.65) blur), `.combat-stage-pill` (linear-gradient violet→raisin), `.csp-icon`, `.combat-progress`, `.pp` + variants `--s1/--s2/--s3/--cur/--boss/--done`, `.combat-resources`, `.cres`, `.cres-icon`. `.combat-boss-bar`, `.cbb-name/-star/-phase/-bar/-fill/-divider/-text` + `@keyframes bar-flow`. `.combat-field`, `.combat-floor`, `.combat-floor-grid`, `.combat-side--heroes/--enemies`. Hero V5 `.chero` + glow/frame/portrait/rays/mascot/hat/eye/mouth/cape/cast-ring/bottom/name/role/bar/cooldown + `@keyframes chero-attack`, `cast-ring`. `.enemy/-glow/-frame/-portrait/-name/-bar/-fill/-text` + `@keyframes enemy-attack`, `enemy-hit`. `.intent--attack/--debuff/--aoe`. `.e-slime` + shine + eye + mouth + drop + `@keyframes slime-bob`, `drop-fall`. `.e-bat` + wing--l/r + eye + fangs + `@keyframes wing-l/wing-r`. `.e-boss` + aura + glow + crown + eye + mouth + spike--l/r + `@keyframes boss-breathe`. `.combat-center`, `.spell--magic` + orb + trail + `@keyframes spell-magic`. `.spell--phys` + arrow + `@keyframes spell-phys`. `.spell--heal` + cross--2/3 + `@keyframes spell-heal`. `.spell--aoe` + shock + `@keyframes spell-aoe`. `.fnum--dmg/-dmg-small`. `.combat-screen .combat-footer`, `.combat-skills`, `.sk`, `.sk--ready/--cooling`, `.sk.is-pulse` + `@keyframes sk-pulse`, `.sk-icon`, `.sk-icon-pulse` + `@keyframes sk-icon-ring`, `.sk-meta/-name/-cd/-cdbar/-cdbar-fill/-key`. `.combat-consumables`, `.cons`, `.cons--empty`, `.cons-icon/-name/-qty`. `.combat-speed`, `.speed-btn`, `.speed-btn--active`. **Toutes les classes attendues sont présentes côté CSS**. Aucune keyframe combat manquante (cloud-drift, mist-pulse, specks-drift, bar-flow, chero-attack, enemy-attack, enemy-hit, boss-breathe, slime-bob, drop-fall, wing-l, wing-r, cast-ring, spell-magic, spell-phys, spell-heal, spell-aoe, sk-pulse, sk-icon-ring tous déclarés. `fnum-rise` non recherché — V3 a sa propre anim `floating-num--*`).

### Composants React émis au DOM (V5-T11 à V5-T22)

**HeroPortrait (V5-T11)** : ✓ — App.tsx L3200-3227 émet `hp-wrap > hp-spotlight + hp-body > hp-head + hp-hat (avec hp-hat-band + hp-hat-pom) + hp-eyes (2× hp-eye > hp-pupil) + hp-cheek--l + hp-cheek--r + hp-mouth + hp-cape > hp-cape-shine`. Identique au bundle JSX cards.jsx L39-70.

**Sparkles (V5-T11)** : ✓ markup correct (L3230-3257) ; pose `--dx`/`--dy`/`width`/`height`/`background`/`animationDelay`. ✗ animation rendue invisible/erronée car la keyframe `spark` V4 ne lit pas `--dx`/`--dy`. **Majeur**.

**CharacterCardDetailed (V5-T12)** : ✓ — L4914-4980. Émet `pcard pcard--{rarity}` (avec aussi `character-card-detailed rarity-${rarity}` en alias V4 pour compat) + `--rcolor`/`--rdeep`/`--rcream` inline. Wrapper button/div selon onClick. `pcard-halo`, `Sparkles`, `pcard-frame > pcard-top (rank "RANG II/III/..." + rarity-badge avec rrb-dot) + pcard-portrait + pcard-name + pcard-role + pcard-stats (6 stats grid 2x3 PV/ATQ/MAG/VIT/DEF/CD) + pcard-skill + pcard-trait + pcard-foot (frag + rank-stars 5/rs--on)`. État `is-locked` + `pcard-locked` interne avec `pcard-q "?" + pcard-locked-tag "À DÉBLOQUER"`. ⚠ Mineur : la classe alias V4 `character-card-detailed` est conservée (compat blocs CSS V4 dead) — pas un blocker mais peut écraser certains styles bundle si la spécificité V4 est plus haute (ordre source = bundle gagne, OK).

**CombatHero (V5-T13)** : ✓ — L3533-3603. Émet `chero` + `is-attacking/is-casting/is-ko/is-selected/is-hit`, style `--hidx`. `chero-glow` (radial), `chero-frame > chero-portrait > chero-rays + chero-mascot (chero-hat + chero-head + chero-eye--l + chero-eye--r + chero-mouth + chero-cape) + (chero-cast-ring conditionnel) + chero-bottom (chero-name + chero-role + chero-bar > chero-bar-fill + chero-bar-text + chero-cooldown > chero-cooldown-fill)`. Note ajout V5 : un bouton hidden `chero-special-trigger` pour Playwright/clavier (pas dans le bundle, mais invisible et utile). ⚠ `chero-rays` ne tournent pas (spin-slow manquant).

**EnemyCard (V5-T14)** : ✓ — L3633-3691. `enemy enemy--boss?` + `--ec`/`--eg`. `enemy-glow + enemy-frame > enemy-portrait > <e-slime|e-bat|e-boss> + enemy-name + enemy-bar > enemy-bar-fill + enemy-bar-text` + `intent intent--{attack,debuff,aoe}`. Branchement par `mapEnemyToDAType`. e-slime contient e-slime-shine + e-eye--l/r + e-mouth + e-drop--1 + e-drop--2. e-bat contient e-bat-wing--l/r + e-eye--l/r + e-fangs. e-boss contient e-boss-crown + e-boss-glow + e-boss-aura + e-eye--l/r + e-boss-mouth + e-boss-spike--l/r. Conforme bundle.

**BossHpBar (V5-T15)** : ✓ — L3260-3288. `combat-boss-bar > cbb-name (cbb-star + name + cbb-phase) + cbb-bar > cbb-fill (width%) + cbb-divider (left:50%) + cbb-text`. Inséré L6031-6038 dans CombatScreen au-dessus de combat-field si `state.run.enemy.boss`. Phase = `bossPhase + 1` (1, 2, 3) — cohérent. ⚠ `cbb-star` ne tourne pas (spin-slow manquant).

**RunProgress (V5-T16)** : ✓ — L3761-3799. `combat-progress` (avec id `#run-progress`) + 30 spans `pp pp--s{1,2,3} pp--cur? pp--boss? pp--done?`. Logique stage = floor(i/10), boss = (i+1)%10===0, done = fightNum<fight, cur = ===fight. Aria-* préservés.

**combat-top (V5-T17)** : ✓ — L6008-6028. `combat-stage-pill` (avec csp-icon "▲" + "ACTE I/II/III · VAGUE N"), `RunProgress` (pp), `combat-resources > 2× cres > cres-icon + b` (or "$" sun + fragments "◆" grape).

**CombatScreen background (V5-T18)** : ✓ — L6002-6005. 4 layers `combat-bg combat-bg--sky/clouds/mist/specks` directement enfants de `.combat-screen`. Plus de `.bg-sky-day` dans le markup combat. ⚠ Note : la className parent reste `screen combat-screen + speed-125/-150 + boss-pressure + stage-N` ; les classes V2/V3 (boss-pressure, speed-125) sont préservées pour compat — pas un problème, juste dette légère.

**Spells (V5-T19)** : ✓ — L3291-3311 (SpellLayer) + L6079-6091 (instanciation). `combat-center` rend les 4 `spell--{magic,phys,heal,aoe}` avec `is-active` selon mapping. spell-orb/spell-trail pour magic, spell-arrow pour phys, spell-cross/-2/-3 pour heal, spell-shock pour aoe. Re-key `${tick}-${active}` retrigger. Activation : scan `state.run.animQueue` pour le dernier event `kind === "projectile"`, mapping trajectoire→spell type via `mapAnimTrajectoryToSpellType`. Logique correcte pour le système V3 actuel ; le SpellLayer s'allume bien quand un projectile vole. ⚠ Mineur : si plusieurs projectiles back-to-back, le dernier gagne (pas un bug, comportement souhaité).

**FinalChest (V5-T20)** : ✓ — L4782-4847. `chest chest--{tier} + chest-tier--{tier}` (alias V4 conservé) + `is-shaking/is-shaking--{tier}/opened/is-opening` selon phase. `--ccolor`/`--cdeep`/`--cglow` inline depuis `getChestTierColors`. `chest-shadow + chest-aura + chest-body > chest-lid (chest-lid-band-top + chest-lid-keyhole + chest-lid-stud--l + chest-lid-stud--r) + chest-box (chest-box-band + chest-box-lock + (runic ? 3× chest-rune--1/2/3 : null))`. `chest-burst` quand phase=opening|beam. `chest-flash` (V4) conservé (V4 alias). `chest-beam chest-beam--{tier}` (V4 alias) en phase=beam|reveal. ID `#open-chest` conservé sur le bouton. Bouton utilise `btn btn--primary primary-action` — bon. ⚠ Mineur : V4 alias `chest-tier--${tier}` + `chest-flash` + `chest-beam` cohabitent avec bundle markup ; OK fonctionnellement, dette de cleanup.

**LootRoulette (V5-T21)** : ✓ — L5515-5552. Émet `loot-roulette rou` (alias V4 + bundle), `rou-frame > rou-marker + loot-roulette__marker (alias V4) + rou-fade--l + rou-fade--r + rou-strip (id #loot-roulette-strip + className `loot-roulette__strip rou-strip`) > N× rou-item + loot-roulette__item rou-item--{rarity} + ${rarityClassFor} + is-winner${onComplete} > mini-portrait > mini-head (mini-hat + mini-eye--l/r + mini-mouth) + rou-item-name`. Translate3d. testHookRef et reducedMotion conservés.

**combat-footer (V5-T22)** : ✗ **MAJOR** — L6102 instancie `<CombatFooter run={...}/>` qui rend (L3705-3737) toujours un `<section className="combat-footer">` legacy V3 contenant `<article>` avec "Competences pretes / Timeline / Log" — **AUCUN markup `combat-skills`, `sk`, `sk-icon`, `sk-icon-pulse`, `sk-meta`, `sk-name`, `sk-cd`, `sk-cdbar`, `sk-cdbar-fill`, `sk-key` n'est émis**. Pareil pour `<SpeedSelector>` L5006 qui rend `<div className="speed-selector">` + `speed-selector__btn` au lieu de `combat-speed > speed-btn/speed-btn--active`. Pareil pour `<ConsumableRail>` L3891+ qui rend `consumable-rail > consumable-slot/consumable-slot--filled/consumable-slot--empty/consumable-slot__icon` au lieu de `combat-consumables > cons/cons--empty + cons-icon/cons-name/cons-qty`. Le CSS bundle pour le footer (L7144-7236) est donc **dead** côté DOM. **Acceptance V5-T22 violée**. Ce n'est pas un blocker fonctionnel (les hotkeys, hooks, IDs Playwright fonctionnent), mais c'est un blocker DA : visuellement le footer reste V3.

### Helpers V5 (V5-T8 à V5-T10)

- ✓ `mapEnemyToDAType` (L3070-3095) retourne `{type, palette}` avec type ∈ slime|bat|boss. Boss palettes différenciées : Gardien des Cendres (rose-orange #ff8b6f), Sorcière du Vide (violet #b563ff), Roi Brisé (rose nacré #ff5fa2). Heuristique mots-clés robuste.
- ✓ `mapSkillToSpellType` (L3099-3111) retourne magic|phys|heal|aoe. heal→heal, shield→magic, attack avec mots boss "cendre/vide/brisé/onde/aoe"→aoe, sinon physical>=magic→phys, sinon magic.
- ✓ `mapAnimTrajectoryToSpellType` (L3113-3119) : heal→heal, shield→magic, physical→phys, poison→aoe, magic→magic. Cohérent.
- ✓ `RARITIES_V5` (L3130-3171) : 5 entrées (common/rare/epic/legendary/mythic) avec color/deep/cream/particles (0/3/5/8/12)/idle (static/shimmer/pulse/breathe/wobble)/sparkColor — match bundle cards.jsx L21-37 strict.
- ✓ `RARITY_COMBAT_COLOR` (L3178-3183) : 4 entrées concrètes pour chero (#9aa3b2 / #4ec5e8 / #b563ff / #ffb938).
- ✓ `CHEST_TIERS_V5` (L3187-3193) : 5 tiers (damaged/bronze/silver/royal/runic) avec ccolor/cdeep/cglow/name. Note : valeurs damaged `#a8957c/#6b5847/#c9b89c` — alignées chests.jsx L9-15.
- ✓ `rarityToStars` (L4996) + `romanizeRank` (L5000) helpers utilitaires.

### Suppressions V5-T7

- ⚠ `HeroMascot` toujours dans App.tsx L2947 — conservé inerte (décision dev validée). ✗ N'est plus appelé par les composants V5 cibles (CharacterCardDetailed, CombatHero, EnemyCard) ✓. Toujours appelé par `CharacterPortrait` L3320→L3329 → utilisé par `CharacterCard` simple → utilisé par Hub onglet Équipe et `<ChestResult>` (L3746). **Décision documentée dans decisions.md L92-96** mais consommatrice de complexité. Sévérité : minor.
- ⚠ `mapPersonaToVariant` toujours utilisé (L3320 dans CharacterPortrait). Idem.
- Le Hub `CharacterCard` simple émet `character-card rarity-${rarity} + selected/locked + card-visual-row + portrait + card-topline + stats-row + special-line` (L3346-3370). Markup V2/V3 legacy, pas migré V5. Décision dev validée — Hub hors-périmètre V5.

### Conservation V2/V3 (CRITIQUE)

- ✓ Reducer V1/V2/V3 non touché (audit grep — aucune modif des actions/handlers).
- ✓ saveVersion conservé à 3 (L535, L592).
- ✓ localStorage clé `runebound-cards-save-v1` conservée (L366).
- ✓ `render_game_to_text` fonctionnel (L5653-) — conservé.
- ✓ `advanceTime` (L5647), `__game_test_skip_roulette`/`__game_test_skip_boss_intro` (L4601, L5650) tous présents.
- ✓ IDs Playwright tous présents : `#stage-intro-enter` (L3821), `#open-chest` (L4823), `#run-progress` (L3776), `#loot-roulette-strip` (L5523), `#abandon-run` (L3430), `#speed-1/-25/-5` (via SpeedSelector L5023 dynamique), `#consumable-${index}` (L3847, L3864 — slots 0/1/2), `#reward-${index}` (L6170), `#lootbox-close` (L5591).
- ✓ `prefers-reduced-motion` couvert (9+ occurrences dans styles.css).

### Volume & qualité

- ⚠ Bundle CSS 166 KB (V4 = 131 KB, +35 KB / +27%). Acceptable pour Append + Override. Cleanup V4 dead-code possible en V6.
- ✓ Bundle JS 298 KB (V4 = 289 KB, +9 KB / +3%). Très acceptable.
- ⚠ App.tsx 6211 lignes (V4 = 5797, +414 lignes). Approche du plafond souple 6000+. Non bloquant mais à surveiller.
- ✓ TypeScript strict, build 0 erreur 0 warning rapporté.

## Évaluation des limites du dev

1. **CombatHud V2 reste sous combat-top V5** : **MAJOR** vs bundle. La maquette est 1232×720 stricte, le HUD V2 (lives/stats run/log) ajoute ~140 px en plus → la zone combat dépasse 720px. Le dev justifie par la stabilité Playwright. Compromis acceptable mais dette DA : à terme migrer le HUD vers la zone bundle ou le déplacer hors du combat-screen. Conséquence visuelle : le combat n'est pas pixel-perfect (excédent visible au scroll). Sévérité **MAJOR** car écart direct au critère de succès "Combat 1232×720 mature".

2. **Hub Équipe utilise encore HeroMascot V4** : **MINOR**. Le brief V5 cible explicitement les 4 écrans clés (cartes détaillées, combat, coffre, roulette) ; le bundle ne propose pas d'équivalent simple Hub. Décision dev cohérente. À traiter en V6 si l'utilisateur veut une cohérence totale.

3. **Bobby/Lila/Ronan = même mascotte (couleur par rareté seule)** : **MINOR ACCEPTÉ** — décision architecte validée (decisions.md L83-90) confirmée par bundle (cards.jsx L39-70 — HeroPortrait prend rarity, pas perso). Conforme bundle. Sujet V6 si différenciation souhaitée.

4. **SpellLayer s'active sur le dernier kind=projectile de animQueue** : **MINOR/OK**. Mécanique correcte : la trajectoire portée par l'event projectile mappe vers le bon spell type. Re-key par animQueue.length retrigger l'animation. Le seul risque est en cas de projectile heal/shield rapide-fire → l'événement le plus récent gagne, ce qui est le comportement souhaité. Limite acceptable.

## Écarts par sévérité

### Blocker
Aucun. Le build passe 0/0, le gameplay tourne, save/IDs/hooks sont intacts.

### Major

**M1. Footer V5 non migré (V5-T22 partiellement violé)** — `CombatFooter`, `SpeedSelector`, `ConsumableRail` continuent d'émettre le markup V3 legacy (`combat-footer + article + timeline-row + speed-selector + speed-selector__btn + consumable-rail + consumable-slot__icon`). Le CSS bundle `.combat-skills/.sk*/.combat-consumables/.cons*/.combat-speed/.speed-btn` est dead côté DOM. **Action correctrice** : refactoriser les 3 composants pour émettre les classes bundle. Conserver les IDs Playwright (`#speed-1`, `#speed-1-25`, `#speed-1-5`, `#consumable-0/1/2`). Sk-key affiche "1/2/3", sk-icon-pulse halo si ready, sk-cdbar-fill % cooldown. Cons supportent `--empty`. Speed-btn--active sur la valeur courante. Voir V5-T25 nouveau.

**M2. Keyframe `spin-slow` non déclaré** — `.cbb-star` (L6785) et `.chero-rays` (L6867) référencent `animation: spin-slow ...` mais aucun `@keyframes spin-slow` n'existe dans styles.css. Visuellement : cbb-star ne tourne pas, chero-rays statiques. **Action correctrice** : ajouter dans le bloc V5 `_shared` :
```css
@keyframes spin-slow { to { transform: rotate(360deg); } }
```
Voir V5-T26.

**M3. Keyframe `spark` V4 ne lit pas `--dx`/`--dy`** — Sparkles V5 (cards.jsx pattern, L3230 dans App.tsx) posent `--dx`/`--dy` inline pour orbiter. Mais `@keyframes spark` (L5804-5808) hardcode `translate(2px,-3px)` puis `translate(6px,-10px)` puis `translate(10px,-16px)`. Résultat : toutes les sparkles bougent identiquement (petit mouvement nord-est) au lieu d'orbiter selon angle calculé. Légendaire 8 sparks et mythique 12 sparks deviennent visuellement plates. **Action correctrice** : remplacer le keyframe `spark` V4 par celui du bundle (utilise var(--dx,0)/var(--dy,0)). Vérifier qu'aucun autre usage V4 ne dépend des coordonnées hardcodées (grep montre qu'il est utilisé par `.character-card-detailed__sparkle` qui est dead V5). Voir V5-T27.

**M4. Keyframes `breathe`/`wobble`/`pulse-halo` V4 divergent du bundle** — divergence subtile : breathe V4 = scale(1.018) ; bundle = scale(1.04) rotate(0.5deg). wobble V4 = translate+rotate ; bundle = rotate(±1.5deg) seul. pulse-halo V4 = scale(1.06) ; bundle = scale(1.08) opacity 0.55→0.85. Visuellement les cartes Légendaires (breathe) respirent à peine, les Mythiques (wobble) ondulent verticalement au lieu d'osciller en rotation. **Action correctrice** : adopter strictement les keyframes du bundle. Risque secondaire : les blocs CSS V4 (`.character-card-detailed`, hero mascots V4) qui dépendent des keyframes actuels peuvent voir leur anim modifiée — non régression visible car ces classes sont dead côté DOM V5 (sauf Hub Équipe → CharacterCard simple → portrait V4 utilisé sans wobble/breathe). Voir V5-T28.

### Minor

**m1. CombatHud V2 dépasse 1232×720** — déjà documenté ci-dessus comme limite dev #1. Sévérité MAJOR pour pureté DA mais dette acceptable au cycle V5.

**m2. Aliases V4 sur composants V5** — `CharacterCardDetailed` émet `pcard pcard--${rarity} character-card-detailed rarity-${rarity}`. `FinalChest` émet `chest chest--${tier} chest-tier--${tier}`. `LootRoulette` émet `loot-roulette rou`. Dette de cleanup, pas un bug. À retirer en V6 polish.

**m3. HeroMascot V4 conservé inerte** — décision dev acceptée. Sujet V6.

**m4. CombatFooter V3 (timeline/log) coexiste avec bundle** — cf M1, mais aussi le composant lui-même (panneaux Timeline/Log) n'a pas d'équivalent bundle. À décider en V6 : remplacer ou intégrer.

**m5. `chest-burst` keyframe local `chest-burst-v5`** — divergence nom ; le CSS V4 d'origine avait probablement `chest-burst`. Pas de conflit fonctionnel mais nommage hybride. Cosmétique.

## Risques de régression V2/V3

- **Tests Playwright** : tous les IDs et hooks présents. Pas de régression attendue tant que les sélecteurs sont par ID.
- **Save migration** : saveVersion=3 inchangé, normalizeSave preservée — pas de risque.
- **Reducer** : audit grep négatif sur les actions critiques (TICK, USE_SPECIAL, USE_CONSUMABLE, OPEN_CHEST, START_STAGE, BOSS_INTRO_DISMISS, etc.). Pas de régression attendue.
- **Hub onglets, atelier, recyclage, replace consumable** : composants V2/V3 intacts ; `HeroMascot` conservé pour le Hub.
- **animQueue** : la couche `CombatAnimationLayer` V3 est conservée en parallèle au SpellLayer V5 (L6061-6065). Aucune régression possible. L'ajout du SpellLayer ne lit que les events sans muter.
- **Risque résiduel** : le z-index du SpellLayer (combat-center) est dans `combat-field` à côté de `CombatAnimationLayer`. Peut donner un double rendu visuel sur projectiles (V3 dot + V5 spell). À vérifier en QA visuelle.

## Validation cohérence DA

**Pixel-perfect : NON, ~75-80%.** Les éléments principaux (cartes pcard, combat-screen avec layers, héros chero, ennemis e-slime/bat/boss, boss bar cbb, run progress pp, coffre chest-lid+box+studs+runes+burst, roulette rou+mini-portrait) émettent correctement les classes du bundle, ce qui couvre les écrans cibles à environ 80%. Les écarts qui empêchent la conformité totale :

1. **Footer combat non migré** (M1) — visible immédiatement quand le joueur regarde le bas de l'écran combat : skills/cons/speed sont en V3 legacy au lieu du look bundle (sk-icon halo + sk-key + sk-cdbar). Impact visuel ~15% de la zone combat.
2. **Animations sparkles brisées** (M3) — légendaire et mythique sparkles ne tournent pas en orbite. Impact visuel : 5/5 raretés pour les cartes — mais surtout effets idle Légendaire + Mythique perdent leur signature.
3. **cbb-star + chero-rays statiques** (M2) — boss bar et héros perdent un peu de vie.
4. **Idle animations légendaire/mythique faibles** (M4) — la respiration et le balancement sont sub-perceptibles.
5. **CombatHud V2 ajoute du contenu hors-cadre 1232×720** — la maquette artistique n'est pas reproductible exactement.

Sur les écrans cibles précis (carte détaillée standalone, coffre + roulette, combat-screen *partie haute + cartes*) → pixel-perfect ~90%. Sur le combat-screen complet (footer + HUD V2) → ~65%.

## Tâches de correction
Cf. `tasks.json` mis à jour : V5-T25 (footer migration), V5-T26 (spin-slow keyframe), V5-T27 (spark keyframe avec --dx/--dy), V5-T28 (breathe/wobble/pulse-halo align bundle).

## Recommandation finale
**À reprendre partiellement** : le gros est en place, mais 4 corrections ciblées (M1-M4) sont nécessaires pour atteindre le pixel-perfect promis par le brief. Une fois ces 4 majors traités, la livraison V5 atteindra ~95% de conformité bundle, le reste étant des décisions explicites (Hub V6, mascottes par rareté seule).
