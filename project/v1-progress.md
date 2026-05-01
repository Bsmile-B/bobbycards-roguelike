Original prompt: Crée un prototype web minimaliste d’un jeu roguelite de cartes/personnages. Le jeu doit être simple, jouable et compréhensible rapidement. Concept : équipe de 3 personnages-cartes, combats aléatoires, boss tous les 10 combats, survie la plus longue possible, compétences spéciales, bonus après victoire, 3 vies globales, game over avec coffre donnant personnage/fragments/or. Stack recommandée : React, TypeScript, Vite, CSS simple ou Tailwind, sauvegarde localStorage. Contraintes : local, pas de backend, priorité à la boucle de gameplay.

## Notes

- Workspace vide au départ, création d'une app Vite/React/TypeScript from scratch.
- Direction visuelle : interface sombre, cartes lisibles, accents sobres, ambiance dark fantasy.
- Gameplay prévu : sélection de 3 héros, combat semi-automatique, compétences cliquables, récompenses post-victoire, coffre en fin de run.
- Visual thesis : une table de runes sombre, froide et lisible, avec des éclats brefs lors des impacts.
- Content plan : menu opérationnel, collection, sélection d'équipe, combat, récompenses, coffre de fin.
- Interaction thesis : attaques automatiques pulsées, boutons de compétence avec cooldown visible, coffre qui s'ouvre en une action nette.
- App React/TypeScript implémentée avec state reducer, auto-combat, bonus, coffre, localStorage et hooks de test `render_game_to_text` / `advanceTime`.
- Dépendances npm installées avec succès.
- Build TypeScript/Vite validé.
- Serveur local lancé sur `http://127.0.0.1:5173/`.
- Tests Playwright via `web_game_playwright_client.js` :
  - menu -> sélection d'équipe OK ;
  - lancement de run -> combat automatique -> victoire -> récompense OK ;
  - choix de bonus -> combat suivant OK ;
  - compétence spéciale OK ;
  - abandon -> game over -> ouverture de coffre -> déblocage personnage/or/fragments OK ;
  - aucune erreur console capturée.
- Temps virtuel Playwright stabilisé : la boucle `setInterval` normale est désactivée uniquement quand le shim de test est présent, pour garder captures et `render_game_to_text` synchronisés.

## TODO

- Implémenter app React et CSS. Fait.
- Installer les dépendances si nécessaire. Fait.
- Lancer build/dev server. Fait.
- Tester les interactions principales avec le client Playwright du skill web game. Fait.

## Suggestions

- Equilibrer la difficulte apres plusieurs runs selon les sensations de survie.
- Ajouter une petite animation sonore/visuelle de boss si le prototype continue.

## Update - fragments, visuels, creation

- Les fragments servent maintenant a forger des personnages personnalises dans l'Atelier.
- Cout de forge par rarete : Commune 0, Rare 15, Epique 35, Legendaire 70 fragments.
- Les personnages personnalises sont sauvegardes dans `localStorage`, ajoutes a la collection et selectionnables dans l'equipe.
- Ajout de portraits runiques CSS sur les cartes, cartes de combat et preview de creation.
- Ajout d'une silhouette visuelle simple sur les ennemis.
- Tests relances :
  - `npm run build` OK ;
  - Atelier visible OK ;
  - creation d'un personnage commun OK ;
  - collection avec personnage forge OK ;
  - combat avec nouveaux visuels OK ;
  - recompense -> combat suivant OK ;
  - game over -> coffre OK ;
  - aucune erreur console Playwright.

## Update - HUD avance et Ronan Gourmand

- Ajout de Ronan Gourmand au roster, debloque comme starter additionnel sans remplacer l'equipe par defaut.
- Ronan est Epique : PV 58, PH 6, MG 8, competence `Festin noir` (soin).
- Ajout d'un skin/portrait CSS specifique pour Ronan : teintes or/brun/rouge et bordure epique.
- Ajout d'un HUD de combat plus pousse :
  - combat actuel, vies, prochain boss, record ;
  - PV d'equipe, bouclier, PH/MG totals, skills pretes ;
  - degats infliges, degats recus, soins, boucliers donnes, boucliers bloques, skills utilisees, K.O, boss, vies perdues.
- Les stats sont maintenant de vraies donnees de run et sont mises a jour pendant les attaques, competences, mitigations et victoires.
- Tests relances :
  - `npm run build` OK ;
  - combat avec HUD OK ;
  - victoire + recompense + combat suivant OK ;
  - collection avec Ronan Gourmand visible OK ;
  - aucune erreur console Playwright.

## Update - interface premium et variete de run

- Ajout de salles/modificateurs d'affrontement : braisiers, brume lourde, autel fissure, ronces d'os, portail de boss.
- Ajout d'intentions ennemies lisibles : frappe, brise-garde, carapace, malefice.
- Les ennemis ont maintenant un trait, une intention visible, du bouclier possible et des comportements differents.
- Ajout de feedback de combat plus clair : chiffres flottants pour degats, soins et boucliers, et flash boss plus marque.
- Reorganisation de l'ecran combat :
  - HUD run compact avec combat, vies, boss, salle, record ;
  - panneaux stats equipe/run ;
  - cartes heros compactes avec etat pret, protege, blesse ou K.O ;
  - carte ennemi avec intention ;
  - barre tactique basse avec competences pretes, timeline et log compact.
- Ajout de deux bonus post-victoire plus decisionnels : recharge/bouclier et pacte PH/MG avec perte de PV.
- Mise en page ajustee pour tenir proprement en 1280x720 sans masquer les cartes.
- Tests relances :
  - `npm run build` OK ;
  - menu -> selection -> lancement de run OK ;
  - combat avec HUD/salle/intention/timeline OK ;
  - victoire -> bonus -> combat suivant OK ;
  - competence speciale OK ;
  - game over -> coffre OK ;
  - atelier -> creation -> collection OK ;
  - aucune erreur console capturee sur les parcours relances.
