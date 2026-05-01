# Journal des décisions — V5 Bobbycard DA pixel-perfect

Format : `## [date] [auteur] décision`

## [2026-04-30] [orchestrator] Cycle V5 = implémentation pixel-perfect du bundle Claude Design
- L'utilisateur a fourni un bundle Claude Design complet via API Anthropic, contenant : README.md (instructions), 3 chats (intent), `Bobbycard DA.html` + ses imports (tokens.css, _shared.css, cards.css, chests.css, combat.css, synthesis.css + 4 JSX artboards).
- Le README dit explicitement : *« Read Bobbycard DA.html in full. Recreate them pixel-perfectly. Match the visual output. »*
- L'utilisateur dit : *« recupere le design du standalone car il respect la da que je souhaite sans changé la nature du jeux »*.
- V4 livrée précédemment a re-skinné mais avec écarts visuels significatifs (combat trop clair, mascottes non-fidèles, classes dead code).
- V5 = correction par **alignement pixel-perfect** sur les fichiers source du bundle.
- Workspace V5 isolé sous `project/v5/`.
- Mode auto reste actif. Pas de checkpoint visuel intermédiaire.

## [2026-04-30] [orchestrator] Stratégie : copie-coller des CSS bundle + adaptation markup React
- Les CSS du bundle (tokens.css, _shared.css, cards.css, chests.css, combat.css) sont la **source de vérité visuelle**.
- Stratégie : **copier-coller intégralement** ces CSS dans `src/styles.css`, en remplaçant les blocs V4 conflictuels.
- Le travail React = **adapter le markup** pour produire les classes attendues (`pcard`, `chero`, `enemy`, `e-slime`, `chest-lid`, `cbb-fill`, etc.).
- Pas de modif reducer / save / hooks de test.

## [2026-04-30] [orchestrator] Suppression du HeroMascot V4 unique
- V4 a créé un composant `<HeroMascot variant size mood>` avec 22 variants.
- Le bundle DA n'a PAS ce pattern : il a 4 mascottes inline CSS+JSX différentes selon le contexte (`hp-*` carte / `chero-mascot` combat / `e-slime/e-bat/e-boss` ennemis / `mini-*` roulette).
- Décision : **virer HeroMascot**, inliner chaque mascotte selon le pattern DA correct par contexte.
- Conséquence : -22 variants à maintenir, +simplicité, +fidélité DA.

## [2026-04-30] [orchestrator] Ennemis simplifiés à 3 types DA (slime / bat / boss)
- V1+V2+V3 a un ENEMY_POOL avec ~10 noms d'ennemis (slime, bat, ghost, witch, vine, golem, royal-guard, soldier, etc.) + 3 boss (Gardien des Cendres, Sorcière du Vide, Roi Brisé).
- Le bundle DA fournit seulement 3 mascottes ennemies : `e-slime`, `e-bat`, `e-boss`.
- Décision : **mapper chaque ennemi V1+V2+V3 vers slime|bat|boss** via un helper `mapEnemyToDAType(name, isBoss)`. Les 3 boss reçoivent `boss` avec palettes différentes.
- Trade-off accepté : fidélité DA vs variété visuelle. L'utilisateur a explicitement validé le bundle.

## [2026-04-30] [orchestrator] Combat = palette nuit violet/rose mature (correction V4)
- V4 a appliqué `bg-sky-day` (clair) sur le combat stage 1 — erreur fondamentale.
- Bundle combat.css : palette **nuit violet/rose** systématique (`linear-gradient(180deg, #2a2147 0%, #3a2f5e 100%)` + 4 layers `combat-bg--{sky,clouds,mist,specks}`).
- Décision : **remplacer** le combat-screen V4 par le combat-screen bundle. Garder héros en cartes cream (contraste OK).
- Skybox stage-aware abandonné : la DA est uniforme nuit violet/rose pour tous les stages.

## [2026-04-30] [orchestrator] Sparkles bundle vs cap perf V3
- Bundle DA : sparkles count par rareté = 0 / 3 / 5 / 8 / 12.
- V3 perf-guard : cap 4 boucles infinite simultanées.
- Décision : on suit le bundle (12 sparkles légendaire+mythic). Justification : `spark` keyframe est translate+scale+opacity sur petit élément, GPU-composé, ne déclenche ni layout ni paint. Si jank constaté en run réelle, fallback : cap dynamique selon `prefers-reduced-motion` ou nombre de cartes visibles.

