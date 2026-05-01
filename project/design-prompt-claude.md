# Prompt complet — Direction visuelle & artistique de **Bobbycard Roguelike**

> Ce document est un prompt autonome destiné à Claude (Claude.ai, mode design / artifacts).
> Le designer qui le lit n'a aucun contexte préalable. Tout ce qu'il doit savoir est ici.

---

## Rôle attendu

Tu es **directeur artistique senior** spécialisé dans :
- les jeux de cartes premium (style Hearthstone, Slay the Spire, Inscryption, Marvel Snap),
- le dark fantasy sobre (Diablo IV, Darkest Dungeon, Path of Exile, Solasta),
- les interfaces UI/UX dense mais lisibles (Returnal, Hades, Disco Elysium).

Ta mission : produire la **direction visuelle complète, actuelle et future**, du jeu **Bobbycard Roguelike**. Pas seulement décrire — proposer, illustrer (mockups HTML/CSS exécutables si possible), et anticiper la suite.

---

## 1. Identité du jeu

- **Nom** : Bobbycard Roguelike
- **Genre** : Roguelite de cartes / personnages, semi-automatique, run courte (~30 vagues)
- **Ton** : dark fantasy premium, sobre, mystique, runique, runeforge — **pas heroic-fantasy clinquant**, pas anime, pas comic, pas pixel-art
- **Mots-clés visuels** : runes, pierre, métal froid, braise, poussière dorée, vide violet, sang royal terni, parchemin, encre noire
- **Promesse au joueur** : *« Chaque carte que je tire ressemble à une relique. Chaque combat est un duel runique. Chaque coffre est un événement. »*
- **Plateforme cible** : navigateur desktop, **résolution 1280×720** (contrainte dure), Chromium-based en priorité

---

## 2. Stack technique (à respecter dans tout livrable)

- **React 18 + TypeScript strict** + **Vite**
- **CSS pur** (pas de Tailwind, pas de styled-components) — tokens via `:root` custom properties, classes BEM-ish
- **Pas d'images bitmap** dans le projet aujourd'hui : tous les visuels sont **CSS pur** (gradients, box-shadow, ::before/::after, masques radiaux, runes en pseudo-éléments). Tu peux proposer des SVG inline si nécessaire.
- **Pas de moteur d'animation externe** (pas de Framer Motion, GSAP, Lottie). Animations en CSS keyframes + rAF custom pour la roulette de loot box.
- **Build Vite** ~285 kB JS / 68 kB CSS gzip après V3 — chaque ajout doit être conscient du budget.

---

## 3. État actuel du jeu (V1 → V2 → V3 déjà livrées)

### Boucle de jeu
1. Menu → sélection d'équipe (3 héros parmi une collection)
2. Run en **3 stages de 10 vagues** chacun (30 combats au total)
3. Combat semi-automatique (héros attaquent en cooldown, joueur clique skills + consommables)
4. Récompenses post-vague (or, fragments, consommables, reliques)
5. **Boss vague 10/20/30** avec choix de relique parmi 3
6. **Hub** entre stage 1→2 et 2→3 : 5 onglets (Boutique, Loot Box, Recyclage, Équipe, Stats) + bouton "Continuer"
7. Game over → coffre final tier-aware (damaged → bronze → silver → royal → runic)

### Économie
- **Or** : monnaie de run, dépensable au hub (potions, lootboxes, reroll boutique, swap équipe, bénédiction)
- **Fragments** : monnaie persistante, sert à forger des persos personnalisés à l'**Atelier**
- **Persos forgés** : recyclables au hub contre fragments + or
- **Pity system** local (5 lootboxes sans rare → +5% ; 8 → +10% ; 12 → +5% épique). Pas de vraie monnaie, tout local, probabilités affichées.

### 3 Stages
| Stage | Nom | Boss vague 10/20/30 | Ambiance | Accent actuel |
|-------|-----|---------------------|----------|---------------|
| 1 | Les Cryptes Froides | Gardien des Cendres | pierre, runes bleues, froid | `#6FB3D2` bleu acier glacé |
| 2 | Le Sanctuaire du Vide | Sorcière du Vide | magie, poison, violet sombre | `#8E5BD5` violet + `#7DBE65` toxique |
| 3 | La Salle du Roi Brisé | Roi Brisé | ruines royales, or terni, rouge sombre | `#C9A24A` or terni + `#8E2A2A` sang |

