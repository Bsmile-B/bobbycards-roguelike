# Specs V4 — Application de la DA "Joyful Direction"

## 1. Intention
Refondre la peau visuelle complète du jeu (V1 + V2 + V3) pour adopter la DA cartoon candy chunky "Joyful Direction" (Clash Royale × Cult of the Lamb × Cookie Run), **inspirée** du fichier `Bobbycard DA - standalone.html` mais **non copiée**. Aucune mécanique ne change. Le squelette React/reducer/save/hooks de test reste intact.

## 2. Audience
- Persona : joueur curieux qui lance le proto en local (`npm run dev`).
- Contexte : desktop 1280×720, navigateur récent (Chromium / Firefox / Safari).
- Attente : *« je vois clairement un jeu candy joyeux dès le menu, des cartes-stickers, des persos qui sont de vrais personnages »*.

## 3. Résultats attendus
1. Au premier coup d'œil, la rupture de DA est nette (cream + violet nuit + Lilita One).
2. Toutes les cartes ont la signature : cerne ink 3px + sticker shadow `0 6px 0 rgba(38,26,61,0.45)`.
3. Tous les héros et ennemis sont des **mascottes CSS** (tête + chapeau + yeux + joues + bouche), plus aucune silhouette runique.
4. Les 5 raretés (commun → rare → épique → légendaire → mythique) sont distinctes à 2 mètres.
5. Les mécaniques V1/V2/V3 fonctionnent à l'identique (pas de bug de régression fonctionnelle).

## 4. Périmètre fonctionnel — 6 phases

### Phase A — Fondation tokens

**Fichiers touchés** : `index.html`, `src/styles.css` (bloc `:root`), `src/App.tsx` (vérification — pas de logique).

**Classes CSS à modifier** :
- `:root` (extension complète, voir §5 stratégie tokens)
- `body`, `#root`, `.app-shell` : `background: var(--bg-deep)`, `font-family: var(--font-body)`, color : `var(--paper)` pour le shell global qui contient `.combat-screen` (sombre étoilé), mais `var(--ink)` pour les surfaces cream.

**Classes CSS à créer (utilitaires globaux)** :
- `.bg-sky-day`, `.bg-sky-dusk`, `.bg-meadow`, `.bg-night` (skyboxes utilitaires réutilisables — composition gradient documentée en §5.b du handoff designer).
- `.sticker-shadow`, `.sticker-shadow-sm`, `.sticker-shadow-lg` (shorthand `box-shadow: var(--shadow-stick-...)`).
- `.ink-stroke` (helper pour cerne 3px ink + radius variable).
- `.pill`, `.btn`, `.btn--primary`, `.btn--gold`, `.btn--mint`, `.btn--grape` (atomes réutilisables).

**Composants React touchés** : aucun en phase A. Vérification visuelle Menu uniquement.

