# Revue V4 — itération 1 (2026-04-29)

## Résumé

Livraison **à reprendre partiellement**. La fondation tokens (Phase A), les mascottes CSS (Phase B/C), les cartes détaillées et les skyboxes sont **conformes et convaincants**. Mais une part substantielle de la skin V4 a été **fournie en CSS sans être branchée au DOM React** : boutons, coffres, floating numbers, onglet hub actif, plusieurs atomes combat. Résultat : à l'écran, des morceaux entiers (chests, fnums, .primary-action, .hub-tab--active, skill cards, consumables) **gardent leur apparence V3 dark fantasy** sous une enveloppe par ailleurs candy. La cohérence DA n'est donc pas atteinte de bout en bout, malgré la qualité des morceaux livrés. V2/V3 fonctionnellement préservées (IDs Playwright, hooks de test, save).

---

## Audit checklist

### Phase A — Tokens & polices
- index.html preconnect + Google Fonts : ✓ — `index.html:6-11` (Lilita One, Nunito, JetBrains Mono).
- :root migration vers candy : ✓ — second `:root` à `styles.css:3212` redéclare `--color-bg = var(--bg-deep)`, `--rarity-commune = var(--rarity-common)`, etc.
- Nouveaux tokens (bg-cream, paper, brand-coral/mint/sun/sky/grape, shadow-stick*, font-display/body, rarity-{kind}-deep/cream, stage-{N}-deep/cream) : ✓ — `styles.css:3214-3475`.
- body : `--bg-deep` + `--font-body` + `var(--paper)` global : ✓ — `styles.css:5819-5828`.
- app-shell::before grille runique neutralisée : ✓ — `styles.css:5833`.
- Aucune classe V2/V3 cassée par rename : ✓ — stratégie d'append cumulatif.

### Phase B — Cartes & raretés
- HeroMascot signature stricte (variant/size/mood/className/style + side/ariaLabel) : ✓ — `App.tsx:2947`. 0 `any`. Composant pure.
- 22 variants exposés (17 spec + 5 alias) : ✓ — `App.tsx:2886-2908`. Légère sur-surface mais documentée en `decisions.md`.
- 5 sizes / 6 moods : ✓ — types stricts `App.tsx:2910-2911`.
- CharacterCardDetailed double inset + cerne ink + sticker shadow + halo radial : ✓ — `styles.css:4160-4234`.
- Mascotte intégrée au portrait (lg) : ✓ — `App.tsx:4596-4602`.
- 5 raretés idle : commun static / rare shimmer-x / épique pulse-halo / légendaire breathe : ✓ — keyframes `styles.css:5786-5810`.
- Mythique activée visuellement : ⚠ — classe `.rarity-mythic` complète et token `#ff5fa2` actifs en CSS, mais aucun perso mythique dans STARTERS et `CharacterCardDetailed.tsx:4626` n'inclut pas le branchement `rarity === "mythic"` pour les particules ni les sparkles. Cohérent avec `decisions.md` "visuel actif, drop désactivé V4". Acceptable.
- Sparkles ≤ 2 cartes mythique : ✓ — `App.tsx:4634-4639` rend 1 sparkle uniquement pour légendaire (mythique non instancié).