Fond de jeu actuel : `#0b0a0c` (presque noir, légère teinte chaude).

### 5 Raretés
| Rareté | Couleur dominante | Particules | Animation idle |
|--------|-------------------|------------|----------------|
| Commun | `#6b6e75` pierre/gris | 0 | statique |
| Rare | `#5BA3D0` bleu froid | 2 (cycle 4s) | halo soft pulsant |
| Épique | `#9C6BD9` violet profond | 4 (cycle 5s) | glow pulsant 3s |
| Légendaire | `#E0B450` or profond | 6 + sparks | bordure animée 6s |
| Mythique (réservé) | `#F5E6D8` blanc nacré | placeholder | RESERVED — à activer plus tard |

### 5 Tiers de coffre final
- **Damaged** (mort avant boss 1) : bois fendu gris, faible glow gris, souffle de poussière
- **Bronze** (boss 1 vaincu) : bois ferré, accent cuivre tiède
- **Silver** (boss 2 vaincu) : métal froid, scintillement subtil
- **Royal** (boss final vaincu) : or profond, lueur dorée pulsante
- **Runique** (run exceptionnelle) : bois noir + runes lumineuses bleu-or, animation lente premium

### Animations livrées (V3)
- Roulette de lootbox : strip horizontal 18 items, easing `cubic-bezier(.12,.85,.25,1)` 2500ms, arrêt déterministe, leurres "presque" psychologique
- Reveals raretés : commun lueur grise, rare flash bleu, épique aura violette, légendaire explosion dorée + screen-shake léger
- Combat : pulse héros 220ms, projectiles 5 types (physical/magic/heal/shield/poison), impact flash + shake, floating numbers regroupés (`-24 / -8` puis `-58 cumul`)
- Boss intro 1600ms (darken → nom → ambiance → fade)
- Boss présence : carte 1.4×, BossHpBar full-width, Phase II à 50% PV, aura instable <30%
- Vitesse combat x1 / x1.25 / x1.5
- `prefers-reduced-motion` couvert pour toutes les anims

### Composants UI déjà existants
- `CombatHero` (compact, en combat) ↔ `CharacterCardDetailed` (détaillé, en collection/reveal)
- `CombatHud` + `CombatFooter` + `RunProgress` (3 stages × 10 + 2 hubs)
- `HubScreen` + `ShopTab` + `LootboxTab` + `RecycleTab` + `TeamTab` + `StatsTab`
- `LootboxScreen` (5 phases) + `LootRoulette` + `RarityReveal`
- `BossIntroOverlay` + `EnemyCard` (avec mode boss) + `BossHpBar`
- `FinalChest` tier-aware + `ChestOpening`
- `ConsumableRail` (3 slots sous CombatFooter)
- `Atelier` (forge de persos personnalisés) + `Collection`

---

## 4. Système de design existant à respecter

### Tokens fondamentaux
```css
:root {
  /* Fond et neutres */
  --bg-deep: #0b0a0c;
  --bg-elevated: #15131a;
  --ink: #e8e3d8;
  --ink-muted: #9a958a;

  /* Stages */
  --stage-1-accent: #6FB3D2;
  --stage-2-accent: #8E5BD5;
  --stage-3-accent: #C9A24A;
  --stage-3-accent-blood: #8E2A2A;

  /* Raretés */
  --rarity-common: #6b6e75;
  --rarity-rare: #5BA3D0;
  --rarity-epic: #9C6BD9;
  --rarity-legendary: #E0B450;
  --rarity-mythic: #F5E6D8;

  /* Combat */
  --combat-speed: 1;
  --hp-good: #6fbf77;
  --hp-warn: #d8a04a;
  --hp-low: #c25656;
}
```

### Conventions
- Toutes les durations combat sont scalées : `transition: transform calc(220ms / var(--combat-speed)) ease-out`
- Halos = `box-shadow`, **jamais `filter: blur`** sur grand élément (perf)
- Pas plus de **4 boucles infinite simultanées** en combat (cap perf)
- Cap **12 anim events** simultanés dans la queue
- Contrastes **AA minimum** (idéalement AAA pour titres) sur fond `#0b0a0c`
- **Pas fluo, pas saturé, pas pastel** — premium dark sobre

