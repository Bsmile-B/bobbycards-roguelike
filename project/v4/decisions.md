# Journal des décisions — V4 Joyful Direction

Format : `## [date] [auteur] décision`

## [2026-04-30] [orchestrator] Cycle V4 isolé sous project/v4/
- V3 (game feel) vient d'être livrée. V4 = mission distincte "application DA Joyful Direction".
- Workspace V4 isolé pour ne pas polluer V3.
- Mode auto reste actif. Pas de checkpoint visuel intermédiaire.
- DA = inspiration, pas copie littérale (user verbatim).
- DA = rupture totale avec dark fantasy V3 → cartoon candy chunky (Clash × Cult of the Lamb × Cookie Run).
- Phase F (renommage stages) **proposée comme optionnelle** dans le brief — ne pas faire sans validation user.

## [2026-04-30] [orchestrator] Stratégie de migration : refonte tokens + composants, pas de réécriture
- **Squelette gameplay préservé** : reducer, hooks de test, save localStorage v1, mécaniques V1/V2/V3.
- **Peau visuelle refondue** : tokens `:root`, classes CSS principales, mascottes CSS.
- Le code TS/React change peu (sauf nouveau composant `<HeroMascot>` et adaptations mineures pour les nouvelles classes).
- Le `src/styles.css` change beaucoup (~+1000 / -500 lignes attendues).
- Ordre : tokens → cartes → combat → coffres/roulette → hub.