## [2026-04-29] [architect] Stratégie CSS = Append + Override (pas Replace)
**Contexte** : V4 contient ~6187 lignes de CSS dont des blocs BEM qui divergent du bundle (chest__lid vs chest-lid, combat-hero vs chero, boss-hp-bar vs combat-boss-bar, character-card-detailed* vs pcard*, run-progress* vs combat-progress + pp).
**Options envisagées** :
- A : Replace — chercher chaque bloc V4 et le remplacer par bundle inline.
- B : Append — coller les blocs bundle (tokens/_shared/cards/chests/combat) en fin de styles.css sous séparateur, laisser V4 dead inerte (DOM ne les émet plus).
- C : Hybride — replace pour blocs gros (combat), append pour le reste.
**Décision** : B — Append + Override.
**Rationale** : (1) Replace risque de casser des écrans non-cibles (Atelier, Hub onglets, modales recyclage) qui partagent des classes V2/V3 stables. (2) Append garantit que les classes bundle gagnent par cascade naturelle (mêmes spécificités, ordre source plus tardif). (3) Le markup React migrera vers les classes bundle ; les classes V4 deviennent dead inertes. (4) Polish ultérieur pourra retirer les blocs dead — pas en V5.
**Conséquences** : ~1500 lignes appended ; styles.css ~7700 lignes après V5 (sous le seuil 8000). Audit dead code reporté à un cycle de polish.

## [2026-04-29] [architect] Migration animations V3 → spells V5 = parallèle, pas remplacement
**Contexte** : V3 a un système Projectile (combat-anim-layer + projectile-trail) câblé sur animQueue. V5 introduit `combat-center > .spell--{magic,phys,heal,aoe}` du bundle.
**Options envisagées** :
- A : Remplacer V3 Projectile par V5 spells.
- B : Garder V3 Projectile, ajouter V5 spells en parallèle.
- C : Convertir 1-1 chaque event animQueue vers le bon spell--* et désactiver Projectile.
**Décision** : C avec garde-fou — convertir le pipeline anim vers spells V5, mais conserver le code V3 Projectile commenté ou inerte (pas supprimé) pour rollback rapide si régression.
**Rationale** : Le bundle est explicite — 4 spells animés cliquables. Le système V3 simple est moins riche visuellement. Conserver le code en sécurité couvre le risque de régression sur tests Playwright qui pourraient observer les classes projectile.
**Conséquences** : Helper `mapSkillToSpellType` requis. Re-key par tick + phase pour retrigger animation. La couche `Projectile` reste exportée mais inerte si non instanciée.

## [2026-04-29] [architect] Représentation des ~10 ennemis V1+V2+V3 avec 3 types DA
**Contexte** : ENEMY_POOL V1+V2+V3 contient ~10 noms (slime, bat, ghost, witch, vine, golem, royal-guard, soldier, etc.) + 3 boss. Bundle DA = 3 mascottes (e-slime, e-bat, e-boss).
**Options envisagées** :
- A : Mapping nom-par-nom dans un dict explicite.
- B : Heuristique par mots-clés (bat|chauve|fantôme|ghost|spectre → bat ; le reste → slime ; boss flag → boss).
- C : Random uniforme par stage.
**Décision** : B — heuristique par mots-clés, pas de dict explicite.
**Rationale** : Robuste si on ajoute un ennemi (à condition de respecter la convention de nommage). Évite la maintenance d'un dict aligné en parallèle de ENEMY_POOL.
**Conséquences** : Helper `mapEnemyToDAType(name, isBoss)` simple. Palette de chaque type ajustable. Boss reçoit des palettes dédiées par boss (ember pour Gardien, violet pour Sorcière, rose nacré pour Roi Brisé).