---

## 5. Ce qu'on attend de toi (livrables)

Produis ces livrables, **dans cet ordre** :

### Livrable 1 — Direction artistique synthèse (1 page)
- **Pitch visuel en 3 phrases** : qu'est-ce qui rend Bobbycard Roguelike visuellement reconnaissable au premier coup d'œil ?
- **Mood-board en mots** : 12 références visuelles précises (jeux, films, illustrateurs, époques, matières) avec 1 ligne chacune expliquant ce qu'on en garde.
- **Anti-références** : 5 choses que Bobbycard **n'est pas** (ex: « pas de chibis », « pas d'icônes Material », « pas d'or néon »).

### Livrable 2 — Charte chromatique étendue
- Vérifie/ajuste les palettes existantes (stages, raretés) : valide les contrastes WCAG AA/AAA, propose des variantes pour états (hover, locked, disabled, error, success).
- Ajoute une **palette UI universelle** : neutres (5 niveaux), accents fonctionnels (success, warning, error, info), couleurs de stat (PV/PH/MG/SOIN/BCL).
- Pour chaque couleur, donne hex + usage + contraste sur fond `#0b0a0c`.

### Livrable 3 — Système typographique
- Aujourd'hui : pas de famille typo importée, on est sur stack système. **Propose 1 ou 2 familles Google Fonts** dark-fantasy compatible (ex: Cinzel, Marcellus, EB Garamond pour titres ; Inter, Cormorant, ou Spectral pour corps).
- Hiérarchie complète : H1 (boss intro), H2 (stage names), H3 (sections hub), titre carte, label stat, body, micro-caption.
- Tokens en `:root` + exemples d'usage.

### Livrable 4 — Direction "carte personnage" — la pièce centrale du jeu
C'est **le composant le plus regardé** du jeu (Collection, Atelier, reveals lootbox, reveals coffre).

Produis :
- **Mockup HTML/CSS exécutable** (artifact ouvrable au navigateur) montrant les 5 raretés côte à côte d'un même perso, en grille 5 colonnes 1280×280.
- Détails : layout interne (nom, badges rareté + rôle, portrait runique, stats grid 2×3, encadré skill, encadré trait, pied fragments/rang).
- Animations idle par rareté (subtiles : pulse halo, shimmer bordure, particules ambiantes) — keyframes CSS dans le mockup.
- **Reduced-motion** : variante statique pour chaque rareté.
- État `hover` : élévation translateY -3px + glow renforcé.
- État `locked` (perso non débloqué) : silhouette + ?, tagline « Trouve cette carte dans un coffre ».

### Livrable 5 — Direction "boss" — le moment fort
Pour chacun des **3 boss canon** + **1 boss final** :

| Boss | Stage | Ambiance | Mécaniques narratives |
|------|-------|----------|------------------------|
| Gardien des Cendres | 1 | pierre, braise éteinte | À 50% : Braise éternelle / <30% : brûlure |
| Sorcière du Vide | 2 | poison violet, vide arcanique | Empoisonne, malédictions |
| Roi Brisé | 3 (final) | or terni, sang royal | Multi-attaque, phase finale |

Produis pour chacun :
- Direction visuelle (silhouette runique CSS, palette précise, particules, aura).
- **Boss intro 1600ms** : phrase d'ambiance écrite (1-2 lignes), composition de l'overlay.
- État Phase II (50%) et état Rage (<30%) : transformation visuelle.
- État de mort : ralentissement, particules d'explosion thématiques.
- Mockup HTML/CSS exécutable d'au moins 1 boss en intro.

### Livrable 6 — Direction "coffre & loot box"
Le brief est non-négociable : *« Le coffre = moment fort, pas un bouton. »*

Pour chacun des **5 tiers de coffre final** + **4 types de loot box** (Petite/Rare/Épique/Runique) :
- Silhouette CSS + palette + animation idle + animation d'ouverture.
- Pour la roulette de lootbox : direction du strip (taille items, marqueur central, leurres), comportement à l'arrêt, intensité du reveal selon rareté.
- Mockup HTML/CSS exécutable d'au moins : 1 coffre runique (idle + ouverture) + 1 roulette légendaire (séquence complète).

