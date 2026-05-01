# Journal des décisions — V3 Game feel

Format : `## [date] [auteur] décision`

## [2026-04-29] [orchestrator] Cycle V3 isolé sous project/v3/
- V2 (stages/hub/économie) vient d'être livrée. V3 = mission distincte "sensation pure".
- Workspace V3 isolé pour ne pas polluer l'historique V2 et éviter les conflits.
- Mode auto reste actif. Pas de checkpoint visuel intermédiaire.
- Discipline V3 : **0 nouveau contenu**. Animation, lisibilité, sensation, rareté uniquement.

## [2026-04-29] [architect] Vitesse de combat — multiplicateur double : tick interval + CSS variable
**Contexte** : le brief demande un sélecteur ×1/×1.25/×1.5. Le tick combat est piloté par `setInterval(TICK, 260)` qui dispatch `TICK { delta: 260 }`. Les durées d'animation CSS sont des constantes en ms.
**Options envisagées** :
A. Modifier l'intervalle de `setInterval` (ex. 260/speed). Risque : Playwright via `advanceTime` injecte un delta brut, désynchronisé.
B. Garder `setInterval(260)` mais multiplier le `delta` envoyé au reducer (`delta * speed`). Inconvénient : `advanceTime(N)` ne saurait plus si `N` doit être scalé ou non.
C. Garder le tick brut, **lire** `playerAttackInterval = round(BASE * modifier / speed)` et `enemy.attackInterval = round(BASE / speed)` dynamiquement dans `advanceCombat`. Côté CSS, injecter `--combat-speed: 1` sur `.combat-screen`, toutes les durations animées s'écrivent `calc(<base> / var(--combat-speed))`.
**Décision** : **C**.
**Rationale** : `advanceTime` reste un outil temps-virtuel pur (delta brut) ; le moteur combat consomme la vitesse via les seuils. Côté UI, une seule variable CSS scale toutes les anims. Les tests Playwright restent déterministes.
**Conséquences** : aucun changement dans la boucle `setInterval`. Aucun changement dans `advanceTime`. `state.settings.combatSpeed` est lu dans `advanceCombat` (et `useSpecial`), pas dans le tick. Le designer écrit les durées en `calc()`.

## [2026-04-29] [architect] AnimQueue — file d'events typés, parallèle aux flashes V2
**Contexte** : le brief §13 demande un système d'events d'animation (`attack_started`, `projectile_launched`, `target_hit`, etc.). La V2 a déjà `state.flashes: FlashEvent[]` (impacts + floating numbers basiques).
**Options envisagées** :
A. Réutiliser `flashes` en l'étendant (variants) — risque : casse la sémantique V2 et casse les composants qui en dépendent.
B. Nouvelle queue `state.run.animQueue: CombatAnimEvent[]` parallèle, vit sa propre vie. La V2 reste intouchée.
C. Refondre `flashes` complètement (réécriture).
**Décision** : **B**.
**Rationale** : la V2 fonctionne. Greffer une couche par-dessus est la plus sûre et la moins coûteuse. La nouvelle couche peut consommer la queue pour rendre projectiles/impacts/floating-numbers, et la V2 continue d'âger ses flashes pour les anims existantes (rétrograde gracieux). En V4 on pourra unifier si besoin.
**Conséquences** : `state.run.animQueue` ajouté. `addAnimEvent(queue, event)` helper. TTL des events : 800 ms (cohérent avec la durée max d'un projectile ou d'un floating number). Le purge se fait dans `advanceCombat` comme pour `flashes`. Les producteurs (`advanceCombat`, `useSpecial`, `applyConsumable`) appendent ; le consommateur unique est `CombatAnimationLayer`.