**`index.html` modifications** :
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@400;600;700;800&family=JetBrains+Mono:wght@400&display=swap">
```
+ langue `lang="fr"` conservée, title inchangé.

### Phase B — Cartes personnages détaillées + raretés + mascottes

**Fichiers touchés** : `src/App.tsx` (CharacterCardDetailed, RarityReveal, nouveau HeroMascot), `src/styles.css`.

**Composant React nouveau** : `<HeroMascot variant size mood className style />` (voir §5.c).

**Classes CSS à modifier** (refonte profonde) :
- `.character-card-detailed` (parent) : `border: 3px solid var(--ink)`, double inset `0 0 0 4px var(--rcolor)` + `0 0 0 6px white`, `box-shadow: var(--shadow-stick)`, `border-radius: var(--r-xl)`, fond `radial-gradient(circle at 30% 25%, var(--bg-cream), white)`, font : `var(--font-display)` pour le nom + `var(--font-body)` pour le reste.
- `.character-card-detailed__halo` (nouveau pseudo-element ou div) : `position: absolute; inset: -12px; border-radius: 28px; background: radial-gradient(circle, var(--rcolor), transparent 65%); filter: blur(var(--rarity-halo-blur));`. Désactivé en reduced-motion.
- `.character-card-detailed__rank-pill`, `.character-card-detailed__rarity-badge` : pill cream avec cerne ink + Lilita One.
- `.character-card-detailed__portrait` : 140×140, fond cream gradient, cerne ink 2px, `border-radius: var(--r-md)`, **contient `<HeroMascot size="lg" />`**.
- `.character-card-detailed__name` : `font-family: var(--font-display)`, color : `var(--rcolor-deep)`, text-stroke 1px ink, text-shadow `0 2px 0 var(--ink)`.
- `.character-card-detailed__role` : Nunito italic 11px, `var(--ink-muted)`.
- `.character-card-detailed__stats` : grid 2 colonnes, fond `var(--paper)`, cerne ink 2px, icônes en cercles colorés (hp/atk/mag/def couleurs des stats).
- `.character-card-detailed__skill` : fond `var(--rcream)`, cerne ink, icône cercle coloré rareté.
- `.character-card-detailed__trait` : pill ink + label Lilita One.
- `.character-card-detailed__foot` : grape pill (frags) + étoiles or (rang).

**Classes raretés** (V4) :
- `.rarity-common` : `--rcolor: var(--rarity-common); --rcolor-deep: ...; --rcream: var(--rarity-common-cream); --rarity-halo-blur: 0px;` aucune anim idle.
- `.rarity-rare` : tokens cyan, `--rarity-halo-blur: 2px`, idle anim `shimmer-x` 4s linear infinite (sur `::before`).
- `.rarity-epic` : tokens violet, `--rarity-halo-blur: 3px`, idle `pulse-halo` 3s sur le halo.
- `.rarity-legendary` : tokens or, `--rarity-halo-blur: 4px`, idle `breathe` 6s sur frame, sparkles `spark` 3s.
- `.rarity-mythic` : tokens rose nacré (**activée**), `--rarity-halo-blur: 6px`, idle `wobble` 5s sur frame, sparkles +1.

**Mapping tokens raretés V2/V3 → V4** : voir §5.a — les classes V2 (`.rarity-commune`, `.rarity-epique`, `.rarity-legendaire`, `.rarity-runique`) **conservent leurs noms** (utilisées par CharacterCard compact) mais reçoivent les nouvelles valeurs candy. Les classes V3 (`.rarity-common/rare/epic/legendary`) sont également mises à jour.

**Sparkles** : `<span class="character-card-detailed__sparkle" style="--sx:..; --sy:..">` — 3-4 instances par carte légendaire/mythique, animation `spark` 3s alternés.

**Cap 4 boucles infinite** : sur une carte mythique le compte est : halo (1) + frame wobble (1) + sparkle ×N (≤2). On limite les sparkles à **2 par carte mythique** pour rester sous le cap.

### Phase C — Combat skin (sans toucher la mécanique)

**Fichiers touchés** : `src/App.tsx` (CombatHero, EnemyCard, BossHpBar, RunProgress, BossIntroOverlay, CombatScene wrapper), `src/styles.css`.

**Classes CSS à modifier** :
- `.combat-screen` : background skybox stage-aware via classe modifier `.combat-screen--stage-1/2/3` qui pose un `::before` plein cadre avec gradient (sky-day pour S1, sky-dusk magique pour S2, sky-dusk doré pour S3), z-index -1.
- `.combat-hero` (compact) : refonte complète. Cerne 3px ink, radius `var(--r-lg)`, sticker shadow, fond cream gradient, **mini-mascotte 50px** (HeroMascot size="sm") au lieu du portrait runique, `font-family: var(--font-display)` pour le nom, barre HP en pill cream→hp-color avec cerne ink. Float-y idle 3s (mais désactivé pour héros KO).
- `.enemy-card` : cerne 3px ink, sticker shadow, fond cream avec teinte stage-accent. Mascotte ennemi (slime/bat/etc selon stage). Float-y idle (désactivé si `enemy.hp <= 0`).
- `.enemy-card--boss` : scale 1.4, halo radial mythic, nom Lilita One avec mythic glow.
- `.boss-hp-bar` : fond `rgba(38,26,61,0.85)` + cerne ink, nom Lilita One avec text-shadow mythic, barre dégradé `linear-gradient(90deg, var(--rarity-mythic), var(--brand-coral))`, fill ink `0 0 0 2px ink`.
- `.run-progress` : refonte. Fond `var(--paper)`, cerne ink, dots (10 par stage) en cercles colorés stage-accent, dot courant `--brand-coral` pulsant 1s, dots "boss done" carrés or (`--rarity-legendary`) avec couronne emoji (ou pseudo-element).
- `.combat-stage-pill` : grape pill avec icône stage (cercle coloré).
- `.cres` (resource pills or/fragments) : fond white pill + cerne ink + icône cercle coloré + valeur Lilita One.
- `.skill-card` (boutons compétence) : carré ink + label Lilita One + cooldown sun. Variants `--ready` (coral active), `--cooldown` (gris désaturé).
- `.cons` (slot consommable) : 56×56, cerne ink, icône emoji centré.
- `.combat-speed` : pill avec 3 boutons, active = coral.
- `.projectile` : refonte, cercle 22×22, glow rareté/type (var(--anim-projectile-*) pour la durée).
- `.fnum` (floating numbers) : Lilita One, text-stroke ink, text-shadow `0 2px 0 rgba(38,26,61,0.5)`, animation `fnum-rise` 1.6s.
- `.intent` (intent ennemi) : pill cream + cerne ink + icône type.

**Animations à ajouter / modifier** :
- **Nouvelle keyframe `chero-attack`** : `0% { transform: translate(0,0) rotate(0); } 30% { transform: translate(20px,-10px) rotate(4deg); } 100% { transform: translate(0,0) rotate(0); }` — 0.45s — appliquée via `.is-attacking` (remplace le `attack-pulse` V3).
- **Nouvelle keyframe `enemy-attack`** : symétrique (translate(-20px,-10px) rotate(-4deg)).
- **Nouvelle keyframe `chero-attack-special`** : amplitude majorée (translate(28px,-14px) rotate(6deg)).
- **Nouvelle keyframe `fnum-rise`** : `0% { transform: translateY(0) scale(0.6); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-50px) scale(0.9); opacity: 0; }` — 1.6s.
- **Float-y** sur `.combat-hero`, `.enemy-card`, `.character-card-detailed` (3-4s, infinite). **Désactivée** sur `.combat-hero.is-ko`, `.enemy-card.is-dead`, et globalement en `prefers-reduced-motion`.

**Cap 4 boucles infinite combat** (decision V3 perf-guard) :
- Float-y est sur 3 héros + 2-3 ennemis + 1 boss = 6-7 cartes simultanément, ce qui dépasse 4. **Décision** : la float-y "permanente" de la DA est conservée car elle est `transform: translateY` pure, sans filter blur, sans box-shadow animé. Le cap 4 visait les boucles **coûteuses** (filter, box-shadow, multiples props animées). Une translateY pure infinite × 7 cartes reste sous le budget GPU. **À valider en revue runtime** ; si dégradation perçue, fallback sera de désactiver float-y sur les héros et de la garder seulement sur ennemis/boss.

### Phase D — Coffres + roulette

**Fichiers touchés** : `src/App.tsx` (FinalChest, LootRoulette, LootboxScreen), `src/styles.css`.

**Classes CSS à modifier** :
- `.chest` (parent FinalChest) : refonte complète. `position: relative`, `width: 110px`, `height: 92px`. **Aura radial colorée** en `::before` (`background: radial-gradient(circle, var(--cglow), transparent 70%)`, scale via tier).
- `.chest__shadow` : ellipse au sol (`::after` du parent ou span dédié), opacity 0.3.
- `.chest__body` : `transform: float-y` 4s ou static (damaged). 60px haut. Cerne ink. Fond `var(--ctier)`. Inclut `.chest__lock` central.
- `.chest__lid` : 38px haut, transform-origin bottom. Inclut `.chest__band` horizontal cdeep + `.chest__keyhole` rond ink + `.chest__studs` (3 cercles or). État `.chest--opening .chest__lid { transform: rotateX(-100deg); }` 700ms.
- `.chest__rune` (×3, runic uniquement) : positionnés autour, animation `pulse-halo` 3s avec offsets 0/0.4/0.8s.
- `.chest__burst` (overlay ouverture) : `position: absolute; inset: 0; background: radial-gradient(ellipse, white, var(--cglow), transparent); animation: chest-burst 1.2s;`.
- Tiers : `.chest--damaged` (no aura, rotate -3deg fixe), `.chest--bronze`, `.chest--silver`, `.chest--royal` (pulse-halo 4s sur aura), `.chest--runic` (pulse-halo 3s + 3 runes glow cyan).

**Roulette** :
- `.rou` (frame) : 140px haut, fond cream gradient, cerne ink 2.5px, radius `var(--r-md)`, overflow hidden.
- `.rou__marker` : ligne verticale 4px coral centré, `box-shadow: 0 0 12px var(--brand-coral)`, triangles haut/bas en `::before`/`::after`.
- `.rou__fade-left`, `.rou__fade-right` : 80px linear gradient cream → transparent.
- `.rou__strip` : conteneur horizontal, `transition: transform 2700ms cubic-bezier(.12,.85,.25,1)` (ou rAF — déjà choisi en V3).
- `.rou__item` : 110px, mini-portrait 56×56 avec mascotte mini, name Lilita One 10px. Fond cream rareté (var(--rcream)), cerne 2.5px ink (color rareté pour rare+).
- `.rou__item.is-winner` : `pulse-halo` à l'arrêt.
- `.rou-status` : Lilita One 14px uppercase. États `--default` ink-soft, `--spin` grape, `--done` legendary-deep + glow.

### Phase E — Hub + onglets

**Fichiers touchés** : `src/App.tsx` (HubScreen, HubTabs, HubHeader, HubResource, ShopTab, LootboxTab, RecycleTab, TeamTab, StatsTab), `src/styles.css`.

**Classes CSS à modifier** :
- `.hub-screen` : skybox approprié (sky-dusk royal) en `::before`, pas de fond opaque.
- `.hub-header` : pill cream stage-name + ressources or/fragments en pills white avec icônes.
- `.hub-tabs` : 5 onglets en pills, pill active `var(--brand-coral)` avec sticker shadow.
- `.hub-content` : carte cream sticker (cerne ink + sticker shadow + radius xl).
- `.shop-item` : carte cream avec rarity-cream bg, prix en pill or, bouton coral/grape.
- `.lootbox-card` : carte cream avec aura radial colorée par tier, nom Lilita One, prix or pill, mascotte coffre mini.
- `.recycle-confirm-modal` : carte chunky cream + bouton primary coral + bouton secondary grape.
- `.team-tab` : grille mascottes (HeroMascot lg) avec indicateur swap gratuit/payant.
- `.stats-tab` : tableau Nunito 700 + valeurs Lilita One.

**Boutons** :
- `.btn--primary` : fond coral, color white, Lilita One 18px uppercase, cerne ink, sticker shadow, hover translateY -2px, active translateY 3px.
- `.btn--gold` : fond sun.
- `.btn--mint`, `.btn--grape`.
- `.btn--ghost` : fond transparent + cerne ink (utilisé pour cancel modale).

### Phase F — Renommage narratif (optionnel — décision §5.f)

Voir §5.f — **DÉCISION : on garde les noms V2** (Cryptes Froides / Sanctuaire du Vide / Salle du Roi Brisé). Pas de modification de `STAGE_CONFIGS.name` ni des noms boss. La DA visuelle (skybox sky-day glaciaire pour S1, sky-dusk violet pour S2, sky-dusk doré pour S3) reste cohérente avec les noms gothiques car interprétée comme : *« le froid des cryptes = ciel pâle givré, le vide = crépuscule violet, le roi brisé = couronnement doré sanglant »*.

## 5. Stratégie de migration

### 5.a Tokens — rename in-place + extension

**Décision** : on garde les **noms** des tokens existants quand ils existent, on **change leurs valeurs**. On **ajoute** les nouveaux. On **ne supprime aucun token** sans audit (risque de casser une classe oubliée).

**Tokens existants conservés (nom) — valeur changée** :
| Token | Avant V3 | Nouvelle V4 |
|-------|----------|-------------|
| `--color-bg` | `#0b0a0c` | `#1a1530` |
| `--color-surface` | `rgba(18,16,19,0.78)` | conserver pour compat — superposé par `var(--bg-cream)` sur les cartes |
| `--color-text` | `#f3eadb` | conservé pour shell sombre, mais surfaces cream utilisent `var(--ink)` |
| `--color-text-strong` | `#f7efe2` | conservé |
| `--color-text-muted` | `#a99f91` | conservé pour shell sombre |
| `--accent` | `#bb9d64` | `var(--brand-coral)` (mapping) ou conservé en fallback |
| `--rarity-commune` | gris désat | `var(--rarity-common)` candy gris-bleu |
| `--rarity-rare` | bleu sombre | `var(--rarity-rare)` cyan candy |
| `--rarity-epique` | violet sombre | `var(--rarity-epic)` violet magique |
| `--rarity-legendaire` | or sombre | `var(--rarity-legendary)` or pop |
| `--rarity-runique` | cyan glace | conservé comme alias de `var(--rarity-mythic)` ou supprimé après audit |
| `--chest-damaged/bronze/silver/royal/runic` | tons sombres | tons candy festifs |
| `--stage-1/2/3-accent` | bleu glacé / violet vide / or rouge | bleu glacier doux (S1) / violet pétillant (S2) / or chaleureux (S3) |
| `--combat-speed` | `1` | conservé (V3) |

