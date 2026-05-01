# Extraction DA — Bobbycard Roguelike "Joyful Direction"

Source : `C:/Users/Bsmile/Downloads/Bobbycard DA - standalone.html` (template décompressé).
Fichier extrait : `project/v4/da-template-extracted.html` (1502 lignes, 62 KB).

## 1. Verdict global

**RUPTURE TOTALE** avec le dark fantasy actuel (V1/V2/V3).

| Aspect | Avant (V3) | DA Bobbycard |
|--------|------------|--------------|
| Genre | Dark fantasy runique | **Cartoon candy chunky** type Clash Royale × Cult of the Lamb × Cookie Run |
| Fond | `#0b0a0c` presque noir | `#1a1530` violet-bleu nuit étoilée — **jamais noir pur** |
| Texte | `#e8e3d8` ivoire sur sombre | `#261a3d` violet sombre **sur cream** `#fff5e1` |
| Police | Stack système | **Lilita One** (display chunky) + **Nunito** (body) + **JetBrains Mono** (Google Fonts) |
| Style cartes | Bordure runique sobre | **Cerne épais 3px ink + double inset rarity + sticker shadow** (style autocollant) |
| Mascottes | Silhouettes runiques abstraites | **Personnages ronds expressifs** : tête `#ffe1c2`, chapeau pointu, yeux ronds, joues `#ff8b9c`, cape |
| Anims | Pulses runiques sobres | **float-y / breathe / wobble** chaleureuses, attack qui projette le héros vers l'avant + rotate |
| Stages | Cryptes / Vide / Roi Brisé (sombre) | **Prairie Givrée / Jardin Magique / Royaume Doré** (lumineux) |

L'utilisateur a dit : *« ne copie pas sur pour sur le fichier design mais tu peux te basé dessus »*. Donc **inspiration**, pas portage.

## 2. Tokens couleur (à intégrer)

### Fond + neutres (warmer, pas noir pur)
```css
--bg-deep: #1a1530;          /* nuit étoilée violet-bleu */
--bg-mid: #2a2147;           /* mid panneaux */
--bg-elevated: #3a2f5e;      /* surélevé */
--bg-cream: #fff5e1;         /* parchemin pour cartes */
--bg-cream-deep: #f4e4c1;
--ink: #261a3d;              /* texte foncé sur cream */
--ink-soft: #4d3d6b;
--ink-muted: #7a6c92;
--paper: #fffbf0;
--paper-line: #e8d5a8;
```

### Marque candy (pas fluo)
```css
--brand-coral:  oklch(72% 0.19 28);   /* signature */
--brand-mint:   oklch(78% 0.13 165);
--brand-sun:    oklch(85% 0.15 85);
--brand-sky:    oklch(75% 0.13 230);
--brand-grape:  oklch(65% 0.18 305);
```

### Stages renommés
```css
/* Stage 1 — "Prairie Givrée" — bleu glacier doux */
--stage-1: oklch(72% 0.13 220);
--stage-1-deep: oklch(50% 0.13 230);
--stage-1-cream: oklch(95% 0.04 220);

/* Stage 2 — "Jardin Magique" — violet pétillant */
--stage-2: oklch(70% 0.18 310);
--stage-2-deep: oklch(45% 0.18 305);
--stage-2-cream: oklch(95% 0.05 310);

/* Stage 3 — "Royaume Doré" — orange/or chaleureux */
--stage-3: oklch(74% 0.18 50);
--stage-3-deep: oklch(50% 0.19 40);
--stage-3-cream: oklch(96% 0.04 70);
```

### Raretés (plus vives, plus "candy")
```css
--rarity-common: #9aa3b2;       /* gris-bleu tendre */
--rarity-rare: #4ec5e8;         /* cyan brillant */
--rarity-epic: #b563ff;         /* violet magique */
--rarity-legendary: #ffb938;    /* or pop */
--rarity-mythic: #ff5fa2;       /* rose nacré — ACTIVÉE */
/* + variantes -deep et -cream pour chaque */
```

### Stats fonctionnelles combat
```css
--hp-good: oklch(75% 0.18 145);     /* vert frais */
--hp-warn: oklch(80% 0.18 75);      /* ambre */
--hp-low: oklch(68% 0.21 25);       /* rouge corail */
--shield: oklch(80% 0.10 220);      /* bleu pâle */
--mana: oklch(70% 0.16 270);        /* bleu-violet */
--rage: oklch(70% 0.21 35);         /* orange feu */
--poison: oklch(72% 0.18 140);      /* vert acide doux */
```