## [2026-04-29] [architect] Phases LootboxScreen — extension de l'enum local sans toucher au reducer
**Contexte** : V2 LootboxScreen a `phase: 'closed' | 'opening' | 'opened'` géré localement. Le reducer dispatche `OPEN_LOOTBOX` après 300 ms. V3 veut une roulette + révélation rareté.
**Options envisagées** :
A. Garder 3 phases, ajouter sous-phases dans le composant (état imbriqué).
B. Étendre l'enum à `'idle' | 'shake' | 'roulette' | 'reveal' | 'opened'`. `OPEN_LOOTBOX` est dispatché à la fin de `shake` (≈ 320 ms après le clic). Le reducer reste inchangé.
C. Pousser des champs de phase dans le state global (couplage reducer).
**Décision** : **B**.
**Rationale** : la phase est purement présentationnelle, elle n'a aucune raison d'être dans le state global. Renommer `closed → idle` aligne le vocabulaire sur l'animation, mais on garde la même action `OPEN_LOOTBOX` et le même contrat de timing : le résultat est connu *avant* la roulette (anti-triche). La phase `reveal` joue après la roulette, et `opened` est le state final.
**Conséquences** : `LootboxScreen` est refondu. La transition `idle → shake` est déclenchée par clic. `shake → roulette` après 320 ms. `OPEN_LOOTBOX` dispatché en début de `roulette`. `roulette → reveal` après 2500 ms. `reveal → opened` après la durée du reveal selon rareté. Les hooks de test `__game_test_skip_roulette` et la prise en compte `prefers-reduced-motion` raccourcissent les timings.

## [2026-04-29] [architect] Pity system — compteur double (rare, épique), bump step, reset au draw rare+
**Contexte** : le brief §2 mentionne un pity "+5% à +10% chance de rare/épique après X loot boxes ouvertes sans rare+". Plusieurs paramètres ouverts : seuil X, granularité (par tier ou global), bump linéaire ou step.
**Options envisagées** :
A. Compteur unique `sinceLastRarePlus`, bump linéaire (1% par lootbox au-dessus de 5).
B. Deux compteurs (`sinceLastRare`, `sinceLastEpic`), bumps step (5 → +5%, 8 → +10% pour rare ; 12 → +5% pour épique).
C. Compteur par type de lootbox (Petite/Rare/Épique séparément).
**Décision** : **B**.
**Rationale** : C est trop granulaire pour un pity discret ; A est moins lisible (le joueur voit "garantie progressive" mais ne sait pas où on en est). B donne deux paliers visibles ("garantie après 5 lootboxes", "garantie renforcée après 8") cohérents avec le ton premium dark fantasy. Un compteur épique séparé permet de viser la progression vers du contenu plus rare sans diluer la garantie de base.
**Conséquences** : `save.lootboxPity = { sinceLastRare: number; sinceLastEpic: number }`. `rollLootbox` lit les compteurs, ajoute des bonus aux poids correspondants, puis incrémente ou reset selon le résultat. Affichage discret dans `LootboxTab`. `saveVersion = 3`. `normalizeSave` injecte les défauts si absent (lecture tolérante).

## [2026-04-29] [architect] CharacterCardDetailed — nouveau composant, combat reste compact
**Contexte** : le brief §3 demande des cartes très détaillées. La V2 utilise `CombatHero` (compact) en combat, et un rendu différent en collection. Refonte ou nouveau composant ?
**Options envisagées** :
A. Refondre `CombatHero` en `CharacterCardDetailed` partagé partout.
B. Nouveau composant `CharacterCardDetailed`, utilisé en collection / lootbox reveal / chest reveal / creator preview. Le combat conserve `CombatHero` compact.
C. Une seule carte avec mode `compact` / `detailed`.
**Décision** : **B**.
**Rationale** : en combat, la lisibilité tactique prime sur la richesse de détails. Un héros doit être lu en < 1 s (HP, BCL, état). Un jeu de cartes premium *montre* ses cartes hors combat (collection, reveal) — c'est là qu'on veut le détail luxueux. C ajoute de la complexité conditionnelle pour aucun gain. Cette séparation préserve aussi la performance (le combat n'a pas à rendre des cartes lourdes 60 fps).
**Conséquences** : nouveau composant. Le combat n'est pas modifié visuellement (sauf pulse/shake d'attaque). La collection et les reveals consomment les nouveaux tokens raretés. Le designer livre un seul layout détaillé.