### Livrable 7 — Direction "combat"
- Composition du `CombatScreen` 1280×720 : où placent les héros, les ennemis, le HUD, le RunProgress, la barre tactique.
- Trajectoires d'attaque : 5 types détaillés (forme, durée, particules, easing).
- Réactions impact : flash, shake, aura wounded, K.O.
- Floating numbers : variants, regroupement (`-24 / -8` puis `-58 cumul`), zigzag anti-superposition.
- Layout de l'`EnemyCard` boss (1.4×) + `BossHpBar` au-dessus du battlefield.
- Mockup HTML/CSS d'un combat type (3 héros + 2 ennemis + 1 boss en simulation).

### Livrable 8 — Direction "hub" (5 onglets)
- Composition générale du hub (header avec ressources, barre d'onglets, zone centrale, footer continuer).
- Pour chaque onglet (Boutique, Loot Box, Recyclage, Équipe, Stats) : layout, hiérarchie, micro-interactions.
- Atmosphère du hub : doit être un **lieu de respiration**, plus calme que le combat. Bois, parchemin, lanterne, stèle runique ?
- Mockup HTML/CSS exécutable d'un hub stage 1→2 (onglet Boutique actif par défaut).

### Livrable 9 — Iconographie
- **Système d'icônes runiques** : 30+ icônes nécessaires (PV, PH, MG, SOIN, BCL, VIT, or, fragments, lootbox, coffre, recyclage, équipe, stats, poison, brûlure, malédiction, bouclier, rage, KO, trait, skill, intent attack/defend/buff/debuff, stages, hubs, etc.).
- **Style** : SVG inline, monochromes, ligne fine, géométrie runique. Pas de Material, pas de Lucide. Cohérent dark fantasy.
- Mockup HTML/CSS d'une **planche d'icônes** complète (grille 6 colonnes).

### Livrable 10 — Ambitions futures (V4+)
Anticipe la suite. Propose :

- **Mythique activée** : à quoi ressemble une carte mythique en mouvement ? Quel est son "événement de reveal" ? (max 1 mythique par save jusqu'à boss final ou achievement caché — propose une règle d'apparition cohérente).
- **Skins de héros** : si on permet plus tard d'avoir Ronan en skin "Festin Hivernal" ou "Lame Brisée", à quoi ça ressemble ? Comment l'UI affiche les skins disponibles ?
- **Niveaux/rangs persos** : aujourd'hui le rang est juste un placeholder. Propose une mécanique visuelle de rang I→V (étoiles runiques ? gemmes ? sceaux ?).
- **Méta-progression** : un futur écran de "compendium" / "atlas runique" qui montre l'évolution du joueur entre runs (boss vaincus, légendaires obtenues, runs parfaites). Direction visuelle.
- **Stage 4+ hypothétique** : si on ajoute un stage caché post-Roi Brisé (déblocable après run runique), quel univers visuel ? Mots-clés et palette proposée.
- **Mode "endless"** : run sans fin avec scaling ; comment le faire ressentir visuellement (ambiance qui se corrompt, palette qui dérive) ?
- **Direction sonore future** : non-livrable visuel mais propose en 5 lignes ce que serait la direction sonore minimaliste cohérente avec la DA (instrumentation, pulsations, motifs runiques, silence stratégique).

### Livrable 11 — Composants atomiques
Catalogue de composants atomiques à standardiser, avec mockups HTML/CSS :
- `Button--primary/secondary/ghost/destructive`
- `Badge--rarity-{kind}`, `Badge--role`, `Badge--stage`
- `StatPill` (icône + valeur)
- `Tooltip` (sur hover stats/skills)
- `ProgressBar` (HP, BCL, XP, pity)
- `Modal` (recyclage, replace consumable, confirmations)
- `Toast` (or insuffisant, achat OK, etc.)
- `EmptyState` (collection vide, hub stats vide)
- `Loader` (chargement initial, transitions)

### Livrable 12 — Garde-fous & accessibilité
- **prefers-reduced-motion** : pour chaque animation produite, donne explicitement la version "réduite" (statique, fade simple, opacity step).
- **Daltonisme** : vérifie que les états (HP bas, rareté, intent ennemi) restent distinguables sans la couleur seule (icône + texte + forme).
- **Focus visible** : tous les éléments interactifs ont un focus ring discret mais visible (offset 2px, couleur accent stage).
- **Lecteur d'écran** : ARIA roles + live regions pour reveals, boss intro, intents ennemis.
- **Performance** : récap des règles à suivre (cap 4 boucles infinite, cap 12 anim events, transform/opacity uniquement, box-shadow pour halos, will-change avec parcimonie).

---

## 6. Format de sortie attendu

- **Markdown structuré** pour les livrables 1, 2, 3, 9, 10, 12.
- **Artifacts HTML/CSS exécutables** (autonomes, ouvrables au navigateur, Tailwind via CDN autorisé pour le mockup) pour les livrables 4, 5, 6, 7, 8, 11. Chaque artifact doit montrer plusieurs états côte à côte si pertinent.
- **Tokens CSS** prêts à coller dans `src/styles.css` à chaque fois que c'est pertinent.
- **Décisions justifiées** : pour chaque choix (couleur, typo, anim), explique en 1-2 phrases pourquoi cette option vs alternatives.

---

## 7. Contraintes dures (à respecter sans exception)

1. **Ton** : dark fantasy premium sobre. Pas de chibis, pas de néon, pas de pastel, pas d'emoji dans l'UI in-game (les icônes sont SVG runiques).
2. **Résolution** : tout doit tenir en 1280×720 sans scroll en jeu. La collection peut scroller, le hub non, le combat non.
3. **Pas de bitmap** : tout en CSS / SVG inline. Si tu proposes des images, dis-le explicitement et justifie.
4. **Performance** : 60fps cible sur Chromium desktop, 5 ennemis simultanés combat ×1.5.
5. **Accessibilité** : WCAG AA minimum, prefers-reduced-motion **obligatoire**.
6. **Cohérence** : tout livrable doit être compatible avec le système existant (V1+V2+V3). Tu peux proposer des évolutions, mais explique la migration.
7. **Pas de logique gambling prédatrice** : probabilités toujours visibles, pity discret, jamais de vraie monnaie, jamais d'incitation à l'achat impulsif.

---

## 8. Ce que tu dois ABSOLUMENT clarifier avec moi avant de produire

Pose 3 à 6 questions courtes si :
- une référence visuelle te manque (ex: « est-ce que tu veux une vibe plus Hades ou plus Darkest Dungeon ? »),
- un trade-off est impossible à trancher seul (ex: « typo serif premium = identité forte mais coût de chargement, je propose woff2 préchargée »),
- une ambition future a plusieurs déclinaisons légitimes (ex: « stage 4 = jardin runique inversé OU forge cosmique ? »).

Sinon, **fonce et produis**. Auto mode : je préfère 80% livré que 100% débattu.

---

## 9. Critère de succès

Quand je vois ta livraison, je dois pouvoir :

1. **Visualiser** Bobbycard Roguelike en 5 secondes (sans avoir à lire la doc).
2. **Recoller** chaque écran à une intention narrative claire.
3. **Distinguer** une commune d'une légendaire en 0,3s à l'œil nu.
4. **Anticiper** les 2 prochaines versions du jeu (V4, V5) sans me demander.
5. **Donner** la livraison à un dev frontend qui implémente sans me re-poser une question pendant 3 jours.

---

## 10. Petit mot perso

Bobbycard Roguelike est mon prototype. Il a déjà 3 itérations majeures livrées (V1 mécaniques, V2 progression/économie, V3 game feel). La direction visuelle existe — elle est cohérente, mais elle est **fonctionnelle** plus que **désirable**.

Ce que je veux de toi : que tu en fasses **un objet désirable**, qu'on ait envie d'imprimer une carte légendaire, qu'on ait envie d'ouvrir un coffre runique pour le plaisir de l'ouvrir.

Le jeu est local, pas commercial. Aucune pression marché. **Tout ce qui compte, c'est que ce soit beau, lisible, premium, et que ça donne envie de relancer une run.**

Bon travail.
