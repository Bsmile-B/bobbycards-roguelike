# Passation Designer → Dev (V2)

## 1. Cap général

Tu greffes une couche progression sur l'app combat existante. **Tu ne dois pas toucher au HUD combat.** Tu ajoutes des composants autour : RunProgress (au-dessus), ConsumableRail (en dessous), et de nouveaux écrans (stage-intro, hub, lootbox) qui sont rendus à la place du combat.

Tous les tokens, classes et animations sont définis dans :
- `project/design/design-system.md` — palette, tokens, conventions.
- `project/design/wireframes.md` — layouts détaillés, états, interactions.
- `project/design/animations.md` — durées, easings, sequences, reduced-motion.
- `project/design/css-tokens.md` — bloc CSS prêt à coller.

**Lis `css-tokens.md` en premier**, copie le bloc `:root` étendu et le bloc `.app-shell.stage-N` dans `src/styles.css`, puis colle le skeleton des composants à la fin du fichier (avant la media query mobile). C'est ton point de départ.

---

## 2. Ce qui n'est pas évident à la lecture seule

1. **Le hub porte l'accent du stage SUIVANT, pas du stage en cours.** `<div class="hub-screen stage-2">` après le boss de stage 1. Justification : le hub est l'antichambre, on annonce visuellement la couleur de la suite.
2. **L'or animé est JS-side.** Le compteur or doit interpoler de l'ancienne valeur à la nouvelle sur 320ms easeOutCubic. Si `prefers-reduced-motion: reduce`, jump direct. Pas de CSS pour ça (CSS counter ne tient pas la route).
3. **La séquence lootbox est en chevauchement.** Click → flash 200ms (out à 200ms) → lid open démarre à 200ms (en parallèle) → reveal démarre à 400ms (en delay). Total visible : 600ms. Implémente avec **3 setTimeout** (ou un `useTransition` à 3 états) qui swap des classes CSS — pas de logique d'animation en JS.
4. **Consumable rail intégré sous CombatFooter, PAS dans CombatFooter.** C'est une bande indépendante, en frère du `.combat-footer`, dans le `.combat-screen`. Pas de modification du markup `CombatFooter`.
5. **Les classes `.stage-1/2/3` sur `.app-shell`** influencent uniquement les composants V2 qui consomment `var(--stage-accent)`. Le combat (HUD, cards) garde son or/rouge sang. Si tu vois le HUD changer de couleur, c'est qu'une classe V2 a leak un override sur un sélecteur trop large — c'est un bug.
6. **La modale recycle est centrée en `position: fixed`** (pas en `position: absolute` dans un parent). C'est le seul moyen de centrer sans dépendre du layout du tab actif. Backdrop séparé, click-on-backdrop = annulation.
7. **Le RunProgress tient en 1 ligne de 30 cases.** Largeur calculée : 30×14 + 29×4 (gap) + 2×18 (hubs) + 2×8 (gaps autour des hubs) = 580px. Largement sous 1180px. Pas besoin de wrap.

---

## 3. Composants React à créer

### 3.1 RunProgress
Props :
```ts
type RunProgressProps = {
  fight: number; // 1..30
  stage: 1 | 2 | 3;
  wave: number; // 1..10
  bossesDefeated: number;
};
```
Rendu : 30 steps + 2 hub markers, calcul des classes `--passed`/`--current`/`--future`/`--boss`/`--hub` à partir de `fight`. Légende textuelle au-dessus.

Position d'usage : dans le `CombatHud` (en haut, prepend) **et** dans le `HubHeader`.

ID racine : `run-progress`. Pas d'ID sur les steps (pas testés individuellement).

### 3.2 StageIntroScreen
Props :
```ts
type StageIntroScreenProps = {
  stage: 1 | 2 | 3;
  onEnter: () => void;
};
```
Rendu : sigil, eyebrow "STAGE N", titre du stage (depuis `STAGE_CONFIGS[stage].name`), phrase d'ambiance hardcodée (3 phrases dans un constant `STAGE_INTRO_LINES`), nom du boss, bouton "Entrer" `id="stage-intro-enter"`.

