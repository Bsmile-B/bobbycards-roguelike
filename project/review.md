# Revue — itération V2 (cadrage progression / hub / boutique / lootbox)

## Résumé

Globalement OK avec réserves. Le scope est couvert sur le quoi (3 stages, hub, boutique, lootbox, recyclage, équipe, consommables, coffre tier-aware), avec quelques écarts assumés par le dev (T24 in-progress, modal REPLACE_CONSUMABLE absent) et un trou réel sur le pool de récompenses post-boss (les "3 reliques de boss" du brief §10). Aucun blocker structurel — la livraison est exécutable, mais 2-3 ajustements tactiques sont nécessaires avant de la déclarer "done".

---

## Audit checklist

### Brief §1 — 3 stages
- 3 stages déclarés : ✓ `STAGE_CONFIGS` à App.tsx:645-685.
- Boss dédiés : ✓ "Gardien des Cendres" L655, "Sorciere du Vide" L668, "Roi Brise" L681. ⚠ orthographes sans accent ("Sorciere", "Brise") — assumé ASCII pour cohérence avec l'existant, à confirmer avec l'utilisateur (mineur).
- Boss = vague 10/20/30 : ✓ `createEnemy` L1010 utilise `boss = fight % 10 === 0` et pioche `STAGE_CONFIGS[stageFromFight(fight)].bossName`.
- Pool ennemis stage-spécifique : ✓ L650-653, 663-666, 676-679.

### Brief §2 — Progression visuelle
- RunProgress 3×10 + 2 hubs : ✓ App.tsx:2551-2611, `Array.from({length: 10})` × 3 stages + `<span run-progress__step--hub>` après stages 1 et 2 (L2600-2604).
- Visible en combat ET en hub : ✓ combat L3748, hub via HubHeader L2744.

### Brief §3 — Hub 5 onglets
- screen='hub' atteint après boss stage 1 et 2 : ✓ CHOOSE_REWARD L1715-1742 (`wasBoss && (currentStage === 1 || currentStage === 2)`).
- 5 onglets : ✓ HubTabs L2756-2762 (shop, lootbox, recycle, team, stats).
- Header avec or/fragments/vies : ✓ HubHeader L2731-2747. ✓ Bonus : Conso K/3 affiché.
- Bouton "Continuer" : ✓ `#hub-continue` L3232-3239.

### Brief §4 — Prix exacts
- Potion soin mineure 25 or : ✓ "Potion de sang froid" 25 or L737, "Potion de soin" consommable 25 or L768.
- Bouclier départ 40 or : ✓ "Rune de pierre" 40 or +10 bouclier L744.
- Reroll boutique 15 or : ✓ HUB_REROLL_SHOP L2002.
- Lootbox 50/120/250 : ✓ LOOTBOX_PRICES L883-888.
- Bénédiction stage 180 or : ✓ "Benediction royale" 180 or L836.
- Swap supplémentaire 75 or : ✓ HUB_SWAP_HERO L2107.

### Brief §5 — Items boutique par stage
- Stage 1 : ✓ Potion sang froid (738), Rune pierre +10 bouclier (744), Lame ébréchée +8% phys (754), Petite loot box 50 (762). Bonus : Potion soin et Bouclier d'urgence consommables.
- Stage 2 : ✓ Encens du vide cooldown -12% (788), Sceau arcanique +12% magie (796), Fiole anti-poison (804), Loot box rare 120 (812). Bonus : Potion soin, Bombe runique.
- Stage 3 : ✓ Bénédiction royale (838), Couronne fissurée +15% vs boss (846), Armure dernier rempart (854), Loot box épique 250 (862).

