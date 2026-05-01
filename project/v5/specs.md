# Specs V5 — Implémentation pixel-perfect du bundle Bobbycard DA

## 1. Intention
Aligner le rendu visuel du jeu Bobbycard sur le bundle de design Claude Design (`Bobbycard DA.html`), **sans toucher au gameplay V1+V2+V3**. V4 a re-skinné mais avec écarts (combat trop clair, mascotte unique, BEM `__` au lieu du `-` du bundle, classes spell absentes). V5 corrige par alignement strict.

## 2. Audience
- Joueur tous âges, vibe Clash Royale × Brawl Stars.
- Combat 1280×720 mature (palette nuit violet/rose).
- Cartes héros candy à 5 raretés.

## 3. Résultats attendus
- Combat-screen rendu = bundle (4 layers `combat-bg--*`, hero `chero`, ennemis `e-{slime,bat,boss}`, sorts `spell--*`, fnum, boss bar `combat-boss-bar`).
- Cartes détaillées = bundle (`pcard pcard--{rarity}` + `HeroPortrait` (`hp-*`) + sparkles count par rareté + idle anim par rareté).
- Coffre = bundle (`chest chest--{tier}` + chest-lid + chest-body + studs + lock + runes + burst).
- Roulette = bundle (`rou rou-frame rou-strip rou-item rou-item--{rarity}` + `mini-portrait`).
- Boutons CTA = `.btn .btn--primary/--gold/--mint/--grape` du bundle.
- Build TypeScript clean.
- 0 régression V2/V3 (reducer, save, hooks de test, Playwright IDs).

## 4. Périmètre fonctionnel (audit V4 vs bundle)

### a) Tokens (`tokens.css` — 110 lignes)

V4 a déjà appliqué la plupart des tokens (`--bg-deep`, `--brand-coral`, etc., cf. `decisions.md` V4). À vérifier en mode passif : si une clé du bundle est différente, le bundle gagne. Pas de divergence majeure attendue.

### b) `_shared.css` (105 lignes)

| Classe / @keyframes | État V4 | Action V5 |
|---|---|---|
| `.bg-sky-day`, `.bg-sky-dusk`, `.bg-meadow`, `.bg-night` | présent partiellement | **append** (overrides bundle) |
| `.btn`, `.btn--primary/gold/mint/grape` | absent (V4 a `.primary-action`) | **append** |
| `.pill` | absent | **append** |
| `@keyframes float-y, shimmer-x, pulse-halo, spark, breathe, wobble, spin-slow` | déjà en V4 (cf. décision V4) | **vérifier identique** |
| `@media (prefers-reduced-motion)` reset global | présent en V4 (déjà couvert) | conserver |

### c) `cards.css` (213 lignes — pcard + hp-* + sparkles)

**V4 a `character-card-detailed__*` (BEM strict)**. Bundle utilise `pcard*` et `pcard-portrait`, `pcard-name`, `pcard-stats`, etc.

| Classe bundle | V4 état | Action V5 |
|---|---|---|
| `.pcard`, `.pcard-halo`, `.pcard-frame` | absent | **add** |
| `.pcard--{common,rare,epic,legendary,mythic}` | absent | **add** (V4 a `rarity-*`) |
| `.pcard-top`, `.pcard-rank`, `.pcard-rarity-badge`, `.rrb-dot` | absent | **add** |
| `.pcard-portrait`, `.pcard-portrait--{static,shimmer,pulse,breathe,wobble}` | absent | **add** |
| `.pcard-name`, `.pcard-role`, `.pcard-stats`, `.stat`, `.stat-icon`, `.stat-meta`, `.stat-v`, `.stat-l` | absent | **add** |
| `.pcard-skill`, `.pcard-skill-head`, `.pcard-skill-icon`, `.pcard-skill-name`, `.pcard-skill-desc` | absent | **add** |
| `.pcard-trait`, `.pcard-trait-tag`, `.pcard-trait-name` | absent | **add** |
| `.pcard-foot`, `.pcard-frag`, `.pcard-frag-lbl`, `.pcard-rank-stars`, `.rs`, `.rs--on` | absent | **add** |
| `.pcard-locked`, `.pcard-q`, `.pcard-locked-tag` | absent | **add** |
| `.hp-wrap`, `.hp-spotlight`, `.hp-body`, `.hp-head`, `.hp-hat`, `.hp-hat-band`, `.hp-hat-pom`, `.hp-eyes`, `.hp-eye`, `.hp-pupil`, `.hp-cheek*`, `.hp-mouth`, `.hp-cape`, `.hp-cape-shine` | absent (V4 utilise `HeroMascot`) | **add** |
| `.sparkles`, `.sparkle` | absent (V4 utilise `rarity-particle*` et `character-card-detailed__sparkle`) | **add** |