Phrases d'ambiance suggérées (à valider) :
- Stage 1 : « Le froid mord les os. Les runes attendent. »
- Stage 2 : « Le vide chuchote. Ne réponds pas. »
- Stage 3 : « Le Roi est brisé. Sa couronne saigne encore. »

Focus auto sur le bouton au mount.

### 3.3 HubScreen
Props :
```ts
type HubScreenProps = {
  hub: HubState;
  run: RunState;
  save: SaveData;
  customCharacters: CharacterTemplate[];
  selectedIds: string[];
  unlockedIds: string[];
  dispatch: Dispatch<Action>;
};
```
Rendu : header + tabs + content (switch sur `hub.activeTab`) + footer. Classe `stage-{nextStage}` sur le wrapper.

### 3.4 HubHeader
Sous-composant : eyebrow stage cleared + next, 4 `HubResource` pills (or, fragments, vies, conso slots remplis), RunProgress.

### 3.5 HubTabs
Sous-composant : 5 boutons. IDs : `hub-tab-shop`, `hub-tab-lootbox`, `hub-tab-recycle`, `hub-tab-team`, `hub-tab-stats`. `aria-selected`, `role="tab"`, navigation flèches gauche/droite.

### 3.6 ShopTab
Props : `shopItems: ShopItem[]`, `gold: number`, `dispatch`.
Rendu : titre "Boutique des [stage]" + bouton reroll (`id="shop-reroll"`) à droite, grille 3 cols × 2 lignes max.
Chaque item = `ShopItemCard` (sous-composant), id du bouton acheter `shop-buy-{index}`. Animation buy-flash en ajoutant la classe `buy-flash` puis `--locked` après 360ms.

### 3.7 LootboxTab
Rendu : 4 `LootboxCard` (small/rare/epic/runic). IDs : `lootbox-buy-small`, `lootbox-buy-rare`, `lootbox-buy-epic`. La runique est `disabled` sauf si une feature future la débloque.

### 3.8 LootboxScreen
Props : `pendingLootbox: { tier, opened, result }`, `dispatch`.
État interne : `phase: 'closed' | 'opening' | 'opened'`. Click sur `id="lootbox-open"` → setPhase('opening') → setTimeout 300ms → setPhase('opened') → dispatch OPEN_LOOTBOX (qui calcule le résultat). CTA "Récupérer" `id="lootbox-close"` apparaît après 600ms.

### 3.9 RecycleTab
Props : `customCharacters`, `selectedIds`, `dispatch`.
Filtre : `customCharacters.filter(c => !STARTER_IDS.includes(c.id) && !selectedIds.includes(c.id))`.
Chaque ligne = `RecycleRow`, bouton "Recycler" → dispatch `HUB_RECYCLE_REQUEST` qui set `pendingRecycle`. La modale est rendue conditionnellement (voir 3.10).

### 3.10 RecycleConfirmModal
Props : `pendingRecycle: { characterId } | null`, `customCharacters`, `dispatch`.
Si `pendingRecycle === null`, ne rend rien. Sinon : backdrop + modal centrée, bouton "Annuler" (`recycle-cancel`, focus auto) et "Recycler" (`recycle-confirm`).
Esc = cancel, click-backdrop = cancel. Focus trap.

### 3.11 TeamTab (HubTeamTab)
Props : `team`, `selectedIds`, `unlockedIds`, `customCharacters`, `freeSwapsUsed`, `dispatch`.
État : `pendingIn: characterId | null` (pour le flow 2-clics). Quand un héros disponible est cliqué, `pendingIn` est set, les 3 cards d'équipe deviennent `swap-target`. Click sur l'une → dispatch `HUB_SWAP_HERO`. ID composite (en dernier ressort) : `team-swap-{outId}-{inId}`.

Indicateur en haut-droite : "Swap gratuit disponible (1)" (freeSwapsUsed=0) ou "75 or par swap" (freeSwapsUsed=1).

Tag "70% PV" affiché sur la `hub-team-card` du nouveau venu (post-swap).

### 3.12 StatsTab
Props : `run.stats`, `run.stage`, `save`. Lecture seule. 2 `.stats-block` côte à côte.

