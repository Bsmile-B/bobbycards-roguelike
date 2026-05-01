# Revue V3 — itération 1 (2026-04-29)

## Résumé

OK avec réserves. La couche projectiles + floating-numbers + roulette + boss intro + cartes détaillées + raretés est en place et le build est clean (App.tsx ~5293 lignes sous le plafond 5500). Trois zones empêchent toutefois la sensation visée d'être complète : les pulses/shakes sur les cartes ne se déclenchent jamais, la séquence d'ouverture du coffre final reste figée à idle, et le test V2 `open-lootbox.json` est cassé silencieusement par le nouveau flow phasé. Aucun blocker critique, mais ces 3 points sont des `major` qui pèsent directement sur l'outcome "sensation pure".

---

## Audit checklist

### Brief §1 — Roulette d'ouverture lootbox
- 5 phases (idle/shake/roulette/reveal/opened) — ✓ App.tsx:4044, 4571 (LootboxPhase)
- Strip horizontal 18 items + marqueur central — ✓ App.tsx:4573 (`LOOT_ROULETTE_ITEMS=18`), 4691 (`loot-roulette__marker`)
- Easing 2500ms + arrêt sur index 14 — ✓ App.tsx:4574, 4644, 4647 (targetX déterministe), 4660 (`easeOut(progress)`)
- Résultat tiré AVANT animation — ✓ App.tsx:4090 (`OPEN_LOOTBOX` dispatché en début de phase roulette, avant l'animation)
- 5 effets de rareté à la révélation (commun/rare/épique/légendaire/mythique placeholder) — ⚠ 4 effets actifs (common/rare/epic/legendary) ; mythique réservé non rendu (cohérent avec specs §4.10) — styles.css:2614-2630
- Reduced-motion : skip direct — ✓ App.tsx:4081-4085, styles.css:2966+

### Brief §2 — Pity system
- `save.lootboxPity` typé — ✓ App.tsx:201, 238
- Compteur double (rare, épique) — ✓ App.tsx:238 (`sinceLastRare/sinceLastEpic`)
- Bumps step (5 → +5%, 8 → +10% rare ; 12 → +5% épique) — ✓ App.tsx:1187-1189
- Reset au draw rare+ — ✓ App.tsx:1208-1225
- Affichage discret — ✓ App.tsx:3524-3528 (LootboxTab pity status text)

### Brief §3 — Cartes personnages détaillées
- `CharacterCardDetailed` créé — ✓ App.tsx:4232
- Affiche nom + rareté + rôle + portrait + stats + skill + trait + fragments + rang — ✓ App.tsx:4269-4302
- Branché en Collection / Lootbox reveal / FinalChest reveal / Atelier preview — ⚠ Collection (App.tsx:4995) + Atelier preview (5085) + Lootbox reveal (4726) ✓. **FinalChest reveal NON branché** : `ChestResult` (l'ancien) reste utilisé via `<FinalChest>` (App.tsx:4210) — la carte reveal coffre final n'utilise pas CharacterCardDetailed.
- Combat NON branché (CombatHero compact) — ✓ App.tsx:3046 (CombatHero inchangé)

### Brief §4 — Raretés visuellement fortes
- 5 classes `.rarity-*` distinctes (border/glow/particles/animation idle) — ✓ tokens styles.css:126-157, classes 2557-2590
- Mythique = placeholder — ✓ tokens présents, aucune carte mythique active
- Pas fluo, dark fantasy premium, contrastes AA — ✓ palette désaturée (decisions.md ui-designer "Palette raretés")

### Brief §5 — Vitesse + contrôle
- `state.save.settings.combatSpeed: 1 | 1.25 | 1.5` — ✓ App.tsx:236-237, 537
- `SpeedSelector` dans CombatFooter (3 boutons) — ✓ App.tsx:4314, 5186
- IDs `#speed-1/#speed-1-25/#speed-1-5` — ✓ App.tsx:4322-4326
- `--combat-speed` CSS variable injectée — ✓ via classes `.speed-125/.speed-150` (styles.css:167-169, App.tsx:5137)
- Lecture dynamique dans `advanceCombat` (pas dans le tick) — ✓ App.tsx:1675-1677 (`scaledDelta = delta * speed`)

### Brief §6 — Animations attaque alliées
- `Projectile` avec 5 types (physical/magic/heal/shield/poison) — ✓ App.tsx:4396-4426
- Origin/target via refs des cards — ⚠ via approximation `locateCard()` % (App.tsx:4429), pas via refs DOM. Acceptable pour un premier rendu, mais pas pixel-perfect (le projectile peut passer hors d'une carte si la grille bouge).
- Pulse héros avant tir — ✗ **Limite dev #1**. Classes `.combat-hero.is-attacking` définies (styles.css:2263), keyframe `attack-pulse` câblé (2258), mais aucune logique ne pose la classe sur le DOM (CombatHero ne reçoit pas de prop d'état d'animation, animQueue n'est pas consommé pour ça).

### Brief §7 — Animations attaque ennemies
- Trajectoires ennemi → allié — ✓ App.tsx:1801, 1848 (`animProjectile(enemy, member, ...)`)
- Cas zone (multi-target) — ⚠ implémenté en projectiles individuels par allié (decision frontend-dev "Hex zone") plutôt qu'onde unique. Conforme au brief mais sensation "onde de zone" perdue.
- Cas heal ennemi — ✗ Pas de cas heal ennemi dans `advanceCombat` (le brief §4.3 mentionne "Soin ennemi (flux doux vers ennemi soigné)" — non câblé). Aucun ennemi V2 actuel n'a d'intent heal donc pas un blocker, mais lacune brief.
- Pulse ennemi pas déclenché — ✗ idem limite #1, classe `.enemy-card.is-attacking` définie mais jamais posée.

### Brief §8 — Réactions impacts
- Flash blanc ennemi 90ms — ⚠ Token `--anim-impact-flash: 90ms` défini (styles.css:99) mais pas de classe `.is-flashing` ni de style flash blanc déclenché à l'impact. La classe `.enemy-card.is-hit` (shake) n'est jamais posée non plus.
- Flash sombre allié — ⚠ idem (token `--anim-impact-flash-dark: 120ms` défini, pas de classe ni de déclencheur).
- Shake court 180ms — ✗ keyframe en place, classe `.is-hit` jamais posée (limite dev #1).
- Aura blessé < 30% PV — ⚠ partiel : `wounded` posé sur CombatHero quand `hp/maxHp <= 0.35` (App.tsx:3055) ; pas la même logique exacte que la spec (<30%), mais visuellement présent.
- Aura instable boss < 30% — ✓ App.tsx:3099-3103 (`lowHp = hpPct < 0.3` → classe `aura-low`).

### Brief §9 — Boss intro + présence
- `BossIntroOverlay` 1600ms — ✓ App.tsx:4518, 4532 (timeout `reduced ? 800 : 1600`)
- `state.run.bossIntroAt` non null bloque advanceCombat — ✓ App.tsx:1659-1665
- Action `BOSS_INTRO_DISMISS` — ✓ App.tsx:352, 2620
- Hook `__game_test_skip_boss_intro()` — ✓ App.tsx:4791-4793
- Carte boss 1.4× + bordure animée — ⚠ classe `.enemy-card--boss` posée (App.tsx:3100) mais à vérifier que styles.css applique le scale. (Le test-action set-speed ne le couvre pas.)
- Barre de vie boss au-dessus du battlefield — ⚠ `BossHpBar` rendu **dans** `EnemyCard` (App.tsx:3107), pas en bandeau au-dessus du battlefield comme suggéré §4.11. Acceptable mais sensation "barre imposante" amoindrie.
- Phase II à 50% — ✓ App.tsx:1737-1742 (`bossPhase=1` à <50% one-shot).
- Aura instable < 30% — ✓ App.tsx:1743-1747 (`bossPhase=2` à <30% + classe `aura-low`).
- Mort boss : ralentissement 800ms + particules — ✗ Pas câblé. Le brief §4.11 ne le rend pas non plus obligatoire mais le brief général le mentionne. Lacune mineure.

### Brief §10 — Floating numbers
- Variants (damage-physical/magic/heal/shield/crit/poison/burn) — ✓ App.tsx:241-248, styles.css:2411-2417
- Crit 1.6× plus grand — ⚠ Crit plus grand mais `font-size: 28px vs 18px` ≈ 1.55× (cohérent à 0.05 près).
- Format `-24 PH`, `+18 SOIN`, etc. — ✓ App.tsx:4351-4367
- Regroupement <120ms non implémenté — ✗ **Limite dev #3**. Le brief §10 dit "Regrouper si rafale rapide" — non câblé. Sur combat dense (5 ennemis ×1.5), risque d'illisibilité.
- Zigzag anti-superposition — ✓ App.tsx:4468 (`id.charCodeAt(...) % 3`).

### Brief §11 — Coffres plus vivants
- 5 tiers idle animés (souffle/scintillement/pulses/runes) — ✓ styles.css:2718-2738 (`chest-damaged-breath/bronze-glow/royal-glow/runic-aura`).
- Séquence d'ouverture (lid rotate + beam + flash) non câblée dans FinalChest — ✗ **Limite dev #5**. App.tsx:4193-4198 — `FinalChest` rend un div `chest-tier--{tier}` avec `lid + body`, classe `opened` posée mais le CSS n'a qu'une rotation existante V2 (styles.css:1310 `.chest.opened .chest-lid`) — pas de beam, pas de flash, pas de séquence d'ouverture. Le coffre final ouvre comme en V2.

### Brief §12 — Architecture
- AnimQueue parallèle aux flashes V2 — ✓ App.tsx:288 (`animQueue` séparé de `state.flashes`).
- TTL 800ms purgé dans TICK — ✓ App.tsx:1679 (`ageAnimQueue` appelé), helpers L:1468.
- Cap 12 events — ✓ via `pushAnim` (cf. progress.md, decisions verifiables dans l'helper).

### Brief §13 — Animation events
- Types `attack-started / projectile / target-hit / damage-number / heal-number / shield-number / ko / boss-phase` déclarés — ✓ App.tsx:250-258
- Producteurs dans `advanceCombat` / `useSpecial` — ✓ App.tsx:1719-1851 et 1909-1978
- Consommateur unique `CombatAnimationLayer` — ✓ App.tsx:4441

### Contraintes
- localStorage clé v1 conservée + saveVersion 3 + migration silencieuse — ✓ App.tsx:533, normalizeSave (598-599)
- `render_game_to_text` étendu pour vitesse / phase lootbox / bossIntro / pity — ⚠ partiel : `settings`, `lootboxPity`, `animQueueLength`, `bossIntroActive`, `bossPhase` exposés (App.tsx:4805-4855). **Lootbox phase NON exposée** (le champ `lootbox` n'expose que `tier/opened/result`, pas la `phase` locale du composant — c'est cohérent avec l'archi "phase locale au composant" mais la spec §4.15 demandait `lootbox.phase` exposé).
- prefers-reduced-motion couvert (CSS + JS skip) — ✓ styles.css:2920+ + App.tsx:4047-4050, 4527-4530
- TypeScript strict 0 any — ✓ build clean, aucun any visible.
- Cap 4 boucles infinite simultanées respecté — ⚠ pas mesuré formellement. Risque modéré : `aura-low` (1) + `chest-runic-aura` (1, mais pas en combat) + `boss-hp-shimmer` (1) + `rarity-particle-rise` ×3 sur cartes détaillées (mais hors combat) → en combat normal, max 2 boucles simultanées (aura-low, boss-shimmer). OK.
- Pas de filter:blur sur grand élément — ⚠ `backdrop-filter: blur(12px/16px)` sur 4 éléments (`.menu/etc.` styles.css:282, 799, 1210, 1857). Ces blur sont sur overlays statiques (pas animés). Acceptable.

### V2 préservée (CRITIQUE)
- Hub V2 (5 onglets) toujours fonctionnel — ✓ HubScreen + tabs intacts, T22 Pity branché dans LootboxTab sans casser.
- Lootboxes V2 (4 types) achat → flow V3 (roulette) → reward correctement appliquée — ✓ OPEN_LOOTBOX dispatché en début de roulette, reward stockée dans pendingLootbox.result, CharacterCardDetailed dans reveal.
- Recyclage V2 toujours fonctionnel — ✓ pas de modification de RECYCLE_REQUEST/CONFIRM/CANCEL.
- Reliques de boss V2 toujours appliquées — ✓ `boss-relic-choice` et CHOOSE_BOSS_RELIC inchangés ; `applyStartOfCombatRelics` toujours appelé.
- Stages V2, FinalChest tier-aware V2 — ✓ FinalChest reçoit toujours `tier` et applique `chest-tier--{tier}`.

### Hooks de test
- `__game_test_skip_roulette()` exposé — ✓ App.tsx:4067
- `__game_test_skip_boss_intro()` exposé — ✓ App.tsx:4791
- Test-actions V2 toujours fonctionnels conceptuellement — ⚠ **`open-lootbox.json` est cassé silencieusement** : le V2 `frames: 60` (≈1s) attend un `#lootbox-close` qui n'apparaît qu'après la roulette (320ms shake + 2500ms roulette = 2820ms ≈ 169 frames à 60fps). Le test V2 cliquerait sur `#lootbox-close` avant que la phase reveal n'ait posé le bouton. **Le dev a remplacé `open-lootbox.json` par une version qui appelle `__game_test_skip_roulette` (test-actions/open-lootbox.json:14)** — donc fonctionnellement OK, mais c'est une **modification** d'un test V2, pas une préservation. Le brief V3 dit "test-actions existants continuent de fonctionner" — légère entorse. Acceptable car l'hôte V2 du test (`#lootbox-close`) est toujours présent en sortie de phase reveal.

---

## Évaluation des 5 limites du dev

### Limite #1 — Pulses/shakes sur cartes non déclenchés (CSS prêt, refs non câblés)
- **Sévérité : major.**
- **Impact sensoriel : significatif.** Le brief §6/§7/§8 répète "héros pulse / ennemi pulse / cible flash + shake" comme la sensation d'attaque. Sans pulse au tir et shake à l'impact, le projectile arrive sur une carte qui ne réagit pas — la chaîne préparation→attaque→impact→réaction est cassée (3 maillons sur 5 silencieux). C'est précisément la sensation "Avant : je clique, les chiffres changent / Après : je sens l'impact" du brief §16. **À relancer en priorité 1.**
- Action : implémenter la consommation des events `attack-started` et `target-hit` côté `CombatHero`/`EnemyCard` via une prop dérivée (sans refs : passer les ids "actifs" par classe). Cf. decision frontend-dev "Pulse/shake DOM via classes — déféré" — basculer en option C (data-attribute via useState local).

### Limite #2 — `open-lootbox.json` V2 nécessite skip-roulette ou frames: 200
- **Sévérité : minor.**
- **Impact sensoriel : nul** (c'est un test, pas du gameplay).
- Le dev a déjà patché le JSON existant pour appeler `__game_test_skip_roulette`. Fonctionnellement OK.
- Action : aucune correction code requise. Documenter dans handoff que `open-lootbox.json` a été modifié (ce n'est pas le golden path V2 inchangé).

### Limite #3 — Regroupement floating-numbers <120ms non implémenté
- **Sévérité : major.**
- **Impact sensoriel : moyen.** Sans regroupement, en combat ×1.5 dense, plusieurs floating-numbers se superposent verticalement (zigzag stable mais zigzag = 3 slots seulement). Au-delà de 3 events <120ms sur la même cible, illisibilité. Impacte directement l'outcome "lisibilité combat" §3.1.
- Action : agréger dans `CombatAnimationLayer` les events `damage-number` / `heal-number` / `shield-number` ayant même `targetId` et `createdAt - prev.createdAt < 120ms` en un label fusionné `-24 / -8`. Max 3 valeurs.

### Limite #4 — Audit perf 60fps en x1.5 combat 5 ennemis non mesuré
- **Sévérité : minor (mais à valider runtime).**
- **Impact sensoriel : conditionnel** (si 60fps OK, aucun impact ; si jank, gros impact).
- Action : task V3-T28 reste pending. À mesurer en revue runtime DevTools (recording 10s combat ×1.5, rapport jank). Si > 5%, désactiver `rarity-particle-rise` sur les cartes en combat (déjà hors combat OK).

### Limite #5 — Séquence d'ouverture coffre final (lid + beam + flash) non câblée
- **Sévérité : major.**
- **Impact sensoriel : moyen-élevé.** Le brief §11 dit "Le coffre = moment fort, pas un bouton." En V3, le coffre final reste un bouton qui passe en `opened` avec rotation lid V2 (~400ms) sans flash, sans beam, sans révélation graduée. La carte révélée derrière sort en `ChestResult` (pas en `CharacterCardDetailed`). Impact sur l'outcome §3.5 "envie de rouvrir un coffre".
- Action : étendre `FinalChest` avec une phase locale `idle → shaking → opening (lid rotate + flash) → beam (300ms) → reveal (CharacterCardDetailed) → claimed`. Reuse rarity-reveal keyframes.

---

## Écarts par sévérité

### Blocker
*(aucun — le build est clean, les flows V2 marchent, la roulette tire le résultat correctement, la persistance v3 est silencieuse, les hooks de test existent.)*

### Major
1. **Pulses/shakes cartes non câblés** (limite dev #1) — chaîne d'impact incomplète. Fix : `CombatHero`/`EnemyCard` consomment animQueue via `useMemo(activeIds)` synchronisé sur `state.run.animQueue`, posent classes via state local.
2. **Regroupement floating-numbers <120ms manquant** (limite dev #3) — illisibilité en combat dense. Fix : agrégation dans `CombatAnimationLayer` avant render.
3. **Séquence d'ouverture coffre final** (limite dev #5) — moment fort raté. Fix : phase locale dans `FinalChest` + flash + beam + branchement `CharacterCardDetailed` à la révélation.
4. **CharacterCardDetailed non branché dans FinalChest reveal** — la spec §4.6 le demande explicitement. Fix : remplacer `<ChestResult>` (App.tsx:4210) par `<CharacterCardDetailed>` quand `reward.kind === "character"`.

### Minor
1. **Mort boss : ralentissement 800ms + particules non câblé** — sensation "victoire boss" amoindrie.
2. **`render_game_to_text` n'expose pas `lootbox.phase`** (la phase est locale au composant) — gêne pour Playwright qui ne peut pas voir la phase courante. Fix optionnel : remonter la phase dans le state global.
3. **`open-lootbox.json` modifié** (skip-roulette ajouté) — le dev a respecté l'esprit mais le JSON V2 a été touché.
4. **Cas heal ennemi non câblé dans advanceCombat** (brief §4.3) — pas d'impact car aucun ennemi V2 actuel n'a d'intent heal.
5. **Barre de vie boss rendue dans EnemyCard** au lieu d'au-dessus du battlefield — interprétation brief §4.11.
6. **Pulse "wounded" CombatHero à 35% au lieu de 30%** — léger écart spec §4.4.
7. **Audit perf V3-T28 non mesuré** — à valider runtime.

---

## Risques de régression V2

- **`open-lootbox.json` modifié** : tout runner Playwright qui rejoue la suite V2 sans le skip va attendre `#lootbox-close` après 60 frames et le manquer (le bouton n'existera pas avant ~170 frames). Le dev a déjà patché le JSON, mais si un test externe utilise l'ancien format (frames: 60, sans evaluate), il timeout.
- **Test-actions hub-buy-lootbox.json + open-lootbox.json en chaîne** : à valider que le délai entre les deux laisse le pendingLootbox prêt et que `#lootbox-open` est bien rendu.
- **localStorage v3 sur navigateur ayant joué v2** : `normalizeSave` injecte les défauts (App.tsx:537, 598-599). Risque très faible.
- **animQueue jamais vidé si TICK pas appelé** : pendant un boss intro, `ageAnimQueue` est appelé (App.tsx:1665), donc OK. Pendant `pendingLootbox` ou `pendingBossRelics`, le combat est en pause mais runLocked → pas d'animQueue à âger.
- **Pulse `aura-low` continu sur boss en phase 2 + boss-hp-shimmer + chest-tier--runic dans hub** : 3 boucles infinite simultanées max, sous le cap 4. OK.
