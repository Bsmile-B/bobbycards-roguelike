# Specs — V3 Game feel, animations, suspense, rareté

## 1. Intention

Transformer la sensation moment-par-moment du prototype sans toucher au contenu. Le joueur doit ressentir le combat (préparation/attaque/trajectoire/impact/réaction), désirer les cartes (raretés visuellement fortes), et vibrer à l'ouverture de coffre (roulette + révélation). **0 nouveau contenu** : pas de nouveaux ennemis, persos, items, mécaniques de combat, mécaniques de hub, sons. Tout est réécriture cosmétique + couche de feedback visuel par-dessus le moteur V2 existant.

**On étend l'existant. On ne réécrit ni le reducer ni le moteur de combat.**

## 2. Audience

- Persona principal : joueur déjà familier de la V2 (3 stages / hub / coffres / lootboxes). Sait jouer, ne sait pas encore *ressentir*.
- Contexte : navigateur desktop 1280×720, sessions de 5–15 min, souris+clavier.
- Le joueur doit comprendre instantanément qui attaque qui, voir l'impact, et avoir envie de réouvrir un coffre.

## 3. Résultats attendus (outcomes)

1. **Lisibilité combat** : pour chaque attaque (alliée ou ennemie), le joueur voit une trajectoire entre l'attaquant et la cible, un impact, un nombre flottant lisible, une réaction de la cible.
2. **Contrôle de tempo** : un sélecteur de vitesse (×1/×1.25/×1.5) modifie le rythme du combat sans altérer ni les dégâts ni les probas. Ralentissement par défaut très léger pour gagner en lisibilité.
3. **Désir de rareté** : à chaque ouverture de lootbox/coffre, une roulette horizontale (~2.5 s) défile et s'arrête sur la récompense réellement tirée. La révélation visuelle distingue les 5 raretés.
4. **Présence boss** : à l'apparition d'un boss, écran d'intro pleine page (nom, aura, message), suivi d'un combat avec carte boss visuellement plus imposante et seuils visuels à 50% / 30% PV.
5. **Cartes désirables** : chaque carte personnage affiche clairement son nom, portrait, rareté, rôle, stats (PV/PH/MG/VIT), compétence encadrée, trait, fragments possédés, niveau/rang. La rareté se voit de loin (bordure + halo + effet propre).
6. **Pity discret** : une garantie locale anti-frustration (compteur lootbox sans rare+ → bump probabiliste). Pas prédateur, affichable.
7. **Pas de régression** : V2 (stages/hub/boutique/lootbox/recyclage/consommables/reliques/coffre tier-aware) intacte. `render_game_to_text`, `advanceTime`, hooks Playwright et save localStorage V1 préservés.

## 4. Périmètre fonctionnel — 16 sections du brief V3

### 4.1 Vitesse de combat + contrôle (priorité 1)

- Réglage `state.settings.combatSpeed: 1 | 1.25 | 1.5`. (Optionnel ×2 désactivé par défaut.) Persisté dans `localStorage` (`runebound-cards-save-v1`, sous-objet `settings`).
- UI : sélecteur 3 boutons radio dans le HUD combat (ou sous le `CombatFooter`), id `speed-1`, `speed-1.25`, `speed-1.5`.
- Le tempo *par défaut* est légèrement plus lent qu'en V2 : on garde l'intervalle TICK à 260 ms mais on **augmente** `PLAYER_ATTACK_INTERVAL` et `enemy.baseInterval` d'un facteur 1.10 dans la base, puis on divise par `combatSpeed` au moment de la lecture (pas en mutation des constantes).
- Effet : `playerAttackInterval = round(PLAYER_ATTACK_INTERVAL * modifier.playerAttackMod / settings.combatSpeed)`. Idem pour `enemy.attackInterval`. Les cooldowns spéciaux scalent aussi.
- L'animation visuelle (durations CSS) scale via une CSS variable `--combat-speed: 1` injectée sur `.combat-screen` (`animation-duration: calc(<base> / var(--combat-speed))`).
- Hooks de test : `advanceTime` reste basé sur le delta brut. La vitesse n'altère que la mise à l'échelle interne du moteur (donc les tests Playwright qui injectent du temps virtuel restent déterministes).