### 3.13 ConsumableRail
Props : `consumables: ConsumableSlots`, `inCombat: boolean`, `dispatch`.
3 slots toujours rendus. IDs : `consumable-0`, `consumable-1`, `consumable-2`. Click sur slot rempli → si `inCombat`, dispatch `USE_CONSUMABLE`. Si !inCombat (au hub), pas d'action mais tooltip "Disponible en combat".

État `using` (animation de sortie) : ajouter classe pendant 240ms avant de dispatch (l'utilisateur perçoit l'effet) — alternativement, dispatch immédiat et le re-render efface le slot. Choix : **dispatch immédiat**, le slot disparaît en `--empty` aussitôt, l'animation est portée par le slot lui-même via React `key={slotIndex + (consumable?.id ?? 'empty')}`. Voir l'implémentation reduced-motion.

### 3.14 ConsumableSlot (sous-composant)
Props : `consumable: Consumable | null`, `slotIndex`, `onClick`, `disabled`.
Si null → `.consumable-slot--empty`. Sinon → `.consumable-slot--filled` + icône via classe `.consumable-icon-{kind}` + label.

### 3.15 FinalChest
Props : `tier: ChestTier`, `opened: boolean`, `reward: ChestReward | null`, `onOpen`.
Rendu : div `.final-chest` + `.chest.chest-tier--{tier}` + bouton `id="open-chest"` (existant, conserver). Label du bouton dynamique : "Ouvrir le coffre [abîmé|bronze|argent|royal|runique]".

---

## 4. Mapping wireframe → classes CSS

| Wireframe section | Classe wrapper | Classes enfants clés |
|-------------------|---------------|----------------------|
| RunProgress (§1) | `.run-progress` | `.run-progress__legend`, `.run-progress__bar`, `.run-progress__stage`, `.run-progress__step` (+ `--passed/current/future/boss/hub`) |
| Stage Intro (§2) | `.stage-intro.stage-{n}` | `.stage-intro__sigil`, `.stage-intro__title`, `.stage-intro__atmosphere`, `.stage-intro__boss`, `.stage-intro__cta` |
| Hub Screen (§3) | `.hub-screen.stage-{n}` | `.hub-header`, `.hub-tabs`, `.hub-content`, `.hub-footer`, `.hub-resource`, `.hub-tab` (+ `--active`), `.hub-continue` |
| Shop tab (§4) | `.shop-grid` | `.shop-item` (+ `.rarity-{r}`, `--locked`, `--unaffordable`, `.buy-flash`), `.btn-shop`, `.tier-badge--{r}`, `.shop-reroll` |
| Lootbox tab (§5) | `.lootbox-grid` | `.lootbox-card` (+ `--small/rare/epic/runic/locked`), `.lootbox-card__title`, `.lootbox-probas`, `.lootbox-card__price` |
| Lootbox screen (§6) | `.lootbox-screen` | `.lootbox-chest` (+ `.opening`, `.opened`), `.lootbox-flash`, `.lootbox-reveal` |
| Recycle tab (§7) | `.recycle-list` | `.recycle-row`, `.recycle-row__name`, `.recycle-row__refund`, `.tier-badge--{r}` |
| Recycle modal (§7) | `.modal-backdrop.open` | `.recycle-confirm-modal.open`, `.recycle-confirm-modal__title`, `.recycle-confirm-modal__warn`, `.recycle-confirm-modal__actions` |
| Team tab (§8) | `.hub-team-current` + `.hub-team-roster` | `.hub-team-card` (+ `.swap-target`), `.hub-team-card__hp-tag`, `.swap-cost-tag` |
| Stats tab (§9) | `.hub-stats-grid` | `.stats-block`, `.stats-block__title` |
| Consumable rail (§10) | `.consumable-rail` | `.consumable-slot` (+ `--empty/--filled`, `.using`), `.consumable-slot__icon`, `.consumable-slot__label`, `.consumable-icon-{kind}` |
| Final chest (§11) | `.final-chest` | `.chest.chest-tier--{tier}` (+ existing `.chest-lid/.chest-body/.opened`) |

---

## 5. Hooks d'accessibilité

### Focus management