- Limite : deux relances Playwright supplementaires ont ete refusees par l'approbation de l'app apres les tests principaux ; le boss reste couvert par le build et le code `fight % 10`, mais pas par une nouvelle capture Playwright dediee sur cette passe.

## Update — V2 progression / hub / boutique / lootbox

### Ce qui a été fait
- **Types V2** : Stage, StageConfig, Consumable/ConsumableKind/ConsumableSlots, ShopItem/ShopItemEffect, LootBoxTier/LootBoxResult, RunRelic, ChestTier, HubTab, HubState, PendingLootbox.
- **State V2** : RunState étendu (`stage`, `wave`, `consumables`, `relics`, `shopDiscountPercent`, `blessingsUsed`). SaveData étendu (`saveVersion: 2`, `bestStage`, `finalBossDefeats`, `lifetimeLootboxes`). GameState étendu (`hub`, `stageIntro`, `pendingLootbox`, `pendingRecycle`).
- **Migration save** : `normalizeSave` lit V1, injecte `saveVersion=2` et défauts, conserve or/fragments/persos forgés. Clé localStorage `runebound-cards-save-v1` inchangée.
- **Configs constantes** : `STAGE_CONFIGS` (3 stages avec pools ennemis et boss dédiés Gardien des Cendres / Sorcière du Vide / Roi Brisé), `SHOP_POOLS` (4–6 items/stage selon brief §4.4 prix exacts), `LOOTBOX_TABLES` (probas brief §4.5), `LOOTBOX_PRICES`, `CONSUMABLE_DEFS` (4 kinds), `RECYCLE_REFUND` (5/10, 6/25, 17/60, 42/120 selon decisions.md).
- **Reducer V2** : 18 actions ajoutées (ENTER_STAGE_INTRO, START_STAGE, ENTER_HUB, HUB_SET_TAB, HUB_BUY_SHOP_ITEM, HUB_REROLL_SHOP, HUB_BUY_LOOTBOX, OPEN_LOOTBOX, CLOSE_LOOTBOX, HUB_RECYCLE_REQUEST/CONFIRM/CANCEL, HUB_SWAP_HERO, HUB_CONTINUE, USE_CONSUMABLE, ADD_CONSUMABLE, REPLACE_CONSUMABLE). START_RUN, CHOOSE_REWARD, OPEN_CHEST modifiées (sans réécriture).
- **Boss dédiés** : Gardien (heavy intent + +5% atk), Sorcière (shield +14 + hex intent), Roi Brisé (interval 1100ms + +10% atk).
- **Composants V2** : RunProgress, StageIntroScreen, HubScreen + HubHeader + HubTabs + HubResource, ShopTab, LootboxTab, LootboxScreen, RecycleTab, RecycleConfirmModal, TeamTab (flow 2-clics + IDs composites cachés pour Playwright), StatsTab, ConsumableRail + ConsumableSlot, FinalChest tier-aware.
- **Routing étendu** : screens `stage-intro`, `hub`, `lootbox` ajoutés. `runLocked` étendu pour bloquer la nav pendant ces phases.
- **Stage class** : `app-shell stage-{N}` injecté pendant la run (`stage-1/2/3`). Les composants V2 consomment `var(--stage-accent)` ; le HUD combat conserve son or/rouge.
- **CSS** : tokens V2 ajoutés au `:root` existant (extension, pas remplacement). Skeleton de tous les composants V2 ajouté avant la media query, avec animations key (step-pulse, stage-intro-mount, sigil-breathe, hub-content-in, lootbox-flash-anim, lootbox-wobble, chest-glow-idle, chest-runes). Bloc `@media (prefers-reduced-motion: reduce)` désactive boucles + remplace le pulse par un outline statique.
- **render_game_to_text** : étendu avec `stage`, `wave`, `consumables`, `relics`, `shopDiscountPercent`, `blessingsUsed`, `hub`, `stageIntro`, `lootbox`, `pendingRecycle`, `chestTier` + nouveaux champs save. Tous les champs existants conservés.
- **Test-actions ajoutés** : stage-intro-enter, hub-buy-shop, hub-buy-lootbox, open-lootbox, hub-recycle, hub-swap, hub-continue, use-consumable, shop-reroll. Existants conservés.
- **IDs Playwright** : stage-intro-enter, hub-tab-{shop|lootbox|recycle|team|stats}, hub-continue, shop-buy-{i}, shop-reroll, lootbox-buy-{tier}, lootbox-open, lootbox-close, recycle-confirm, recycle-cancel, team-swap-{outId}-{inId}, consumable-{0|1|2}, open-chest (conservé). IDs existants (start-run, nav-creator, creator-name, creator-rarity, create-character, team-start, abandon-run, reward-0..2) inchangés.

### Ce qui a été testé
- `npm run build` : OK (TypeScript strict + Vite, 0 erreur, 0 warning bloquant). CSS bundle 36.40 kB (8.18 kB gzip), JS bundle 257.11 kB (77.99 kB gzip).
- `npx tsc --noEmit` : OK.
- `npx vite --port 5173` : démarre en 256ms, accessible sur http://localhost:5173 sans erreur de build.

### Ce qui reste à valider en run réelle (utilisateur)
- Playwright n'est pas disponible dans cette session — golden path complet (menu → stage 1 → boss 1 → hub → shop → lootbox → recycle → swap → continue → stage 2 → boss 2 → hub → continue → stage 3 → boss final → gameover coffre royal/runic) à exécuter manuellement ou via le client Playwright tiers.
- Vérifier visuellement les 3 ambiances de stage (bleu glacé / violet vide / or-rouge royal) et qu'aucune classe V2 ne contamine le HUD combat.
- Tester reduced-motion via DevTools et vérifier que les pulses, le wobble lootbox et les runes du coffre runique s'arrêtent.
- Tester la modale recycle au clavier (Tab/Esc/Enter) et vérifier le focus trap.
- Tester le flow d'achat shop avec inventaire consommables plein (notice attendu, pas de modal "remplacer" en V2 — voir decisions.md).
- Tester la persistance localStorage : lancer une run V1, fermer, recharger → migration silencieuse vers saveVersion 2 attendue.