### Phase C — Combat
- CombatHero mini-mascotte sm + cerne ink + sticker shadow + cream gradient : ✓ — `App.tsx:3282-3287`, `styles.css:4683-4694`.
- EnemyCard mascottes + boss scale (1.4) : ✓ — `App.tsx:3350-3355`, `styles.css:2962`.
- mapEnemyNameToVariant 9 mobs + 3 boss : ✓ — `App.tsx:3022-3044`. Note : fallback `stageFromFight(1)` ligne 3351 hardcoded mais inerte (mascot stocké à createEnemy).
- BossHpBar fond ink-violet + nom mythic glow + barre dégradé mythic→coral : ✓ pour CSS — `styles.css:4626-4662` ; ⚠ DOM réel : le React de `EnemyCard` n'émet que `.boss-hp-bar__fill` et `.boss-hp-bar__shimmer` (App.tsx:3344-3347), pas de `.boss-hp-bar__name` ni `.boss-hp-bar__track` — la stylisation CSS s'applique sur le wrapper mais la sous-structure V4 (track + name) est ignorée.
- RunProgress 30 dots + dot courant coral pulsant + dots boss carrés or : ⚠ — CSS V4 `.run-progress__dot` à `styles.css:4575-4598` existe MAIS le React rend `.run-progress__step` (App.tsx:3490) — ancien V2. La nouvelle stylisation candy ne s'applique pas.
- Skybox stage 1/2/3 : ✓ — `styles.css:4508-4525`, classe `combat-screen stage-N` posée à `App.tsx:5606`.
- chero-attack / enemy-attack keyframes (translate + rotate 0.45s) : ✓ — `styles.css:4981-5002`.
- chero-attack-special : ✓ — `styles.css:4986`.
- Floating numbers Lilita One + stroke ink + fnum-rise : ✗ — React rend `.floating-num` (App.tsx:4854) qui matche le CSS V3 `styles.css:2399` (font V3, animation `floating-rise-fade`). Le bloc V4 `.fnum`/`fnum-rise` (`styles.css:4833+5004`) est **dead CSS** — aucun DOM ne le déclenche.
- Combat footer (skills + consumables + speed selector) re-skinné candy : ✗ — React conserve `.special-button`, `.consumable-slot`, `.speed-selector`, `.intent-banner`. Le V4 fournit `.skill-card`, `.cons`, `.combat-speed`, `.intent` (`styles.css:4795-4823`), tous **dead** car classes non émises.

### Phase D — Coffres & roulette
- FinalChest 5 tiers candy avec composition lid + body + studs + aura : ✗ — React rend uniquement `<div class="chest-lid"/>` + `<div class="chest-body"/>` (App.tsx:4493-4498). Le bloc CSS V4 `.chest__body / .chest__band / .chest__lock / .chest__lid / .chest__lid-band / .chest__keyhole / .chest__stud--{l,c,r} / .chest__rune--{1,2,3} / .chest__burst` (`styles.css:5060-5197`) est **dead code intégral**. Les coffres restent stylisés via `.chest-tier--{tier}` (V3 minimal) — **pas la composition candy promise**.
- Animation idle par tier : ⚠ — partielle (V3 `chest-glow-idle` reste sur `.chest-tier--royal` etc.), mais sans la couche `pulse-halo` aura V4.
- Animation d'ouverture (lid rotateX -100deg + chest-burst) : ⚠ — V3 conserve `chest-lid-rotate` (un Y subtil) ; le `chest-burst` keyframe V4 existe (`styles.css:5338`) mais aucune classe `.chest.is-opening .chest__burst` n'est déclenchée car le DOM n'a pas de `.chest__burst`.
- LootRoulette marker coral pointu + fade lateral + items 110px cards rareté : ✓ — CSS dual-class (`.rou` + `.loot-roulette__*`), React émet `.loot-roulette__*` qui matche les règles communes (`styles.css:5260-5290`). Items 110px confirmés.
- Easing 2700ms cubic-bezier : ✓ — `styles.css:5268`.

