# Specs — V2 Progression / Hub / Boutique / Loot Box

## 1. Intention

Transformer la boucle "combat → bonus → combat" en une vraie structure roguelite à 3 stages avec hub d'inter-stage offrant des choix économiques (boutique, loot boxes, recyclage, gestion d'équipe). Le but : rendre l'or significatif, créer des dilemmes, donner une progression visuelle claire, et différencier les fins de run par tier de coffre.

**On étend l'existant. On ne réécrit pas le combat.**

## 2. Audience

- Persona principal : joueur de prototype web roguelite, déjà familier de la V2 combat (HUD avancé, intentions ennemies, salles).
- Contexte : navigateur desktop 1280x720, session courte (5–15 min par run), interactions clavier+souris simples.
- Le joueur doit pouvoir comprendre la boucle stage→hub en moins de 30 secondes au premier passage.

## 3. Résultats attendus (outcomes)

1. Une run terminée passe par 3 stages de 10 vagues, avec boss vague 10/20/30 et hub après stage 1 et stage 2.
2. L'or est dépensé activement (boutique, loot boxes, soins, bénédictions, équipe) ; le joueur termine sa run avec un solde proche de zéro.
3. Le joueur perçoit visuellement la progression (barre/carte de run) et l'ambiance change par stage (palette d'accent).
4. Les loot boxes achetées au hub donnent une révélation animée et un loot variable (or/fragments/perso) selon les probas du brief.
5. Le coffre final est tier-aware : son visuel et son contenu reflètent la performance de la run (abîmé / bronze / argent / royal / runique).
6. Les consommables (max 3) sont achetables, gagnés en récompense, et utilisables en combat sans casser le HUD existant.
7. La sauvegarde localStorage migre proprement depuis l'ancienne version sans perte de personnages forgés ni de monnaie.

## 4. Périmètre fonctionnel

### 4.1 Stages (priorité 1)

3 stages × 10 vagues. Le state run gagne un champ `stage: 1 | 2 | 3` et un compteur `wave: 1..10` qui remplace conceptuellement le simple `fight` global. On garde `fight` comme compteur global continu (1..30) pour ne pas casser les hooks et les calculs existants ; on dérive `stage` et `wave` de `fight`.

| Stage | Plage `fight` | Boss (vague 10) | Pools ennemis dédiés |
|-------|---------------|-----------------|----------------------|
| 1 — Cryptes froides | 1..10 | Gardien des Cendres | goules, brigands, spectres |
| 2 — Sanctuaire du Vide | 11..20 | Sorcière du Vide | acolytes, ombres, occultistes |
| 3 — Salle du Roi Brisé | 21..30 | Roi Brisé | reliques royales, gardes brisés |

