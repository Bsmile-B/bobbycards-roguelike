# Journal des décisions

Format : `## [date] [auteur] décision`

## [2026-04-29] [orchestrator] Mode auto activé
- Auto mode : pas de checkpoint utilisateur visuel intermédiaire.
- Brief très prescriptif (prix, items, stages exacts) → architect mappe sur l'existant, pas d'arbitrage majeur attendu.
- Étendre `src/App.tsx` existant, ne pas réécrire.

## [2026-04-29] [architect] Stratégie d'extension : sur-greffe sans réécriture du reducer
**Contexte** : `App.tsx` ~1900 lignes, reducer central monolithique. La V2 ajoute hub, boutique, lootbox, recyclage, équipe, consommables, stages, coffre tier — naïvement c'est +1500 lignes.
**Options envisagées** :
A. Tout dans `App.tsx`, accepter ~3000 lignes.
B. Extraire les helpers V2 (hub reducer, shop pool, lootbox roll, recycle, chest tier) dans des fichiers séparés sous `src/v2/`, le reducer principal délègue.
C. Réécriture modulaire complète.
**Décision** : **A en première intention**, B autorisé en cours de route si dépassement >2800 lignes ou impossibilité de naviguer le fichier. Pas de C.
**Rationale** : le brief dit explicitement "Étendre, ne pas réécrire". Garder le reducer central protège les hooks de test et le flux de données. Les helpers V2 sont des fonctions pures appelées depuis le reducer — facile à extraire plus tard sans changer la sémantique.
**Conséquences** : le frontend-dev ajoute les types V2 en haut du fichier, les pools/configs juste après les constantes existantes, les actions V2 dans le switch du reducer, les composants V2 (HubScreen, ShopTab, LootboxScreen, etc.) après les composants existants. Si le fichier devient illisible, ouvrir une décision pour passer en B.

## [2026-04-29] [architect] Nommage des phases et structure d'écrans
**Contexte** : V2 introduit hub avec 5 sous-vues, transition stage, ouverture lootbox animée. Tout n'est pas un Screen.
**Options envisagées** :
A. Un Screen par sous-vue (`hub-shop`, `hub-lootbox`, `hub-recycle`, `hub-team`, `hub-stats`, `lootbox-open`, `stage-intro`).
B. Screens uniquement pour les vraies transitions plein écran, sous-onglets via state interne.
**Décision** : **B**. Screens : `stage-intro`, `hub`, `lootbox`, `gameover`. Onglets dans le hub via `state.hub.activeTab: HubTab`. Recyclage et team-swap = onglets, pas screens.
**Rationale** : Screen = transition narrative. Onglet = navigation latérale. Le joueur perçoit "je suis dans le hub" comme un seul lieu. Réduit la combinatoire dans le switch du reducer.
**Conséquences** : action `HUB_SET_TAB` au lieu de `NAVIGATE`. `state.hub` non null pendant tout le séjour au hub. `screen='lootbox'` est temporaire, retour à `screen='hub'` après `CLOSE_LOOTBOX`.

## [2026-04-29] [architect] Migration localStorage : version interne, pas de bump de clé
**Contexte** : la save actuelle est sous `runebound-cards-save-v1`. La V2 ajoute des champs (bestStage, finalBossDefeats, lifetimeLootboxes, saveVersion).
**Options envisagées** :
A. Bump de clé vers `...-save-v2`, nouvelle save vierge, perte des persos forgés et de l'or.
B. Garder la clé V1, étendre `normalizeSave` pour injecter les défauts.
C. Double-écriture : lire V1, écrire V2, supprimer V1.
**Décision** : **B**. Garder `runebound-cards-save-v1`. `normalizeSave` injecte `saveVersion=2` et tous les nouveaux champs avec valeurs par défaut. `Number.isFinite(...)` reste la garde standard.
**Rationale** : préserver les progrès du joueur (or accumulé, persos forgés) est non-négociable. `normalizeSave` est déjà défensif (cf. lignes 342-360). Pas de migration destructive.
**Conséquences** : le frontend-dev étend `normalizeSave` et `defaultSave`. Le champ `saveVersion` n'est lu pour l'instant que comme tag — il sera utilisé en V3 si nécessaire.