### 4.2 Animations attaque alliées (priorité 2)

Pour chaque attaque alliée standard et chaque compétence :
1. Pulse léger sur la carte du héros (200 ms).
2. Projectile / trail / arc lumineux de la carte héros vers la cible ennemie (durée par défaut 320 ms scalée).
3. Impact sur l'ennemi (flash + shake).
4. Floating number près de l'ennemi.
5. Retour idle.

Trajectoires distinctes par type :
- `physical` : trait/slash horizontal
- `magic` : projectile runique avec trail
- `heal` : flux ascendant vers un allié
- `shield` : cercle/rune autour de l'allié
- `poison` : particules persistantes courtes (~600 ms)

**Sélection du type** dérivée de `member.magic > member.physical ? "magic" : "physical"` pour les attaques de base, et du `specialType` du héros pour la compétence (mapping dans `rarityVisuals.ts` ou `combatTiming.ts`). Aucun nouveau champ data.

### 4.3 Animations attaque ennemies (priorité 3)

Symétrique. L'ennemi pulse, intention devient active (légère emphase), trajectoire vers la cible alliée (ou onde de zone si `intent.kind === "hex"`), impact + floating + shake sur l'allié visé. Soin ennemi (flux doux vers ennemi soigné).

### 4.4 Réactions impacts (priorité 4)

- Ennemi touché : flash blanc 90 ms + shake 180 ms + barre PV animée. Si `hp/maxHp < 0.30` → aura instable (pulse rouge lent).
- Allié touché : shake court + flash rouge sombre discret. Si `hp/maxHp < 0.30` → aura "blessé" (déjà existant côté CSS, juste à amplifier). Bouclier consommé → flash bleuté distinct du flash dégât.
- K.O. : disparition franche (fade vers gris + croix runique).

### 4.5 Floating numbers améliorés (priorité 5)

Format normalisé :
- `-24 PH`, `-31 MAG`, `+18 SOIN`, `+12 BCL`
- `CRIT -48` plus grand (×1.4), bordure dorée
- `BRÛLURE -6`, `POISON -5` (purple tint)

Règles :
- Position près de la cible (delta ±4% écran).
- Animation : translateY -22px sur 720 ms (déjà la durée actuelle de `flashes`), opacity 1 → 0.
- Si plusieurs flashes <120 ms d'écart sur la même cible → grouper en un seul label `-24 / -8 / -12` (max 3 valeurs).
- Pas de superposition : décalage horizontal en zigzag stable (variant déterministe par `flash.id` modulo 3).

### 4.6 Cartes personnages détaillées (priorité 6)

Nouveau composant `CharacterCardDetailed`, utilisé dans :
- Collection (remplace les cartes actuelles)
- Lootbox reveal (après roulette)
- Game over chest reveal
- Creator preview

**Pas utilisé dans le combat** (où on garde `CombatHero` compact pour la lisibilité).

Layout :
```
┌──────────────────────────┐
│ [Rareté badge] [Rôle]   │  ← header
│       Nom (h2)          │
│   ┌────────────┐        │
│   │  Portrait  │        │  ← portrait runique au centre
│   │   runique  │        │
│   └────────────┘        │
│  PV xx | PH x | MG x    │  ← stats (4 colonnes : PV / PH / MG / VIT)
│  VIT x                  │
│  ┌─────────────────┐   │
│  │ Compétence : … │   │  ← compétence encadrée
│  └─────────────────┘   │
│  Trait : …              │
│  Fragments : N (si dup) │
│  Rang : (si appliqué)   │
└──────────────────────────┘
```