### Coffres (5 tiers, festifs)
```css
--chest-wood: #c0894d;
--chest-bronze: #d97a3c;
--chest-silver: #b8c4d4;
--chest-royal: #ffc845;
--chest-runic: #5fdfff;     /* féérique cyan, pas sombre */
```

## 3. Typographie

```css
--font-display: 'Lilita One', 'Fredoka', 'Baloo 2', system-ui, sans-serif;
--font-body:    'Nunito', 'Quicksand', system-ui, sans-serif;
--font-mono:    'JetBrains Mono', ui-monospace, monospace;
```

Import Google Fonts requis (Lilita One 400, Nunito 400/600/700/800, JetBrains Mono 400).

Hiérarchie observée :
- H1 (logo) : Lilita One 64px, letter-spacing 2px, text-stroke 2px ink, text-shadow 0 4px 0 ink35
- H2 (titre artboard) : 38px Lilita One, color coral, text-stroke 1.5px ink, shadow 0 4px 0 ink25
- H3 (section) : 22px Lilita One uppercase
- H4 (label) : 14px Lilita One uppercase letter-spacing 1.5px
- Body : 14-17px Nunito 400-700

## 4. Espacements / radius / ombres

```css
--r-sm: 8px;
--r-md: 14px;
--r-lg: 22px;
--r-xl: 32px;
--r-pill: 999px;

--stroke: 3px solid var(--ink);          /* cerne épais Clash-style */
--stroke-thin: 2px solid var(--ink);

/* Sticker shadow — lift épais sans flou (autocollant) */
--shadow-stick-sm: 0 3px 0 rgba(38, 26, 61, 0.35);
--shadow-stick:    0 6px 0 rgba(38, 26, 61, 0.45);
--shadow-stick-lg: 0 10px 0 rgba(38, 26, 61, 0.55);
--shadow-glow:     0 0 32px;                    /* couleur fournie par classe */
--shadow-soft:     0 8px 22px rgba(0,0,0,0.18);
```

**Signature visuelle critique** : `box-shadow: 0 6px 0 rgba(38,26,61,0.45)` (offset Y sans flou) — donne l'effet "autocollant collé sur surface". Présent sur **toutes** les cartes, boutons, pills.

## 5. Animations clés (toutes courtes, joyeuses)

```css
@keyframes float-y { 0%,100% { translateY(0); } 50% { translateY(-6px); } }      /* 3s — flottement permanent */
@keyframes shimmer-x { ... }                                                       /* 4s linear — shimmer rare */
@keyframes pulse-halo { ... scale + opacity }                                      /* 3s — épique */
@keyframes spark { ... translate + scale }                                         /* 3s — légendaire sparkles */
@keyframes breathe { ... scale 1.04 + rotate 0.5deg }                              /* 6s — légendaire */
@keyframes wobble { ... rotate ±1.5deg }                                           /* 5s — mythique */
@keyframes spin-slow { to { rotate(360deg); } }
@keyframes chero-attack { ... translate(20px,-10px) rotate(4deg) }                 /* 0.45s — héros s'élance */
@keyframes enemy-attack { ... translate(-20px,-10px) rotate(-4deg) }               /* 0.45s — symétrique */
@keyframes proj-fly { translate(-30px,0) → translate(280px,-10px) }                 /* 0.5s — projectile arc */
@keyframes proj-fly-heal { translate(80px,0) → translate(-200px,-10px) }            /* 0.6s — heal arc inverse */
@keyframes fnum-rise { translateY(0,scale 0.6) → translateY(-50px,scale 0.9) }     /* 1.6s — floating numbers */
@keyframes chest-burst { scaleY(0.4) → scaleY(2.4) opacity 0→1→0 }                  /* 1.2s — coffre éclat */

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

**Différence majeure vs V3** : les attaques **bougent vraiment les cards** (chero-attack translate + rotate). En V3 c'était `attack-pulse` scale léger.

## 6. Mascotte Bobbycard (composition CSS)

```
Tête ronde 84×84, fond #ffe1c2, cerne 3px ink, inset shadow rich
+ Chapeau pointu (border-radius 50% 50% 0 0)
  + Bandeau ink 8px sous chapeau
  + Pompon en haut du chapeau
