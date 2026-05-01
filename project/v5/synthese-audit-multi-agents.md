# Synthèse Audit Multi-Agents — Bobbycard V5.1

**Date** : 2026-04-30
**Mode** : Audit READ-ONLY parallèle (5 agents, aucune modification)
**Objectif** : produire un plan exécutable AVANT de toucher au code

---

## 0. État réel du projet (consolidé)

| Domaine | Statut | Note |
|---|---|---|
| Build | ✅ Clean | 0 erreurs TS, 0 warnings Vite |
| Architecture | ⚠️ Monolithe | App.tsx 6332L, styles.css 7237L, 0 tests auto |
| DA | 🚨 Désaligné | V4 violet sombre vs cible peach chaud |
| Sauvegarde | 🚨 Volatile | RunState pas persistée, pas de "Continuer" |
| Équilibrage | ⚠️ Cassé | 2 reliques OP, forge abusable, pity invisible |
| Tests | ⚠️ Manuels | 18 JSON jamais exécutés, 0 Playwright spec |

**Verdict global** : le jeu **fonctionne** mais a **3 bugs structurels critiques** qui doivent être traités dans cet ordre :
1. Refonte DA (l'utilisateur ne reconnaît pas son jeu)
2. Sauvegarde de run (perte de progression à la fermeture)
3. Équilibrage reliques + forge (cassé après 1ère découverte)

---

## 1. Problèmes BLOQUANTS (à régler en V5.1)

### 🚨 B1 — DA actuelle ≠ DA voulue
- **Constat** : V4 a un fond `#1a1530` (violet nuit), la cible HTML standalone a `#ffd6c2` (peach chaud). Écart **MAJEUR**.
- **Impact** : tout le ressenti du jeu est faux pour l'utilisateur.
- **Décision critique** : mascottes CSS (16 variants existants) vs SVG dessiné (cible HTML) → **À ARBITRER avant V5.1**.

### 🚨 B2 — Run perdue à la fermeture du navigateur
- **Constat** : `RunState` n'est **jamais** sauvée. Seuls or, fragments, perso débloqués, stats meta sont persistés.
- **Impact** : un joueur qui ferme l'onglet en plein run perd 20+ minutes.
- **Solution** : Checkpoints (sauver `currentRun` à chaque fin de combat / hub / boss-relic-choice).

### 🚨 B3 — Reliques OP + forge cassée
- **Sceau d'aube éternelle** : revive all 1× → trivialise le boss final.
- **Couronne Roi Brisé** : +15 % toutes stats → multiplicateur incontrôlé.
- **Warden forgé legendary** : 56 HP base + 20 HP bonus = 76 HP > 50 HP perso de base.
- **Impact** : la 2ème run est soit gagnée d'office (bonnes reliques), soit perdue d'office.

### 🚨 B4 — Reliques invisibles en combat
- 13 reliques implémentées, **0** feedback visuel quand elles se déclenchent.
- **Impact** : le système relique = moteur stratégique du roguelite, joue à 10 % de son rôle.

### 🚨 B5 — Pity counter invisible
- Implémenté en code, **jamais affiché** au joueur.
- **Impact** : frustration max sur lootboxes, joueur ne comprend pas le système.

---

## 2. Problèmes MAJEURS (V5.2 / V5.3)

| # | Problème | Impact |
|---|---|---|
| M1 | Pas de bouton "Continuer" sur menu | Pas de reprise de run même si save présente |
| M2 | Pas de reset save | Save corrompue = jeu cassé sans recours |
| M3 | Win screen vide (pas de recap) | Pas de récompense narrative à finir le jeu |
| M4 | Phases de boss codées mais jamais déclenchées (`bossPhase 1/2`) | Combat boss = simple DPS check |
| M5 | Modificateurs de combat affichés en label seulement | Joueur ne comprend pas l'impact |
| M6 | 18 test-actions JSON jamais exécutés | Régression possible à chaque commit |
| M7 | App.tsx 6332L + reducer 750L = risque régression | Refonte DA dans monolithe = dangereux |

---

## 3. Décisions à prendre AVANT de toucher au code

### Q1 — Mascottes : CSS ou SVG ?
**Contexte** : V4 a 16 variants CSS pur, le standalone semble utiliser SVG.
**Options** :
- A) **Garder CSS, recolorier seulement** (rapide, low risk, ~2h)
- B) **Refaire en SVG d'après le standalone** (lent, high risk, ~10h)

**Ma reco** : **A) Garder CSS et recolorier**. Pour 3 raisons :
1. Tu as déjà 16 variants qui marchent
2. Le standalone montre une SEULE mascotte SVG, pas les 16
3. Recolorier = changement de tokens, pas de réécriture de composant

**À confirmer par utilisateur**.