## [2026-04-29] [architect] Helpers V4 obsolètes (mapPersonaToVariant, mapEnemyNameToVariant)
**Contexte** : V4 a deux helpers de mapping vers MascotVariant (22 valeurs). Avec suppression de HeroMascot, ces helpers deviennent orphelins.
**Options envisagées** :
- A : Supprimer purement.
- B : Conserver `mapEnemyNameToVariant` adapté pour retourner les nouveaux types DA.
- C : Renommer/refactor en `mapEnemyToDAType` et supprimer mapPersonaToVariant (les héros n'ont plus de variant — couleur par rareté seule).
**Décision** : C.
**Rationale** : Cohérent avec décision V5 « HeroPortrait sans variant par perso (couleur par rareté seule) ». Le type Enemy.mascot peut être conservé optionnel, mais on ne l'utilise plus côté DOM. Les saves V4 qui contiennent `mascot` sont tolérées (champ ignoré).
**Conséquences** : `mapPersonaToVariant` supprimé. `mapEnemyNameToVariant` renommé/réécrit en `mapEnemyToDAType`. Type `MascotVariant` peut rester déclaré (compat) mais devient un type non utilisé — TypeScript signalera 0 erreur.

## [2026-04-29] [architect] HeroPortrait : couleur par rareté, pas par perso
**Contexte** : Bundle `cards.jsx` HeroPortrait prend uniquement une `rarity` et fabrique une mascotte générique (chapeau + cape colorés par rareté). Pas de variant Bobby/Lila/Ronan.
**Options envisagées** :
- A : Suivre strictement le bundle (couleur par rareté seule, identique pour tous les persos).
- B : Enrichir avec variantes mineures par perso (toque pour Ronan gourmand, chapeau soigneuse pour Lila, etc.).
**Décision** : A — strictement bundle.
**Rationale** : Le brief V5 dit explicitement « pixel-perfect bundle ». L'utilisateur a validé la DA telle qu'elle. Différencier les persos sera un sujet V6 si demandé.
**Conséquences** : Bobby, Lila, Ronan, et tous les autres persos affichent la même mascotte générique HeroPortrait, seul le `rarity` change. Le nom et le rôle restent distincts (texte). Cf. `pcard-name` et `pcard-role`.

## [2026-04-29] [frontend-dev] HeroMascot V4 conservé inerte plutôt que supprimé
**Contexte** : Le `CharacterCard` simple (non-detailed) utilisé dans le Hub onglet "Equipe" ainsi que le `CharacterPortrait` qui en dépend continuent à invoquer `HeroMascot` + `mapPersonaToVariant`. Le supprimer impose une cascade de refactor sur des écrans non-cible V5 (Hub) et risque de casser le rendu Hub.
**Décision** : Conserver le composant `HeroMascot` et les helpers `mapPersonaToVariant` / `mapEnemyNameToVariant` / `computeHeroMood` / `computeEnemyMood` dans `App.tsx` mais ne plus les invoquer depuis les composants V5 cibles (`CharacterCardDetailed`, `CombatHero`, `EnemyCard`). Cf. brief : suppression effective sur les écrans cibles, conservation pour `CharacterCard` simple du Hub.
**Rationale** : Le brief V5 vise les écrans clés (cartes détaillées, combat, coffre, roulette). Le Hub onglet "Equipe" reste sur le composant simple V2/V4 car il n'est pas dans le périmètre Bobbycard DA bundle (qui ne propose pas d'équivalent simple). Sujet V6 si l'utilisateur veut migrer.
**Conséquences** : `HeroMascot` reste exporté, `Enemy.mascot?: MascotVariant` reste optionnel pour tolérer les saves V4. Aucune erreur TS. ~120 lignes de code legacy mais isolées.

## [2026-04-29] [frontend-dev] SpellLayer activé via animQueue.kind === "projectile"
**Contexte** : Les events V3 dans `animQueue` ont 2 kinds : `attack-started` (sans trajectory) et `projectile` (avec trajectory). Le SpellLayer V5 doit savoir quel `spell--*` activer.
**Décision** : Le SpellLayer scanne `state.run.animQueue` pour le dernier event `kind === "projectile"` et map sa `trajectory` (`physical|magic|heal|shield|poison`) vers un `SpellType` (`magic|phys|heal|aoe`). Re-key par `animQueue.length` (proxy de tick).
**Rationale** : `kind: "projectile"` porte la sémantique "un projectile traverse l'écran" — exactement ce que le SpellLayer visualise. `attack-started` est juste le début d'animation, sans direction.
**Conséquences** : Mapping `physical→phys`, `magic→magic`, `heal→heal`, `shield→magic` (pas de spell--shield bundle, fallback orb violet), `poison→aoe` (onde toxique). Les V3 Projectiles continuent à tourner en parallèle (rollback).

## [2026-04-29] [frontend-dev] CombatHud V2 conservé en complément des layers V5
**Contexte** : Le bundle DA combat 1280×720 ne montre pas le HUD V2 dense (lives, stats run, log). Mais le HUD V2 sert à remonter les hooks Playwright et l'aria-live des changements de phase boss. Le supprimer casserait `__game_test_*` qui dépend implicitement de la présence des nodes.
**Décision** : Conserver `<CombatHud>` rendu sous le `combat-top` V5. Visuellement il reste mais peut être stylé plus tard pour mieux s'intégrer (sujet polish).
**Rationale** : Stabilité tests > pureté visuelle. Le bundle propose `combat-resources` qui couvre or/fragments — déjà câblé en V5. Lives + stats run sont en plus.
**Conséquences** : Le combat-screen est plus long que 720px en hauteur car HUD V2 + footer V2 (consumables, speed) viennent en plus du bloc 1232×720 du bundle. Acceptable — la maquette est un cadre artistique, le HUD complet du jeu peut dépasser.