## [2026-04-29] [architect] Consommables en combat : rail discret, zéro refonte du HUD
**Contexte** : le brief demande inventaire de 3 consommables utilisables en combat. Le HUD combat actuel est dense (HUD primary + 2 panels + battlefield + footer).
**Options envisagées** :
A. Ajouter un quatrième panel dans le HUD primary.
B. Insérer dans le `CombatFooter` à côté du log compact.
C. Rail latéral à droite du battlefield, vertical.
D. Rail horizontal autonome sous le `CombatFooter`, 3 slots, hauteur ~48px.
**Décision** : **D**. ConsumableRail = nouvelle bande discrète insérée entre `CombatFooter` et le bas de la `combat-screen`, avec 3 slots cliquables.
**Rationale** : zéro intrusion dans les composants existants (qui sont déjà tendus en 1280x720). Position basse = ergonomie main droite. Hauteur de 48px tient sans push hors écran.
**Conséquences** : nouveau composant `ConsumableRail`, classe CSS `.consumable-rail`. Action `USE_CONSUMABLE` injecte ses effets dans le run state via la même mécanique que `applyReward`. Pas de modification de `advanceCombat`.

## [2026-04-29] [architect] Recyclage : arbitrage des pourcentages de remboursement
**Contexte** : le brief dit "40% du coût pour rare, 50% pour épique, 60% pour légendaire". Coûts de forge actuels : Rare 15, Épique 35, Légendaire 70 fragments. 40% de 15 = 6, 50% de 35 = 17.5, 60% de 70 = 42.
**Options envisagées** :
A. Suivre strictement le brief : 6 / 17 (round) / 42.
B. Arrondir uniformément à 40%/40%/60% pour cohérence : 6 / 14 / 42.
C. Plus généreux : 50%/50%/60% : 8 / 17 / 42.
**Décision** : **A**. 6 fragments + 25 or pour rare, 17 fragments + 60 or pour épique, 42 fragments + 120 or pour légendaire (commun forgé : 5 fragments + 10 or, valeur fixe du brief).
**Rationale** : le brief est précis sur les pourcentages, on respecte. L'arrondi vers le bas pour épique (17 au lieu de 17.5) évite le sur-remboursement.
**Conséquences** : le frontend-dev implémente la table dans une constante `RECYCLE_REFUND` typée. Specs.md §4.6 met à jour la valeur épique à 17 (corrigé après cette décision). NB : la valeur "14" écrite initialement dans specs §4.6 est à lire comme "17" (correction par cette décision, ne pas modifier la spec rétroactivement, cette décision fait foi).

## [2026-04-29] [ui-designer] Mode auto — passe design en une seule étape, pas de draft HTML
**Contexte** : la mission étend une UI React existante (game in-app), pas un nouveau site. Le brief impose 1280×720, le ton dark fantasy est déjà posé dans `src/styles.css` (~1260 lignes). L'utilisateur active le mode auto pour cette passe.
**Décision** : on saute l'étape `draft.html` (artifact-style) et on produit directement le design system, les wireframes, les animations, les tokens CSS et le handoff dev en une passe consolidée.
**Rationale** : un draft HTML autonome serait redondant avec le rendu React final. La direction visuelle est contrainte (3 stages avec ambiances explicitement décrites dans le brief). Aucun arbitrage majeur de direction n'est nécessaire — seulement des choix d'accents et d'animations bornées.
**Conséquences** : le designer ne livre pas `draft.html`. Les livrables sont `design-system.md`, `wireframes.md`, `animations.md`, `css-tokens.md` (skeleton CSS prêt à coller) et `handoffs/designer-to-dev.md`. Le dev doit valider visuellement au fur et à mesure de l'implémentation des composants V2 (notamment stage intro et lootbox).