### Q2 — Sauvegarde : checkpoints quand exactement ?
**Options** :
- A) **À chaque fin de combat** (gros gain, simple)
- B) **À chaque entrée hub + reward + boss-relic-choice** (plus granulaire)
- C) **Mid-fight aussi** (complexe, peu utile)

**Ma reco** : **A + B = sauvegarder aux 4 transitions** : `END_COMBAT`, `CHOOSE_REWARD`, `ENTER_HUB`, `CHOOSE_BOSS_RELIC`. Pas mid-fight.

### Q3 — Reliques OP : nerf ou retrait ?
**Sceau d'aube éternelle** :
- A) Retirer du pool
- B) Nerf à "revive 1 perso à 50 % HP, 1×"
- C) Garder mais ajouter un coût (perdre 50 % d'or, etc.)

**Couronne Roi Brisé +15 %** :
- A) Réduire à +10 %
- B) Splitter en 2 reliques (+10 % HP, +10 % stats)
- C) Garder mais en faire un trade-off (boost + debuff)

**Ma reco** : **B pour les deux**. Préserve la fantaisie de la relique tout en cappant l'abus.

### Q4 — Forge Warden : cap ou contraintes ?
**Options** :
- A) Cap HP max à 65 (vs 76 actuel)
- B) Limiter bonus rareté à +12 (vs +20)
- C) Lier rôle ↔ stats max (Warden HP cappé à 60, Mage MG max 18, etc.)

**Ma reco** : **C**. Renforce le design du jeu (chaque rôle a sa courbe).

### Q5 — Architecture : découpage minimal AVANT refonte DA ?
**Options** :
- A) **Découper d'abord** (Étapes 1-3 de l'audit archi : data files + mascotMapping + HeroMascot, ~2h)
- B) **Refondre d'abord, découper après**
- C) **Pas de découpage, tout dans App.tsx**

**Ma reco** : **A**. Coût 2h, bénéfice = refonte DA isolée dans 3 fichiers au lieu de 6332 lignes.

### Q6 — Tests : Playwright avant ou après refonte ?
**Options** :
- A) Écrire 1 spec golden path **avant** refonte (3-4h)
- B) Refondre, vérifier manuellement, écrire spec en V8

**Ma reco** : **A pour golden path uniquement** (1 seul .spec.ts, ~3h). Couvre 80 % des régressions critiques.

---

## 4. Plan d'attaque V5.1 (ordre exact)

### Phase 0 — Décisions utilisateur (15 min)
Arbitrer Q1-Q6 ci-dessus.

### Phase 1 — Découpage minimal (2h)
**À faire AVANT toute refonte DA**.

1. **Extraire les données master** (40 min)
   - Créer `src/data/characters.ts` (ROSTER, RARITY_LABEL)
   - Créer `src/data/stages.ts` (STAGE_CONFIGS, INTENTS, MODIFIERS)
   - Créer `src/data/shop.ts` (SHOP_POOLS, LOOTBOX_*)
   - Créer `src/data/relics.ts` (BOSS_RELIC_POOL, BOSS_RUNIC_RELIC_POOL)
   - Créer `src/data/consumables.ts` (CONSUMABLE_DEFS, REWARD_POOL)

2. **Extraire mascotMapping** (20 min)
   - Créer `src/utils/mascotMapping.ts` (mapPersonaToVariant, mapEnemyNameToVariant, computeHeroMood, initials)

3. **Extraire HeroMascot** (45 min)
   - Créer `src/components/HeroMascot.tsx` (composant pur)
   - Créer `src/styles/mascot.css` (extrait de styles.css ~500L)
   - Importer dans App.tsx

4. **Build clean** (5 min)
   - `npm run build` doit passer 0 erreurs

5. **Smoke test manuel** (10 min)
   - Lancer `npm run dev`, vérifier menu + combat affichage

**Critère de sortie** : App.tsx ≤ 5400L, styles.css ≤ 6700L, 0 régression visuelle.

### Phase 2 — Spec Playwright golden path (3h)
**À faire AVANT toute refonte DA**.

1. Créer `playwright.config.ts`
2. Créer `tests/golden-path.spec.ts` couvrant :
   - Menu → Team → Stage 1 → Combat → Reward → Hub → Continue
   - Stage 2 → Combat → Hub → Stage 3 → Boss → Relic → Win
   - Game over → Recap → Retour menu
3. Utiliser `window.render_game_to_text()` et `window.advanceTime(ms)` pour assertions
4. Ajouter `npm test` au package.json

**Critère de sortie** : 1 spec verte sur le golden path complet.