### Brief §6 — Lootboxes
- 4 types : ✓ LOOTBOX_PRICES L883 + LOOTBOX_TABLES L899.
- Tables conformes :
  - Petite 50/30/18/2 : ✓ L900.
  - Rare 45/30/20/5 : ✓ L901 (fragments 45, gold 20, rare 30, epic 5).
  - Épique 40/35/20/5 : ✓ L902.
  - Runique : ✓ L903 (non achetable, drop spécial — pas d'auto-drop côté code, voir Major-2 ci-dessous).
- Probas affichées : ✓ LootboxTab L2883-2890.
- Animation coffre→flash→révélation : ✓ LootboxScreen L3290-3346 + classes CSS `.lootbox-flash`, `.lootbox-chest.opening`, `.lootbox-chest.opened` (styles.css 1691-1729).

### Brief §7 — Recyclage
- Filtre starter et équipe actuelle : ✓ RecycleTab L2922-2924 (`!STARTER_IDS.includes && !selectedIds.includes`).
- Confirmation modale "définitif" : ✓ RecycleConfirmModal L2964-3021 ("Cette action est definitive" L2997).
- Remboursements : ✓ RECYCLE_REFUND L906-911 (commun 5/10, rare 6/25, épique 17/60, légendaire 42/120).
- Persistence localStorage : ✓ HUB_RECYCLE_CONFIRM L2078-2099 ; mutation save persiste via `useEffect` L3413-3415.

### Brief §8 — Équipe au hub
- 1er swap gratuit : ✓ L2107 `cost = freeSwapsUsed === 0 ? 0 : 75`.
- Suivants 75 or : ✓ idem.
- Héros entrant à 70% PV : ✓ L2116 `Math.round(fresh.maxHp * 0.7)`.

### Brief §9 — Inventaire 3 consommables
- 4 kinds : ✓ CONSUMABLE_DEFS L703-723 (potion-heal, bomb-runic, shield-emergency, vial-antipoison).
- Max 3 slots : ✓ ConsumableSlots = `[null, null, null]` L1634, padded à 3 dans ConsumableRail L2703.
- Utilisables en combat : ✓ ConsumableRail rendu dans combat-screen L3784-3788, USE_CONSUMABLE bloque hors combat L2154.
- Comportement quand plein : ✗ **Major** — pas de modale "Remplacer ?" : achat consommable retourne notice "Inventaire plein" L1945. Le brief §9 dit explicitement "Si plein : remplacer un objet ou abandonner le nouveau". Action `REPLACE_CONSUMABLE` existe (L2210) mais aucune UI ne la déclenche.

### Brief §10 — Récompenses revues
- Vague normale ≠ vague 5 ≠ boss : ⚠ partiel — uniquement le bonus or est contextualisé (CHOOSE_REWARD L1670-1680). Les 3 cartes restent le pool stat existant.
- Boss : gros or ✓ (+80..120 / +120..160 L1672-1675), lootbox spéciale ✗, accès hub ✓, choix relique parmi 3 ✗.
- T24 marquée in-progress : sévérité **Major**. La spec §4.9 et le brief §10 décrivent un pool "3 reliques de boss" non livré. L'or contextualisé compense partiellement la friction économique mais ne livre pas la décision narrative attendue.

### Brief §11 — Coffre final tier-aware
- 5 tiers : ✓ ChestTier (`damaged | bronze | silver | royal | runic`) + computeChestTier L971-982.
- Logique : ✓ damaged si pas de boss, bronze si ≥1, silver si ≥2, royal si fight≥30 + 3 boss, runic si royal + lives≥2 + blessingsUsed=0.
- Visuels : ✓ styles.css 1984-2028 (5 backgrounds, drop-shadow argent, glow runique avec runes).

### Contraintes
- Clé localStorage `runebound-cards-save-v1` conservée : ✓ STORAGE_KEY non modifié (vérifié indirectement via persistance L3414).
- `normalizeSave` étendu, pas cassé : ✓ L482-508, garde-defaut sur tous les nouveaux champs, `saveVersion=2` forcé en sortie.
- HUD combat existant non touché : ✓ CombatHud, CombatHero, EnemyCard, CombatFooter inchangés. RunProgress ajouté en haut, ConsumableRail ajouté en bas — additions, pas modifications.
- `render_game_to_text` étendu : ✓ L3431-3514 (stage, wave, consumables, relics, hub, stageIntro, lootbox, pendingRecycle, chestTier, saveVersion, bestStage, finalBossDefeats, lifetimeLootboxes). Champs existants conservés.
- prefers-reduced-motion : ✓ styles.css 2033-2056 (animations désactivées sur sigil, lootbox, run-progress current, runic chest ; flash supprimé).
- TypeScript strict, pas de `any` : ✓ aucune occurrence de `: any` ou `<any>` dans App.tsx.

### Hooks de test
- `__game_test_*` : ⚠ aucune hook `__game_test_*` n'existe et n'a jamais existé — la spec §5.7 ne les requérait pas non plus, seulement `render_game_to_text` et `advanceTime` qui sont préservés (L3428-3431). Pas un écart.
- 9 nouveaux test-actions : ✓ tous présents (stage-intro-enter, hub-buy-shop, hub-buy-lootbox, open-lootbox, hub-recycle, hub-swap, hub-continue, use-consumable, shop-reroll), tous utilisent le nouveau format `selector` plutôt que `mouse_x/mouse_y`.
- Existants conservés sur disque : ✓. ⚠ **Risque de régression** — `start-combat.json` (mouse_x=160, mouse_y=494) cliquait sur "Lancer la run" puis attendait l'écran combat. Désormais ce clic mène à `screen='stage-intro'`, pas à `combat`. Le test conceptuel "lancer une run et arriver en combat" requiert une étape supplémentaire.

---

## Écarts par sévérité

### Blocker
Aucun.

### Major
1. **Modal REPLACE_CONSUMABLE absent (T23 partiel)** — brief §9 explicite "remplacer ou abandonner". Aujourd'hui, achat avec slots pleins → notice silencieuse, l'or n'est pas dépensé mais l'item n'est pas remplaçable. Action correctrice : afficher un dialogue modal lorsque `eff.kind === "consumable"` et `consumables.findIndex(null) === -1`. Ajouter état `pendingConsumablePurchase: { kind: ConsumableKind } | null` dans GameState ; render `ReplaceConsumableModal` avec 3 boutons "remplacer slot N" + 1 bouton "abandonner". Position : reducer L1942-1946 dans HUB_BUY_SHOP_ITEM ; nouveau composant entre LootboxScreen (L3250) et FinalChest (L3349).
2. **Pool de récompenses post-boss (T24 in-progress)** — brief §10 demande "3 reliques de boss parmi 3" et "loot box spéciale gratuite". Aujourd'hui, post-boss le joueur a juste les 3 cartes stat habituelles + bonus or. Action correctrice : créer `BOSS_RELIC_POOL` (3-6 reliques typées RunRelic), modifier `createRewardOptions` (autour de L1657-1770) pour basculer vers ce pool quand `wasBoss && !wasFinalBoss`, et offrir une lootbox `tier: "rare"` automatiquement empilée dans `pendingLootbox` après le hub (ou en bonus de récompense affichable).
3. **start-combat.json conceptuellement cassé** — le clic sur "Lancer la run" mène désormais à stage-intro, pas combat. Action correctrice : ajouter une 3e étape `selector: #stage-intro-enter` dans `start-combat.json` après le clic team-start ; ou créer un nouveau JSON `start-combat-v2.json` qui chaîne les deux.

### Minor
1. **Lootbox runique non droppée automatiquement** — brief §6 dit "récompense spéciale post-boss/fin avancée". Aujourd'hui elle existe en table mais n'est jamais distribuée (verrou `c.tier === "runic"` partout, jamais d'auto-drop). Mineur car le coffre runique en game-over couvre la version "fin avancée".
2. **Effet "Couronne fissurée" non appliqué au boss** — relique `nextFightBossDamageBonus` est stockée (L1965) mais `advanceCombat` ne lit pas ce champ. À vérifier — si boss combat n'utilise pas ce multiplicateur, l'item est cosmétique.
3. **`pickShopItems` slice à 5** — `Math.min(5, shuffled.length)` plafonne à 5 même si pool en a 6. Brief dit "4-6", donc dans la fourchette mais asymétrique avec le pool stage 3 qui en a aussi 6.
4. **Orthographes sans accents** dans STAGE_CONFIGS et logs (Sorciere, Brise, ebrechee). Cohérent avec l'existant (le reste du jeu est aussi sans accents) mais le brief utilise "Sorcière du Vide" / "Roi Brisé". Décision implicite à logger ou normaliser.
5. **`finalBossDefeats++` en double** — incrémenté à L1694 (CHOOSE_REWARD wasFinalBoss) et à L1178 (finishRun si tier royal/runic). Si la victoire boss final passe par CHOOSE_REWARD (chemin nominal), pas de doublon. Si elle passe par finishRun (cas rare ?), incrément correct. Mais dans CHOOSE_REWARD wasFinalBoss, `screen` passe direct à gameover sans appeler finishRun — donc OK. Risque latent si refactor futur.

---

## Risques de régression

1. **localStorage V1 lecture** : `normalizeSave` injecte `saveVersion=2` même si la save absente. Risque : si un joueur a une vieille save sans `bestStage`, le clamp `clampStage(undefined)` doit retourner 1. À vérifier dans `clampStage` (non lu — supposé safe vu absence d'erreur build, mais runtime à valider sur save vide).
2. **RunProgress débordement viewport** : 3 segments × 10 pas + 2 hubs = ~32 cases sur une ligne en 1280px. Si la largeur des `.run-progress__step` n'est pas assez petite ou si `flex-wrap` n'est pas posé, débordement possible. À vérifier visuellement.
3. **Modal recycle focus trap** : dev a posé `autoFocus` sur le bouton Annuler, `onKeyDown Escape` ferme la modale, mais pas de focus trap explicite (Tab peut sortir de la modale et atteindre des éléments derrière). Mineur a11y.
4. **`HUB_SWAP_HERO` consomme le swap gratuit même si gratuit** : ligne `freeSwapsUsed: state.hub.freeSwapsUsed === 0 ? 1 : 1` → toujours 1 après. OK fonctionnellement, mais l'expression est syntaxiquement étrange (toujours évaluée à 1) — lisibilité.
5. **Lootbox runique "non achetable"** : LootboxTab affiche la carte mais sans bouton ; l'utilisateur peut cliquer dessus et rien ne se passe. UX OK mais pas d'indication active "Drop boss uniquement" très visible.
6. **`wasBoss` détection** : `state.run.fight % 10 === 0` est correct pour fight=10, 20, 30. Mais après START_STAGE qui force fight=11 ou 21, le wasBoss du `fight=10` au moment du CHOOSE_REWARD est correct car ENTER_HUB n'a pas encore changé fight. À vérifier : la séquence boss10 → reward → choose → fight=10 reste pendant l'évaluation, puis ENTER_HUB sans incrémenter fight. OK.
7. **Pool boutique stage 1 sans "Bouclier d'urgence" optionnel** — brief §5 ne le mentionne pas explicitement (consommables hors §5). Spec §4.4 le liste. Si l'utilisateur audite le brief strictement, +1 item non demandé. Pas un bug.
8. **Test-actions schéma mixte** : anciens utilisent `mouse_x/mouse_y`, nouveaux utilisent `selector`. Le runner Playwright doit supporter les deux. Si non, écart.

---

## Tâches de correction

Mises à jour append à `tasks.json` (T30+).