Bordure + halo selon `rarity`. Common = pierre grise sobre. Rare = bleu froid. Épique = violet aura. Légendaire = or + glow + bordure animée subtile. Mythique réservé (placeholder visuel, pas de carte mythique en V3).

### 4.7 Configuration visuelle des raretés (priorité 7)

Module conceptuel `rarityVisuals` : table CSS de tokens par rareté.
```
--rarity-common-border, --rarity-common-glow, --rarity-common-particle (= "none")
--rarity-rare-border, --rarity-rare-glow, --rarity-rare-particle ("blue-spark")
--rarity-epic-* ("violet-aura")
--rarity-legendary-* ("gold-glow" + animation pulse)
--rarity-mythic-* (réservé)
```

Toutes les classes `.rarity-{kind}` consomment ces tokens. Pas fluo, pas saturé : palette dark fantasy continue de `styles.css`.

### 4.8 Refonte ouverture coffre (priorité 8)

Refonte de `LootboxScreen` (V2 phase `closed | opening | opened`) en :
```
phase: 'idle' | 'shake' | 'roulette' | 'reveal' | 'opened'
```
- `idle` : coffre fermé, bouton "Ouvrir".
- `shake` : tremblement 320 ms (scale + rotate ±2°).
- `roulette` : phase 4.9.
- `reveal` : phase 4.10.
- `opened` : carte détaillée + bouton "Ajouter à la collection" / "Continuer".

Les 5 tiers de coffres (damaged/bronze/silver/royal/runic) reçoivent chacun une intensité distincte en `idle` :
- damaged : glow faible, animation lente
- bronze : glow chaud léger
- silver : glow argenté + reflets
- royal : glow doré chaud, particules dorées discrètes
- runic : runes animées qui pulsent, halo bleu glacé/or

### 4.9 Roulette lootbox (priorité 9)

**Critique** : la récompense est tirée AVANT l'animation. La roulette ne triche pas.