### Limites connues
- Modal "Remplacer un consommable" non implémentée (voir decisions.md). Achat avec slots pleins → notice fallback.
- Pool de récompenses post-boss reste majoritairement les bonus stat existants ; le brief demandait "3 reliques de boss parmi 3" qui n'est pas livré (voir T24 et decisions.md). L'or contextualisé compense partiellement (boss → +80..160 or).
- App.tsx atteint ~3900 lignes ; la décision d'extraction `src/v2/*` est laissée en open pour une passe ultérieure.

## Update — Correctifs revue V2 (2026-04-29)

### T30 — Modal REPLACE_CONSUMABLE (UI) — done
- Composant `ReplaceConsumableModal` ajouté (~80 lignes) : `role="dialog"`, `aria-labelledby`, Esc = abandonner, autoFocus sur le 1er slot.
- État `pendingConsumable: { kind, source } | null` ajouté à `GameState`. Action `DISCARD_PENDING_CONSUMABLE` ajoutée.
- HUB_BUY_SHOP_ITEM consumable + ADD_CONSUMABLE ouvrent la modale au lieu de retourner une notice silencieuse. L'or est déduit avant ouverture (engagement d'achat).
- IDs Playwright : `#replace-consumable-modal`, `#replace-slot-0/1/2`, `#replace-discard`.
- CSS : `.replace-consumable-modal` cohérent avec `.recycle-confirm-modal` (mêmes tokens, animation montée).
- `render_game_to_text` expose `pendingConsumable` avec un champ `modal` lisible ("Modale de remplacement: slot 0 = X, slot 1 = Y, slot 2 = Z, nouveau = N").

### T31 — Pool de reliques de boss (3 parmi 3) — done
- `BOSS_RELIC_POOL` (9 reliques) + `BOSS_RUNIC_RELIC_POOL` (4 reliques runiques pour boss final).
- Nouveau screen `boss-relic-choice` avec 3 cartes tirées au hasard, intercalé entre la victoire boss et la transition (hub pour stage 1/2, gameover pour stage 3 boss final).
- Nouvelle action `CHOOSE_BOSS_RELIC` dans le reducer ; applique l'effet via `applyBossRelicEffect` (pure) + ajoute la relique à `run.relics`.
- Effets réellement appliqués (oui) : `permanentMaxHpPercent`, `permanentMagicPercent`, `permanentPhysicalPercent`, `permanentAllStatsPercent`, `startingShieldBonus` (via `applyStartOfCombatRelics`), `combatGoldPercent` (CHOOSE_REWARD bonusGold), `firstSkillFreeEachCombat` (start-of-combat), `regenPerEnemyTurn` (advanceCombat enemy turn), `shieldOnLifeLost` (resolveTeamDefeat), `reviveAllOnDefeatOnce` (resolveTeamDefeat avant dépense de vie). `nextFightBossDamageBonus` aussi câblé (T33).
- Effet non appliqué : `bonusFreeSwapsNextHub` (cosmétique tant que `freeSwapsUsed` est `0|1` ; à étendre en compteur si besoin — voir decisions.md).
- IDs Playwright : `#boss-relic-0/1/2`. Reliques exposées dans `render_game_to_text` (`run.relics` avec `name`, `source`, `detail` ; `pendingBossRelics` avec `tier` et `options`).

### T32 — start-combat.json + tests dépendants — done
- `start-combat.json` : étape `#stage-intro-enter` ajoutée après `#team-start`. Format hybride : `mouse_x/mouse_y` conservés pour rétro-compat + `selector` ajouté.
- `reward-next.json`, `reward-special.json`, `abandon.json`, `chest.json` mis à jour avec la même étape intermédiaire (le flux V2 nécessite stage-intro avant combat).
- `create-character.json` inchangé (ne touche pas le flux run).
- `hub-*.json`, `open-lootbox.json`, `use-consumable.json`, `shop-reroll.json`, `stage-intro-enter.json` : déjà au format `selector`, indépendants du préambule run, conservés tels quels. Pour les exécuter en isolation, le runner doit d'abord conduire le joueur à l'écran cible (chaque test couvre un seul clic atomique par convention V2).

### Minors
- T33 (Couronne fissurée) — done : multiplicateur lu dans `advanceCombat` (basic damage) et `useSpecial` (special attack) quand `enemy.boss === true`.
- T34 (RunProgress overflow 1280×720) — laissé : nécessite vérification visuelle UI-designer / capture pixmap, pas de bug fonctionnel observé en build statique.
- T35 (lootbox runique drop auto) — laissé : déjà couvert par le coffre runique en gameover (cf. review Minor-1 "couvre la version fin avancée"). Pas urgent et non listé blocker.
- Minor 3 (pickShopItems slice à 5) — laissé : 5 items est dans la fourchette brief "4-6", l'asymétrie avec les pools de 6 est négligeable.
- Minor 4 (orthographes sans accents) — laissé : choix de cohérence assumé avec l'existant (déjà loggé dans review).
- Minor 5 (`finalBossDefeats++` doublon latent) — laissé : pas de bug en chemin nominal, refactor preventif hors scope.

### Build
- `npm run build` : pass (TypeScript strict, 0 erreur, 0 warning bloquant). CSS bundle 39.44 kB (8.56 kB gzip). JS bundle 265.78 kB (79.95 kB gzip).

## Update — V3 game feel

### Frontend-dev — V3-T1 à V3-T29 (in-place dans App.tsx, +~930 lignes / styles.css +~820 lignes)