### Phase E — Hub & onglets
- HubScreen skybox + header + 5 onglets pill : ✓ — `styles.css:5361-5446`. Skybox stage rendue.
- Onglet actif coral candy : ✗ — V4 cible `.hub-tab.is-active` (`styles.css:5441`) mais React émet `.hub-tab--active` (App.tsx:3663). **L'onglet actif reste V3 (couleur runique).**
- Onglets pill cream sticker shadow inactif : ✓ — `.hub-tab` matche.
- Boutique / Lootbox / Recyclage / Équipe / Stats skinnés candy : ⚠ — `.shop-item`, `.lootbox-card` reçoivent `color: var(--ink)` via `styles.css:5843` mais leurs règles V4 spécifiques (cards cream avec rarity-cream bg, prix or pill, mascotte coffre mini) **ne sont pas écrites dans la livraison** (cf. specs §4 Phase E). Le skin reste hybride V3+tokens migrés.
- Modales (recycle-confirm, replace-consumable) re-skinnées : ⚠ — leurs anciens CSS (V2 `styles.css:1859-1914` et `:2114-2188`) restent intacts. Aucune surcharge V4 chunky/cream sticker. Bouton primary reste rouge.
- Boutons coral / grape / sun / mint variants : ✗ — `.btn--primary/gold/mint/grape/ghost` définis (`styles.css:3598-3602`) mais **0 occurrence dans App.tsx**. `.primary-action` reste sur `linear-gradient(180deg, #8f2632, #5f1925)` (`styles.css:385-392`) — gradient rouge V1 dark fantasy. **Tous les boutons primaires du jeu (Entrer / Continuer / Ouvrir le coffre / boss-relic-card / etc.) restent rouge sombre.**

### Phase F — Boss intro
- BossIntroOverlay re-skinné candy : ✓ — `styles.css:5674-5738` + DOM React émet `boss-intro-overlay__mascot/name/phrase` (`App.tsx:5003-5019`).
- Phrases boss V4 candy menaçant : ✓ — `App.tsx:4953-4957` (3 phrases stage 1/2/3).
- prefers-reduced-motion bandeau static 800ms : ✓ — `App.tsx:4972-4975`.

### Contraintes V4
- TypeScript strict, 0 `any`, 0 erreur, 0 warning : ✓ — rapporté par dev.
- Reducer V1/V2/V3 non touché : ✓ — vérifié grep.
- saveVersion conservé à 3 : ✓ — `App.tsx:535+592`.
- localStorage clé v1 : ✓ — `App.tsx:366`.
- render_game_to_text fonctionnel : ✓ — extension V3 préservée (rapporté dev, non re-vérifié exhaustivement).
- advanceTime, hooks `__game_test_*` préservés : ✓ — `App.tsx:361-362+4307`.
- prefers-reduced-motion couvert : ✓ — 7 blocs `@media (prefers-reduced-motion: reduce)` dans styles.css.
- Cap 4 boucles infinite respecté : ⚠ — float-y posé sur `.combat-hero` (line 4693) + `.enemy-card` + `.character-card-detailed` + `.chest__body` (5070, dead). 7 cartes en combat × float-y, conforme à decision V3 perf-guard (translate-only, hors cap). Audit perf 60fps non mesurable en revue statique.

### V2/V3 préservées (CRITIQUE)
- Hub V2 5 onglets fonctionnel : ✓ (DOM identique).
- Boutique / Lootbox V2 (4 types) flow → roulette V3 → reveal V4 → reward V2 : ✓ structurel.
- Recyclage V2 : ✓.
- Reliques boss V2 : ✓ (boss-relic-screen présent App.tsx:4021).
- Stages V2, FinalChest tier-aware V2 : ✓.
- AnimQueue V3 : ✓.
- Vitesse combat V3 (x1/x1.25/x1.5) : ✓.
- Pity V3 : ✓.
- Boss intro V3 (1600ms / 800ms reduced) : ✓.
- CharacterCardDetailed (combat compact / collection détaillé / reveals détaillé) : ✓.

### IDs Playwright préservés
- `#stage-intro-enter` : ✓ App.tsx:3527.
- `#boss-intro-skip` : ✓ App.tsx:5012.
- `#open-chest` : ✓ App.tsx:4506.
- `#speed-1`, `#speed-1-25`, `#speed-1-5` : ✓ (rapporté dev, hooks V3 inchangés).
- `#run-progress` : ✓ App.tsx:3458.
- `#recycle-cancel`, `#recycle-confirm` : ✓ App.tsx:3907+3916.
- `#replace-consumable-modal`, `#replace-slot-{0,1,2}`, `#replace-discard` : ✓ App.tsx:3960+3978+3999.
- `#boss-relic-{0,1,2}` : ✓ App.tsx:4032.