### Phase 3 — Refonte DA (8-12h)
1. **Tokens** (2h) : aligner `:root` sur palette HTML standalone (peach, cream, ink conservé, raretés pastels)
2. **HeroMascot recolor** (1h) : changer les couleurs CSS variables (--mascot-skin, --mascot-hat) sans toucher la structure
3. **CharacterCard** (3h) : adapter au pattern visuel cible
4. **Boutons / pills / hub** (3h)
5. **Combat layout** (2h)
6. **Coffres + roulette** (1h)

**Critère de sortie** : 
- ✅ Build clean
- ✅ Playwright golden path passe toujours
- ✅ Validation utilisateur sur écran menu + combat

### Phase 4 — Sauvegarde checkpoints (4h)
1. Étendre `SaveData` avec `currentRun?: RunState` + sérialisation/désérialisation
2. Sauver dans le reducer aux 4 transitions (END_COMBAT, CHOOSE_REWARD, ENTER_HUB, CHOOSE_BOSS_RELIC)
3. Au démarrage : si `currentRun` présent → afficher bouton "Continuer" sur menu
4. Au game over : `currentRun = null`
5. Try/catch global avec bouton "Réinitialiser save" en cas de corruption

**Critère de sortie** : fermer navigateur après hub stage 2 → revenir → cliquer "Continuer" → reprend exactement où on était.

### Phase 5 — Équilibrage reliques + forge (3h)
1. Sceau d'aube éternelle : nerf à "revive 1 perso 50 % HP, 1×"
2. Couronne Roi Brisé : split en 2 reliques (+10 % HP, +10 % stats)
3. Forge : ajouter contraintes rôle ↔ stat max (Warden HP cap 60, Mage MG cap 18, etc.)
4. Mettre à jour les tests si besoin

**Critère de sortie** : 5 runs de test sans cas évident de "trivialisation par relique".

### Phase 6 — Feedback visuel (3h)
1. Pity counter affiché en lootbox screen ("Prochaine rare garantie dans 3 draws")
2. Reliques actives : pulse + log au combat quand elles se déclenchent
3. Modificateurs de combat : tooltip explicatif sur le label

**Critère de sortie** : un joueur peut **expliquer** chaque relique active après une run.

---

## 5. Fichiers à modifier en premier (par phase)

### Phase 1 (découpage)
- `src/App.tsx` (extraire ~1000L)
- `src/styles.css` (extraire mascot section ~500L)
- + 7 nouveaux fichiers `src/data/*.ts`, `src/utils/mascotMapping.ts`, `src/components/HeroMascot.tsx`, `src/styles/mascot.css`

### Phase 2 (tests)
- `playwright.config.ts` (nouveau)
- `tests/golden-path.spec.ts` (nouveau)
- `package.json` (script test)

### Phase 3 (DA)
- `src/styles.css` (`:root` tokens)
- `src/styles/mascot.css` (couleurs variants)
- `src/components/CharacterCard*.tsx` (à extraire)

### Phase 4 (save)
- `src/App.tsx` types + reducer + initialState
- `src/data/save.ts` (nouveau, avec serialize/deserialize)

### Phase 5 (équilibrage)
- `src/data/relics.ts`
- `src/data/characters.ts` (createCustomCharacter constraints)

### Phase 6 (feedback)
- `src/screens/LootboxScreen.tsx` (à extraire)
- `src/screens/CombatScreen.tsx` (à extraire)

---

## 6. Fichiers à NE PAS toucher avant tests

- `gameReducer` (lignes 2116-2867 dans App.tsx) — **750L de logique critique**
- `advanceCombat` (lignes 1655-1876) — **animations + dégâts + boss phases**
- `animQueue` system (lignes 3487-3520) — **synchro visuelle**
- `STORAGE_KEY` constant — **compatibilité saves existantes**
- `PLAYER_ATTACK_INTERVAL` (1280ms) — **timing combat**
- Sélecteurs data-* utilisés par test-actions/

---

## 7. Tickets V5.1 (granularité courte)

```
T1  [archi]   Extraire src/data/characters.ts                 [40min]
T2  [archi]   Extraire src/data/stages.ts                     [30min]
T3  [archi]   Extraire src/data/shop.ts + relics + consumables [40min]
T4  [archi]   Extraire src/utils/mascotMapping.ts             [20min]
T5  [archi]   Extraire src/components/HeroMascot.tsx          [25min]
T6  [archi]   Extraire src/styles/mascot.css                  [20min]
T7  [tests]   Setup playwright.config.ts                      [30min]
T8  [tests]   Spec golden path menu → boss final              [2h30]
T9  [DA]      Aligner :root tokens sur palette peach          [1h30]
T10 [DA]      Recolorier mascot.css variants                  [1h]
T11 [DA]      Refondre CharacterCard pattern                  [2h30]
T12 [DA]      Refondre boutons + pills + hub UI               [3h]
T13 [DA]      Refondre combat layout                          [2h]
T14 [DA]      Refondre coffres + roulette                     [1h]
T15 [save]    Étendre SaveData avec currentRun                [1h]
T16 [save]    Sauver aux 4 transitions reducer                [1h30]
T17 [save]    Bouton Continuer + reset save                   [1h]
T18 [save]    Try/catch global save corruption                [30min]
T19 [equil]   Nerf Sceau d'aube éternelle                     [30min]
T20 [equil]   Split Couronne Roi Brisé                        [30min]
T21 [equil]   Contraintes forge rôle ↔ stat                   [1h]
T22 [equil]   5 runs de validation manuelle                   [2h]
T23 [feed]    Affichage pity counter en lootbox               [1h]
T24 [feed]    Pulse reliques actives en combat                [2h]
```