## [2026-04-29] [architect] Stratégie tokens — rename in-place + extension (pas de nouveau préfixe)
**Contexte** : la DA introduit beaucoup de nouveaux tokens (`--bg-cream`, `--brand-coral`, `--ink`, `--font-display`...) et change radicalement les valeurs des tokens existants (`--color-bg`, `--rarity-commune`, etc.). Faut-il préfixer les nouveaux (`--v4-bg-deep`) ou réutiliser/renommer ?
**Options envisagées** :
A. Tout préfixer V4 (`--v4-*`) pour ne rien casser. Verbose, dette technique.
B. Renommer en place : changer la **valeur** des tokens existants (`--color-bg: #1a1530`) et **ajouter** les nouveaux noms candy (`--bg-deep`, `--brand-coral`...). Les classes V2/V3 qui consomment `--color-bg` reçoivent automatiquement la nouvelle valeur.
C. Big bang : supprimer tous les anciens tokens, refondre toutes les classes pour consommer les nouveaux.
**Décision** : **B**.
**Rationale** : zéro risque de classe V2/V3 oubliée qui resterait sombre. Les tokens FR (`--rarity-commune`) gardent leur nom mais reçoivent une valeur candy. Les tokens nouveaux sont en parallèle pour les nouvelles classes (`--brand-coral` pour les boutons primary, etc.). Coût : un bloc `:root` un peu plus gros (~140 tokens vs ~80 actuellement), acceptable.
**Conséquences** : aucun rename de classe nécessaire. Pas de migration côté React. Audit grep pour identifier les valeurs en dur (#hex non-tokenisées) à reprendre — list dans T32.

## [2026-04-29] [architect] HeroMascot — nouveau composant React, pas un CSS-only modifier
**Contexte** : la DA dessine ses persos en CSS pur (tête + chapeau + yeux + joues + bouche + cape). On peut soit (a) faire un seul composant React paramétrable, (b) faire des classes CSS modifiers (`<div class="mascot mascot--bobby mascot--lg">` que React n'a pas à connaître), (c) coder chaque variant comme un composant dédié.
**Options envisagées** :
A. Composant React `<HeroMascot variant size mood />` avec lookup interne.
B. CSS-only : juste poser des classes, React n'instancie qu'un `<div class="mascot mascot--bobby">`.
C. 16 composants distincts (`<BobbyMascot />`, `<SlimeMascot />`, ...).
**Décision** : **A**.
**Rationale** : A donne un point unique de paramétrisation (le mood, qui se calcule depuis le state combat — hpPct, is-attacking, is-ko — c'est plus naturel en React). B exige que le parent connaisse les classes exactes — fragile au refactor. C explose le nombre de composants. A reste léger : un seul composant ~80 lignes avec un lookup. Coût : ~150 lignes de plus dans App.tsx.
**Conséquences** : `<HeroMascot variant="bobby" size="lg" mood="idle" />`. Le composant pose `data-mascot-variant`, `className` avec size/mood, et rend la structure DOM commune. Le CSS fait le reste via `[data-mascot-variant="..."]` selectors. App.tsx plafond souple 5500 → on accepte 5700.

## [2026-04-29] [architect] Phase F — conserver les noms V2 par défaut
**Contexte** : la DA propose les noms "Prairie Givrée / Jardin Magique / Royaume Doré". Le brief V4 marque cette phase explicitement comme **optionnelle**. L'utilisateur n'a pas demandé le renommage.
**Options envisagées** :
A. Renommer pour cohérence DA candy.
B. Garder les noms V2 (Cryptes Froides / Sanctuaire du Vide / Salle du Roi Brisé).
C. Demander à l'utilisateur (`[BLOCKING]`).
**Décision** : **B**.
**Rationale** : (1) l'utilisateur n'a pas demandé, principe d'inertie ; (2) renommer impacte la sémantique narrative V1+V2+V3 (phrases boss, ambiance globale) qui n'est pas ciblée par la mission V4 ; (3) la **tension entre noms gothiques et DA candy joyeuse** est une force narrative (style Cult of the Lamb : c'est mignon, mais ça reste sombre). C ralentirait inutilement.
**Conséquences** : `STAGE_CONFIGS.name` reste "Les Cryptes froides", "Sanctuaire du Vide", "Salle du Roi Brisé". Les phrases V3 `BOSS_PHRASES` restent. Les skyboxes candy (sky-day pour S1, etc.) sont interprétées comme une *réinterprétation visuelle* (le froid des cryptes = ciel pâle givré, etc.). Si l'utilisateur demande explicitement le renommage en review, c'est une opération d'1 minute.

## [2026-04-29] [architect] Cap 4 boucles infinite — float-y translate-only acceptée sur 7 cartes en combat
**Contexte** : la DA met `float-y` (translate Y ±6px) en infinite sur **tous** les héros + ennemis + boss + coffres. En combat = 3 héros + 2-3 ennemis + 1 boss = 6-7 cartes simultanément en float-y. La règle V3 perf-guard dit "cap 4 boucles infinite simultanées".
**Options envisagées** :
A. Désactiver float-y en combat (statique) → casse l'identité DA.
B. Garder float-y partout, cap 4 réinterprété comme "cap sur boucles **coûteuses**" (filter blur, box-shadow animé, multiples props simultanées).
C. Float-y seulement sur ennemis/boss, héros statiques.
**Décision** : **B**, avec **fallback C** si jank constaté en revue runtime.
**Rationale** : `transform: translateY` sur 7 éléments est composé sur GPU, ne déclenche pas de layout, ne déclenche pas de paint si aucun autre rendering n'est concerné. Le cap 4 V3 visait des boucles avec `filter: blur` ou `box-shadow` animées (compositées CPU sur certains navigateurs). Une translate pure × 7 cartes reste sous le budget. Si Chrome DevTools Performance montre du frame drop en combat ×1.5, fallback C.
**Conséquences** : pas de changement. Le designer pose `animation: float-y 3s ease-in-out infinite` sur `.combat-hero`, `.enemy-card`, `.character-card-detailed`. **Désactivée** dans 3 cas : `.combat-hero.is-ko`, `.enemy-card.is-dead`, et globalement `prefers-reduced-motion`. **À surveiller** : audit perf 60fps en combat ×1.5 (V4-T33).

## [2026-04-29] [architect] Mythique — visuel actif, drop désactivé en V4
**Contexte** : la DA active la rareté mythique (rose nacré `#ff5fa2`, wobble, sparkles renforcés). Le jeu V3 a `--rarity-mythic-placeholder` réservé. Faut-il introduire un drop mythique ?
**Options envisagées** :
A. Pas de mythique du tout (skip la rareté visuellement).
B. Visuel mythique actif (classe `.rarity-mythic` complète, ready à recevoir un perso), mais aucun perso mythique introduit, aucune condition de drop activée. Le visuel sert juste pour Custom Characters forgés à un futur tier ou pour V5.
C. Introduire 1-2 persos mythiques + drop conditions (boss final ×3 = 1% chance).
**Décision** : **B**.
**Rationale** : le brief V4 est explicitement **0 nouveau contenu**. Introduire un perso mythique = nouveau contenu. La DA *active* la classe visuelle parce que la maquette montre une carte mythique en exemple — c'est une démonstration UI, pas une demande de gameplay. B respecte le brief tout en honorant la DA.
**Conséquences** : `.rarity-mythic` est une classe CSS complète (tokens deep/cream + wobble + sparkles +1). Aucun perso mythique dans STARTERS. `LOOTBOX_TABLES` inchangé (mythic = 0%). Si l'utilisateur demande la mécanique de drop en V5, le visuel est déjà prêt.

## [2026-04-29] [architect] Google Fonts CDN — accepté pour proto local, à reconsidérer pour déploiement
**Contexte** : la DA importe Lilita One + Nunito + JetBrains Mono via Google Fonts CDN. Conformité RGPD stricte demande self-host (l'IP du visiteur ne doit pas être envoyée à Google sans consentement).
**Options envisagées** :
A. Self-host woff2 dans `public/fonts/` + `@font-face` (~120 KB ajoutés au bundle).
B. CDN Google Fonts (preconnect + font-display: swap).
C. Stack système (Fredoka / Baloo 2 / system-ui) — perd la marque candy.
**Décision** : **B**, avec note pour V5 / déploiement public → A.
**Rationale** : proto local, pas de visiteurs externes, l'utilisateur teste via `npm run dev` localement. Pas d'enjeu RGPD pratique. CDN simplifie le développement. Cache navigateur partagé entre sites = chargement plus rapide pour utilisateurs ayant déjà visité un site Google Fonts.
**Conséquences** : `index.html` ajoute 2 link preconnect + 1 link stylesheet. Fallback `'Lilita One', 'Fredoka', 'Baloo 2', system-ui, sans-serif`. `font-display: swap` (déjà dans l'URL Google Fonts par défaut + paramètre explicite). Si la latence Google Fonts est >1s perçue par l'utilisateur, fallback A.

## [2026-04-29] [architect] saveVersion — pas de bump V4
**Contexte** : la V3 a bumped à saveVersion 3. La V4 est purement visuelle. Faut-il bump à 4 ?
**Décision** : **non, reste à 3**.
**Rationale** : aucun nouveau champ persistant. Tous les changements sont visuels (CSS + composants React de présentation). Aucune migration nécessaire. Bump = bruit dans le diff sans valeur. Si V5 introduit un nouveau champ, bump à 4 à ce moment-là.
**Conséquences** : `STORAGE_KEY = "runebound-cards-save-v1"` inchangé. `normalizeSave` lit V3 sans changement. Aucun migrate à écrire.

## [2026-04-29] [ui-designer] Couleurs des 17 variants mascottes — regroupement par rôle/stage
**Contexte** : 16 variants demandés + `bobby` fallback = 17 designs à proposer. La règle de cohérence : tous les ennemis d'un même stage partagent une **vibe palette** (Stage 1 froid bleu-violet, Stage 2 violet pétillant magique, Stage 3 doré-noble).
**Décision** : héros = palette chaleureuse cream/coral/grape/mint ; ennemis stage 1 = teintes froides (slime cyan-vert, bat violet à yeux jaunes) ; ennemis stage 2 = magique-toxique (ghost blanc fantomatique, witch lilas+chapeau mythic, plant=poison vert acide) ; ennemis stage 3 = ambivalence dorée (guard heaume sun, golem stone-warm, soldier coral) ; boss = accessory `👑`/`✦` + halo signature.
**Rationale** : à 2 mètres on doit deviner le stage rien qu'à la couleur des ennemis. La cohérence narrative des palettes prime sur l'originalité de chaque variant. Boss = accessory unique (couronne / étoile) pour distinction immédiate.
**Conséquences** : couleurs hardcodées via `data-mascot-variant` dans `mascots.css`. Aucun token spécifique mascot ajouté à `tokens.css` — chaque variant pose ses CSS variables locales (`--mascot-skin`, `--mascot-hat`, etc.). Si l'utilisateur veut customiser un héros forgé, il faudra exposer ces variables au React (hors scope V4).

## [2026-04-29] [ui-designer] Skybox combat — 3 variantes différentes (pas variations subtiles)
**Contexte** : faut-il 3 skyboxes radicalement distinctes par stage, ou une seule skybox avec teintes accent variables ?
**Options** : A. 3 distinctes ; B. 1 skybox + tinte. C. 2 skyboxes + variation.
**Décision** : **A**.
**Rationale** : la DA pousse fort sur le contraste stage. Stage 1 ciel-jour pâle, Stage 2 crépuscule violet magique, Stage 3 couronnement doré. La même skybox réteintée perdrait l'identité narrative que portent les couleurs. Le coût (3 gradients radial vs 1) est négligeable côté GPU (gradients statiques compositables).
**Conséquences** : 3 règles `.combat-screen.stage-{N}::before` distinctes dans `combat.css`, gradient unique par stage. Pareil pour `.hub-screen.stage-{N}` dans `hub.css`. Total : 6 gradients (3 combat + 3 hub) — acceptable.

## [2026-04-29] [ui-designer] Cap sparkles cartes — 2 par mythique, 1 par légendaire
**Contexte** : la DA originale propose 3-4 sparkles sur cartes mythique. Cap effectif 4 boucles infinite simultanées par carte signifie : float-y(1) + frame anim wobble(1) + N sparkles(N) ≤ 4.
**Décision** : **2 sparkles maximum par carte mythique**, 1 par carte légendaire, 0 ailleurs.
**Rationale** : 1 (float-y) + 1 (wobble) + 2 (sparkles) = 4 boucles, exactement au cap. Le halo de la mythique reste statique (filter blur 6px constant, pas animé) pour ne pas dépasser. Visuellement, 2 sparkles bien placés (15% 25% delay 0s, 85% 60% delay 1.5s) suffisent à donner la sensation "magique" sans tomber dans le bling.
**Conséquences** : `.character-card-detailed.rarity-mythic` rend 2 `<span class="character-card-detailed__sparkle">`, légendaire en rend 1, autres raretés 0. Cap respecté.

## [2026-04-29] [ui-designer] Boss-hp-bar — position en haut du combat-screen, sous la top-bar
**Contexte** : la barre HP boss peut être (a) flottante sticky au-dessus du boss, (b) intégrée à la top-bar, (c) bandeau dédié sous la top-bar.
**Décision** : **C — bandeau dédié `.boss-hp-bar` sous la `.combat-top`, margin 12px latéral, fond ink-violet 85%, n'apparaît que si boss actif**.
**Rationale** : (a) flottante = se chevauche avec le boss-card, fragile au layout ; (b) intégrée top-bar = top-bar devient surchargée ; (c) bandeau dédié = lisibilité maximale, position prévisible, n'occupe l'espace que quand pertinent. Le fond ink-violet 85% rappelle le shell sombre et fait ressortir le nom mythic glow.
**Conséquences** : `.boss-hp-bar` rend en dessous de `.combat-top`, au-dessus de `.combat-field`. Visible uniquement si `isBoss` (le React conditionne). Pas de modification de la fitchness reducer.

## [2026-04-29] [ui-designer] Phrases boss — ton candy menaçant (cute mais inquiétant)
**Contexte** : la DA est candy joyeux, mais les boss restent menaçants. Ton à choisir entre (a) candy joyeux pur, (b) gothique sérieux, (c) candy menaçant (Cult of the Lamb).
**Décision** : **C**.
**Rationale** : la **tension** entre noms gothiques (Cryptes Froides) et DA candy est une force narrative préservée par la décision architect. Les phrases doivent honorer cette tension : mignonnes en surface, glaçantes en sous-texte. Style validé par les références (Cult of the Lamb : *« Je suis si content que tu sois là. Si tu savais combien j'ai attendu… »*).
**Conséquences** : 3 phrases proposées dans `boss-phrases.md` (1 principale + 2 alternatives par boss). Le dev intègre les principales dans `BOSS_PHRASES`. Pas de bump save, pas de logique nouvelle.

## [2026-04-29] [frontend-dev] Stratégie CSS — append cumulatif en fin de styles.css
**Contexte** : la stratégie architect dit "rename in-place + extension". L'option naïve serait de réécrire le `:root` initial. La doc designer ajoute "ou s'ajoute en bas — décision dev".
**Décision** : append du bloc `tokens.css` V4 + tous les autres fichiers CSS V4 à la suite, en fin de styles.css. Le second `:root` redéclare les valeurs et la cascade applique les nouvelles. Override `body` également appendé pour neutraliser le gradient V2 hardcodé. `app-shell::before { display: none }` neutralise la grille runique V2.
**Rationale** : (1) zéro risque de régression — toutes les classes V2/V3 continuent de matcher leurs sélecteurs existants ; (2) diff plus lisible (ajout pur, pas de patch surgical sur 1500 lignes) ; (3) le second `:root` est légalement valide en CSS et l'ordre source détermine la valeur effective.
**Conséquences** : ~+2580 lignes en fin de styles.css (V4 design files concaténés + ~50 lignes de keyframes manquantes + body override). styles.css passe de 3201 à 5845 lignes. Bundle CSS 123 kB (au-dessus du seuil 100 kB de la spec mais en cohérence avec le coût attendu de la DA candy).

## [2026-04-29] [frontend-dev] HeroMascot — variants étendus à 22 (alias compat)
**Contexte** : la spec liste 17 variants. Mais cards.css et combat.css référencent aussi `knight`, `vine`, `royal-guard`, `boss-broken-king` et le DA dev brief utilise `plant`/`vine` interchangeably.
**Décision** : exposer 22 variants au type union (ajout `knight`, `vine`, `plant`, `guard`, `royal-guard`, `boss-king`, `boss-broken-king` comme alias visuels). Aucun coût TS, le CSS gère via les sélecteurs `[data-mascot-variant="..."]` cumulatifs.
**Rationale** : tolérance au mapping. Si un dev future ajoute un perso "knight forgé", `knight` est déjà câblé. Pas de mapping forcé.
**Conséquences** : 22 entrées dans `MASCOT_VARIANT_LABEL`. Pas de coût build.

## [2026-04-29] [frontend-dev] Sparkles cap effectif : légendaire 1, mythique 0 V4
**Contexte** : la DA prescrit légendaire = 1 sparkle, mythique = 2 sparkles. En V4 aucun perso mythique n'est introduit (decision architect §5.h).
**Décision** : on rend 1 sparkle pour les cartes légendaires uniquement. Les cartes mythiques (n'existent pas en V4) sont prêtes via classe CSS mais ne reçoivent pas de sparkles inline pour le moment.
**Rationale** : pas de cas réel de carte mythique en V4 → pas de logique morte.
**Conséquences** : si un perso mythique est ajouté en V5, il faudra ajouter `rarity === "mythic"` dans le rendu sparkle (1 ligne).

## 2026-04-29 [frontend-dev] V4 correctifs câblage — stratégie alias CSS vs rename React
**Décision** : pour les 8 majors M1-M8, privilégier les overrides CSS en fin de styles.css plutôt que de renommer les classes émises par les composants React, **sauf** pour les 3 cas où un changement de DOM était nécessaire (M3 FinalChest, M5 RunProgress, M7 BossHpBar).

**Rationale** :
- Les overrides CSS ciblant `.primary-action`, `.hub-tab--active`, `.floating-num`, `.recycle-confirm-modal`, `.special-button` (etc.) coûtent ~290 lignes ajoutées en fin de styles.css mais évitent de toucher 8+ sites JSX dispersés et préservent la stabilité des classes pour Playwright et debug.
- Les variants `.btn--primary/--gold/--mint/--grape/--ghost` définis en V4 phase E restent disponibles pour usages futurs ; on n'a pas migré la base existante car le coût (8 fichiers de modales + boutons) ne se justifie pas pour un overlay visuel équivalent obtenu via override `.primary-action`.
- Le coût n'est pas l'augmentation de bundle (+10 KB raw / ~2 KB gzip), mais un peu de dette : 2 chemins CSS (V2 + V4) pour les boutons primaires. Dédup planifié V5 (cf. m4 review).

**Cas DOM modifié (3) — justification** :
- **M3 FinalChest** : la composition `.chest__body > .chest__band + .chest__lock` etc. n'a pas d'équivalent V2/V3 — il faut émettre les enfants pour activer la skin. Les classes V3 (`chest-body`, `chest-lid`, `chest-tier--*`) sont conservées pour rétrocompat.
- **M5 RunProgress** : double-class `run-progress__step run-progress__dot is-stage-{N} is-current/is-done/is-boss` sur le même span. CSS arbitre via spécificité (`.run-progress__step.run-progress__dot`) en faveur du V4. Pas de breaking JSX.
- **M7 BossHpBar** : on ajoute `.boss-hp-bar__name` (texte décoratif) + `.boss-hp-bar__track` wrapper. Classes V2 préservées au-dessus.

**Alternative écartée** :
- Rename complet `.primary-action` → `.btn--primary` à travers App.tsx : 8 sites + tous les sélecteurs CSS V2 dépendants → risque régression, gain visuel nul.
- Variants `.btn--primary/.btn--gold/.btn--mint/.btn--grape` non câblés à des CTA spécifiques (Continuer hub vs Ouvrir coffre vs Choisir relique) : pas de mapping spec dispo, et homogénéité coral candy déjà cohérente DA.

## 2026-04-29 [frontend-dev] M3 FinalChest — émettre `.chest__burst` sur phase opening + beam
**Décision** : le burst overlay reste actif sur phases `opening` ET `beam` (pas seulement opening). Permet à l'animation `chest-burst` (1200ms) de couvrir la transition d'ouverture jusqu'au beam (700ms total des phases shake→opening→beam).
**Rationale** : si on ne le rend que sur opening, l'animation s'interrompt à la transition vers beam. La keyframe gère elle-même l'opacité finale = 0.