Mécanique :
1. Au passage en `roulette`, le composant connaît déjà `pendingLootbox.result` (existant V2). Il génère 18 items (15 leurres + le résultat à l'index 14 + 3 leurres après) — index final fixe pour timing prévisible.
2. Strip horizontal de cartes (largeur fixée, ~140px chacune), curseur central fixe (marqueur runique).
3. Le strip translate de `-(14 * 140 - centerOffset) px` en 2500 ms avec easing `cubic-bezier(0.13, 0.85, 0.25, 1)` (ease-out cubique fort).
4. Réduction motion : strip statique avec révélation immédiate après 200 ms.

Timing total `roulette` : 2500 ms (réduit à 200 ms si `prefers-reduced-motion`).

**Test mode** : `advanceTime` doit pouvoir compléter la roulette. Implémentation : la roulette utilise `requestAnimationFrame` + un easing manuel basé sur un `startTimestamp`. Quand le shim de test (`window.__vt_pending`) est présent, on ne dépend pas de `setTimeout`/`requestAnimationFrame` pour la complétion ; on expose un hook `window.__game_test_skip_roulette()` qui force l'arrêt sur le résultat en 1 frame. À documenter dans decisions.md.

Tension visuelle :
- Les leurres sont biaisés pour avoir une carte de rareté ≥ rareté finale dans les 2-3 dernières positions ("presque" légendaire qui passe juste après).

### 4.10 Révélation rareté (priorité 10)

Quand la roulette s'arrête sur le résultat :
- Common : flash gris discret 220 ms, scale 1.05.
- Rare : flash bleu froid 280 ms, particules bleues x6.
- Épique : aura violette 380 ms, particules violettes x10, scale pulse 1.08.
- Légendaire : explosion dorée 600 ms, micro shake écran ±2px, particules dorées x16, halo persistant.
- Mythique (réservé) : faisceau blanc/or + ralenti dramatique 900 ms (réservé, non déclenché en V3).

Reduced motion : un seul fade-in 200 ms + bordure colorée selon rareté.

### 4.11 Boss intro + présence (priorité 11)

Nouvelle phase intercalée **dans le combat** (pas un Screen distinct, pour ne pas casser le routing V2). Avant que `advanceCombat` ne commence à ticker pour un combat boss (`enemy.boss === true`), un overlay plein page joue 1.6 s :
1. Fond s'assombrit (overlay 88% noir).
2. Nom du boss en grand (h1 doré pour Gardien, violet pour Sorcière, or-rouge pour Roi Brisé).
3. Carte boss entre par le bas avec scale 0.7 → 1, durée 600 ms.
4. Texte "BOSS DE STAGE" sous le nom.
5. Pulse d'aura colorée derrière la carte (couleur de stage).
6. Auto-dismiss après 1600 ms.

Implémentation : champ `state.run.bossIntroAt: number | null` (timestamp d'entrée). Le tick ne fait avancer le combat que si `bossIntroAt === null` ou que `Date.now() - bossIntroAt > 1600`. Reduced motion : 200 ms et pas de scale.

Présence pendant le combat boss :
- Carte ennemi `EnemyCard` reçoit classe `.enemy-card--boss` (déjà existante côté V1 ?) avec scale +20%.
- Barre PV plus haute, label "BOSS" doré.
- Seuils visuels : `hp/maxHp < 0.50` → flash spécial unique + log "Le boss change de phase". `hp/maxHp < 0.30` → aura instable continue.

Implémentation seuils : flag `enemy.bossPhase: 0 | 1 | 2` calculé dans `advanceCombat`, déclenche un `FlashEvent` de type `boss-phase` une seule fois par seuil franchi.

### 4.12 Pity system (priorité bas, transverse)

- Champ `save.lootboxPity: { sinceLastRare: number; sinceLastEpic: number }` (nouveau, défauts 0).
- Au tirage d'une lootbox : si `sinceLastRare >= 5` → +5% chance de rare. Si `sinceLastRare >= 8` → +10%. Si `sinceLastEpic >= 12` → +5% chance d'épique. Reset au draw.
- Affichage discret : ligne dans `LootboxTab` du hub : "Garantie de rareté progressive active".
- Persisté dans `runebound-cards-save-v1` via `normalizeSave` étendu (saveVersion=3, défauts si absent).

### 4.13 Système d'événements d'animation (transverse §13 brief)

Nouveau type :
```ts
type CombatAnimEvent =
  | { kind: 'attack-started'; sourceId: string; ts: number }
  | { kind: 'projectile-launched'; sourceId: string; targetId: string; trajectory: 'physical' | 'magic' | 'heal' | 'shield' | 'poison'; ts: number }
  | { kind: 'target-hit'; targetId: string; ts: number }
  | { kind: 'damage-number'; targetId: string; amount: number; variant: 'PH' | 'MAG' | 'CRIT' | 'POISON' | 'BRULURE'; ts: number }
  | { kind: 'heal-number'; targetId: string; amount: number; ts: number }
  | { kind: 'shield-number'; targetId: string; amount: number; ts: number }
  | { kind: 'ko'; targetId: string; ts: number }
  | { kind: 'boss-phase'; phase: 1 | 2; ts: number }
```

Stockage : `state.run.animQueue: CombatAnimEvent[]` (TTL court, 800 ms par event, purgé au tick comme les flashes).

Producteurs : `advanceCombat`, `useSpecial`, `applyConsumable`. Plutôt que d'ajouter des `addFlash` impératifs (existants), on append à la queue.

Consommateur : nouveau composant `CombatAnimationLayer` (position absolute par-dessus la `battlefield`). Il lit `state.run.animQueue` et rend projectiles, impacts, floating numbers. Les flashes V2 existants restent en place le temps de la transition (les deux peuvent coexister sans conflit ; en V3 on ajoute la couche par-dessus).

**Aucun changement à `advanceTime`** : la queue vieillit avec le delta du TICK comme les flashes.

### 4.14 Architecture (recommandée par le brief §12)

Le brief suggère une décomposition `src/components/*` et `src/game/*`. **Décision** (cf. decisions.md) : on suit la même politique qu'en V2 — extension in-place dans `App.tsx` tant que le fichier reste navigable. Si `App.tsx` dépasse ~5500 lignes après V3, on extrait `LootRoulette`, `RarityReveal`, `CombatAnimationLayer`, `CharacterCardDetailed`, `BossIntro` dans `src/components/`. Pas obligatoire en première passe.

### 4.15 Tests (§15 brief)

`render_game_to_text` étendu pour exposer :
- `settings.combatSpeed`
- `run.animQueue` (longueur seulement, pour ne pas casser le format)
- `run.bossIntroAt` (booléen "active" suffit)
- `run.enemy.bossPhase`
- `lootbox.phase` (`idle | shake | roulette | reveal | opened`)
- `save.lootboxPity`

Hooks de test à ajouter :
- `window.__game_test_skip_roulette()` : force l'arrêt de la roulette sur le résultat (utilisable en Playwright).
- `window.__game_test_skip_boss_intro()` : force la fin du boss intro.

IDs Playwright à ajouter : `speed-1`, `speed-1-25`, `speed-1-5`, `boss-intro-skip` (bouton skip caché derrière l'overlay), `lootbox-skip-roulette` (bouton skip).

### 4.16 Résultat attendu (§16 brief)

Critères qualitatifs (à valider en revue) :
- Le joueur voit le projectile partir.
- Il voit l'ennemi encaisser.
- Il voit clairement les chiffres flottants.
- Il sent le boss arriver (intro).
- Il a envie de rouvrir un coffre.

## 5. Mapping sur l'existant (où ça s'insère)

### 5.1 État

```ts
// Nouveaux types
type CombatSpeed = 1 | 1.25 | 1.5;
type Settings = { combatSpeed: CombatSpeed };
type LootboxPity = { sinceLastRare: number; sinceLastEpic: number };
type AnimTrajectory = 'physical' | 'magic' | 'heal' | 'shield' | 'poison';
type CombatAnimEvent = (...) // voir 4.13

// Extensions
type GameState = {
  ...
  settings: Settings;       // NOUVEAU
};

type RunState = {
  ...
  animQueue: CombatAnimEvent[];  // NOUVEAU
  bossIntroAt: number | null;    // NOUVEAU (null si pas de boss intro en cours)
};

type Enemy = {
  ...
  bossPhase: 0 | 1 | 2;          // NOUVEAU (dérivé du % HP, 0 par défaut)
};

type SaveData = {
  ...
  lootboxPity: LootboxPity;      // NOUVEAU
  saveVersion: 3;                 // bump de 2 vers 3
};
```

### 5.2 Reducer — extensions sans réécriture

| Action | Effet |
|--------|-------|
| `SET_COMBAT_SPEED { speed }` | Met à jour `state.settings.combatSpeed`. Persiste dans localStorage (sous-objet `settings`). Pas d'effet sur le run en cours (lu dynamiquement). |
| `TICK { delta }` (modifié) | Avant `advanceCombat`, vérifier `run.bossIntroAt`. Si actif et delta-since < 1600 ms (ou 200 ms reduced) → ne tick pas le combat, juste âge la queue d'anims. Sinon `bossIntroAt = null` et tick normal. |
| `BOSS_INTRO_DISMISS` | Force `bossIntroAt = null` (utilisé par `__game_test_skip_boss_intro`). |
| `START_RUN` (modifié) | Ajoute `animQueue=[]`, `bossIntroAt=null`. |
| `ENTER_STAGE_INTRO` / combat init pour `wave===10` | Set `bossIntroAt = Date.now()` au moment où l'ennemi boss est créé. |

`advanceCombat` reçoit en bonus la responsabilité de :
- Appender au lieu de seulement flasher (les `addFlash` existants restent ; on ajoute des appends à `animQueue`).
- Mettre à jour `enemy.bossPhase` si `enemy.boss && hp/maxHp < seuil`.

### 5.3 Composants

| Composant | Statut | Rôle |
|-----------|--------|------|
| `LootboxScreen` | refonte locale (phase étendue) | Roulette + reveal |
| `LootRoulette` | nouveau | Strip + curseur + arrêt sur cible |
| `RarityReveal` | nouveau | Effet à la révélation selon rareté |
| `CharacterCardDetailed` | nouveau | Carte de collection/reveal/preview |
| `CombatAnimationLayer` | nouveau | Couche absolute over battlefield |
| `BossIntroOverlay` | nouveau | Overlay 1600 ms |
| `FinalChest` | extension | 5 tiers visuellement distincts |
| `CombatHero`, `EnemyCard` | extension légère | Pulse, shake, phase aura |
| `CombatFooter` | extension | Sélecteur vitesse |

### 5.4 CSS

- Nouveaux tokens raretés (`--rarity-*-border`, `--rarity-*-glow`, particles).
- `--combat-speed: 1` injecté sur `.combat-screen`.
- Keyframes : `attack-pulse`, `projectile-physical`, `projectile-magic`, `heal-trail`, `shield-rune`, `poison-particle`, `enemy-shake`, `ally-shake`, `enemy-aura-low`, `boss-intro-mount`, `roulette-spin` (en JS), `rarity-flash-common/rare/epic/legendary`.
- Bloc `@media (prefers-reduced-motion: reduce)` étendu : toutes les nouvelles keyframes désactivées, alternatives statiques (bordure, opacity step).

### 5.5 Migration save

`saveVersion=3`. `normalizeSave` injecte `lootboxPity={sinceLastRare:0,sinceLastEpic:0}` et `settings={combatSpeed:1}` si absent. Aucune perte de données V2.

## 6. Hors-périmètre (explicite)

- **Pas de nouveau contenu** : pas de nouveaux ennemis, persos, items boutique, lootboxes, consommables, reliques, mécaniques de combat, screens narratifs.
- **Pas de son** : aucune lib audio, aucun fichier audio, aucun bruitage.
- **Pas de WebGL / canvas / lib d'animation** : tout en CSS + transform/opacity, plus rAF pour la roulette uniquement.
- **Pas de tutoriel scripté**.
- **Pas de localisation**.
- **Pas de leaderboard, pas de cloud, pas de réseau**.
- **Pas de refonte du HUD combat** (ConsumableRail, RunProgress, panels) — uniquement extensions visuelles.
- **Pas de réécriture du reducer V2** ni des helpers V2 (`advanceCombat`, `useSpecial`, `applyReward`, `resolveTeamDefeat`, `pickShopItems`, `rollLootbox`).
- **Pas de carte mythique réelle** : la rareté mythique a un placeholder visuel mais aucune carte n'est mythique en V3.
- **Pas de pity prédateur** : la garantie est douce (+5% à +10%), affichée, et reset au draw.
- **Pas de speedrun ×2** : ×1.5 est le max en V3 ; ×2 listé en optionnel n'est pas livré.

## 7. Contraintes

- **Stack** : React + TS + Vite. **Pas de nouvelle dépendance npm**.
- **Performance cible** : 60 fps soutenu sur un combat 5 ennemis (le plus chargé V2) en ×1.5. Mesure : Chrome DevTools Performance, jank < 5%.
- **Animations** : `transform` et `opacity` uniquement sur les éléments animés en continu. Pas de `filter` sur grand élément animé. `will-change` uniquement sur les éléments réellement animés (max 6 simultanés). GPU layers : pas plus de 8 layers actifs en combat normal.
- **prefers-reduced-motion** : obligatoire pour CHAQUE animation. Alternative statique (bordure, fade < 200 ms, opacity step).
- **TypeScript strict** : pas de `any`. Les nouveaux types complets.
- **Accessibilité** : focus visible préservé, contrastes AA conservés sur tous les badges de rareté (textes blancs sur fond pierre/bleu/violet/or testés).
- **Tests** : `npm run build` 0 erreur 0 warning bloquant. `render_game_to_text` JSON valide à tout moment. Hooks de test V2 inchangés. `test-actions/*.json` existants continuent de fonctionner.

## 8. Critères de succès (mesurables — pour la revue)

- [ ] `npm run build` passe.
- [ ] Sélecteur vitesse présent (`#speed-1`, `#speed-1-25`, `#speed-1-5`), changement effectif sur le tempo et persistance localStorage.
- [ ] Attaque alliée : projectile visible (CombatAnimationLayer rend l'élément), impact, floating number `-N PH/MAG/CRIT`.
- [ ] Attaque ennemie : trajectoire vers la cible, impact, floating number près de l'allié, shake.
- [ ] Compétence spéciale animée différemment (durée +20%, particules supplémentaires).
- [ ] Boss intro pleine page visible 1600 ms avant chaque combat boss (vagues 10/20/30). `__game_test_skip_boss_intro` testable.
- [ ] Boss à 50% : flash spécial unique. Boss à 30% : aura instable continue.
- [ ] Lootbox : phases `idle → shake → roulette → reveal → opened`. La roulette s'arrête sur la récompense réellement tirée. Effet de révélation distinct par rareté.
- [ ] `__game_test_skip_roulette()` complète immédiatement la roulette pour les tests Playwright.
- [ ] CharacterCardDetailed visible en collection, reveal lootbox, reveal coffre, creator preview.
- [ ] 5 tiers de coffre visuellement distincts (damaged / bronze / silver / royal / runic).
- [ ] Pity : sauvegardé, affiché discret dans hub `LootboxTab`, reset au tirage rare+.
- [ ] `render_game_to_text` expose les nouveaux champs (`settings`, `bossIntroAt`, `bossPhase`, `animQueue.length`, `lootbox.phase`, `lootboxPity`).
- [ ] `prefers-reduced-motion: reduce` (DevTools) : toutes les anims réduites/désactivées, alternatives statiques visibles.
- [ ] V2 jouable identique : tous les `test-actions/*.json` existants passent sans modif.
- [ ] 0 erreur console.

## 9. Risques identifiés

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Saturation visuelle (trop d'anims simultanées) | Lisibilité | Limiter à 1 projectile / source, batching des floating numbers, `will-change` parcimonieux. Capper la queue d'anims à 12. |
| Perf 1.5× sur combat 5 ennemis | jank | Audit DevTools en revue. Si jank, désactiver les particules de fond pour l'épique/légendaire en combat (réservées aux reveals). |
| Roulette Playwright | tests bloqués | `__game_test_skip_roulette` exposé dès l'init. Documenter dans handoffs. |
| Boss intro casse le tick | combat bloqué | Le tick continue d'âger la queue ; seul `advanceCombat` est bypassé. Test : `advanceTime(2000)` doit ne PAS infliger de dégât pendant l'intro et reprendre normalement après. |
| Save migration vers v3 casse v2 | régression | `normalizeSave` étendu, défauts sûrs, lecture tolérante (pattern V2 conservé). `saveVersion=3` mais clé `runebound-cards-save-v1` inchangée. |
| `App.tsx` explose (>5500 lignes) | maintenance | Décision in-place jusqu'à 5500. Au-delà : extraction `src/components/*` documentée en decisions.md. |
| `prefers-reduced-motion` mal couvert sur 1 anim oubliée | a11y | Designer fournit la liste exhaustive en `handoffs/architect-to-designer.md` ; dev coche chaque animation dans une checklist en review. |
| Rareté mythique tease sans contenu | UX | Placeholder visuel uniquement, badge "À VENIR". Pas de slot dans les pools de loot. |