V4 obsolètes côté cartes : `.character-card-detailed*` (gardés en safe pour ne pas casser autres usages, mais on n'en émet plus).

### d) `chests.css` (254 lignes)

V4 utilise BEM `chest__lid`, `chest__body`, `chest__lid-band`, `chest__keyhole`, `chest__stud--{l,c,r}`, `chest__rune`, `chest__burst`. Bundle utilise `chest-lid`, `chest-body`, `chest-lid-band-top`, `chest-lid-keyhole`, `chest-lid-stud--{l,r}`, `chest-rune`, `chest-burst`.

| Classe bundle | V4 état | Action V5 |
|---|---|---|
| `.chest`, `.chest-aura`, `.chest-shadow`, `.chest-body` | partiel (`chest__body`) | **add** |
| `.chest-lid`, `.chest-lid-band-top`, `.chest-lid-keyhole`, `.chest-lid-stud--l/r` | divergent (`chest__lid`, `chest__lid-band`, `chest__keyhole`, `chest__stud--l/c/r`) | **add bundle classes** + adapter markup |
| `.chest-box`, `.chest-box-band`, `.chest-box-lock` | divergent (`chest__band`, `chest__lock`) | **add** |
| `.chest-rune`, `.chest-rune--{1,2,3}` | divergent (`chest__rune`, `chest__rune--{1,2,3}`) | **add** |
| `.chest-burst` + `@keyframes chest-burst` | divergent (`chest__burst`) | **add** |
| `.chest-name` | absent | **add** (sera un noop vu qu'on a déjà notre propre label) |
| `.chest--{damaged,bronze,silver,royal,runic}` | présent (V4) avec valeurs | **override avec bundle** |
| `.rou`, `.rou-frame`, `.rou-marker`, `.rou-fade--l/r`, `.rou-strip`, `.rou-strip--idle`, `.rou-item`, `.rou-item--{rare,epic,legendary}`, `.rou-item.is-winner`, `.mini-portrait`, `.mini-head`, `.mini-hat`, `.mini-eye--l/r`, `.mini-mouth`, `.rou-item-name`, `.rou-status`, `.rou-status--spin`, `.rou-status--done` | divergent (V4 utilise `loot-roulette*` et `rou__*` BEM) | **add bundle** + adapter markup |

### e) `combat.css` (611 lignes)

V4 a un combat-screen mais pas la palette nuit violet/rose. V4 utilise `combat-hero`, `enemy-card`, `boss-hp-bar` (BEM). Bundle = `chero`, `enemy`, `combat-boss-bar` (`cbb-*`).

| Classe bundle | V4 état | Action V5 |
|---|---|---|
| `.combat-screen` (background, border) | présent V4 (clair stage 1 — bug) | **override** (palette nuit violet/rose) |
| `.combat-bg`, `.combat-bg--{sky,clouds,mist,specks}` + keyframes | absent | **add** |
| `.combat-top`, `.combat-stage-pill`, `.csp-icon` | présent V4 (`combat-stage-pill__icon`) | **override** + adapter markup |
| `.combat-progress`, `.pp`, `.pp--s{1,2,3}`, `.pp--cur`, `.pp--boss`, `.pp--done` | absent (V4 a `run-progress*`) | **add** + nouveau composant ou refactor RunProgress |
| `.combat-resources`, `.cres`, `.cres-icon` | présent V4 partiellement (`cres__icon`) | **override** + adapter markup |
| `.combat-boss-bar`, `.cbb-name`, `.cbb-star`, `.cbb-phase`, `.cbb-bar`, `.cbb-fill`, `.cbb-divider`, `.cbb-text` + `@keyframes bar-flow` | absent (V4 a `boss-hp-bar*`) | **add** + refactor BossHpBar |
| `.combat-field`, `.combat-floor`, `.combat-floor-grid` | partiel | **add** |
| `.combat-side`, `.combat-side--heroes`, `.combat-side--enemies` | absent (V4 a `combat-field__heroes/enemies`) | **add** + refactor |
| `.chero`, `.chero-glow`, `.chero-frame`, `.chero-portrait`, `.chero-rays`, `.chero-mascot`, `.chero-head`, `.chero-hat`, `.chero-eye/mouth/cape`, `.chero-cast-ring`, `.chero-bottom`, `.chero-name`, `.chero-role`, `.chero-bar`, `.chero-bar-fill`, `.chero-bar-text`, `.chero-cooldown`, `.chero-cooldown-fill`, animations `chero-attack`, `cast-ring` | absent (V4 a `combat-hero*`) | **add** + refactor `CombatHero` |
| `.enemy`, `.enemy-glow`, `.enemy-frame`, `.enemy--boss`, `.enemy-portrait`, `.enemy-name`, `.enemy-bar`, `.enemy-bar-fill`, `.enemy-bar-text`, animations `enemy-attack`, `enemy-hit` | absent (V4 a `enemy-card*`) | **add** + refactor `EnemyCard` |
| `.intent`, `.intent--{attack,debuff,aoe}`, `.intent-icon` | absent | **add** |
| `.e-slime`, `.e-slime-shine`, `.e-eye`, `.e-eye--l/r`, `.e-mouth`, `.e-drop`, `.e-drop--{1,2}` + animations `slime-bob`, `drop-fall` | absent | **add** |
| `.e-bat`, `.e-bat-wing`, `.e-bat-wing--{l,r}`, `.e-fangs` + animations `wing-l`, `wing-r` | absent | **add** |
| `.e-boss`, `.e-boss-aura`, `.e-boss-glow`, `.e-boss-crown`, `.e-boss-mouth`, `.e-boss-spike`, `.e-boss-spike--{l,r}` + animations `boss-breathe` | absent | **add** |
| `.combat-center`, `.spell`, `.spell--{magic,phys,heal,aoe}`, `.spell-orb`, `.spell-trail`, `.spell-arrow`, `.spell-cross`, `.spell-cross--{2,3}`, `.spell-shock`, `.is-active` + animations `spell-magic`, `spell-phys`, `spell-heal`, `spell-aoe` | absent (V4 a `Projectile`) | **add** + nouveau plumbing animQueue → spell |
| `.fnum`, `.fnum--{dmg,dmg-small,crit,heal}` + `@keyframes fnum-rise` | présent V4 (`.fnum`, `.fnum--special`, `.fnum--crit`, `.fnum--heal`) | **append override** (ajout `fnum--dmg`, `fnum--dmg-small` ; conserver `--special`, `--shield`, `--poison` V4 pour ne pas casser) |
| `.combat-footer`, `.combat-skills`, `.sk`, `.sk--{ready,cooling}`, `.sk.is-pulse`, `.sk-icon`, `.sk-icon-pulse`, `.sk-meta`, `.sk-name`, `.sk-cd`, `.sk-cdbar`, `.sk-cdbar-fill`, `.sk-key` | partiel (V4 a `.sk`, `.sk__icon`, etc.) | **override** + adapter markup |
| `.combat-consumables`, `.cons`, `.cons--empty`, `.cons-icon`, `.cons-name`, `.cons-qty` | partiel (V4 a `.cons`, `.cons__icon`, etc.) | **override** + adapter markup |
| `.combat-speed`, `.speed-btn`, `.speed-btn--active` | partiel (V4 a `.speed-selector`, `.combat-speed__btn`) | **add** + adapter markup |

### f) Composants React à modifier

| # | Composant | Lignes (App.tsx) | Avant | Après |
|---|---|---|---|---|
| 1 | `CombatHero` | L3255-3318 | `combat-card combat-hero rarity-*` + `HeroMascot` | `chero` + inline mascot CSS (`chero-hat/head/eye/mouth/cape`) |
| 2 | `EnemyCard` | L3320-3382 | `enemy-card intent-* boss` + `HeroMascot` | `enemy enemy--boss` + inline `e-{slime,bat,boss}` |
| 3 | `BossHpBar` (extrait de EnemyCard) | L3343-3353 | `boss-hp-bar*` | `combat-boss-bar` + `cbb-*`, **séparer** en composant pour usage en haut du combat-screen |
| 4 | `RunProgress` | L3451-3516 | `run-progress run-progress__*` | `combat-progress` + 30 dots `pp pp--s{1,2,3}` |
| 5 | `combat-top` ressources | L5637+ | `cres__icon` partiel | `combat-resources` + `cres` + `cres-icon` |
| 6 | `combat-stage-pill` | dans App.tsx render | `combat-stage-pill` + `combat-stage-pill__icon` | `combat-stage-pill` + `csp-icon` |
| 7 | `CombatScreen` background | L5637 | `combat-screen stage-N` (skybox clair) | `combat-screen` + 4 layers `combat-bg--*` |
| 8 | Spells (animQueue → spell) | nouveau | V4 `Projectile` | `combat-center` + 4 `spell--*` éléments toggled `.is-active` |
| 9 | `CharacterCardDetailed` | L4581-4673 | `character-card-detailed*` + `HeroMascot` | `pcard pcard--{rarity}` + `HeroPortrait` + `pcard-stats` (6 stats) + skill encadré + trait + foot |
| 10 | `HeroPortrait` (nouveau) | nouveau | — | `hp-wrap > hp-body > hp-head + hp-hat + hp-eyes + hp-cheek + hp-mouth + hp-cape` |
| 11 | `Sparkles` (nouveau) | nouveau | — | `sparkles > sparkle×N` count par rareté |
| 12 | `FinalChest` | L4428-4562 | `chest__*` BEM | `chest > chest-aura + chest-shadow + chest-body > chest-lid + chest-box` |
| 13 | `LootRoulette` | L5112-5195 | `loot-roulette*` | `rou > rou-frame > rou-marker + rou-fade + rou-strip > rou-item--{rarity} > mini-portrait` |
| 14 | Boutons `.primary-action` | global | `.primary-action` | `.btn .btn--primary` (mais conserver `.primary-action` en alias pour ne rien casser) |
| 15 | Suppression `HeroMascot` | L2883-2998 | composant 22 variants | **supprimer** + helpers `mapPersonaToVariant`, `mapEnemyNameToVariant` (transformer en `mapEnemyToDAType` qui retourne `'slime'\|'bat'\|'boss'`) |

### g) Helpers à créer / modifier

- **`mapEnemyToDAType(name: string, isBoss: boolean): { type: 'slime'\|'bat'\|'boss'; palette: { c, cream, glow } }`** — retourne le type DA et la palette à passer en `style={{'--ec': c, '--eg': glow}}`. Mapping :
  - boss=true ⇒ `boss` ; palette différente par boss (ember pour Gardien des Cendres rose-orange, violet pour Sorcière du Vide, rose nacré pour Roi Brisé).
  - non-boss : si nom contient `bat|chauve|fantôme|fantome|ghost|spectre` ⇒ `bat`. Sinon ⇒ `slime`.
- **`mapSkillToSpellType(special: SpecialSkill): 'magic' \| 'phys' \| 'heal' \| 'aoe'`** — d'après le `special.type` (`attack` ⇒ `phys` si `physical >= magic`, sinon `magic` ; `heal` ⇒ `heal` ; `shield` ⇒ `magic`). AOE seulement pour boss (skill avec mot `cendres|vide|brisé|onde`). Faute de marqueur explicite : `phys` si `c.physical >= c.magic`, `magic` sinon ; pour heal/shield basculer vers `heal`.
- **`getRarityProps(rarity: Rarity): { color, deep, cream, particles, idle, sparkColor }`** — selon `cards.jsx` L21-37. Inclure `mythic` (utilisé pour reveal coffre runique exceptionnel).
- **`getChestTierColors(tier: ChestTier): { ccolor, cdeep, cglow, name }`** — selon `chests.jsx` L9-15.

### h) Conservation V2/V3 — IDs et hooks
À préserver intacts :
- IDs Playwright : `#stage-intro-enter`, `#open-chest`, `#speed-1`, `#speed-1-25`, `#speed-1-5`, `#consumable-{0,1,2}`, `#loot-roulette-strip`, `#run-progress`.
- Hooks de test : `__game_test_skip_roulette`, `__game_test_skip_boss_intro`, `__game_test_*`.
- localStorage : `runebound-cards-save-v1`.
- Props et signatures composants : `CombatHero(member, onSpecial, anim)`, `EnemyCard(enemy, bossPhase, anim)`, `LootRoulette(items, finalIndex, onComplete, reducedMotion, testHookRef)`, `FinalChest(tier, opened, reward, onOpen, customCharacters)`, `CharacterCardDetailed(character, mode, size, isSelected, isLocked, onClick, fragments, rank, ...)`.

## 5. Hors-périmètre
- Pas de gameplay ni nouvelle mécanique.
- Pas de migration save (clé conservée).
- Pas de renommage stages (V2 names préservés).
- Pas de phrases boss différentes (V4 préservé).
- Pas de variantes par perso pour `HeroPortrait` (couleur uniquement par rareté ; cf. décision §C-1).
- Pas de Projectile V3 si `combat-center > spell--*` couvre. **Décision** : conserver le système V3 `Projectile` réseau, mais ajouter en parallèle la couche bundle `combat-center > spell--*`. La transition complète des projectiles V3 → spells V5 sera faite en migrant chaque animQueue event vers le bon `spell--*`. Le système V3 sera désactivé (inert) si les nouveaux spells couvrent. Cf. décision dédiée.
- Pas de toucher à : reducer, save, hubScreen 5 onglets, Atelier preview, recyclage, replace consumable.

## 6. Contraintes
- Stack : Vite + React + TypeScript ; `npm run build` doit passer 0 erreur 0 warning.
- Volume CSS : viser ≤ 7 500 lignes après ajouts (V4 = 6 187, bundle ajoute ~1 500).
- Performance : sparkles count par rareté (max 12 mythic) — déjà arbitré par décision V5 (GPU-composé).
- Reduced motion : déjà couvert par `_shared.css` reset global ; aucun ajout requis.
- Browser : Chrome/Edge récents (cible Playwright). Pas de polyfill OKLCH.
- Accessibilité : conserver les `aria-*`, `role`, IDs Playwright.

## 7. Critères de succès
- [ ] Build TypeScript clean : 0 erreur, 0 warning.
- [ ] Toutes les classes du bundle CSS sont présentes dans `src/styles.css` (à vérifier par grep des classes-clés).
- [ ] Le DOM React émet `chero`, `enemy`, `e-slime/bat/boss`, `combat-boss-bar`/`cbb-*`, `combat-progress`/`pp`, `pcard pcard--{rarity}`, `chest chest-lid chest-body`, `rou rou-strip rou-item`, `combat-bg combat-bg--*`.
- [ ] Combat-screen palette nuit violet/rose (vérifier dans le DOM : pas de `.bg-sky-day`).
- [ ] Aucun appel `<HeroMascot>` (composant supprimé ou ramené à no-op).
- [ ] localStorage `runebound-cards-save-v1` lue/écrite intacte.
- [ ] IDs Playwright tous présents.
- [ ] Hooks de test V3 (`__game_test_*`) tous fonctionnels.
- [ ] Reducer / actions / save inchangés.

## 8. Risques identifiés
- **Volume CSS** : ~1 500 lignes ajoutées. Mitigation : append en fin de fichier, pas de remplacement intra-bloc — la cascade fait le tri.
- **Conflit BEM `__` vs hyphen-`-`** : V4 a `chest__lid`, bundle veut `chest-lid`. Mitigation : émettre **les deux classes** sur les éléments React (`className="chest-lid chest__lid"`) le temps de la transition, ou passer 100% bundle et laisser les classes V4 dead.
- **CombatHero markup incompatible** : V4 a `combat-card combat-hero` qui hérite de styles V2/V1 généraux (`.combat-card`). Risque que des règles V2/V1 ciblant `.combat-card` perturbent `.chero`. Mitigation : émettre `chero` **sans** `combat-card`, et accepter que `.combat-card` styles V1 deviennent dead pour les héros (les hubs/menu peuvent encore utiliser `.combat-card`).
- **Spells animQueue mapping** : V3 `Projectile` peut avoir des events qu'on ne sait pas traduire en `spell--*`. Mitigation : fallback `spell--phys` par défaut.
- **Run-progress refactor** : V4 a 30 dots avec `run-progress__step` et un séparateur hub. Bundle a 30 dots `pp` strict. Décision : conserver le séparateur hub V4 invisible (CSS `display:none`) pour ne pas casser test ; émettre les 30 dots `pp pp--s{1,2,3} pp--cur pp--boss pp--done` en plus.
- **Ennemis simplifiés à 3 types** : déjà acté par décision V5 (orchestrator). Risque de monotonie visuelle compensé par palette par stage et boss.

## 9. Stratégie d'application : Append + Override

Après audit : **Append** est plus sûr.
- Les blocs V4 (`character-card-detailed*`, `combat-hero*`, `enemy-card*`, `boss-hp-bar*`, `combat-stage-pill__icon`) restent en place mais **ne sont plus émis** par le DOM (donc dead code visuel inerte).
- Les blocs bundle (cards.css, chests.css, combat.css, _shared.css) sont **appendés** en fin de `src/styles.css` après un séparateur clair `/* === V5 — Bundle Bobbycard DA — pixel-perfect override === */`.
- Spécificité naturelle : les sélecteurs bundle sont au même niveau que V4 mais arrivent après dans le fichier ⇒ ils gagnent. Pour les classes BEM divergentes (`chest__lid` vs `chest-lid`) on émet le markup bundle uniquement.
- Avantage : zero risk de casser les autres écrans (Atelier, Hub onglets, modales) qui n'utilisent pas ces classes.
- Au cycle de polish ultérieur, suppression des blocs V4 dead.

## 10. Plan de tâches (résumé)
Voir `tasks.json`. 20 tâches T1→T20. Owner = `frontend-dev` pour toutes (V5 = chantier d'implémentation pure).