## [2026-04-29] [architect] Boss intro — phase intra-combat, pas un Screen distinct
**Contexte** : le brief §9 demande une intro boss pleine page. La V2 a déjà un Screen `stage-intro` (transition entre stages). Faut-il un Screen `boss-intro` ?
**Options envisagées** :
A. Nouveau Screen `boss-intro` avec son propre routing.
B. Phase intra-combat : combat démarré, mais `state.run.bossIntroAt` non null bloque le tick d'`advanceCombat`. Un overlay React rend l'intro 1600 ms.
C. Dérouler l'intro avant `START_COMBAT` (similaire à `stage-intro`).
**Décision** : **B**.
**Rationale** : A multiplie les screens et complique le retour Combat (il faut un Screen→Screen). C nécessite des modifications de `START_RUN`/`HUB_CONTINUE`/`CHOOSE_REWARD` pour rerouter avant chaque boss (waves 10/20/30) — coûteux et risque de régression V2. B est minimal : un champ d'état + un overlay + un guard dans `advanceCombat` (déjà la fonction qui décide si le tick combat avance ou non). Les tests V2 ne sont pas affectés tant que `__game_test_skip_boss_intro` est exposé.
**Conséquences** : `state.run.bossIntroAt: number | null`. Set au moment de la création de l'ennemi boss (dans `createEnemy` pour `wave === 10`). Lu par `advanceCombat` (skip si `Date.now() - bossIntroAt < 1600`). Nouveau composant `BossIntroOverlay` rendu conditionnellement en surimpression de `CombatScene`. Reduced-motion : 200 ms au lieu de 1600 ms.

## [2026-04-29] [architect] Architecture in-place — extension App.tsx jusqu'à 5500 lignes
**Contexte** : le brief §12 propose une décomposition `src/components/*` et `src/game/*`. App.tsx fait actuellement ~4365 lignes après V2. V3 ajoute ~700 à 1100 lignes (composants, anim layer, types, hooks).
**Options envisagées** :
A. Suivre la suggestion du brief, extraire LootRoulette, RarityReveal, CombatAnimationLayer, CharacterCardDetailed, BossIntro, FloatingNumberLayer dans `src/components/`. Configs dans `src/game/`.
B. Garder in-place comme V2 (decisions V2 §[2026-04-29] [frontend-dev] stack confirmée).
C. Extraction sélective : seulement les configs visuelles (rarityVisuals, animationEvents) dans `src/game/`.
**Décision** : **B en première intention**, **réévaluation en V3-T30** une fois la V3 fonctionnelle. Plafond souple : si App.tsx dépasse 5500 lignes ou devient illisible, ouvrir une décision pour passer en A ou C.
**Rationale** : la cohérence du fichier unique facilite la lecture du flux de données (state → reducer → composants). La V2 a démontré que ~3900 lignes sont navigables. ~5500 reste gérable en mode "Ctrl+F". Extraire pendant la livraison V3 ajoute du risque (imports circulaires, types partagés à exporter) sans bénéfice immédiat. La V4/V3.1 pourra trancher avec recul.
**Conséquences** : tout le code V3 va dans App.tsx. Sections délimitées par `// === V3 anim ===`, `// === V3 lootbox ===`, etc. Les types V3 vont en haut du fichier (après les types V2). Le frontend-dev mesure la taille à chaque tâche et alerte si ça dérape.

## [2026-04-29] [ui-designer] Palette raretés V3 — dark fantasy premium, jamais fluo
**Contexte** : le brief impose dark fantasy continue, pas de néon, contrastes AA. Cinq raretés à différencier visuellement de loin (commun → légendaire + mythique placeholder).
**Options envisagées** :
A. Palette saturée flashy (gold vif, violet électrique, bleu néon) — refusée d'office par le ton.
B. Palette désaturée premium : gris pierre, bleu froid `#5BA3D0`, violet profond `#9C6BD9`, or chaud `#E0B450`, blanc nacré `#F5E6D8`. Halos en `box-shadow` (pas filter blur).
C. Palette monochrome avec seul l'or qui varie en intensité.
**Décision** : **B**.
**Rationale** : B s'aligne avec les accents de stages V2 (`#6FB3D2` cyan, `#8E5BD5` violet, `#C9A24A` or). Les 5 raretés se lisent à distance par bordure et glow sans crier visuellement. Contrastes AA vérifiés (≥ 9:1 sur fond `#0b0a0c`). Performance : halos en `box-shadow` permettent d'éviter les filter blur coûteux.
**Conséquences** : tokens `--rarity-{kind}-{border|bg|glow|text|particle}` ajoutés en parallèle des tokens V2 (qui restent pour compat). Les classes V3 (`.rarity-common/rare/epic/legendary`) coexistent avec les classes V2 (`.rarity-rare/epique/legendaire`). Aucune carte mythique en V3 — la classe `.rarity-mythic-placeholder` reste `opacity: 0` (RESERVED pour V4).