Chaque stage a : nom, ambiance (couleur d'accent), pool ennemis spécifique, boss dédié unique, boutique propre.

**Écran `stage-intro`** : court écran de transition au démarrage de chaque stage (< 2s utilisateur), affichant nom du stage, numéro, ambiance, prochain boss. Un bouton "Entrer" termine la transition.

### 4.2 Progression visuelle de run (priorité 6)

Composant `RunProgress` toujours visible en mode combat et hub :
- 3 segments (un par stage), chacun composé de 10 cases (9 vagues + 1 boss).
- Case courante mise en avant.
- Cases passées remplies, cases futures grisées.
- Marqueur "Hub" entre les stages.
- Affiche `stage / wave / boss in N`.

### 4.3 Hub (priorité 2)

Phase déclenchée après victoire du boss de stage 1 et de stage 2 (PAS après le boss final, qui mène directement à game over + coffre royal/runique).

5 onglets :
- **Boutique** (4–6 items, pool stage-spécifique, voir 4.4)
- **Loot Box** (4 types achetables, voir 4.5)
- **Recyclage** (voir 4.6)
- **Équipe** (voir 4.7)
- **Stats** (lecture seule : stats de run cumulées + résumé du stage)

Header du hub :
```
HUB — Stage X terminé / Prochain : Stage Y
Or : N | Fragments : M | Vies : L/3 | Consommables : K/3
```

Bouton **"Continuer vers le prochain stage"** en bas, toujours actif.

### 4.4 Boutique (priorité 3)

4–6 items affichés, prix indiqué, achat unique (l'item disparaît après achat). Bouton **Relancer la boutique** : 15 or, regénère le pool.

**Stage 1 — Boutique des Cryptes**
- Potion de sang froid : 25 or — soigne 20% de l'équipe (immédiat).
- Rune de pierre : 40 or — +10 bouclier au prochain combat (modificateur de run).
- Lame ébréchée : 30 or — +8% attaque physique pour le reste du stage.
- Petite loot box : 50 or — voir 4.5.
- Potion de soin (consommable) : 25 or — ajoute consommable inventaire.
- Bouclier d'urgence (consommable) : 35 or — ajoute consommable inventaire.

**Stage 2 — Boutique du Vide**
- Encens du vide : 35 or — réduit cooldowns 12% au prochain combat.
- Sceau arcanique : 45 or — +12% magie pour le reste du stage.
- Fiole anti-poison (consommable) : 30 or — ajoute consommable inventaire.
- Loot box rare : 120 or.
- Potion de soin (consommable) : 25 or.
- Bombe runique (consommable) : 40 or — ajoute consommable inventaire.

**Stage 3 — Boutique Royale**
- Bénédiction royale : 180 or — restaure 1 vie globale si lives < 3.
- Couronne fissurée : 90 or — +15% dégâts contre le prochain boss.
- Armure du dernier rempart : 110 or — premier héros K.O revient avec 30% PV (relic run).
- Loot box épique : 250 or.
- Potion de soin (consommable) : 25 or.
- Bombe runique (consommable) : 40 or.

Achat refusé si or insuffisant (ou inventaire de consommables plein → modal "remplacer ?").

### 4.5 Loot boxes achetables (priorité 4)

4 types, chaque type avec ses probas affichées :
- **Petite** (50 or) : 50% fragments / 30% or / 18% perso commun / 2% perso rare
- **Rare** (120 or) : 45% fragments / 30% perso rare / 20% or / 5% perso épique
- **Épique** (250 or) : 40% fragments / 35% perso épique / 20% perso rare / 5% perso légendaire
- **Runique** (non achetable, drop spécial post-boss / coffre runique)

UX :
1. Liste des types, prix, probas visibles.
2. Achat → écran `lootbox` (phase dédiée) : coffre fermé.
3. Clic sur le coffre → flash → révélation du contenu.
4. Bouton "Retour au hub".

Quand un perso tombe et qu'il est déjà débloqué → conversion automatique en fragments (équivalent au coût de forge / 2).

### 4.6 Recyclage (priorité 5)

Liste des personnages forgés (custom uniquement), filtrage automatique :
- Pas les starters (`STARTER_IDS`).
- Pas ceux dans `selectedIds` actuels.
- Confirmation modale obligatoire avec texte "Cette action est définitive".

Remboursement :
| Rareté forgée | Fragments | Or |
|---------------|-----------|------|
| Commun | 5 | 10 |
| Rare | 6 (40% de 15) | 25 |
| Épique | 17 (50% de 35, arrondi inférieur) | 60 |
| Légendaire | 42 (60% de 70) | 120 |

(Pourcentages strictement issus du brief : 40%/50%/60%. Arrondi inférieur pour épique. Voir decisions.md.)

Mise à jour : `customCharacters` filtré, `unlockedIds` filtré, `gold` et `fragments` incrémentés, persistance localStorage.

### 4.7 Gestion d'équipe au hub (priorité 7)

- 1 changement de héros gratuit par hub (compteur `freeSwapsUsed: 0 | 1`).
- Changement supplémentaire : 75 or par swap.
- Le héros entrant arrive avec 70% de ses PV max.
- Affichage : équipe actuelle (3 cartes), héros disponibles (autres unlocked), bouton swap par héros.
- Synergies : on n'introduit PAS de système de synergie en V2 (hors-périmètre, voir 5).

### 4.8 Inventaire de consommables (priorité 7)

Slot d'inventaire `consumables: Consumable[]`, max 3.
4 types :
- `potion-heal` : Potion de soin — soigne 30% PV équipe.
- `bomb-runic` : Bombe runique — 25 dégâts directs à l'ennemi.
- `shield-emergency` : Bouclier d'urgence — +15 bouclier à toute l'équipe.
- `vial-antipoison` : Fiole anti-poison — annule prochain malefice (placeholder de feature).

UI :
- En hub : liste lisible, achat ajoute au slot.
- En combat : mini-HUD discret (bande supérieure ou latérale), 3 emplacements visibles, clic → utilisation immédiate via action `USE_CONSUMABLE`. **Ne pas refondre le HUD combat**, juste ajouter une ligne dans `CombatFooter` ou un panneau sous le HUD principal.
- Si plein à l'achat/récompense : modal "Remplacer un consommable ?" avec choix ou abandon.

### 4.9 Refonte des récompenses (priorité 8)

Actuellement : 3 bonus post-victoire (REWARD_POOL).

Nouveau pool **post-victoire normale** (vagues 1–9, 11–19, 21–29) :
- 3 choix parmi : bonus stat (existant), or (+15..30), fragments (+3..6), petit soin équipe, mini-loot box (rare drop).

**Post-vague 5/15/25 (mid-stage)** :
- Récompense améliorée : choix parmi relique mineure (modificateur de run), objet rare boutique offert, soin équipe complet, ou réduction prix boutique (-20% prochain stage).

**Post-boss stage 1, stage 2** :
- Gros or (+80..120), loot box gratuite (rare), choix d'1 relique de boss parmi 3, accès hub.

**Post-boss final (stage 3)** :
- Gros or, choix de relique légendaire, accès direct écran game over avec coffre tier "royal" (ou "runique" si critères).

### 4.10 Coffre final selon performance (priorité 8)

Tier dérivé en fin de run :
- `damaged` : mort avant boss 1 (fight < 10, run.lives == 0).
- `bronze` : boss 1 vaincu (`stats.bossesDefeated >= 1`).
- `silver` : boss 2 vaincu (`stats.bossesDefeated >= 2`).
- `royal` : boss final vaincu.
- `runique` : boss final vaincu **et** au moins 2/3 vies restantes ET aucune utilisation de bénédiction royale (ou autres critères "exceptionnels" — voir decisions.md).

Visuel du coffre change selon tier (bois/bronze/argent/or/runes bleues). Loot du coffre scale avec tier (plus de fragments/or, chance perso plus élevée).

## 5. Mapping sur le state existant

### 5.1 Types nouveaux

```ts
type Stage = 1 | 2 | 3;

type StageConfig = {
  id: Stage;
  name: string;          // "Les Cryptes froides"
  accent: string;        // CSS class : "stage-1", "stage-2", "stage-3"
  enemyPool: string[];   // noms d'ennemis spécifiques
  bossName: string;
  bossTrait: string;
  bossDetail: string;
};

type ConsumableKind = "potion-heal" | "bomb-runic" | "shield-emergency" | "vial-antipoison";

type Consumable = {
  id: string;
  kind: ConsumableKind;
  name: string;
  detail: string;
};

type ShopItemEffect =
  | { kind: "heal-team-percent"; percent: number }
  | { kind: "shield-next-fight"; amount: number }
  | { kind: "stat-boost-stage"; stat: "physical" | "magic"; percent: number }
  | { kind: "cooldown-next-fight"; percent: number }
  | { kind: "remove-debuff" }
  | { kind: "lootbox"; tier: LootBoxTier }
  | { kind: "consumable"; consumable: ConsumableKind }
  | { kind: "blessing-life" }
  | { kind: "boss-damage-bonus"; percent: number }
  | { kind: "first-ko-revive"; percent: number };

type ShopItem = {
  id: string;
  name: string;
  detail: string;
  rarity: Rarity;
  price: number;
  stage: Stage;
  effect: ShopItemEffect;
};

type LootBoxTier = "small" | "rare" | "epic" | "runic";

type LootBox = {
  tier: LootBoxTier;
  price: number;            // 0 si runique non-achetable
  weights: { fragments: number; gold: number; common: number; rare: number; epic: number; legendary: number };
};

type LootBoxResult =
  | { kind: "fragments"; amount: number }
  | { kind: "gold"; amount: number }
  | { kind: "character"; characterId: string }
  | { kind: "fragments-converted"; amount: number; from: string }; // perso doublon → fragments

type RunRelic = {
  id: string;
  name: string;
  detail: string;
  source: "boss" | "shop" | "reward" | "consumable";
  // modifiers ponctuels
  nextFightShield?: number;
  nextFightCooldownMod?: number;
  nextFightBossDamageBonus?: number;
  stageStatBoost?: { stat: "physical" | "magic"; percent: number; expiresAtStage: Stage };
  reviveOnFirstKO?: { percent: number; used: boolean };
};

type ChestTier = "damaged" | "bronze" | "silver" | "royal" | "runic";

type HubTab = "shop" | "lootbox" | "recycle" | "team" | "stats";

type HubState = {
  stageJustCleared: Stage;     // 1 ou 2 (le hub n'apparaît pas après stage 3)
  nextStage: Stage;
  shopItems: ShopItem[];
  shopRerolls: number;         // pour scaler le prix si re-relance multiple (V3, en V2 fixe à 15)
  freeSwapsUsed: 0 | 1;
  activeTab: HubTab;
  lootboxResult: LootBoxResult | null; // dernier résultat affiché
};

type ConsumableSlots = (Consumable | null)[]; // longueur 3
```

### 5.2 Modifications du state existant

```ts
type RunState = {
  lives: number;
  fight: number;          // existant : 1..30 global
  stage: Stage;           // NOUVEAU, dérivable mais stocké pour stabilité
  wave: number;           // NOUVEAU, 1..10
  wins: number;
  team: CombatCharacter[];
  enemy: Enemy;
  modifier: EncounterModifier;
  stats: RunStats;
  log: string[];
  consumables: ConsumableSlots;     // NOUVEAU
  relics: RunRelic[];               // NOUVEAU, modifiers actifs (stage-scoped et fight-scoped)
  shopDiscountPercent: number;      // NOUVEAU, applique au prochain hub
  blessingsUsed: number;            // NOUVEAU, pour critère coffre runique
};

type GameState = {
  screen: Screen;                   // étendu, voir 5.3
  save: SaveData;                   // étendu, voir 5.4
  selectedIds: string[];
  run: RunState | null;
  rewardOptions: RewardOption[];
  chest: { opened: boolean; reward?: ChestReward; tier?: ChestTier } | null;
  flashes: FlashEvent[];
  notice: string;
  hub: HubState | null;             // NOUVEAU, non null sur screen='hub'
  stageIntro: { stage: Stage } | null; // NOUVEAU, non null sur screen='stage-intro'
  pendingLootbox: { tier: LootBoxTier; opened: boolean; result: LootBoxResult | null } | null; // NOUVEAU
  pendingRecycle: { characterId: string } | null; // confirmation modale
};

type SaveData = {
  unlockedIds: string[];
  customCharacters: CharacterTemplate[];
  gold: number;
  fragments: number;
  bestFight: number;
  chestsOpened: number;
  // NOUVEAUX :
  bestStage: Stage;             // meilleur stage atteint
  finalBossDefeats: number;     // nombre de fois où boss final a été vaincu
  lifetimeLootboxes: number;    // total loot boxes ouvertes
  saveVersion: number;          // 2 — pour migration
};
```

### 5.3 Screens / Phases

Type `Screen` étendu :
```ts
type Screen =
  | "menu"
  | "collection"
  | "creator"
  | "team"
  | "stage-intro"      // NOUVEAU : transition avant chaque stage
  | "combat"           // existant
  | "reward"           // existant
  | "hub"              // NOUVEAU : entre stages
  | "lootbox"          // NOUVEAU : ouverture animée
  | "gameover";
```

Sous-onglets dans le hub gérés par `state.hub.activeTab`, pas par `Screen`.

Le recyclage et le team-swap se font à l'intérieur du hub, via les onglets `recycle` et `team`. Pas de Screen distinct.

### 5.4 Flux des phases

```
menu → team → stage-intro(1) → combat(1) → reward → combat(2) → reward → ...
... → combat(10, boss) → reward(boss) → hub → [tabs] → stage-intro(2) → combat(11) → ...
... → combat(20, boss) → reward(boss) → hub → [tabs] → stage-intro(3) → combat(21) → ...
... → combat(30, boss final) → reward(boss final) → gameover (coffre royal/runic)

Échec à tout moment → gameover (coffre damaged/bronze/silver selon progress)
```

Loot box ouverte depuis le hub : `screen='lootbox'`, retour à `screen='hub'` après "Retour".

### 5.5 Nouvelles actions du reducer

| Action | Payload | Effet |
|--------|---------|-------|
| `ENTER_STAGE_INTRO` | `{ stage: Stage }` | passe screen='stage-intro' |
| `START_STAGE` | — | quitte stage-intro, démarre le combat de la 1ère vague du stage |
| `ENTER_HUB` | — | depuis reward post-boss stage 1/2, génère hub state, screen='hub' |
| `HUB_SET_TAB` | `{ tab: HubTab }` | change l'onglet actif |
| `HUB_BUY_SHOP_ITEM` | `{ itemId: string }` | déduit or, applique effet, retire item du pool |
| `HUB_REROLL_SHOP` | — | déduit 15 or, regénère 4–6 items |
| `HUB_BUY_LOOTBOX` | `{ tier: LootBoxTier }` | déduit or, met `pendingLootbox`, screen='lootbox' |
| `OPEN_LOOTBOX` | — | tire le résultat selon weights, applique au save, opened=true |
| `CLOSE_LOOTBOX` | — | retour screen='hub' |
| `HUB_RECYCLE_REQUEST` | `{ characterId: string }` | met `pendingRecycle` (confirmation) |
| `HUB_RECYCLE_CONFIRM` | — | applique remboursement, retire perso de save |
| `HUB_RECYCLE_CANCEL` | — | annule pendingRecycle |
| `HUB_SWAP_HERO` | `{ outId: string; inId: string }` | swap dans team active, gratuit si freeSwapsUsed=0, sinon -75 or |
| `HUB_CONTINUE` | — | quitte hub vers stage-intro du stage suivant |
| `USE_CONSUMABLE` | `{ slotIndex: number }` | applique effet en combat, retire du slot |
| `ADD_CONSUMABLE` | `{ kind: ConsumableKind }` | ajoute si slot libre, sinon notice |
| `REPLACE_CONSUMABLE` | `{ slotIndex: number; kind: ConsumableKind }` | remplace explicitement |
| `OPEN_CHEST` (étendu) | — | calcule tier selon stats run, retourne reward scalé |

Actions modifiées (pas remplacées) :
- `START_RUN` : initialise `stage=1, wave=1`, `consumables=[null,null,null]`, `relics=[]`, `shopDiscountPercent=0`, `blessingsUsed=0`. Première navigation va vers `stage-intro` au lieu de `combat`.
- `CHOOSE_REWARD` : si `wave=10` et stage<3, va vers `hub` au lieu de `combat`. Si stage=3 wave=10, va vers `gameover`. Sinon, incrémente `wave` (ou passe au stage suivant via `HUB_CONTINUE`). Applique aussi récompenses étendues (or/fragments/consommables/mini-lootbox).
- `OPEN_CHEST` : calcule `ChestTier` à partir de `state.run`/stats avant clear. Loot scalé.

### 5.6 Migration localStorage

`STORAGE_KEY` reste `runebound-cards-save-v1` pour compatibilité (lecture tolérante). On lit la save existante :
- Si `saveVersion` absent ou `< 2` → on injecte les nouveaux champs avec valeurs par défaut (bestStage=1, finalBossDefeats=0, lifetimeLootboxes=0, saveVersion=2). Or/fragments/perso forgés conservés.
- Pas de nouvelle clé localStorage. Pas de bump de version de clé.

### 5.7 Hooks de test à préserver

- `window.render_game_to_text` : étendu pour exposer `stage`, `wave`, `hub` (tab actif, items count, gold, freeSwaps), `consumables`, `chestTier`, `lootboxState`. Backward-compat : champs existants conservés.
- `window.advanceTime` : inchangé.
- `id`s des boutons existants conservés : `start-run`, `nav-creator`, `creator-name`, `creator-rarity`, `create-character`, `team-start`, `abandon-run`, `reward-0..2`, `open-chest`.
- Nouveaux `id`s à exposer : `hub-tab-shop`, `hub-tab-lootbox`, `hub-tab-recycle`, `hub-tab-team`, `hub-tab-stats`, `hub-continue`, `shop-buy-{index}`, `shop-reroll`, `lootbox-open`, `lootbox-close`, `recycle-confirm`, `recycle-cancel`, `team-swap-{outId}-{inId}`, `consumable-{slotIndex}`, `stage-intro-enter`.
- `test-actions/*.json` existants : à laisser tels quels. Le frontend-dev devra ajouter de nouveaux JSON pour le golden path V2.

## 6. Hors-périmètre

- **Ne PAS refondre le HUD de combat** (`CombatHud`, `CombatHero`, `EnemyCard`, `CombatFooter`). Seul ajout permis : un mini-HUD consommables (3 slots) intégré sous la zone existante.
- **Ne PAS réécrire le reducer de combat** (`advanceCombat`, `useSpecial`). On greffe via `relics` et `consumables` qui injectent leurs effets via les fonctions `applyReward` / nouvelle fonction `applyRelicsToTeam`.
- **Pas de système de synergies d'équipe** — le brief le mentionne en affichage mais on ne calcule pas de synergie en V2.
- **Pas d'animation 3D ou WebGL** pour les loot boxes : transition CSS uniquement (rotation, flash, scale).
- **Pas de localisation** : tout reste en français.
- **Pas de tutoriel scripté** : un texte court suffit en stage-intro.
- **Pas de difficulté ajustable** : la courbe stage 1/2/3 du brief est fixe.
- **Pas de migration vers une nouvelle clé localStorage** : on reste sur `v1` avec un champ `saveVersion`.
- **Pas de leaderboard, pas de cloud, pas de réseau**.

## 7. Contraintes

- **Stack** : React + TypeScript + Vite (existant). Pas de nouvelles dépendances npm.
- **Performance** : tient en 1280x720, pas de lag perceptible (la boucle TICK reste à 260ms).
- **Accessibilité** : niveau actuel maintenu (boutons natifs, focus visible). Pas de régression.
- **CSS** : pur, sans framework. Tokens par stage en variables CSS (`--stage-accent`).
- **Persistance** : localStorage, lecture tolérante via `normalizeSave` étendue.
- **Tests** : `npm run build` doit passer 0 erreur. `render_game_to_text` doit toujours retourner du JSON valide à tout moment.

## 8. Critères de succès (mesurables)

Liste cochable pour la phase de revue :

- [ ] `npm run build` passe sans erreur ni warning bloquant.
- [ ] Lancement de run → `screen='stage-intro'`, stage=1 visible.
- [ ] Cliquer "Entrer" → combat vague 1.
- [ ] Victoire vague 1 → reward → combat vague 2.
- [ ] Vague 10 (boss stage 1) → reward boss → hub (screen='hub', stageJustCleared=1).
- [ ] Hub : 5 onglets cliquables, chacun affiche son contenu.
- [ ] Boutique stage 1 : 4–6 items, prix corrects (Potion 25, Rune 40, Lame 30, etc.).
- [ ] Achat d'un item : or déduit, item retiré.
- [ ] Achat loot box small (50 or) : screen='lootbox', clic → résultat révélé.
- [ ] Recyclage d'un perso forgé commun : confirmation, +5 fragments +10 or, perso retiré du save.
- [ ] Swap d'équipe gratuit (1ère fois) puis +75 or pour le second.
- [ ] "Continuer" → stage-intro stage 2 → combat vague 11.
- [ ] Boss stage 2 → hub stage 2 (palette violette).
- [ ] "Continuer" → stage 3 → boss final → gameover avec coffre `royal` ou `runic`.
- [ ] Mort avant boss 1 → coffre `damaged`.
- [ ] localStorage saveVersion=2, ancienne save préservée.
- [ ] 0 erreur console Playwright sur le golden path.
- [ ] `render_game_to_text` expose les nouveaux champs.

## 9. Risques identifiés

| Risque | Impact | Mitigation |
|--------|--------|-----------|
| `App.tsx` devient trop gros (~3000 lignes) | maintenance | extraire les composants Hub/Shop/Lootbox dans `src/components/` (sous-fichiers OK, brief n'interdit pas). Voir decision. |
| Le reducer central explose en taille | maintenance | extraire les helpers (`hubReducer`, `applyShopEffect`, `rollLootbox`, `recycleCharacter`) en fonctions pures dans le même fichier ou modules dédiés. |
| Les hooks Playwright cassent à cause des nouveaux écrans | tests | exposer tous les nouveaux IDs de boutons à des coordonnées stables, étendre `render_game_to_text` sans retirer de champs existants. |
| Migration localStorage casse les saves V1 | UX | `normalizeSave` tolérant : tous les nouveaux champs ont des défauts. |
| Ambiance visuelle des 3 stages mal différenciée | lisibilité | tokens CSS `--stage-accent-*` + classe `stage-N` sur l'app-shell pendant la run. |
| L'or scaling du brief est trop tendu (le joueur n'a pas assez d'or) | game feel | logguer les sources d'or par run (récompenses + boss + lootboxes) dans une décision ; ajuster en revue si test golden montre <30 or au hub 1. |