**Tokens nouveaux (ajout pur)** :
- `--bg-deep`, `--bg-mid`, `--bg-elevated`, `--bg-cream`, `--bg-cream-deep`, `--ink`, `--ink-soft`, `--ink-muted`, `--paper`, `--paper-line`.
- `--brand-coral`, `--brand-mint`, `--brand-sun`, `--brand-sky`, `--brand-grape`.
- `--stage-1-deep`, `--stage-1-cream` (et idem 2, 3).
- `--rarity-common`, `--rarity-rare`, `--rarity-epic`, `--rarity-legendary`, `--rarity-mythic` (en parallèle des FR `--rarity-commune` etc.) + variantes `-deep` et `-cream`.
- `--hp-good`, `--hp-warn`, `--hp-low`, `--shield`, `--mana`, `--rage`, `--poison`.
- `--r-sm`, `--r-md`, `--r-lg`, `--r-xl`, `--r-pill`.
- `--stroke`, `--stroke-thin`.
- `--shadow-stick-sm`, `--shadow-stick`, `--shadow-stick-lg`, `--shadow-glow`, `--shadow-soft`.
- `--font-display`, `--font-body`, `--font-mono`.

**Tokens existants à risque (utilisés par classes V2/V3)** :
- `--stage-{N}-accent-deep`, `-soft`, `-glow` : utilisés par RunProgress, HubScreen, StageIntro. **Conservés**, valeurs ré-alignées sur les nouveaux stage accents.
- `--anim-attack-pulse`, `--anim-projectile-*`, etc. (V3) : conservés tels quels (durées). Les keyframes derrière changent (chero-attack remplace attack-pulse via override).