**Total V5.1** : ~28h (3-4 jours de travail concentré).

---

## 8. Risques principaux & mitigations

| # | Risque | Probabilité | Mitigation |
|---|---|---|---|
| R1 | Refonte DA casse les sélecteurs data-* utilisés par test-actions | HAUTE | Préserver tous les `id="..."` listés au §6, T8 |
| R2 | Refonte tokens `:root` casse des classes V2/V3 oubliées | MOYENNE | Audit grep de tokens V2/V3 utilisés ailleurs, T9 |
| R3 | Sauvegarde corrompue après ajout currentRun | MOYENNE | T18 (try/catch) + bouton reset, normalizeSave robuste |
| R4 | Nerf reliques casse les saves de joueurs ayant déjà des reliques OP | BASSE | Aucune save n'a de reliques persistées (run éphémère), risque nul |
| R5 | Découpage extraction casse les imports React | BASSE | TS strict + build à chaque étape |
| R6 | HeroMascot extracted ne reçoit plus le bon CSS scope | MOYENNE | Importer `mascot.css` dans `HeroMascot.tsx`, T5+T6 |
| R7 | Sauvegarde mid-run avec race condition (TICK pendant save) | BASSE | Sauver hors TICK uniquement, jamais pendant combat |

---

## 9. Tests obligatoires avant merge V5.1

```bash
# 1. Build clean
npm run build
# → 0 erreurs TypeScript, 0 warnings

# 2. Playwright golden path
npm test
# → 1 spec verte (menu → boss → game over)

# 3. Smoke test manuel
npm run dev
# Vérifier :
# - Menu : nouvelle DA chargée (peach background, cream cards)
# - Combat : héros + ennemis affichés correctement
# - Hub : 5 onglets fonctionnels
# - Sauvegarde : fermer + rouvrir → "Continuer" présent si run en cours
# - Reliques : feedback visuel quand actives
# - Pity counter : affiché sur lootbox screen

# 4. localStorage validation
# DevTools → Application → localStorage
# Clé "runebound-cards-save-v1" présente
# Format JSON valide
# Champ currentRun présent si run en cours

# 5. Test régression visuelle
# 5 runs complètes, comparer avec maquette HTML standalone (utilisateur valide)
```

---

## 10. Ce que les 5 audits ont validé ensemble

- ✅ **Build sain** : pas de blocage technique
- ✅ **Architecture découpable** : 4-5h pour réduire de 6332L à 4500L sans casser le reducer
- ✅ **Save schema simple** : ajout `currentRun?` faisable sans migration destructive
- ✅ **18 test-actions JSON existent** : peuvent être convertis en specs Playwright facilement
- ✅ **Hooks de test internes solides** : `render_game_to_text` + `advanceTime` couvrent tout l'état

---

## 11. Ce que les 5 audits ont diagnostiqué unanimement comme cassé

- 🚨 **DA non alignée** : urgence absolue
- 🚨 **Save mid-run inexistante** : critique pour roguelite
- 🚨 **Reliques OP** : Sceau d'aube + Couronne = trivialise le jeu
- 🚨 **Reliques invisibles** : 90 % des effets ne sont jamais perçus
- 🚨 **Win condition vide** : pas de recap, pas de déblocage
- 🚨 **Aucun test automatisé** : régression à chaque commit

---

## 12. Recommandation finale

**Ne PAS commencer la refonte DA tout de suite**. Faire d'abord :
1. **Phase 0** : décisions utilisateur sur Q1-Q6 (15 min)
2. **Phase 1** : découpage minimal (2h)
3. **Phase 2** : Playwright golden path (3h)

Total **~5h** avant la première ligne de DA.

**Pourquoi cet ordre** : refondre la DA sur un monolithe de 6332L sans tests, c'est jouer à la roulette russe. 5h de prep = 80 % de risque en moins, refonte DA 2× plus rapide après.

> *"Ralentir pour aller plus vite."*