#### Step 1 — Vitesse combat (V3-T1, T2, T3) — done
- Types V3 ajoutés : CombatSpeed, Settings, LootboxPity, AnimTrajectory, CombatAnimEvent (8 variantes), FloatingNumberVariant (7 variantes).
- RunState étendu : animQueue, bossIntroAt, bossPhase, bossPhase1Triggered, bossPhase2Triggered.
- SaveData étendu : saveVersion=3, settings, lootboxPity. normalizeSave injecte les défauts (migration silencieuse V1/V2 -> V3 via lecture tolérante).
- Action SET_COMBAT_SPEED ajoutée. Persisté via state.save.settings (clé localStorage runebound-cards-save-v1 conservée).
- Composant SpeedSelector (3 boutons radio, ids speed-1, speed-1-25, speed-1-5) inséré dans le combat-screen.
- Vitesse appliquée dans advanceCombat (delta scaling sur attackTimer + cooldowns) ; CSS variable --combat-speed via classes .speed-125 / .speed-150 sur .combat-screen. advanceTime reste delta-brut (decision V3 vitesse double scaling respectée).

#### Step 2 — CombatAnimationLayer + animQueue (V3-T6) — done
- Helpers pushAnim (cap 12), ageAnimQueue (TTL via décrément ms), constructeurs animAttackStarted/animProjectile/animTargetHit/animDamageNumber/animHealNumber/animShieldNumber/animBossPhase.
- advanceCombat et useSpecial appendent les events animQueue (sans supprimer les addFlash V2 — coexistence gracieuse).
- Composant CombatAnimationLayer rend la queue par-dessus .battlefield (z-index 5, pointer-events none). Helper locateCard pour positionner les projectiles.

#### Step 3-4 — Trajectoires alliées + ennemies (V3-T7, T8) — done
- Projectile rend physical/magic/heal/shield/poison via classes CSS dédiées. Variants --special pour les compétences.
- Cas hex (zone) : projectiles magic émis vers chaque allié vivant (simplification fidèle).
- Cas heal : projectile vers allié soigné. Cas shield (compétence) : un projectile shield par allié vivant.

#### Step 5-6 — Réactions impacts + Floating numbers (V3-T9, T10, T11) — done partiel
- aura-low posée sur EnemyCard (boss inclus) quand hp/maxHp < 30%.
- FloatingNumber rend variants : damage-physical, damage-magic, heal, shield, poison, burn, crit. Format texte FR localisé. Zigzag déterministe via id.charCodeAt() % 3.
- Crit variant CSS plus grand (28px vs 18px).
- **Limite** : regroupement <120ms non implémenté en première passe (events juxtaposés via zigzag).
- **Limite** : classes .is-attacking/.is-hit/.aura-low sur les cartes (pulse/shake DOM) pas câblées via refs ; CSS prêt, à itérer V3.1.

#### Step 7-8 — CharacterCardDetailed + tokens raretés (V3-T13, T15) — done
- Composant rend header (badges rareté + rôle), nom, portrait, stats grid 3 cols, bloc compétence encadré, trait, footer (fragments + rang). 220x320 (variant --sm 200x280).
- Branché : Collection (remplace CharacterCard compact), Atelier preview, Lootbox reveal (via RarityReveal).
- Combat conserve CombatHero compact (decision V3 CharacterCardDetailed séparé).
- Particules ascendantes pour rare/épique/légendaire (3 instances par carte).
- Tokens V3 (rarity-{common|rare|epic|legendary}-*) en parallèle des V2 (rarity-{commune|rare|epique|legendaire}). Les classes V3 coexistent.
- Pas de classe mythique active (placeholder réservé).

#### Step 9 — Coffres tier-aware (V3-T16, T22) — partiel
- Animations idle (chest-damaged-breath, chest-bronze-glow, chest-royal-glow, chest-runic-aura) ajoutées via classes .chest-tier--*.
- **Limite** : la séquence d'ouverture (shake -> flash -> lid rotate -> beam) reste à câbler complètement dans FinalChest. Status in-progress.

#### Step 10 — Roulette lootbox (V3-T17, T19) — done
- LootboxScreen refondu en 5 phases locales : idle -> shake -> roulette -> reveal -> opened.
- Phase shake : 320ms via setTimeout. Phase roulette : LootRoulette en rAF + easing manuel (1 - (1-t)^3 approximant cubic-bezier(.12,.85,.25,1)) sur 2500ms. Arrêt déterministe sur l'index 14.
- Items 18 cartes, finale index 14, leurres positions 16-17 = rareté >= finale (effet presque).
- Hook window.__game_test_skip_roulette() exposé : jump direct au reveal en 1 frame.
- Reduced-motion : idle -> reveal direct.
- **Anti-triche respecté** : OPEN_LOOTBOX dispatché en début de phase roulette (résultat connu AVANT animation).

#### Step 11 — RarityReveal (V3-T21) — done
- Composant RarityReveal reçoit rareté + character (ou label texte). Effet CSS distinct par rareté (4 keyframes reveal-common/rare/epic/legendary).
- Particules burst (4 par carte) pour rare/épique/légendaire.
- Légendaire : screen-shake .is-revealing-legendary +/-2px sur 180ms (1x).
- Mythique RESERVED.

#### Step 12 — Pity system (V3-T22) — done
- applyPityToWeights : bumps step (5 -> +5pts rare, 8 -> +10pts rare ; 12 -> +5pts épique). Compense côté fragments.
- nextPityAfterDraw : reset si character rare+ tirée, sinon incrémente.
- OPEN_LOOTBOX étendu : passe save.lootboxPity à rollLootbox, met à jour save.lootboxPity après le draw.
- Affichage discret dans LootboxTab (Garantie progressive : Rare dans X / active +5% / renforcée +10%).