**Classes V2/V3 critiques à valider survie** :
- `.app-shell` : OK (font-family + bg renew).
- `.combat-screen`, `.combat-screen.speed-125`, `.combat-screen.speed-150` : OK (vitesse conservée).
- `.hub-screen`, `.hub-tabs`, `.hub-content`, `.hub-header` : OK.
- `.character-card-detailed` (V3) : refonte profonde mais le nom de classe reste (pas de breaking pour App.tsx).
- `.combat-hero`, `.enemy-card`, `.boss-hp-bar`, `.run-progress` : refonte profonde, noms conservés.
- `.rarity-{kind}` (V2 et V3) : conservés, valeurs des tokens dérivés mises à jour.
- `.lootbox-screen`, `.rou-*`, `.chest-*`, `.chest-tier--{damaged|bronze|silver|royal|runic}` : refonte profonde, noms conservés.
- `.boss-intro-overlay` : refonte (cream pill candy au lieu d'overlay sombre runique).
- `.rarity-reveal` : conservé.
- `.stage-intro-screen` : conservé, refondu.

### 5.b Skyboxes par stage

```css
.bg-sky-day {
  background:
    radial-gradient(ellipse 60% 40% at 30% 35%, rgba(255,255,255,0.6), transparent 70%),
    radial-gradient(ellipse 40% 30% at 75% 55%, rgba(255,255,255,0.4), transparent 70%),
    linear-gradient(to bottom, #b8e3ff 0%, #ffd6c2 100%);
}
.bg-sky-dusk-magic { /* stage 2 */
  background:
    radial-gradient(circle 200px at 70% 30%, rgba(255,200,140,0.5), transparent 70%),
    linear-gradient(to bottom, #6a4ca0 0%, #ff8b6f 50%, #ffd47a 100%);
}
.bg-sky-dusk-royal { /* stage 3 */
  background:
    radial-gradient(circle 240px at 50% 25%, rgba(255,220,150,0.6), transparent 70%),
    linear-gradient(to bottom, #d97a3c 0%, #ffc845 60%, #fff5e1 100%);
}
.bg-night { /* hub par défaut, menu, atelier */
  background:
    radial-gradient(circle, #3a2f5e, #1a1530),
    /* étoiles via pseudo-element ou image générée */;
}
```

### 5.c Composant `<HeroMascot>`

```tsx
type MascotVariant =
  | "bobby"          // mascotte par défaut, par défaut héros sans mapping spécifique
  | "rogue"          // Cael, Nyx (lame, capuche)
  | "mage"           // Elyra, Maelis, Seraphine (chapeau pointu mage)
  | "guardian"       // Orrin, Thane, Kadris (heaume / bouclier)
  | "gourmand"       // Ronan (toque, ventre rond)
  | "slime"          // ennemi commun stage 1
  | "bat"            // ennemi rare stage 1
  | "ghost"          // ennemi stage 2
  | "witch"          // ennemi stage 2
  | "plant"          // ennemi stage 2 toxique
  | "guard"          // garde stage 3
  | "golem"          // golem stage 3
  | "soldier"        // héraut stage 3
  | "boss-cinder"    // Gardien des Cendres (S1 boss)
  | "boss-void"      // Sorcière du Vide (S2 boss)
  | "boss-king";     // Roi Brisé (S3 boss)

type MascotSize = "xs" | "sm" | "md" | "lg" | "xl";
//                36px  50px  80px  140px  200px

type MascotMood = "idle" | "attacking" | "hurt" | "ko" | "happy" | "angry";

interface HeroMascotProps {
  variant: MascotVariant;
  size?: MascotSize;       // défaut "md"
  mood?: MascotMood;        // défaut "idle"
  className?: string;
  style?: React.CSSProperties;  // permet override --mascot-skin etc.
}
```

**Composition CSS** : chaque variant pose ses CSS variables locales via `data-mascot-variant="..."` :
```css
.hero-mascot[data-mascot-variant="bobby"] {
  --mascot-skin: #ffe1c2;
  --mascot-hat: var(--brand-coral);
  --mascot-cape: var(--brand-grape);
  --mascot-eye: var(--ink);
  --mascot-cheek: #ff8b9c;
  --mascot-mouth: var(--ink);
}
```

Structure DOM (commune à tous variants) :
```html
<div class="hero-mascot hero-mascot--{size} hero-mascot--mood-{mood}" data-mascot-variant="bobby">
  <div class="hero-mascot__cape"></div>
  <div class="hero-mascot__head">
    <div class="hero-mascot__hat">
      <div class="hero-mascot__hat-band"></div>
      <div class="hero-mascot__pompon"></div>
    </div>
    <div class="hero-mascot__eyes">
      <span class="hero-mascot__eye hero-mascot__eye--left"></span>
      <span class="hero-mascot__eye hero-mascot__eye--right"></span>
    </div>
    <div class="hero-mascot__cheek hero-mascot__cheek--left"></div>
    <div class="hero-mascot__cheek hero-mascot__cheek--right"></div>
    <div class="hero-mascot__mouth"></div>
  </div>
</div>
```

Chaque variant peut **masquer / personnaliser** des éléments via les CSS variables (ex: slime n'a pas de chapeau → `--mascot-hat-display: none`).

**Responsabilité** : le composant reste 100% présentation. Il ne lit aucun state global. Le mood est passé par le parent (CombatHero le calcule selon hp et anim state).

### 5.d Mapping persos existants → variants

| Perso | Rareté | Variant |
|-------|--------|---------|
| Cael Brisefer | commune | rogue |
| Elyra Cendre | commune | mage |
| Orrin Veillefer | commune | guardian |
| Ronan Gourmand | epique | gourmand |
| Nyx Noctelame | rare | rogue |
| Maelis Sombrelys | rare | mage |
| Thane Corvacier | rare | guardian |
| Seraphine Voile | epique | mage |
| Kadris le Muet | epique | guardian |
| **Persos forgés (custom)** | * | **bobby** par défaut, override possible via futur sélecteur (hors scope V4) |

### 5.e Mapping ennemis existants → variants

| Stage | Ennemi | Variant |
|-------|--------|---------|
| 1 | Goule creuse | slime (gris-vert) |
| 1 | Brigand maudit | rogue (silhouette ennemie, capuche grape) |
| 1 | Spectre mineur | bat (silhouette ailée violette) |
| 2 | Acolyte noir | witch |
| 2 | Ombre rampante | ghost |
| 2 | Voilet du Vide | plant (toxique) |
| 3 | Garde brise | guard |
| 3 | Relique royale | golem |
| 3 | Heraut sanglant | soldier |
| **Boss** | Gardien des Cendres | boss-cinder (corps cendre orange, couronne brisée) |
| **Boss** | Sorciere du Vide | boss-void (silhouette violette à chapeau pointu) |
| **Boss** | Roi Brise | boss-king (couronne fissurée + cape royale grape) |

Le mapping se fait dans `createEnemy` (App.tsx) : ajout d'un champ `mascot: MascotVariant` sur le type `Enemy` et dérivation au moment de la création depuis le name. **Pas de changement save** (les Enemy ne sont pas persistés).

### 5.f Phase F — DÉCISION : conserver les noms V2

**Pourquoi conserver** :
1. L'utilisateur n'a pas explicitement demandé le renommage.
2. Renommer impacte la save existante (les bosses defeated par nom dans saveData) — risque de régression.
3. La cohérence narrative V1+V2 (arc dark fantasy gothique) a une valeur en soi ; superposer une DA candy joyeuse sur un nom gothique crée une **tension intéressante** (ironique Cult of the Lamb-esque) plutôt qu'une faiblesse.
4. Si l'utilisateur le demande explicitement plus tard, le renommage est une opération mécanique (un seul lieu : `STAGE_CONFIGS`).

**Phrases boss V3 actuelles** : conservées telles quelles (ne sont pas demandées dans la DA et fonctionnent dans le ton candy-mais-menaçant).

### 5.g Critères de succès mesurables

- [ ] `npm run build` : 0 erreur TS, 0 warning bloquant.
- [ ] CSS bundle <= 100 kB (actuellement 68 kB après V3, marge confortable).
- [ ] JS bundle <= 320 kB (actuellement 285 kB).
- [ ] 1280×720 : aucun composant ne dépasse, aucun scrollbar parasite.
- [ ] `prefers-reduced-motion` : toutes les boucles infinite désactivées (le bloc `*::before, *::after { animation: none; transition: none; }` de la DA est conservé, étendu aux nouvelles classes).
- [ ] Aucun composant V2/V3 ne crash à l'écran (smoke test : Menu → Sélection → Combat → Boss → Hub → Shop → Lootbox → Recycle → Stage 2 → Boss → … → Game over → Coffre).
- [ ] Cap 4 boucles infinite combat : voir §5 phase C — décision documentée, à valider en revue runtime.
- [ ] localStorage save préservée : clé `runebound-cards-save-v1` lue, save V3 (saveVersion 3) lue sans modification. **Pas de bump V4**, pas de migration.
- [ ] 5 raretés visuellement distinctes (commun gris, rare cyan, épique violet, légendaire or, mythique rose) — la mythique reste **désactivée par défaut** dans les drops (V4 introduit la classe et le placeholder visuel, mais pas la condition de drop ; voir §5.h).
- [ ] Combat fluide à x1 / x1.25 / x1.5 sans jank.
- [ ] Test Playwright golden path inchangé (les IDs Playwright sont tous conservés).

### 5.h Hors-périmètre explicite

- **Pas de gameplay** : reducer non touché, balance non touchée.
- **Pas de nouvelles mécaniques** : pas de nouveau bonus, pas de nouvelle compétence, pas de nouvelle relique.
- **Pas de bump saveVersion** : reste à 3. Aucune nouvelle clé localStorage.
- **Mythique : carte CSS active mais pas de drop** : la classe `.rarity-mythic` est créée et stylée. **Aucun perso mythique n'est introduit en V4.** Le drop mythique (lootbox tables) reste en placeholder. Conditions futures (V5) : à définir hors-V4. Documenté dans `decisions.md`.
- **Phrases narratives boss** : conservées V3. Pas de réécriture.
- **Pas de SVG line art runique** : la DA utilise emojis text + cercles colorés. On maintient cette approche. Les portraits `bobby-card-portrait` SVG actuels sur CharacterCard compact peuvent être conservés en fallback ou remplacés par HeroMascot — décision dev.
- **Pas de migration des cartes-personnages forgées custom** : ils prennent le variant `bobby` par défaut.
- **Pas de refonte de la modale `ReplaceConsumableModal` ni `RecycleConfirmModal`** au-delà du re-skinning (cerne ink + sticker shadow + boutons coral/grape). Structure DOM inchangée.

## 6. Contraintes
- **Techniques** : TypeScript strict, 0 `any`, React 18, Vite. Build clean obligatoire.
- **Marque (DA)** : cartoon candy chunky, jamais fluo, jamais flou massif, **toujours cerne ink + sticker shadow** sur élément stickerisé.
- **Performance** : cap effectif 4 boucles infinite simultanées **filter-blur ou box-shadow animées**. Translate/transform infinite pure non comptés.
- **Accessibilité** : WCAG AA, contraste texte sur cream `#fff5e1` avec ink `#261a3d` ≈ 13:1 OK. Sur fond sombre `#1a1530` avec paper `#fffbf0` ≈ 14:1 OK.
- **Reduced-motion** : `*, *::before, *::after { animation: none !important; transition: none !important; }` dans le bloc `@media (prefers-reduced-motion: reduce)` (déjà partiellement présent). À étendre pour couvrir mascottes, skyboxes pulsées (si présentes), float-y systématique.
- **Polices Google Fonts** : preconnect + font-display: swap + fallback systeme (`'Lilita One', 'Fredoka', 'Baloo 2', system-ui, sans-serif`).
- **Légal / RGPD** : Google Fonts en CDN n'est pas conforme RGPD strict en EU. **Décision** : acceptable pour proto local (l'utilisateur teste en local), à reconsidérer si déploiement public (option : self-host woff2). Loggué dans `decisions.md`.

## 7. Critères de succès
- [ ] DA "candy chunky" reconnaissable au premier coup d'œil sur Menu et Combat.
- [ ] Toutes les cartes ont cerne ink + sticker shadow.
- [ ] Tous les héros et ennemis sont des `<HeroMascot>` distincts.
- [ ] Les 5 raretés sont visuellement claires.
- [ ] Skybox stage-aware visible derrière le combat.
- [ ] Coffres 5 tiers visuellement distincts + animation d'ouverture spectaculaire.
- [ ] Roulette avec marker coral, fade lateral, easing cubic (déjà V3).
- [ ] Hub 5 onglets en cards cream sticker.
- [ ] Build clean, save préservée, golden path Playwright vert.
- [ ] reduced-motion respecté.

## 8. Risques identifiés

| Risque | Sévérité | Mitigation |
|--------|----------|------------|
| Régression visuelle V2/V3 (classe oubliée qui restait sombre) | Major | Audit grep des classes utilisant `--color-bg`/`--color-text-strong` après refonte. Smoke test manuel sur les 10 écrans clés. |
| Float-y sur 7 cartes simultanées : jank | Major | Translate-only, pas de filter, pas de box-shadow animé. Cap fallback : si jank, désactiver float-y sur héros. |
| Google Fonts FOUT (cream apparaît avec font système 200ms) | Minor | `font-display: swap` accepté. Fallback proche : 'Fredoka', 'Baloo 2'. |
| App.tsx dépasse 5500 lignes (V3 = 5551, V4 ajoute HeroMascot ~150 lignes + composant adaptations) | Minor | Plafond souple 5800 — extraction `src/components/HeroMascot.tsx` recommandée si dépassement. |
| Mascotte CSS complexe : variants × sizes × moods = combinatoire | Major | Structure DOM unique + CSS variables overridées par variant. Mood = juste 2-3 classes (mouth shape, eye shape). |
| Reduced-motion oublié sur nouvelles classes | Major | Bloc `@media (prefers-reduced-motion: reduce)` étendu en fin de styles.css par le designer + audit dev. |
| Cap raretés mythique : drop conditions floues | Minor | Mythique = visuel uniquement V4, pas de drop. Documentation explicite. |