- **StageIntroScreen** : `useEffect` sur le bouton "Entrer", `ref.current?.focus()` au mount.
- **HubTabs** : flèches gauche/droite changent `activeTab`. Tab key sort vers le content.
- **RecycleConfirmModal** : focus trap (utility simple : capturer Tab et Shift+Tab dans le `<dialog>` ou le wrapper). Focus initial sur "Annuler".
- **LootboxScreen** : focus auto sur le coffre cliquable. Après ouverture, focus passe sur "Récupérer".
- **Modale "Remplacer consommable"** (sur achat avec inventaire plein) : même traitement que recycle modal.

### ARIA labels essentiels

- RunProgress : `role="progressbar" aria-label="Progression de la run" aria-valuemin=1 aria-valuemax=30 aria-valuenow={fight}` + texte de légende toujours visible.
- HubTabs : `role="tablist"`, chaque `.hub-tab` = `role="tab" aria-selected={...}`, le content = `role="tabpanel"`.
- ShopItem button : `aria-label="Acheter {item.name} pour {item.price} or"` ; si or insuffisant, ajouter `aria-disabled="true"` + texte explicatif visible.
- ConsumableSlot : `aria-label="Slot {n} : {consumable.name}. Cliquez pour utiliser."` ou `aria-label="Slot {n} : vide" aria-disabled="true"`.
- LootboxScreen : `aria-live="polite"` sur `.lootbox-reveal__line` pour annoncer le contenu.
- RecycleConfirmModal : `role="alertdialog" aria-labelledby="recycle-modal-title" aria-describedby="recycle-modal-warn"`.
- FinalChest : bouton `aria-label="Ouvrir le coffre {tier}"`.

### Respect prefers-reduced-motion

Toutes les animations CSS V2 ont leur override dans le bloc `@media (prefers-reduced-motion: reduce)` à la fin de `css-tokens.md`. **Pour les animations JS** (number tween du gold counter), branche conditionnelle :