### Hooks de test
- `__game_test_skip_roulette()` : ✓ App.tsx:361+4307.
- `__game_test_skip_boss_intro()` : ✓ App.tsx:362.

### Volume & qualité
- Bundle CSS 123 KB (vs 68 KB) : ⚠ acceptable (cf. évaluation limites). Spec §5.g visait ≤100 KB ; dépassement +23 KB causé par l'append cumulatif. Le coût est tolérable car gzip 23 KB reste maigre.
- App.tsx 5766 lignes (vs 5551) : ⚠ dépasse plafond souple 5500 (+266). Cohérent avec le coût HeroMascot + mappings (~150-200 lignes prévues, ~215 ajoutées). Extraction `src/components/HeroMascot.tsx` à programmer en V5.

---

## Évaluation des limites du dev

### Limite 1 — Audit perf 60fps non mesurable
- **Sévérité** : minor.
- **Justification** : limite légitime (Playwright en session pas dispo). La décision V3 perf-guard (translate-only acceptable hors cap) est documentée. Si jank en runtime utilisateur, fallback C (désactiver float-y héros) est prévu.

### Limite 2 — Vérification visuelle 12+ écrans non automatisable
- **Sévérité** : major (pour cette livraison spécifiquement).
- **Justification** : la livraison contient justement plusieurs **régressions visuelles non détectées par le build** (boutons rouges, fnums V3, chest sans composition, run-progress legacy, hub-tab inactif). Sans capture pixmap, ces gaps sont passés au travers. Indique une lacune de **lecture critique** des classes émises vs les classes V4 stylisées.

### Limite 3 — Bundle CSS 123 KB
- **Sévérité** : minor.
- **Justification** : 123 KB raw / 23 KB gzip. Au-dessus du seuil spec 100 KB mais en dessous du seuil pratique d'impact perçu (~200 KB). La cause : append cumulatif sans dédup des règles V3↔V4 redondantes. Acceptable pour un proto, à dédupliquer si déploiement public.

---

## Écarts par sévérité

### Blocker
*Aucun.* Le jeu est jouable, les hooks de test sont préservés, build clean, save préservée.

### Major

**M1 — Boutons primaires restent V1 dark fantasy rouge.**
- Preuve : `styles.css:385` `.primary-action { background: linear-gradient(180deg, #8f2632, #5f1925); }`. Aucun override V4. Tous les CTA du jeu (Entrer stage, Continuer hub, Ouvrir le coffre, boss-relic-card cta, primary-action des modales) restent rouge V1.
- Action : ajouter en bas de styles.css un override `.primary-action { background: var(--brand-coral); color: white; border: var(--stroke); border-radius: var(--r-md); box-shadow: var(--shadow-stick); }` + ajuster hover/active pour transformer translateY(-2px)/(3px). Garder spécificité au moins équivalente.

**M2 — Onglet hub actif reste V3 (rouge runique).**
- Preuve : React émet `.hub-tab--active` (App.tsx:3663) ; V4 cible `.hub-tab.is-active` (`styles.css:5441`).
- Action : ajouter `.hub-tab--active { background: var(--brand-coral); color: white; box-shadow: var(--shadow-stick); }` (ou unifier les sélecteurs en `.hub-tab--active, .hub-tab.is-active`).

**M3 — FinalChest visuellement inchangé : pas de composition candy lid+body+studs+lock+aura.**
- Preuve : `App.tsx:4493-4502` rend `<div class="chest-lid"/>` + `<div class="chest-body"/>` + `<chest-beam>`. Le bloc CSS V4 `.chest__*` (`styles.css:5060-5197`) ne matche aucun DOM. Spec §4 Phase D non livrée.
- Action : refondre le DOM `FinalChest` (App.tsx:4486-4502) pour émettre la structure BEM `.chest__body > .chest__band/.chest__lock`, `.chest__lid > .chest__lid-band/.chest__keyhole/.chest__stud--{l,c,r}`, et 3 `.chest__rune--{1,2,3}` pour tier `runic`. Ajouter `.chest__burst` overlay sur opening. Conserver `id="open-chest"` (a11y/Playwright).