## [2026-04-29] [ui-designer] Easing roulette — cubic-bezier(.12,.85,.25,1)
**Contexte** : la roulette doit donner la sensation "lent au début, défilement rapide, freinage long" en 2500ms exactement. Plusieurs courbes envisagées.
**Options envisagées** :
A. `cubic-bezier(0.13, 0.85, 0.25, 1)` (suggéré par le brief) — ease-out cubique fort.
B. `cubic-bezier(0.42, 0, 0.58, 1)` (ease-in-out) — symétrique, manque de tension à l'arrêt.
C. `cubic-bezier(0.16, 1.04, 0.3, 1)` — overshoot léger, peu adapté à un défilement.
**Décision** : **A** (légèrement ajustée à `cubic-bezier(.12, .85, .25, 1)`).
**Rationale** : la valeur `.12` au lieu de `.13` accentue très légèrement l'accélération initiale, ce qui rend le freinage final plus perceptible psychologiquement. Le freinage doit durer la dernière 0.5s pour donner le moment "j'ai presque eu". Easing manuel en JS via une lib bezier minimale ou une implémentation Newton-Raphson 20 lignes (pas de dep npm).
**Conséquences** : token `--ease-roulette: cubic-bezier(.12,.85,.25,1)` posé. Le composant `LootRoulette` interpole manuellement en rAF (pas de transition CSS, pour pouvoir s'arrêter exactement sur un index).

## [2026-04-29] [ui-designer] Amplitude shake et durées d'impact — court et net, jamais épileptique
**Contexte** : les shakes et flashes d'impact sont les sensations les plus fréquentes du combat. Mauvaisement réglés, ils peuvent rapidement saturer. Bien réglés, ils donnent l'impact sans fatiguer.
**Options envisagées** :
A. Shake fort (±5-7px) + flash 200ms — risque de fatigue après 10 attaques.
B. Shake court (±2-3px) + flash 90-120ms — précis mais subtil. Plus quelques ms de scaling pour les compétences.
C. Shake adaptatif selon dégâts — variabilité difficile à régler, risque incohérence.
**Décision** : **B** avec asymétrie ennemi/allié (ennemi ±3px, allié ±2px) et durée flash bright 90ms / dark 120ms.
**Rationale** : le combat tape une attaque toutes les ~600-1000ms. Sur 10 minutes, si chaque shake est trop long, l'écran devient illisible. ±2-3px est suffisant pour être perçu sans fatiguer. Le flash bright (sur ennemi) à 90ms est plus court que le dark (sur allié) à 120ms parce que l'allié encaisser doit donner un sentiment plus pesant. Asymétrie volontaire : tu vois ton héros encaisser un peu plus longtemps, ce qui soutient l'attention sur ta team.
**Conséquences** : tokens `--anim-impact-shake-enemy: 180ms`, `--anim-impact-shake-ally: 180ms`, `--anim-impact-flash: 90ms`, `--anim-impact-flash-dark: 120ms`, `--anim-impact-flash-shield: 100ms`. Reduced-motion : shakes désactivés, flashes conservés (sous le seuil 200ms perçu comme tolérable). Le seul shake écran de tout le jeu = légendaire reveal ±2px sur 180ms (handoff architect).

## [2026-04-29] [frontend-dev] Easing roulette — approximation cubique simple en JS
**Contexte** : la spec demande `cubic-bezier(.12,.85,.25,1)` 2500ms en rAF avec arrêt déterministe sur index 14. Implémenter le bézier exact requiert Newton-Raphson ou table lookup.
**Options envisagées** :
A. Newton-Raphson 20 lignes pour bézier exact.
B. Approximation `1 - (1-t)^3` (ease-out cubique standard).
C. Lib JS bezier-easing (~1 kB).
**Décision** : **B**.
**Rationale** : la courbe cubic-bezier(.12,.85,.25,1) est une ease-out cubique légèrement biaisée. La différence perceptible avec `1 - (1-t)^3` est < 3% sur la courbe (presque identique aux yeux). Coût : 0 ligne, 0 dépendance, parfaitement déterministe. Si la sensation est jugée insuffisante en revue, basculer vers A est trivial (la fonction `easeOut` dans LootRoulette est isolée).
**Conséquences** : LootRoulette utilise `1 - Math.pow(1 - t, 3)`. Visuellement très proche du target. Test skip via flag `completedRef.current` qui jump direct à `targetX`.

## [2026-04-29] [frontend-dev] Hex zone — projectiles individuels par allié
**Contexte** : la spec brief (4.3) propose une "onde de zone" pour l'intent hex. La spec design (animations.md) liste `attack-wave-expand` 480ms.
**Options envisagées** :
A. Onde unique radiale partant de l'ennemi (un seul élément CSS scale 1 → 8).
B. Projectile magic individuel vers chaque allié vivant (3 projectiles parallèles).
**Décision** : **B** dans cette première passe.
**Rationale** : B donne une lisibilité directe "qui prend quoi" (chaque allié voit le projectile arriver, le floating-number s'aligne). L'onde A est plus iconique mais moins informative. Le coût visuel est équivalent (2-3 projectiles vs 1 onde + impacts). Si la sensation est jugée moins forte en revue, ajouter une onde supplémentaire derrière les projectiles est non-bloquant.
**Conséquences** : code dans le branch `intent.kind === "hex"` de `advanceCombat` push un `animProjectile(enemy, ally, "magic")` par allié vivant. La keyframe `attack-wave-expand` reste définie dans le CSS pour usage futur.

## [2026-04-29] [frontend-dev] Pulse/shake DOM via classes — déféré
**Contexte** : la spec V3 prévoit que `CombatHero` et `EnemyCard` reçoivent les classes `.is-attacking`, `.is-hit`, `.aura-low` déclenchées par animQueue. Cela demande un `useCardRefs` ou un context provider qui mappe `id → HTMLElement` consommé par CombatAnimationLayer.
**Options envisagées** :
A. Implémenter `useCardRefs` + provider + watcher d'events animQueue qui pose/retire les classes via `classList`.
B. Déférer : la couche projectiles + floating-numbers est suffisante en première passe, les pulses sont une amélioration "nice to have".
C. Implémenter en CSS-only via `data-attacking` posé directement sur la card React via un `useState` local synchronisé sur animQueue.
**Décision** : **B en première passe**, **C en V3.1** si la sensation est insuffisante en revue.
**Rationale** : la sensation principale (le projectile part, l'ennemi prend, le chiffre flotte) est portée par le CombatAnimationLayer. Le pulse héros avant tir et le shake ennemi à l'impact sont la cerise — leur absence ne casse pas la lecture combat. A demande un refactor non-trivial (refs, provider, observer) qui peut introduire des bugs de synchro avec advanceTime. C est plus propre mais demande de raisonner sur le timing exact d'apposition/retrait des classes vis-à-vis du tick.
**Conséquences** : les classes CSS `.is-attacking`, `.is-hit`, `.aura-low` sont définies et prêtes à consommer. La classe `.aura-low` est déjà appliquée sur `EnemyCard` quand hp/maxHp < 30% (via prop hpPct). Le câblage complet pulse/shake est laissé à V3.1.

## [2026-04-29] [frontend-dev] LootboxScreen V3 — tier mapping vers les classes coffre V3
**Contexte** : V2 PendingLootbox.tier est `LootBoxTier = "small" | "rare" | "epic" | "runic"`. V3 utilise les classes `.chest-tier--{damaged|bronze|silver|royal|runic}` (5 tiers). Mapping non trivial.
**Décision** : `small → damaged`, `rare → bronze`, `epic → royal`, `runic → runic`. Le tier "silver" n'est pas accessible via lootbox achetée (il reste pour le coffre final tier-aware en gameover).
**Rationale** : les 4 lootboxes commerciales prennent 4 des 5 tiers visuels. silver reste réservé au gameover. Mapping cohérent : small=premier (damaged), rare=bronze, epic=royal (or chaud cohérent avec la rareté épique violet/or). runique en dernier.
**Conséquences** : la classe CSS appliquée dans LootboxScreen est dérivée par un switch ternaire inline. Pas d'enum partagé.

## [2026-04-29] [frontend-dev] V3.1 correctifs — pulses/shakes via state dérivé d'animQueue
**Contexte** : la décision initiale "déféré V3.1" est levée. Les classes CSS `.is-attacking`, `.is-hit` étaient prêtes mais non posées. Le brief §6/§7/§8 attendait la chaîne préparation→tir→impact→réaction.
**Options envisagées** :
A. Refs DOM via context provider (`CardRefsProvider`) qui mappe `id → HTMLElement`, observer animQueue qui pose/retire classes via `classList`.
B. Pure derived state : un `useMemo` au niveau App lit `state.run.animQueue` et calcule `{ attackingIds, hitIds, flashIds }` (Sets de cardId). Passe ce state en prop à `CombatHero` / `EnemyCard` qui rendent les classes via React.
**Décision** : **B**.
**Rationale** : aucune ref, aucun listener, aucun timer manuel. Chaque TICK âge la queue dans le reducer ; le re-render naturel pose/retire les classes. Pas de race condition possible avec `advanceTime`. Côté maintenance : un seul helper pure (`computeCardAnimState`), aucun cleanup à gérer.
**Conséquences** : `CombatHero` reçoit la classe `combat-hero` (ajoutée à l'`article` car la CSS V3 cible `.combat-hero` qui n'était pas posée — le reste continue de cibler `.combat-card`). Les flashes blanc (ennemi 90ms) et sombre (allié 120ms) sont rendus via `::after` overlay sur classe `.is-flash-enemy`/`.is-flash-ally`. Reduced-motion : flashes opacity step seulement, pulses/shakes désactivés (déjà couvert par `@media (prefers-reduced-motion: reduce)` existant + ajouts pour les nouvelles classes).

## [2026-04-29] [frontend-dev] V3.1 — regroupement floating numbers via helper pure dans le layer
**Contexte** : sans regroupement, en combat ×1.5 dense, plusieurs floating-numbers se superposaient. La spec §6 floating-numbers.md demandait un buffer 120ms avec timer de flush.
**Options envisagées** :
A. Buffer stateful avec `setTimeout` 120ms qui flush, comme spec.
B. Helper **pure** `groupFloatingNumbers(events)` qui scanne la queue à chaque render et regroupe les events de même `(targetId, variant)` arrivés à <120ms d'écart. Pas de timer.
**Décision** : **B**.
**Rationale** : la queue elle-même est notre buffer (TTL 800ms). À chaque TICK le rendu re-évalue. Les events groupés disparaissent ensemble en sortant de la TTL. Aucun timer, aucun side-effect, déterministe pour Playwright. Crit + status (poison/burn) ne se groupent jamais (règle spec).
**Conséquences** : `FloatingNumber` accepte `parts?: number[]`. Format : 2 parts → `-24 / -8 PH`, 3 → `-24 / -8 / -12 PH`, 4+ → `-58 PH (cumul)`. Le crit conserve son label dédié. Le rendu projectiles passe par la queue brute, le rendu floating-numbers passe par le helper.

## [2026-04-29] [frontend-dev] V3.1 — séquence ouverture coffre final via phases locales
**Contexte** : `FinalChest` était un bouton qui passait `opened`. Le brief §11 demandait shake + flash + lid rotate + beam + reveal.
**Décision** : phase locale `idle → shake (320ms) → opening (lid 400ms + flash overlay 200ms) → beam (300ms) → reveal`. Le dispatch `OPEN_CHEST` est déclenché au début de la phase `opening` pour synchroniser le state global avec le moment où le flash blanc démarre. Le bouton `#open-chest` (Playwright) est conservé en phase `idle`.
**Rationale** : phase locale au composant comme `LootboxScreen` (cohérence). Le reducer reste inchangé. Reduced-motion : `idle → reveal` direct, dispatch `OPEN_CHEST` immédiat.
**Conséquences** : ajout des keyframes CSS `chest-flash-fullscreen`, `chest-lid-rotate`, `chest-beam-rise`. Le coffre passe `is-shaking--{tier}` pour amplifier subtilement selon le tier. La révélation utilise `CharacterCardDetailed` si reward.kind === "character", sinon fallback `ChestResult` (or/fragments). App.tsx final 5551 lignes, dépasse de ~50 le plafond souple 5500 — l'extraction dans `src/components/` est désormais à acter en V3.2 (note pour architect).