## [2026-04-29] [frontend-dev] V5 correctifs M1-M4 (fidélité bundle)
**Contexte** : Review V5 architect → 4 majors. Le footer combat utilisait toujours le markup V3 legacy malgré le CSS bundle posé. Keyframes `spin-slow` manquant. `spark` V4 hardcodait les translations (Sparkles plates). HUD V2 dépassait 1232×720.
**Décisions** :
1. **M1 Footer** : `CombatFooter` réécrit pour émettre `combat-skills/sk/cons/speed-btn`. Pas de wrapper séparé `SpeedSelector`/`ConsumableRail` dans le combat — fusionnés dans le footer pour matcher la structure bundle (combat.jsx L224-268). Les composants V3 (`SpeedSelector`, `ConsumableRail`, `ConsumableSlot`) sont laissés inertes dans le fichier — pas d'import, donc dead code. Cleanup en V6.
2. **M2 spin-slow** : ajouté à la liste keyframes globales V4 (la même qui contient `spark/breathe/wobble/pulse-halo`). Position : juste après `wobble`, avant `shimmer-x`.
3. **M3 spark** : remplacé en place. Risque : si un bloc V4 dépendait de l'ancienne signature avec `translate(2px,-3px)` etc., il sera cassé. Audit confirmé : seul `.character-card-detailed__sparkle` (V4 dead) consommait cette anim et est inerte côté DOM V5.
4. **M4 CombatHud out** : extrait du `.combat-screen` et placé en sibling au-dessus (wrapped dans un Fragment). Choix : Strategy B — hors `.combat-screen` mais conservé pour compat hooks/tests/aria-live. Le `#abandon-run` reste accessible.
**Rationale** : minimum invasif, pas de réécriture du reducer, pas de cassure save/IDs.
**Risques** : aucun bloquant. La pulse `is-pulse` au clic skill est gérée par état local `useState<number|null>` du `CombatFooter` ; cycle 400ms.

## [2026-04-30] [orchestrator] Phase 5 — Equilibrage reliques + forge custom
**Contexte** : audit game design pré-V6 — 3 vecteurs OP identifiés et corrigés sans toucher aux mécaniques voisines.

### T19 — Sceau d'aube éternelle (nerf)
**Avant** : `reviveAllOnDefeatOnce` ressuscite **toute l'équipe à plein PV** lors d'un wipe. Trivialise complètement le boss final.
**Après** : `reviveSingleOnKO` ressuscite **un seul héros à 50% PV** au premier KO de la run. Triggered au moment où un membre tombe (per-KO), pas au wipe.
**Rationale** : passe d'un "save free de la run" à un buffer ponctuel. Le joueur garde un filet de sécurité, mais le boss final reste un gating réel.

### T20 — Couronne du Roi Brisé (split)
**Avant** : 1 relique runique `permanentAllStatsPercent: 15` (+15% PV, physique, magie sur un seul drop).
**Après** : 2 reliques séparées dans le pool runique :
- "Couronne du Roi Brise" : +10% PV.
- "Sceau du Roi Brise" : +10% physique + 10% magie.
**Rationale** : force un choix stratégique (tank vs damage), supprime le multiplicateur cumulatif sur 3 axes.

### T21 — Forge custom : caps par rôle
**Avant** : Warden legendary atteint 56 + 20 = 76 HP > 50 HP de Seraphine légendaire native. Aucune contrainte.
**Après** : caps `ROLE_STAT_CAPS` :
- blade : 60/16/4
- mage : 48/4/18
- warden : 65/8/8

Chaque stat est clampée après application des bonus rareté. Un Warden legendary plafonne désormais à 65 HP (sous Thane epic 66 HP, ce qui reste cohérent — Thane reste le tank natif premium).

### Migration save (compat ascendante)
- Save contenant `reviveAllOnDefeatOnce` → converti en `reviveSingleOnKO { hpPercent: 50, used }` à la lecture (`migrateRelics` dans `normalizeCurrentRun`).
- Save contenant `permanentAllStatsPercent: 15` → laissée en l'état (l'effet a été appliqué une seule fois au moment du choix de relique, donc le team est déjà buffé ; pas de re-buff au load). Champ marqué deprecated dans le type.
- Save contenant un custom character au-dessus du cap → clamp silencieux dans `cleanCustomCharacters` via `clampCustomTemplate`. Si le perso est en run active, `clampCustomCombatant` le ramène aux limites avec `hp = min(hp, newMaxHp)`.

### Hors scope
- Pas de feedback visuel reliques (Phase 6).
- Pas d'affichage du pity counter (Phase 6).
- Pas de tests automatisés supplémentaires (V5.2).

### Build / Test
- `npm run build` : 0 erreur TS.
- `npm test` : 2/2 specs verts.