**M4 — Floating numbers restent V3 (police système, pas de stroke ink, animation `floating-rise-fade`).**
- Preuve : React émet `.floating-num` (App.tsx:4854) qui matche le bloc V3 `styles.css:2399-2426`. Le bloc V4 `.fnum` (`styles.css:4833`) est dead.
- Action : soit (a) renommer dans App.tsx en `.fnum` (impact : modifier `variantClass()` qui génère les variants — ~5 lignes), soit (b) overrider `.floating-num` en bas de styles.css avec `font-family: var(--font-display); -webkit-text-stroke: 1px var(--ink); text-shadow: 0 2px 0 rgba(38,26,61,0.5); animation: fnum-rise ...`. Option (b) est plus sûre (préserve les `floating-num--*` modifiers existants).

**M5 — RunProgress reste sur `.run-progress__step` V2, pas sur `.run-progress__dot` V4 candy.**
- Preuve : `App.tsx:3490` rend `.run-progress__step`. Le V4 `.run-progress__dot` (`styles.css:4575-4598`) est dead.
- Action : soit (a) modifier `RunProgress` pour rendre les 30 dots avec la classe `.run-progress__dot` + `.is-stage-{N}` + `.is-current` + `.is-boss` + `.is-done`. Soit (b) overrider `.run-progress__step` candy en bas de styles.css. Option (a) recommandée (sémantique propre + spec respectée). Préserver `id="run-progress"` (App.tsx:3458) et la structure boss/hub.

**M6 — Combat footer skill cards / consumables / speed selector / intent banner non re-skinnés.**
- Preuve : React émet `.special-button`, `.consumable-slot`, `.speed-selector`, `.intent-banner`. V4 `.skill-card`, `.cons`, `.combat-speed`, `.intent` (`styles.css:4795-4823`) sont dead.
- Action : ajouter overrides en bas de styles.css ciblant les classes existantes (V2/V3) avec les tokens candy : cerne ink + sticker shadow + Lilita One + paper bg. ~30 lignes. Préserver l'a11y (focus-visible, disabled state).

**M7 — Modales (recycle-confirm, replace-consumable) restent V2 (gradient sombre).**
- Preuve : `styles.css:1859-1914` (recycle V2 ancien) et `:2114-2188` (replace V2) intacts. Aucun override V4.
- Action : ajouter en bas de styles.css overrides : `background: var(--bg-cream); color: var(--ink); border: var(--stroke); box-shadow: var(--shadow-stick-lg); border-radius: var(--r-xl);`. Re-titre Lilita One. Boutons via `.primary-action` (corrigé en M1) + `.recycle-confirm-modal__actions button.cancel` en grape ou ghost.

**M8 — Boss HP bar : sous-structure V4 (track + name) non rendue par React.**
- Preuve : `App.tsx:3344-3347` n'émet que `.boss-hp-bar__fill` + `.boss-hp-bar__shimmer`. Le V4 stylise aussi `.boss-hp-bar__name` + `.boss-hp-bar__track` qui ne sont jamais émis.
- Action : compléter le DOM `EnemyCard` pour les bosses : `<div class="boss-hp-bar"><div class="boss-hp-bar__name">{enemy.name}</div><div class="boss-hp-bar__track"><div class="boss-hp-bar__fill" .../></div></div>`. Mineur en lignes mais nécessaire pour le rendu candy.

### Minor

**m1 — fallback `stageFromFight(1)` hardcoded ligne 3351.**
- Inerte (mascot stocké à createEnemy), mais code smell. Action : passer `stage` en prop à `EnemyCard` ou supprimer le fallback (simplement faire `enemy.mascot ?? "slime"`).

