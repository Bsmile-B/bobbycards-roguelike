# Passation Architect → Frontend-dev (V5)

V5 = chantier d'implémentation pure (pas de phase designer). Le bundle Claude Design `project/v5/bloop-design/project/` est la **source de vérité visuelle**.

## Ce que tu dois absolument retenir

1. **Append + Override CSS, pas Replace.** Tu colles les blocs bundle (tokens, _shared, cards, chests, combat) en fin de `src/styles.css` sous séparateur `/* === V5 — Bundle Bobbycard DA — pixel-perfect override === */`. Tu ne touches pas aux blocs V4 existants. Les classes V4 BEM (`chest__lid`, `combat-hero`, `enemy-card`, `boss-hp-bar*`, `character-card-detailed*`, `run-progress*`, `loot-roulette*`) deviennent dead inertes : elles restent dans le CSS mais ne sont plus émises par le DOM React.

2. **Suppression effective de `<HeroMascot>` et `mapPersonaToVariant`.** `mapEnemyNameToVariant` est renommé/réécrit en `mapEnemyToDAType` qui retourne `'slime'|'bat'|'boss'` + palette `{ c, cream, glow }`. Côté héros, `HeroPortrait` du bundle ne dépend que de la rareté — Bobby/Lila/Ronan partagent la même mascotte (couleur par rareté).

3. **Combat = palette nuit violet/rose uniforme** (pas stage-aware). Tu vires les classes `stage-1/2/3` du `combat-screen` et tu remplaces le background par les 4 layers `combat-bg combat-bg--{sky,clouds,mist,specks}`. Le bundle est explicite : `linear-gradient(180deg, #2a2147 0%, #3a2f5e 100%)`.

4. **Spells V5 en parallèle de Projectile V3.** Tu ajoutes `combat-center > .spell--{magic,phys,heal,aoe}` toggled `.is-active` selon animQueue. Le système Projectile V3 reste exporté mais inerte (rollback de sécurité). Re-key chaque spell par `(tick, phase)` pour retrigger l'animation CSS.

5. **IDs Playwright et hooks de test V3 sont sacrés.** `#stage-intro-enter`, `#open-chest`, `#speed-1/-25/-5`, `#consumable-{0,1,2}`, `#loot-roulette-strip`, `#run-progress`. `window.__game_test_skip_roulette`, `window.__game_test_skip_boss_intro`, etc. localStorage `runebound-cards-save-v1`. **0 régression toléré.**

## Décisions déjà prises (cf. decisions.md)

- 2026-04-30 : V5 = pixel-perfect bundle (orchestrator).
- 2026-04-30 : Stratégie copy CSS bundle + adapt markup (orchestrator).
- 2026-04-30 : Suppression HeroMascot V4 (orchestrator).
- 2026-04-30 : Ennemis simplifiés à 3 types DA (orchestrator).
- 2026-04-30 : Combat palette nuit violet/rose (orchestrator).
- 2026-04-30 : Sparkles count par rareté assumé (orchestrator).
- 2026-04-29 : Append + Override (architect).
- 2026-04-29 : Migration spells = pipeline V3 vers V5 mais code V3 conservé inerte (architect).
- 2026-04-29 : Mapping ennemis par heuristique mots-clés (architect).
- 2026-04-29 : `mapPersonaToVariant` supprimé, `mapEnemyNameToVariant` → `mapEnemyToDAType` (architect).
- 2026-04-29 : `HeroPortrait` couleur par rareté seule, pas par perso (architect).

## Tâches qui te sont assignées

V5-T1 → V5-T24 (toutes). Voir `tasks.json`. Ordre recommandé :