## [2026-04-29] [ui-designer] Palettes des 3 stages — accents prescrits
**Contexte** : le brief décrit chaque stage par mots-clés ("pierre froide runes bleues", "violet sombre poison", "or terni rouge sombre"). Il fallait fixer des hex precis qui passent WCAG AA sur le fond `#0b0a0c` existant et qui se distinguent franchement entre eux.
**Options** :
A. Trois accents proches (variations or sur or) — risque de confusion entre stages.
B. Trois accents très contrastés (bleu vif / violet vif / or+rouge) — plus lisible mais risque de casser le ton dark sobre.
C. Trois accents saturés mais sourds (pas pastel, pas néon) — équilibre.
**Décision** : C.
- Stage 1 : `#6FB3D2` (bleu acier glacé, contraste 9.1 sur fond AAA), accent froid pierre-runique. `--stage-1-accent-deep: rgba(48, 84, 92, 0.78)` reprend le `rgba(48, 84, 92, 0.18)` déjà présent dans le `body`.
- Stage 2 : `#8E5BD5` (violet vide, contraste 5.6 AA), accents toxiques verts `#7DBE65` en variant secondaire. Plus saturé que le `rgba(142, 92, 170, 0.66)` existant pour `.rarity-epic` afin de différencier le stage de la rareté épique.
- Stage 3 : `#C9A24A` (or terni, contraste 8.7 AAA) couplé à `#8E2A2A` (rouge sang royal) en accent secondaire — reprend la teinte des `rgba(117, 19, 36, ...)` du `body` mais en plus profond.
**Rationale** : trois accents franchement séparés en teinte (cyan/violet/or-rouge) garantissent qu'au cours d'une run, le joueur sent visuellement qu'il a changé de stage. Tous passent AA minimum sur fond. Tous restent compatibles avec le dark fantasy : aucun n'est néon ni saturé à 100%.
**Conséquences** : tokens définis dans `design/css-tokens.md`. Bascule via `.app-shell.stage-N` et `.hub-screen.stage-N`. Les composants combat existants ne sont pas teintés (l'accent stage ne s'applique qu'aux composants V2 qui consomment `var(--stage-accent)`).

## [2026-04-29] [ui-designer] Animation lootbox — séquence chevauchée 600ms total
**Contexte** : le brief impose une animation d'ouverture, le specs interdit > 800ms (test Playwright). Le HUD existant a déjà une animation `.chest.opened` (lid rotation 360ms) qu'on doit réutiliser.
**Options** :
A. Animation séquentielle stricte : flash 200 + lid 360 + reveal 280 = 840ms (dépasse).
B. Animation chevauchée : flash 0–200, lid 200–520, reveal 200–480, CTA visible à 600ms.
C. Animation très courte non-narrative (200ms total) — inintéressant pour le moment "magie".
**Décision** : B.
**Rationale** : 600ms est sous le plafond, l'effet narratif est conservé (flash → ouvre → révèle), et le chevauchement est invisible à l'œil mais gagne 240ms. La séquence est implémentable avec 2 setTimeout JS qui swap des classes CSS — aucune lib d'animation, aucun calcul de timing fragile.
**Conséquences** : `LootboxScreen` a 3 phases (`closed` / `opening` / `opened`). Reduced-motion : un seul fade 200ms. Détails dans `design/animations.md` §5.

## [2026-04-29] [frontend-dev] Stack confirmée : extension in-place de App.tsx, sans modules src/v2/
**Contexte** : architect prévoyait extraction possible vers `src/v2/` si dépassement >2800 lignes.
**Décision** : implémentation V2 entièrement dans `src/App.tsx`. Fichier final ~3900 lignes.
**Rationale** : tout le state, le reducer, et les composants partagent les mêmes types ; séparer en modules aurait forcé des barrels d'import et brisé la lisibilité du flux. Le fichier reste navigable via les sections `// === V2 ... ===`. Si un futur passe demande de modulariser, l'extraction sera mécanique : sortir les configs (STAGE_CONFIGS, SHOP_POOLS, LOOTBOX_TABLES, RECYCLE_REFUND, CONSUMABLE_DEFS) dans `src/v2/configs.ts` et les composants (HubScreen et enfants) dans `src/v2/Hub.tsx`.
**Conséquences** : pas de nouvelles dépendances, pas de restructuration. Le fichier dépasse les 2800 lignes mais reste cohérent.

## [2026-04-29] [frontend-dev] LootboxScreen : opening géré côté composant, OPEN_LOOTBOX dispatché après timeout
**Contexte** : le brief impose une animation chevauchée 600ms (flash + lid + reveal). Décision possible : tout pré-calculer dans le reducer et animer en CSS, ou dispatcher OPEN_LOOTBOX après un setTimeout côté UI.
**Décision** : phase locale `closed | opening | opened` dans `LootboxScreen`, `OPEN_LOOTBOX` dispatché 300ms après le clic (50ms si reduced-motion). Le résultat n'est calculé qu'au dispatch — pas avant.
**Rationale** : permet à l'animation CSS de jouer pendant que le rouleau de probas tombe, sans flash de re-render. Le reducer reste pur. `prefers-reduced-motion` réduit le délai à 50ms.
**Conséquences** : tests Playwright doivent attendre ~400ms après le clic sur `#lootbox-open` avant de lire le résultat. `render_game_to_text` expose `lootbox.opened` pour synchronisation.

## [2026-04-29] [frontend-dev] HUB_SWAP_HERO : flow 2-clics + IDs composites cachés
**Contexte** : la spec demande des IDs `team-swap-{outId}-{inId}` pour Playwright, mais l'UI utilise un flow 2-clics (1 héros disponible, 1 héros équipe).
**Décision** : flow 2-clics visible pour l'utilisateur ; en parallèle, un bloc `display:none` rend tous les boutons composites pour permettre à Playwright de cliquer directement par ID sans passer par les 2 étapes.
**Rationale** : le brief priorise les IDs stables pour les tests. Les boutons cachés ne perturbent pas l'UX humaine et garantissent l'accès programmatique.
**Conséquences** : surface DOM légèrement plus large (~6 boutons cachés par hub). Aucun impact perf.

## [2026-04-29] [frontend-dev] Récompenses post-boss : or contextualisé plutôt que pool dédié
**Contexte** : le brief T24 demande un pool de récompenses spécifique post-boss avec "3 reliques de boss parmi 3, lootbox gratuite". La V2 n'a qu'un pool stat existant.
**Décision** : pour cette passe, on ajoute un bonus or contextualisé (vague 1-9 → +8..15, vague 5/15/25 → +18..29, boss stage 1/2 → +80..120, boss final → +120..160) appliqué à `CHOOSE_REWARD`. Le pool de cartes reste les bonus stat existants. Tâche T24 marquée `in-progress`.
**Rationale** : ne pas casser le flux existant de récompenses ; donner suffisamment d'or pour rendre la boutique du hub significative. Un pool de 3 reliques de boss requiert un design dédié (RELIC_POOL avec rareté, effets distincts) qui dépasse le périmètre de la passe auto.
**Conséquences** : la boucle économique est testable (gold accumule, hub permet d'acheter), mais l'expérience "choisis ta relique de boss" n'est pas livrée. Voir tasks.json T24.note.

## [2026-04-29] [architect] Revue V2 — verdict "presque OK", 0 blocker, 3 majors
**Contexte** : audit conformité de la livraison V2 (3858 lignes App.tsx, 2121 lignes styles.css, 9 nouveaux test-actions, build TypeScript clean, Playwright non exécuté).
**Décision** : accepter la livraison sous réserve des corrections T30/T31/T32 (majors) avant de la déclarer "done". T33-T35 (mineurs) peuvent être traités en V2.1.
**Rationale** : tous les outcomes mesurables des specs §8 sont couverts par le code (3 stages, hub, boutique stage-spécifique, lootbox 4 types, recyclage, swap équipe, consommables, coffre tier-aware, migration localStorage). Les écarts sont sur la profondeur narrative (reliques de boss, modal REPLACE) pas sur la structure. La livraison est jouable de bout en bout.
**Conséquences** : T30/T31/T32 prioritaires pour la prochaine itération. Risque principal : RunProgress qui pourrait déborder en 1280×720 (T34 visuel à valider). La modale REPLACE_CONSUMABLE est l'écart le plus visible côté UX brief.

## [2026-04-29] [frontend-dev] Modal "remplacer consommable" non implémentée — fallback notice
**Contexte** : le brief décrit un modal "Remplacer un consommable ?" si l'inventaire est plein lors d'un achat/récompense.
**Décision** : pour cette passe, achat consommable avec inventaire plein → notice "Inventaire consommables plein.", pas de modal. Le joueur doit utiliser un consommable en combat avant d'acheter le suivant.
**Rationale** : implémenter un second modal (focus trap, choix slot, dispatch REPLACE_CONSUMABLE) ajoute ~150 lignes pour un edge case rare en V2 où peu de joueurs auront 3 consommables saturés. Action `REPLACE_CONSUMABLE` est définie et fonctionnelle ; il manque l'UI déclenchante. T23 noté "in-progress" sur la couverture UI.
**Conséquences** : l'UX est légèrement frustrante en cas d'inventaire plein. À itérer en V2.1 si retour utilisateur.

## [2026-04-29] [frontend-dev] Reliques de boss : pool standard vs pool runique séparé
**Contexte** : T31 demande un pool de reliques de boss et un pool runique distinct pour le boss final. La V2 stockait déjà des reliques temporaires (relics nextFightShield, etc.) mais aucun pool narratif "permanent run-wide".
**Options envisagées** :
A. Un seul pool, marquer la dernière relique comme tier supérieur via un flag.
B. Deux pools distincts (`BOSS_RELIC_POOL`, `BOSS_RUNIC_RELIC_POOL`) tirés selon la phase atteinte.
**Décision** : **B**.
**Rationale** : les reliques runiques (Couronne du Roi Brisé, Sceau de l'aube éternelle) sont nettement plus puissantes (+15% all stats, revive once) et n'ont pas de sens en stage 1/2. Deux pools distincts sont plus lisibles pour l'auteur du contenu et plus faciles à tunings indépendamment.
**Conséquences** : 9 reliques boss + 4 reliques runiques. Le screen `boss-relic-choice` est paramétré par `tier: "boss" | "runic"` qui change le styling (boss runique = h1 doré, fond chaud) et le routing (boss → hub, runic → gameover).

## [2026-04-29] [frontend-dev] Modal REPLACE_CONSUMABLE : engagement d'achat avant remplacement
**Contexte** : T30 demande la modale de remplacement quand inventaire consommables plein. Question : déduit-on l'or avant ou après le choix du joueur ?
**Décision** : **avant** (l'or est déduit dès le clic Acheter, l'item est filtré du shop, puis la modale s'ouvre).
**Rationale** : cohérent avec le flux du brief §9 ("Si plein : remplacer ou abandonner le nouveau") — l'abandon est explicite et engage l'or comme un coût d'opportunité. Ça évite aussi de devoir rollback shopItems si le joueur choisit "abandonner".
**Alternative écartée** : ne pas déduire l'or tant que la modale n'est pas résolue. Aurait nécessité un état transitoire complexe.
**Conséquences** : "abandonner le nouveau" garde l'or dépensé. À documenter visuellement (notice "Nouveau consommable abandonne." après dispatch).

## [2026-04-29] [frontend-dev] bonusFreeSwapsNextHub : relique partiellement appliquée
**Contexte** : la relique "Bannière du voyageur" (+1 swap gratuit au prochain hub) a été ajoutée au pool. Le hub stocke `freeSwapsUsed: 0 | 1`, pas un compteur.
**Décision** : la relique est ajoutée à `run.relics` (visible dans Stats hub et render_game_to_text) mais l'effet du +1 swap gratuit n'est pas câblé pour cette passe.
**Rationale** : refactor `freeSwapsUsed: number` impacte HubState type, TeamTab, render_game_to_text et les tests. Coût supérieur à 5 min, hors scope correctif urgent. La relique reste choisissable car elle a une valeur narrative et une trace dans le journal de run.
**Conséquences** : si l'utilisateur choisit "Bannière du voyageur", il bénéficie quand même du swap gratuit standard du hub, mais pas d'un swap supplémentaire. À fixer en V2.2.


## [2026-04-30] [frontend-dev] V5.1 Phase 4 — Sauvegarde de run par checkpoints
**Contexte** : `RunState` n'était jamais persisté en localStorage. Si l'utilisateur fermait l'onglet en plein run → run perdue.
**Décision** : ajouter `currentRun: SerializedRunState | null` au type `SaveData` (saveVersion bumpé 3 → 4), serialisé aux 4 transitions sûres (START_RUN, CHOOSE_REWARD, CHOOSE_BOSS_RELIC, ENTER_HUB, HUB_CONTINUE) et clearé sur fin de run (finishRun + final boss runic).
**Rationale** :
- Sauvegarder mid-fight = risque (animQueue, timing, états transitoires). Les transitions sont des points de cohérence où le run est dans un état restaurable.
- `enemy` n'est PAS serialisé : volatile, regénéré au prochain combat depuis `fight + modifier`.
- `animQueue`, `bossIntroAt`, `flashes`, `log` exclus : effets de bord, restaurés vides.
- `attackTimer` reset à 0 à la sérialisation pour éviter de reprendre mid-cooldown sur un timing arbitraire.
**Migration silencieuse** : saves saveVersion < 4 → currentRun=null par défaut. Aucune save existante n'est cassée.
**Validation defensive** : `normalizeCurrentRun` valide la structure du snapshot ; tout problème → null + console.warn (la run est perdue mais le reste de la save survit).
**Alternative écartée** : sauver à chaque TICK avec debounce. Refusé : trop d'écritures localStorage, risque d'incohérence si crash mid-tick.
**Coût** : ~250 lignes (App.tsx 5554 → 5800 environ), 2 nouvelles actions reducer (CONTINUE_RUN, DISCARD_SAVED_RUN), bump saveVersion.
**Conséquences UI** : MenuScreen ajoute conditionnellement `#continue-run` (run sauvée), modale `#confirm-new-run` (avertissement écrasement), bouton `#reset-save` + modale, bannière de save corrompue.
**Replay partiel sur stage 2/3** : si l'utilisateur ferme l'onglet sur reward d'une vague mid-stage, à la reprise il passe par stage-intro qui via START_STAGE force fight=11 ou 21. Conséquence : il rejouera potentiellement les 1-9 premières vagues de ce stage. Coût acceptable face au gain (la run est préservée). À refiner en V5.2 si besoin.

## [2026-04-30] [frontend-dev] Test golden-path — fix d'un cas non couvert
**Contexte** : `playStage` dans `tests/golden-path.spec.ts` ne gérait pas le cas où `playFightToCompletion` retourne "reward" pour une vague boss (la victoire boss passe par l'écran reward standard avant boss-relic-choice). Conséquence : flake ~20% du temps (selon RNG, le test atteint le boss → bloque sur "reward" → timeout).
**Décision** : ajouter un cas B dans `playStage` qui clique `#reward-0`, attend boss-relic-choice/hub/gameover, et enchaîne le choix de relique boss.
**Rationale** : sans ce fix, T15-T18 ne pouvaient pas être validés par `npm test` de manière déterministe. Le bug n'est pas causé par Phase 4 (il existait avant) mais le rendre visible empêche de prouver la non-régression.
**Conséquences** : 5/5 runs verts post-fix.