**m2 — Sparkle CSS : `.rarity-rare .character-card-detailed__sparkle { display: none }`** — la spec §4.B dit légendaire = 1 sparkle, mythique = +1 ; le dev a hardcodé display:none pour rare/epic ce qui est cohérent. Pas d'action.

**m3 — App.tsx 5766 lignes** dépasse plafond souple 5500. Action : extraction `src/components/HeroMascot.tsx` programmée V5 (cf. decisions.md).

**m4 — Bundle CSS 123 KB** : spec §5.g ≤100 KB. Action : dédup V3↔V4 redondants en V5 (chest, hub, boutons). Pas urgent.

**m5 — `MASCOT_VARIANT_LABEL` expose 22 variants alors que spec en demande 17** (decision V4 frontend-dev). Acceptable pour tolérance future, mais fait du bruit. Pas d'action.

---

## Risques de régression V2/V3

- **Aucun risque fonctionnel détecté.** IDs Playwright préservés, hooks de test inchangés, reducer/save intacts, sélecteurs Playwright tous présents (spot-check OK).
- **Risque visuel** : les écrans Atelier (CharacterCreator) et Collection ont reçu HeroMascot via `CharacterPortrait`. Pas de breaking sur la structure mais la cohérence visuelle entre la mascot expressive et le frame V2 (encore stylé runique pour Atelier en particulier) est à vérifier visuellement.
- **Risque a11y** : modales conservent `role="dialog"` + autoFocus + Esc handler V2 (focus trap). OK.

---

## Validation cohérence DA "Joyful Direction"

**La peau visuelle est partiellement convaincante.** Au premier coup d'œil :
- Menu : OK candy (font Lilita One + cream + fond violet-bleu nuit).
- Cartes personnages détaillées (collection, atelier preview, lootbox reveal) : **excellentes** — le pattern double-inset + cerne ink + sticker shadow + halo radial + mascotte CSS + sparkles légendaire est *exactement* la signature DA.
- Skybox combat stage 1/2/3 : OK distinctes.
- Mascottes CSS héros + ennemis + boss : OK convaincantes.
- BossIntroOverlay : OK candy menaçant cohérent avec phrases V4.

**Mais l'illusion se brise sur :**
- Tous les CTA primaires (gradient rouge V1).
- Onglets hub (actif rouge V1).
- Coffre final (composition non livrée — silhouette V3 minimale).
- Floating numbers en combat (police système, ombre simple, couleurs V3).
- RunProgress (style V2 sombre runique).
- Combat footer (skill buttons V3, consumables V2, speed V3).
- Modales (cream + cerne pas appliqués).

→ **Verdict DA : OK sur 60% de l'expérience, le 40% restant fait dissonance.** Pour atteindre le critère brief *« je vois clairement un jeu candy joyeux dès le menu »*, les Major M1-M8 doivent être corrigés.

---

## Actions correctrices — résumé

| # | Major | Lieu modif | Lignes estimées |
|---|-------|------------|-----------------|
| M1 | Boutons primary candy | styles.css (override .primary-action en fin) | ~15 |
| M2 | Hub tab active candy | styles.css (alias .hub-tab--active) | ~5 |
| M3 | FinalChest composition candy | App.tsx:4486-4502 + check CSS | ~40 |
| M4 | Floating numbers Lilita stroke ink | styles.css (override .floating-num en fin) | ~10 |
| M5 | RunProgress 30 dots candy | App.tsx:3445-3505 (refonte JSX) | ~30 |
| M6 | Combat footer atomes candy | styles.css (overrides ciblées) | ~30 |
| M7 | Modales cream sticker | styles.css (overrides ciblées) | ~25 |
| M8 | BossHpBar sous-structure | App.tsx:3344 (compléter DOM) | ~10 |

Total ~165 lignes (~80 CSS + ~85 React JSX/structure). Aucune touche reducer / save / hooks de test. Build doit rester clean après chaque correction.