```ts
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

Si `reduced`, jump à la valeur finale immédiatement, sinon tween 320ms easeOutCubic.

---

## 6. Ce que tu NE DOIS PAS toucher

- `CombatHud` (composant et CSS `.combat-hud`, `.hud-primary`, `.hud-tile`, `.hud-panels`, `.hud-panel`, `.hud-stat-grid`).
- `CombatFooter` (composant et CSS `.combat-footer`, `.timeline-row`, `.compact-log`).
- `.combat-card`, `.combat-card-head`, `.combat-card-title`, `.special-button`.
- `.enemy-card`, `.enemy-figure`, `.enemy-meter`, `.intent-banner`.
- `.battlefield`, `.team-column`.
- `.portrait`, `.portrait-mark`, `.portrait-name`, variantes `.portrait-attack/heal/shield/ronan/small`.
- `.character-card`, `.collection-grid`.
- `.menu-screen`, `.menu-sigil`, `.menu-stats`, `.menu-actions`.
- `.creator-screen`, `.creator-form`, `.creator-preview`, `.forge-cost`.
- `.reward-grid`, `.reward-card` (tu peux étendre le pool de récompenses dans le code, mais pas la classe CSS).
- `.chest`, `.chest-lid`, `.chest-body`, `.chest-result`, `.compact-result`. **Tu ÉTENDS via `.chest-tier--{tier}` qui s'ajoute en plus.** Le `.chest.opened` reste.
- Les `id` HTML : `start-run`, `nav-creator`, `creator-name`, `creator-rarity`, `create-character`, `team-start`, `abandon-run`, `reward-0..2`, `open-chest`. **Conservés à l'identique** (tests Playwright).
- Les fonctions `render_game_to_text`, `advanceTime`, `applyReward`, `advanceCombat`, `useSpecial`, `normalizeSave` (tu les **étends**, tu ne les renommes pas).

---

## 7. Pièges responsive

Le brief impose 1280×720, mais l'app actuelle a des media queries < 760px. Pour V2 :

- **Hub** : si < 760px, les 5 tabs **ne tiennent pas**. Solution simple : laisser `flex-wrap: wrap` se déclencher ; pas de bug, juste 2 lignes. Pas une priorité.
- **Shop grid** : `grid-template-columns: repeat(3, 1fr)` → en mobile, basculer en `repeat(2, 1fr)` puis `1fr`.
- **Lootbox grid** : 4 cols → 2 cols en < 900px, 1 col en < 600px.
- **Run progress** : 30 cases sur une ligne mobile = trop serré. À < 760px, basculer en 3 lignes empilées (une par stage). Voir si possible avec `flex-wrap` sur `.run-progress__bar` + `flex-basis: 100%` sur `.run-progress__stage`.
- **Consumable rail** : passe en `grid-template-columns: 1fr` (1 par ligne) en < 760px.

Ce sont des "nice to have" — la cible reste 1280×720.

---

## 8. Pièges accessibilité (à tester)

- **Lecteur d'écran** : NVDA / VoiceOver. Le hub doit annoncer "Onglet Boutique sélectionné" quand on change de tab. Le résultat de la lootbox doit être annoncé à voix haute (aria-live polite).
- **Clavier seul** : depuis le menu, on doit pouvoir tout faire sans souris. En particulier : naviguer dans la boutique, acheter, naviguer dans les onglets, ouvrir la lootbox, recycler avec confirmation modale.
- **Esc** : ferme la modale recycle, ferme la modale "remplacer consommable", **ne ferme pas** le hub (pas de Esc=back, sinon le joueur peut perdre son onglet par erreur).
- **Tabulation dans la modale** : focus trap impératif. Sinon le screen reader sort de la modale et lit la boutique en arrière-plan, c'est confus.
- **Contraste** : tous les couples texte/fond V2 sont AA (vérifié dans design-system.md §2.3). À ne pas régresser : ne pas mettre `var(--color-text-muted)` sur `var(--stage-2-accent)` (échec). Pour texte sur surface accent, utiliser `var(--stage-on-accent)` ou `var(--color-text-strong)`.
- **prefers-reduced-motion** : tester via DevTools. Le pulse du current step, les animations runic du coffre, les flashes : tous doivent disparaître.

---

## 9. Ordre de construction recommandé

1. Coller les tokens et le skeleton CSS dans `styles.css`.
2. T1, T2, T3 : types + state + STAGE_CONFIGS.
3. **T7 (déjà fait par designer) → T6 RunProgress** (rapide, débloque visuellement).
4. **T4 stage-intro screen** + classes `.stage-N` sur app-shell.
5. T9 HubScreen squelette (header + tabs + content vide + footer).
6. T20 StatsTab (le plus simple, donne un onglet fonctionnel pour valider la nav).
7. T18/T19 TeamTab + swap.
8. T16/T17 RecycleTab + modale.
9. T10/T11/T12 ShopTab + effets.
10. T13/T14/T15 Lootbox.
11. T21/T22/T23 ConsumableRail + integration combat.
12. T24 Refonte récompenses.
13. T25/T26 ChestTier visuel + logique.
14. T27 render_game_to_text étendu.
15. T28 test-actions JSON V2.
16. T29 build + tests Playwright.

Cette séquence isole les risques : le RunProgress est cosmétique tôt, les Tabs simples avant les complexes, la lootbox (animation) après le hub fonctionnel, les consumables en dernier (touchent au combat).

---

## 10. Validation finale (designer-side)

Avant de marquer T29 done, vérifier visuellement :

- [ ] Stage 1 : accent bleu glacé visible dans le hub stage 0→1 (au menu, pas de stage encore — n/a) puis dans les éléments V2 pendant le combat stage 1.
- [ ] Stage 2 : accent violet profond, **pas pastel**.
- [ ] Stage 3 : or terni + rouge sang sur le hub stage 2→3.
- [ ] Coffre runique : runes qui tournent visiblement, glow cyan + or.
- [ ] Lootbox : flash net, pas de saccade, total ≤ 800ms.
- [ ] Modale recycle : pas de scroll arrière-plan, focus correctement piégé.
- [ ] Consumable rail : 3 slots toujours visibles, pas de chevauchement avec `.combat-footer`.
- [ ] RunProgress : la case courante pulse en accent stage, pas en or.
- [ ] Reduced-motion : tester avec DevTools, plus rien ne bouge en boucle.

Bon code.