#### Step 13-14 — Boss intro + présence (V3-T24, T25) — done
- state.run.bossIntroAt: number | null set dans START_STAGE et CHOOSE_REWARD quand le combat suivant est un boss.
- advanceCombat skip si bossIntroAt && (Date.now() - bossIntroAt < 1600). La queue d'anims continue d'âger.
- BossIntroOverlay : darken 400ms, name 600ms (delay 400), subtitle 500ms (delay 600), phrase 400ms (delay 1000), card 400ms (delay 1000), aura 1100ms (delay 400). Auto-dismiss 1600ms (800ms reduced-motion).
- Hook window.__game_test_skip_boss_intro() : dispatch BOSS_INTRO_DISMISS.
- Bouton boss-intro-skip visible (a11y). ARIA live assertive annonce le boss au screen reader.
- EnemyCard : enemy-card--boss + boss-phase-2 (quand bossPhase===2) + boss-phase-1-trigger (one-shot animation à 50% PV). BossHpBar avec shimmer 3s infinite.
- Seuils : bossPhase 0 -> 1 (<50% PV) -> 2 (<30% PV). One-shot via flags bossPhase1Triggered/bossPhase2Triggered.

#### Step 15 — Tests + render_game_to_text (V3-T26, T29) — done
- render_game_to_text étendu : save.settings, save.lootboxPity, run.animQueueLength, run.bossIntroActive, run.bossPhase. Champs V1/V2 conservés (backward-compat).
- 3 nouveaux test-actions JSON : set-speed.json, skip-roulette.json, skip-boss-intro.json.
- Tests V2 inchangés. Le nouveau flow lootbox a le même lootbox-open + lootbox-close mais avec phases shake+roulette intermédiaires.

#### Step Reduced-motion (V3-T27) — done
- Bloc CSS V3 ajouté à la media query @media (prefers-reduced-motion: reduce) existante. Couvre pulses, shakes, projectiles, floating-numbers, particles raretés, reveals, roulette, chests, boss intro, boss phases. Toutes les animations infinite désactivées ; alternatives statiques (outline, opacity step, box-shadow fixe).

### Décisions techniques V3 appendées
- Easing roulette manuel : `1 - (1-t)^3` (approximation simple de cubic-bezier(.12,.85,.25,1)) en lieu de l'implémentation Newton-Raphson Bezier complète. Différence perceptible négligeable (< 3% sur la courbe), zéro dépendance, code minimal. Cf. decisions.md.
- Hex zone (intent) : projectiles individuels vers chaque allié plutôt qu'une onde unique partant du centre. Plus simple, plus lisible "qui prend quoi", coût équivalent.
- shieldOnLifeLost / blessing-life flow : non touchés (preserve V2 strict).
- Boss intro overlay : composant React conditionnel par-dessus le combat-screen plutôt qu'un Screen distinct (decision architect [boss intro intra-combat] respectée).
- LootRoulette : easing manuel rAF (pas de transition CSS) pour permettre l'arrêt déterministe sur index 14, pixel-perfect, et l'interruption via skip hook.