1. **CSS d'abord** (T1-T6) : audit + tokens + _shared + cards + chests + combat append.
2. **Helpers** (T7-T10) : suppression HeroMascot + 3 helpers (mapEnemyToDAType, mapSkillToSpellType, getRarityProps, getChestTierColors).
3. **Composants nouveaux** (T11) : HeroPortrait + Sparkles.
4. **Composants refactorés** (T12-T18, T21, T22) : CharacterCardDetailed, CombatHero, EnemyCard, BossHpBar, RunProgress, combat-top, CombatScreen bg, LootRoulette, FinalChest.
5. **Spells layer** (T19) : combat-center + 4 spells.
6. **Footer + boutons** (T20) : sk/cons/speed-btn + .btn .btn--primary.
7. **Vérif** (T23-T24) : audit IDs Playwright + build clean + smoke.

## Pièges à éviter

- **Ne supprime PAS les blocs V4 dans styles.css**. Tu en as besoin tant que d'autres écrans non touchés (HUD primary, Atelier preview, recyclage modal) les consomment. Append seulement.
- **Ne casse PAS les signatures props existantes**. `CombatHero(member, onSpecial, anim)`, `EnemyCard(enemy, bossPhase, anim)`, `LootRoulette(items, finalIndex, onComplete, reducedMotion, testHookRef)`, `FinalChest(tier, opened, reward, onOpen, customCharacters)`, `CharacterCardDetailed(character, mode, size, isSelected, isLocked, onClick, fragments, rank, ...)`. **Le markup change, l'API non.**
- **`combat-card combat-hero` → juste `chero`.** Ne pas garder `combat-card` sur les héros, sinon les styles V1 `.combat-card` peuvent perturber `.chero`. `data-card-id` reste pour les anims.
- **Boss-hp-bar : sortir de `EnemyCard`.** Le bundle place `combat-boss-bar` au-dessus du `combat-field` (avant les ennemis). Crée un `<BossHpBar>` séparé et place-le dans `CombatScreen`. L'`EnemyCard` ne contient plus la barre boss.
- **RunProgress 30 dots `pp` strict.** Pas de séparateur hub. Si test Playwright observe `run-progress__step--hub`, le marquer `display:none` ; mais idéalement c'est juste 30 dots. 1 dot = 1 fight, dot 10/20/30 = boss (`pp--boss`). Conserve l'`id="run-progress"` et l'`aria-*`.
- **Sparkles count** : 0 (common) / 3 (rare) / 5 (epic) / 8 (legendary) / 12 (mythic). C'est explicite dans `cards.jsx` L21-37.
- **Couleur héros chero** vient de `RARITIES[rarity].color`, pas de l'identité du perso. Bobby commun = gris, Bobby rare = cyan, Bobby epic = violet, etc.
- **Boutons CTA** : ajoute `.btn .btn--primary` mais conserve `.primary-action` en alias (ne casse pas le sélecteur).
- **`.fnum`** : V4 a déjà `.fnum`, `.fnum--special`, `.fnum--crit`, `.fnum--heal`, `.fnum--shield`, `.fnum--poison`. Bundle ajoute `.fnum--dmg`, `.fnum--dmg-small`. **Append**, ne pas remplacer. Les variantes V3 (`damage-physical`, `damage-magic`) doivent continuer à fonctionner.
- **Speed selector** : V4 utilise `.speed-selector__btn`, bundle `.speed-btn`. Émets les deux classes (`.speed-btn .speed-selector__btn`) ou ajoute un alias CSS pour préserver les sélecteurs Playwright.
- **`prefers-reduced-motion`** : déjà couvert par `_shared.css` reset. N'en ajoute pas en double.
- **Build** : `npm run build` doit rester clean. Si tu importes des fichiers pour types ou helpers, garde l'arborescence existante (pas de nouveau dossier).

## Fichiers à modifier
- `src/styles.css` (append ~1500 lignes)
- `src/App.tsx` (refactor markup ~200-300 lignes, suppression ~120 lignes HeroMascot)

## Fichiers à NE PAS toucher
- Le reducer / actions / save / migrations.
- Les hooks de test `__game_test_*`.
- La logique gameplay (cooldowns, dégâts, buffs).
- Les noms de stages V2 (Cryptes Froides, etc.).
- Les phrases boss (V4 OK).