+ 2 yeux ronds 16×18 blanc + cerne ink, pupille ink 7×7 décalée
+ 2 joues #ff8b9c opacity 0.7
+ Bouche sourire (border-radius 0 0 18px 18px, border-top:none)
+ Cape sous menton (radius 16/16/50%/50%) avec shine band
```

100% CSS, 0 SVG. Ajustable via variables (couleur tête, couleur chapeau).

## 7. Composants visuels illustrés (4 artboards)

1. **Synthèse DA** : header logo + pitch + grille (palette swatches, stage bands, type specs, principes, anti-references)
2. **Cartes personnages** : grille 5 raretés × états (default, hover, selected, locked, mythic)
3. **Coffres + Loot Box** : ligne 5 tiers + roulette légendaire complète (strip 110px items, marqueur coral, fade gauche/droite, status texte)
4. **Combat 1280×720** : combat-screen complet — top bar (stage pill + progress + ressources) + boss bar (fond `rgba(38,26,61,0.85)` + nom mythic + barre divisée) + battlefield (3 héros gauche + 2 ennemis + 1 boss droite, tous en `float-y`) + footer (skills + consumables + speed selector)

## 8. Skyboxes (backgrounds par contexte)

```css
.bg-sky-day  { gradient #b8e3ff → #ffd6c2 + 2 nuages radial blancs }
.bg-sky-dusk { gradient #6a4ca0 → #ff8b6f → #ffd47a + soleil radial }
.bg-meadow   { gradient #b8e3ff → #d8f0c4 → #67c97a + sol radial }
.bg-night    { étoiles radial 1px + radial center #3a2f5e → #1a1530 }
```

Chaque stage a son skybox dédié : Stage 1 = sky-day, Stage 2 = sky-dusk magique, Stage 3 = sky-dusk doré.

## 9. Composants atomiques détectés

- `.btn` chunky (Lilita One 18px uppercase + sticker shadow + hover translateY -2px / active translateY 3px) — variants `--primary` (coral), `--gold` (sun), `--mint`, `--grape`
- `.pill` (Lilita One 13px uppercase + cerne 2px + shadow-stick-sm)
- `.swatch-chip` (72px, radius md, shadow stick)
- `.stage-band` (gradient + decor pseudo-element + nom Lilita One)
- `.pcard` (carte perso) — voir §10
- `.chest` — voir §11
- `.rou` (roulette) — voir §12
- `.combat-stage-pill` (grape pill avec icône)
- `.combat-progress` (paper bg + dots colorés par stage + coral pour current pulsant)
- `.cres` (resource pill : icône cercle coloré + valeur)
- `.combat-boss-bar` (fond ink-violet sombre + nom mythic glow + barre dégradé mythic→coral)
- `.chero` (héros combat) + `.enemy` + `.enemy--boss` (1.56× scale)
- `.intent` (badge intent attack/debuff/aoe)
- `.projectile` (rond 22×22 + glow rareté)
- `.fnum` (floating number Lilita One stroke ink + text-shadow ink50)
- `.sk` (skill card chunky)
- `.cons` (consumable slot 56×)
- `.combat-speed` (pill avec 3 buttons, active = coral)

## 10. Carte perso (.pcard) — composition critique

```
Halo radial extérieur (couleur rareté, blur 2-6px selon rareté, opacity 0.25→0.85)
└─ Frame
   ├─ background: radial cream → white
   ├─ border: 3px solid ink
   ├─ border-radius: 22px
   ├─ box-shadow:
   │   inset 0 0 0 4px var(--rcolor)    /* anneau rareté */
   │   inset 0 0 0 6px white             /* anneau blanc */
   │   0 6px 0 rgba(38,26,61,0.45)       /* sticker shadow */
   ├─ Top: rank pill + rarity badge
   ├─ Portrait 140px (cream gradient + ink border 2px + radius 14px) → mascotte ou silhouette ?
   ├─ Name (Lilita One 22px, color rcolor-deep, stroke 1px ink, shadow 0 2px 0)
   ├─ Role (italic 11px ink-muted)
   ├─ Stats grid 2×3 (paper bg + 4 stats avec icônes colorées)
   ├─ Skill bloc (rcream bg + ink border + icône cercle + name + desc)
   ├─ Trait (tag pill ink + name)
   └─ Foot (frag count grape + rank stars)
```

Idle anims par rareté :
- Common : statique
- Rare : shimmer-x sur portrait via ::before linear-gradient transparent→white→transparent (4s)
- Epic : pulse-halo sur halo (3s)
- Legendary : breathe sur frame (6s) + halo opacity 0.7 + blur 4px
- Mythic : wobble sur frame (5s) + halo opacity 0.85 + blur 6px

## 11. Coffres (.chest)

```
Aura radial colorée derrière (cglow, animation pulse-halo selon tier)
Shadow ellipse au sol
Body 110×92 (float-y 4s, sauf damaged = static + rotate -3deg)
├─ Lid 38px haut, transform-origin bottom
│   ├─ Band horizontal cdeep
│   ├─ Keyhole rond ink
│   └─ Studs dorés
└─ Box 60px haut
    ├─ Band horizontal cdeep
    └─ Lock central
.is-opening: lid rotateX(-100deg)
.chest-rune (3 runes glow cglow, pulse-halo offset 0.4s entre chacune) — pour runic seulement
.chest-burst (radial white→cglow→transparent, scaleY 0.4→2.4) — animation d'ouverture
```

Tiers : damaged (no aura, rotate fixe), bronze, silver, royal (aura active 4s), runic (aura active 3s + 3 runes).

## 12. Roulette (.rou)

```
Frame 140px haut, cream gradient, border 2.5px ink, radius 14
├─ Marker central (4px coral vertical, glow, triangles haut/bas en pseudo)
├─ Fade gauche 80px (linear cream→transparent)
├─ Fade droite 80px (symétrique)
└─ Strip horizontal (transition 2700ms cubic-bezier(.12,.85,.25,1))
    └─ Items 110px (mini-portrait 56×56 + name Lilita One 10px)
        - background cream rareté
        - border 2.5px ink (couleur rareté pour rare+)
        - is-winner: pulse-halo
.rou-status (Lilita One 14px uppercase) :
  - default ink-soft
  - --spin grape
  - --done legendary-deep + glow
```

## 13. Verbatim narratifs récupérés

- Tagline générale : non extraite (dans React Babel chunks externalisés)
- Stages : "Prairie Givrée" (S1) / "Jardin Magique" (S2) / "Royaume Doré" (S3)
- Pas de phrases d'ambiance boss extraites — à inventer

## 14. 3 différences cardinales vs V3

1. **Fond + texte inversés** : V3 = texte clair sur fond sombre. DA = **texte sombre violet sur fond cream + sky gradients colorés**. Ça casse 100% du visuel actuel.
2. **Cerne 3px ink + sticker shadow systématique** : chaque élément a un cerne épais et une ombre offset sans blur. C'est la signature visuelle.
3. **Mascottes vraiment dessinées en CSS** : tête + chapeau + yeux + joues + bouche + cape. Pas une silhouette runique abstraite. Chaque héros et chaque ennemi est un personnage expressif.

## 15. Plan d'application proposé

L'utilisateur dit "tu peux te basé dessus" → **inspiration, pas copie**.

Stratégie recommandée : **migration phasée**, pas big-bang.

### Phase A — Fondation (refonte sans casser le gameplay)
1. Importer Google Fonts (Lilita One + Nunito + JetBrains Mono)
2. Remplacer les tokens `:root` par les nouveaux (fond, ink, brand, stages renommés, raretés candy, coffres tiers, sticker shadows)
3. Adapter `app-shell` au nouveau fond `#1a1530` au lieu de `#0b0a0c`
4. Garder la structure des composants existants (CombatHud, hero-card, enemy-card, HubScreen, etc.) — seulement re-skinner via les nouveaux tokens

### Phase B — Cartes & raretés
5. Refondre `.character-card-detailed` selon le pattern double-inset + sticker shadow
6. Activer les 5 raretés candy (incluant mythique)
7. Refondre `.hero-card` combat compact avec mascotte CSS

### Phase C — Combat skinné
8. Refondre les attaques pour `chero-attack` translate+rotate au lieu de pulse seul
9. Refondre `enemy-card` avec mascottes (slime, bat, boss couronne)
10. Refondre boss bar en haut avec fond ink-violet + nom mythic
11. Skybox par stage (sky-day / dusk / royale)

### Phase D — Coffres & roulette
12. Refondre `FinalChest` avec lid + box + studs dorés + aura radial
13. Refondre `LootRoulette` avec marker coral pointu + fade lateral

### Phase E — Hub & onglets
14. Refondre `HubScreen` avec onglets pill + cards cream sticker
15. Adapter boutique, lootbox tab, recyclage, équipe, stats

### Phase F — Renommage narratif (optionnel)
16. Renommer les 3 stages : Cryptes Froides → **Prairie Givrée**, Sanctuaire du Vide → **Jardin Magique**, Salle du Roi Brisé → **Royaume Doré**

---

Cette extraction est la base de travail pour le pipeline orchestrateur V4.