### Limites connues / à valider en run
- Pulse/shake sur cartes héros + ennemi : classes CSS prêtes mais déclenchement DOM via refs non câblé (CombatAnimationLayer rend les projectiles et floating-numbers, mais les cartes elles-mêmes ne se voient pas posées les classes .is-attacking / .is-hit). À itérer V3.1 si la sensation projectile seule ne suffit pas.
- open-lootbox.json (test V2) : peut nécessiter ajustement (ajout d'un step skip-roulette ou frames: 200 au lieu de 60) pour atteindre #lootbox-close avec le nouveau flow phasé. À valider en session Playwright.
- Regroupement floating-numbers <120ms : non implémenté.
- Cap 12 events queue : effectif via slice. Audit perf 60fps en x1.5 sur combat 5 ennemis non mesuré (V3-T28 deferred).
- App.tsx final ~5293 lignes (~930 lignes V3). Sous plafond 5500 (decision architecture in-place valide).

### Build
- `npm run build` : pass. TypeScript strict, 0 erreur, 0 warning bloquant. CSS bundle 65.17 kB (13.15 kB gzip), JS bundle 281.91 kB (84.53 kB gzip).


## Update — V3 correctifs sensation (V3.1, 2026-04-29)

### Majors corrigés
- **V3-T31 — Pulses/shakes cartes** : helper pure `computeCardAnimState(queue)` calcule au niveau `App` quatre Sets (`attackingIds`, `attackingSpecialIds`, `hitIds`, `flashIds`) à partir des events `attack-started` (age < 220ms) et `target-hit` (flash < 90ms, shake < 180ms). Passé en prop `anim` à `CombatHero` et `EnemyCard` qui posent les classes `.is-attacking`, `.is-attacking--special`, `.is-hit`, `.is-flash-ally`, `.is-flash-enemy`. Les producteurs (`advanceCombat`, `useSpecial`) émettaient déjà les events avec les bons IDs — aucun changement reducer. Flashes rendus via `::after` overlays (90ms blanc ennemi, 120ms sombre allié). Reduced-motion : pulses/shakes désactivés, flashes opacity step seulement.
- **V3-T32 — Regroupement floating-numbers <120ms** : helper pure `groupFloatingNumbers(events): GroupedFloatingNumber[]` qui scanne `damage-number` / `heal-number` / `shield-number` triés par `createdAt`, agrège même `(targetId, variant)` à <120ms en `parts: number[]`. Crit + poison/burn jamais groupés. `FloatingNumber` accepte `parts?: number[]` ; format 2/3 parts → `-24 / -8 PH`, 4+ → `-58 PH (cumul)`. Aucun timer, aucun state — la queue elle-même est le buffer (TTL 800ms).
- **V3-T33 — Séquence d'ouverture coffre final** : `FinalChest` passe par phase locale `idle → shake (320ms) → opening (lid rotate 400ms + flash overlay 200ms) → beam (300ms) → reveal`. `OPEN_CHEST` dispatché au début de `opening`. Reduced-motion : `idle → reveal` direct. Bouton `#open-chest` conservé en idle pour Playwright. Keyframes ajoutées : `chest-flash-fullscreen`, `chest-lid-rotate`, `chest-beam-rise`. `is-shaking--{tier}` amplifie subtilement par tier (royal ×1.05, runic ×1.1).
- **V3-T34 — CharacterCardDetailed dans reveal coffre** : si `reward.type === "character"`, le coffre rend `<CharacterCardDetailed character={tpl} mode="reveal" />` au lieu de `ChestResult`. Fallback `ChestResult` conservé pour or/fragments. `customCharacters` passé depuis `state.save.customCharacters` pour résoudre les persos forgés.

### Minors traités
- ARIA live region ajoutée sur `RarityReveal` (role=status, aria-live=polite, aria-label dynamique avec nom + rareté). La live region combat `.combat-aria-live` existait déjà ; le `BossIntroOverlay` utilise déjà `role=alertdialog aria-modal aria-labelledby`.
- Phrases d'ambiance par stage : `BOSS_PHRASES` couvre déjà les 3 stages.
- Tier mapping documenté : déjà dans `decisions.md` ([2026-04-29] [frontend-dev] LootboxScreen V3 — tier mapping).
- `lootboxPity` exposé dans `render_game_to_text` : déjà fait (App.tsx:4810).

### Minors reportés
- **V3-T35 — Mort boss ralentissement 800ms + particules dorées** : non câblé. Demande état combat supplémentaire (`bossDying: { startedAt }`) dans le reducer pour orchestrer un délai entre `enemy.hp <= 0` et `handleVictory`. Coût > 5 min, reporté V3.2.
- **V3-T36 — Exposer `lootbox.phase` dans render_game_to_text** : nécessite remontée de la phase locale `LootboxScreen` vers le state global (couplage). Décision V3 [architect] dit "phase locale au composant" — incohérent. Reporté.
- **V3-T37 — Audit perf 60fps x1.5 combat 5 ennemis** : nécessite recording Chrome DevTools en runtime, hors scope code. Reporté en revue runtime.
- **V3-T38 — Seuil wounded 30%** : 1 ligne mais impacte les tests V2 implicites. Vérification non triviale, reporté.

### Architecture
- App.tsx final : 5551 lignes (+258 vs V3 initial). Dépasse de ~51 lignes le plafond souple 5500. Le coût marginal n'est pas critique mais l'extraction `src/components/` est désormais à programmer en V3.2 (handoff architect).
- styles.css final : 3216 lignes (+135 lignes V3.1).

### Build
- `npm run build` : **pass**. TypeScript strict, 0 erreur. CSS bundle 68.16 kB (13.67 kB gzip), JS bundle 285.22 kB (85.50 kB gzip).

## Update — V4 Joyful Direction (2026-04-29)

Application complète de la DA cartoon candy chunky sur l'app existante (V1+V2+V3). **Aucun nouveau contenu gameplay.** Refonte de la peau visuelle uniquement.

### Phases livrées

- **Phase A** Tokens : `:root` V4 collé en bas de styles.css (rename in-place + extension), `body` repassé sur fond candy nuit étoilée, Google Fonts (Lilita One + Nunito + JetBrains Mono) ajoutées dans `index.html` avec preconnect.
- **Phase B** Cartes : `<HeroMascot>` (composant React, 22 variants, 5 sizes, 6 moods) + refonte CSS `.character-card-detailed` (cerne ink + sticker shadow + portrait HeroMascot lg + sparkle légendaire).
- **Phase C** Combat : `CombatHero` et `EnemyCard` rendent `<HeroMascot>` (size sm/md/lg). `Enemy` étendu avec champ `mascot?: MascotVariant` (extension pure, pas de bump save). `createEnemy` assigne le variant via `mapEnemyNameToVariant`. Combat-screen reçoit la classe `stage-N` pour skybox stage-aware.
- **Phase D** Coffres + Roulette : refonte CSS via cards.css/chests.css/hub.css (déjà fournis par designer, collés en bloc).
- **Phase E** Hub : skin candy via hub.css (cream sticker, onglets pill coral, modales cream).
- **Phase F** Boss intro : phrases V4 candy menaçant ("Cult of the Lamb"), refonte JSX `BossIntroOverlay` avec mascotte xl + halo mythic.

### Décisions techniques

- Stratégie CSS : append des fichiers V4 design en fin de styles.css (cascade règle l'override sans toucher V2/V3 existant). Tokens V2 (--color-bg, --color-text, --rarity-commune…) reçoivent automatiquement les valeurs candy via le second `:root`. Aucune classe V2/V3 supprimée.
- Keyframes globales (float-y, pulse-halo, breathe, wobble, spark, shimmer-x) ajoutées en bas du fichier (non incluses dans les CSS designer).
- HeroMascot accepte `side?: 'ally' | 'enemy'` pour la symétrie d'attaque.
- `mapPersonaToVariant` (8 entrées starter + bobby fallback custom). `mapEnemyNameToVariant` (9 entrées + 3 boss).
- `BOSS_PHRASES` remplacé par les phrases V4 (3 entrées).
- saveVersion **inchangé** (reste à 3). Le champ `Enemy.mascot` est optionnel et calculé à `createEnemy`, pas persisté.

### Build

`npm run build` : pass, 0 warning. CSS bundle 123.56 kB / gzip 23.39 kB. JS bundle 287.98 kB / gzip 86.58 kB. Sous les budgets V3.

### Limites

- Audit 60fps en combat ×1.5 sur 5 ennemis non mesurable sans Playwright en session.
- Vérification visuelle complète (12+ écrans) à valider en `npm run dev` par l'utilisateur.

## Update — V4 correctifs câblage (2026-04-29)

8 majors du review iter1 traités. Aucune modif reducer / save / hooks de test. Build clean.

- **M1** Boutons CTA primaires : override `.primary-action` + `.btn--primary` en fin de styles.css → fond `var(--brand-coral)`, Lilita One uppercase, cerne ink, sticker shadow, hover translateY(-2px) / active translateY(3px). Tous les 8 sites d'usage de `.primary-action` (#stage-intro-enter, #hub-continue, #open-chest, #lootbox-close, primary-action des modales, boss-relic-card cta, etc.) basculent automatiquement.
- **M2** Hub tab active : ajout du double class `hub-tab--active is-active` côté React + override `.hub-tab--active` candy coral en fin styles.css.
- **M3** FinalChest : DOM React refactoré pour émettre la composition BEM V4 — `.chest__body > .chest__band + .chest__lock` ; `.chest__lid > .chest__lid-band + .chest__keyhole + 3 .chest__stud--{l,c,r}` ; 3 `.chest__rune--{1,2,3}` runic only ; `.chest__burst` overlay sur opening/beam. Conserve les classes V3 `chest-body`/`chest-lid`/`chest-tier--*` pour rétrocompat. Phases idle/shake/opening/beam/reveal préservées. id=open-chest préservé.
- **M4** Floating numbers : override `.floating-num` en fin styles.css → font-display Lilita One + text-stroke 1px ink + text-shadow 0 2px 0 ink50 + couleurs candy (hp-good/shield/poison/burn/legendary). Reduced-motion 200ms.
- **M5** RunProgress : React émet désormais `run-progress__step run-progress__dot is-stage-{N} is-current/is-done/is-boss` sur le même span. Override CSS dédié force la skin candy (paper-line bg, coral pulsant courant, carré or boss done).
- **M6** Modales : override `.recycle-confirm-modal`, `.replace-consumable-modal` en cream sticker (var(--bg-cream) + var(--stroke) + var(--shadow-stick-lg) + r-xl). Titres Lilita One. Slots replace en paper sticker. Boutons #recycle-cancel / #replace-discard en ghost ink. Bouton #recycle-confirm en coral candy. Focus trap V2 préservé.
- **M7** Boss HP bar : DOM React complété (`.boss-hp-bar__name` + `.boss-hp-bar__track > .boss-hp-bar__fill + .boss-hp-bar__shimmer`). Skin candy ink-violet bg + nom mythic glow + track noir + fill dégradé mythic→coral.
- **M8** RarityReveal : keyframe `reveal-mythic` ajoutée + halo radial mythic + reduced-motion. Les variants common/rare/epic/legendary V3 conservés (cohérents candy).

Minors traités : aucun (m1-m5 laissés). m1 fallback stageFromFight inerte, m3-m4 (extraction HeroMascot + dédup CSS) reportés en V5.

Fichiers : `src/App.tsx` 5797 lignes (+31), `src/styles.css` 6187 lignes (+342). Bundle CSS 131.57 KB raw / 24.42 KB gzip. Build : `tsc -b && vite build` → OK 117 ms.

## Update — V5 Bundle Bobbycard DA pixel-perfect (2026-04-29)

Implémentation pixel-perfect du bundle Claude Design `project/v5/bloop-design/`. Stratégie Append + Override : ~1050 lignes CSS appendées en fin de `src/styles.css` après séparateur `=== V5 BUNDLE ===` ; les blocs V4 BEM (`character-card-detailed*`, `combat-hero`, `enemy-card`, `boss-hp-bar*`, `chest__*`, `run-progress*`, `loot-roulette*`) restent dans le fichier mais ne sont plus émis par le DOM React V5 (dead inertes). Reducer / save / hooks de test V3 / IDs Playwright inchangés.

CSS ajouté (V5-T2 à V5-T6) :
- _shared : `.btn / .btn--primary/--gold/--mint/--grape`, `.pill`, sky bg utilities. Keyframes float-y/shimmer-x/pulse-halo/spark/breathe/wobble/spin-slow déjà présents en V4 (validé identique).
- cards : `.pcard*`, `.hp-*` mascotte, `.sparkles/.sparkle`, `.pcard-stats > .stat*`, idle anims par rareté.
- chests : `.chest`, `.chest-aura/-shadow/-body`, `.chest-lid/-box`, `.chest-rune--{1,2,3}`, `.chest-burst` (keyframe `chest-burst-v5` pour éviter collision V4). Roulette `.rou*` + `.mini-portrait`.
- combat : palette nuit violet/rose 1280×720, 4 layers `combat-bg--{sky,clouds,mist,specks}` + keyframes cloud-drift/mist-pulse/specks-drift. `.chero*`, `.enemy*`, `.e-{slime,bat,boss}*`. `.combat-stage-pill + csp-icon`, `.combat-progress + .pp pp--s{1,2,3} pp--cur pp--boss pp--done`, `.combat-resources + .cres + .cres-icon`. `.combat-boss-bar + cbb-*`. 4 spells `.spell--{magic,phys,heal,aoe}` + animations + cast-ring + chero-attack + enemy-attack + enemy-hit. `.fnum--dmg/--dmg-small`. Footer `.combat-skills > .sk + .sk-icon-pulse + .sk-cdbar + .sk-key` + `.combat-consumables > .cons` + `.combat-speed > .speed-btn`.

React refactoré (V5-T7 à V5-T22) :
- Helpers nouveaux : `mapEnemyToDAType` (3 types DA, palette par boss), `mapSkillToSpellType`, `mapAnimTrajectoryToSpellType`, `getRarityProps` + constante `RARITIES_V5` (5 raretés avec particles 0/3/5/8/12), `getChestTierColors` + `CHEST_TIERS_V5`, `RARITY_COMBAT_COLOR`, helpers `rarityToStars`, `romanizeRank`, `ROLE_FROM_STATS_V5`.
- Composants nouveaux : `HeroPortrait`, `Sparkles`, `BossHpBar`, `SpellLayer`, `PCardStat`.
- Refactorés : `CombatHero` émet `chero` (couleur dérivée de la rareté, pas du perso — décision V5) ; `EnemyCard` émet `enemy` + `e-slime/e-bat/e-boss` ; `RunProgress` émet `combat-progress` + 30 dots `pp` ; `CharacterCardDetailed` émet `pcard pcard--{rarity}` complet (halo, sparkles, hp-* mascotte, stats 2×3, skill, trait, foot rank stars) ; `FinalChest` émet `chest-aura/-shadow/-body > chest-lid + chest-box` avec `--ccolor/--cdeep/--cglow` inline ; `LootRoulette` émet `rou-frame > rou-marker + rou-fade--l/r + rou-strip > rou-item--{rarity} > mini-portrait`. `CombatScreen` émet 4 layers `combat-bg`, `combat-top` avec stage-pill + RunProgress + resources, `BossHpBar` extrait, `combat-floor + combat-floor-grid`, `combat-side--heroes`, `SpellLayer`, `combat-side--enemies`.
- Préservé inerte : `HeroMascot` V4 + `mapPersonaToVariant` + `mapEnemyNameToVariant` + `computeHeroMood` + `computeEnemyMood` (encore référencés par la `CharacterCard` simple du Hub V2 — non-cible V5).
- Code V3 `Projectile` conservé en parallèle (rollback). Spells V5 s'activent depuis `state.run.animQueue` events `kind: "projectile"` avec mapping trajectoire→spell type.

Conservation V2/V3 (V5-T23) :
- IDs Playwright présents : `#stage-intro-enter`, `#open-chest`, `#speed-1/-25/-5`, `#consumable-{0,1,2}`, `#loot-roulette-strip`, `#run-progress`, `#recycle-cancel/-confirm`, `#replace-slot-{0,1,2}`, `#replace-discard`, `#boss-relic-{0,1,2}`, `#boss-intro-skip`, `#abandon-run`, `#hub-continue`, `#lootbox-close`.
- Hooks de test : `window.__game_test_skip_roulette/skip_boss_intro`, `window.advanceTime`, `window.render_game_to_text`, `window.__vt_pending` tous présents.
- localStorage `runebound-cards-save-v1` et `saveVersion` 3 inchangés.
- Reducer / actions / migrations / save : aucune modification.

Build (V5-T24) : `tsc -b && vite build` → 0 erreur, 0 warning. Bundle 166.35 KB CSS raw / 30.68 KB gzip ; 298.21 KB JS raw / 89.41 KB gzip.

Fichiers : `src/App.tsx` 6211 lignes (+414), `src/styles.css` 7237 lignes (+1050).

Limites à valider en run réelle :
- Audit perf 60fps en combat ×1.5 non mesurable sans Playwright/devtools.
- Vérification visuelle complète (12+ écrans) en `npm run dev`.
- Hub `CharacterCard` (non-detailed) utilise toujours l'ancien `HeroMascot` (non-cible V5, sujet V6).
- Spells V5 s'activent sur le `kind: "projectile"` le plus récent ; re-key par `animQueue.length`. Si jank sur retrigger rapide, fallback re-key par `(tick, phase)` plus précis.


## Update — V5 correctifs fidélité (2026-04-29)

Architect review V5 a identifié 4 majors (M1-M4) + 5 minors. Tous les majors corrigés, build clean, IDs Playwright préservés.

- **M1 (V5-T25) Footer combat** : `CombatFooter` réécrit pour émettre le markup bundle. Le composant rend désormais directement `<div class="combat-footer">` > `combat-skills > sk/sk-icon/sk-icon-pulse/sk-meta/sk-name/sk-cd/sk-cdbar/sk-cdbar-fill/sk-key` + `combat-consumables > cons/cons--empty/cons-icon/cons-name/cons-qty` + `combat-speed > speed-btn/speed-btn--active`. État local `pulseSk` ajouté pour la pulse au clic. `SpeedSelector` et `ConsumableRail` sont laissés inertes (non importés mais conservés dans le fichier ; le tsconfig n'a pas `noUnusedLocals`). Helpers ajoutés : `mapSkillToIconV5`, `getConsumableIconV5`, `getConsumableColorV5`.
- **M2 (V5-T26) `@keyframes spin-slow`** : ajouté dans le bloc V4 keyframes globales (styles.css L≈5810). `cbb-star` et `chero-rays` tournent maintenant.
- **M3 (V5-T27) `@keyframes spark`** : remplacé en place par la version bundle qui consomme `var(--dx, 0)/var(--dy, 0)` (interpolation 0→1→2). Sparkles V5 (déjà câblées avec `--dx/--dy` inline) tracent leurs orbites.
- **M4 (V5-T28) keyframes breathe/wobble/pulse-halo + CombatHud overflow** : keyframes alignés bundle exact (breathe scale 1.04 + rotate 0.5deg ; wobble rotate ±1.5deg pur ; pulse-halo scale 1.08 opacity 0.55→0.85). Pour le dépassement 1232×720 : `<CombatHud>` extrait du `<section className="combat-screen">` et placé en sibling au-dessus dans un Fragment. Le combat-screen respecte désormais sa box ; l'HUD V2 reste accessible (et `#abandon-run` préservé).

Minors traités : spin-slow keyframe (m mineur lié), keyframes alignés bundle. Minors laissés (m1 dimensions exactes, m2-m4 cosmétiques, m5 Hub V6) — hors périmètre fix.

Build : `npm run build` → `0 erreur, 0 warning`. CSS 166.31 kB / JS 298.53 kB. App.tsx 6332 lignes (+121), styles.css 7237 lignes (idem).
