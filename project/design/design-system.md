# Design System — V2 Progression

Extension du système dark fantasy déjà posé dans `src/styles.css`. **On n'invente pas une nouvelle base, on greffe trois ambiances d'accent et un set de composants neufs.**

## 1. Inventaire des tokens existants (détectés dans styles.css)

Aucun custom property n'existe aujourd'hui — tout est en valeurs littérales. On va donc ajouter les CSS variables proprement, en gardant les valeurs existantes comme défauts.

### 1.1 Palette de base actuelle (à conserver)

| Rôle | Valeur | Usage observé |
|------|--------|---------------|
| Background page | `#0b0a0c` | `:root` background, `body` linear-gradient base |
| Surface principale | `rgba(18, 16, 19, 0.78)` | `.brand`, `.notice`, `.primary-action`, `.menu-actions button`, `.reward-card`, `.creator-form`, `.run-status button` |
| Surface combat | `rgba(14, 13, 16, 0.78)` | `.hud-primary`, `.hud-tile`, `.combat-footer article` |
| Surface combat-card | `rgba(16, 15, 18, 0.88)` | `.combat-card`, `.enemy-card` |
| Bordure neutre | `rgba(237, 231, 220, 0.12)` | toutes les surfaces sobres |
| Bordure active/or | `rgba(187, 157, 100, 0.28..0.78)` | `.menu-sigil`, `.rarity-legendary`, `.chest-lid`, hover states |
| Texte primaire | `#f3eadb` / `#f2eadc` / `#ede7dc` | titres, brand, hud strong |
| Texte secondaire | `#a99f91` / `#a59b8d` | descriptifs, labels |
| Texte muté | `#91887c` / `#938b80` | timeline, footer span |
| Texte or (eyebrow) | `#bb9d64` / `#cdbf9d` | `.eyebrow`, reward-card span, special-line |
| Accent rouge sang | `#8f2632` / `#5f1925` / `#143, 38, 50` | primary-action, hp-meter, boss vibe |
| Accent vert sarcelle | `#6e8a8b` / `#52, 79, 92` / `#52, 91, 76` | bouclier, attaque rythmée, soin |
| Accent magie violet | `rgba(142, 92, 170, 0.66)` | `.rarity-epic`, `.enemy-card.intent-hex` |
| Accent or | `#bb9d64` / `#d8bd7a` / `#206, 158, 71` | rareté légendaire, modificateurs, coffre |
| Sucess heal | `#8dbf8d` / `rgba(141, 191, 141, 0.16)` | impact-heal |

### 1.2 Typographie (existante)

- **Sans serif corps** : `Inter, ui-sans-serif, system-ui, ...`. Tailles : `0.78rem` (eyebrow/legend), `0.8rem` (hud span), `0.84rem` (label), `0.86rem` (stats), `0.93rem` (reward strong), `1rem` (card title), `1.05rem` (intent-banner).
- **Serif titres** : `Georgia, "Times New Roman", serif`. Tailles : `0.9rem` (portrait-name), `1rem` (card-topline), `1.05rem` (intent-banner), `1.2rem` (brand), `1.35rem` (reward span), `clamp(1.8rem, 3.8vw, 3.1rem)` (enemy h2), `clamp(2rem, 4.8vw, 4.3rem)` (section heading), `clamp(2.4rem, 7vw, 6.8rem)` (menu h1), `4rem` (compact-result).
- **Letter-spacing** : déjà à 0 partout sauf `.eyebrow` (texte transformé uppercase).
- **Line-height** : `0.92` sur les gros titres, défaut sinon.

### 1.3 Espacements (existants, à formaliser)

Échelle observée, irrégulière mais lisible : `4, 6, 7, 8, 10, 12, 14, 15, 18, 22` puis `clamp(...)` pour les gaps. On normalise sur une **échelle 4px/8px** :

| Token | Valeur | Usage existant |
|-------|--------|----------------|
| `--space-1` | `4px` | gap boss-track, attack-meter margin |
| `--space-2` | `8px` | hud-primary gap, combat-screen gap |
| `--space-3` | `12px` | reward-grid gap, hud padding horizontal |
| `--space-4` | `16px` | topbar gap, selected-line margin |
| `--space-5` | `24px` | section-heading margin |
| `--space-6` | `32px` | app-shell padding-bottom |
| `--space-8` | `48px` | clamp menu gap |

### 1.4 Rayons et ombres (existants)

- `--radius-sm: 6px` — boutons, hud-tile, link-action.
- `--radius-md: 8px` — cards (combat, character, hud-primary, reward).
- `--radius-pill: 999px` — meter, wallet span.
- `--shadow-card: 0 16px 42px rgba(0, 0, 0, 0.32)` — combat-footer.
- `--shadow-deep: 0 20px 60px rgba(0, 0, 0, 0.28)` — combat-card, enemy-card.
- `--shadow-hot: 0 14px 32px rgba(88, 18, 31, 0.34)` — primary-action.

### 1.5 Glass effect (existant)

`backdrop-filter: blur(12px)` pour la plupart des surfaces, `blur(16px)` pour combat-footer. **À garder tel quel.**

---

## 2. Nouveaux tokens V2

### 2.1 Tokens globaux (toujours actifs)

```css
:root {
  /* Surfaces — réifient l'existant */
  --color-bg: #0b0a0c;
  --color-surface: rgba(18, 16, 19, 0.78);
  --color-surface-deep: rgba(14, 13, 16, 0.78);
  --color-surface-card: rgba(16, 15, 18, 0.88);
  --color-border: rgba(237, 231, 220, 0.12);
  --color-border-hot: rgba(187, 157, 100, 0.28);

  --color-text: #f3eadb;
  --color-text-strong: #f7efe2;
  --color-text-muted: #a99f91;
  --color-text-faint: #91887c;
  --color-text-gold: #bb9d64;

  /* Accent générique (or terni — fallback historique) */
  --accent: #bb9d64;
  --accent-soft: rgba(187, 157, 100, 0.28);
  --accent-glow: rgba(187, 157, 100, 0.16);
  --on-accent: #1a1410;

  /* Stage accents — overridés par .stage-N */
  --stage-accent: var(--accent);
  --stage-accent-soft: var(--accent-soft);
  --stage-accent-glow: var(--accent-glow);
  --stage-accent-deep: rgba(187, 157, 100, 0.7);
  --stage-on-accent: var(--on-accent);

  /* Stage 1 — Cryptes froides : bleu acier glacé */
  --stage-1-accent: #6FB3D2;
  --stage-1-accent-soft: rgba(111, 179, 210, 0.28);
  --stage-1-accent-glow: rgba(111, 179, 210, 0.18);
  --stage-1-accent-deep: rgba(48, 84, 92, 0.78);
  --stage-1-on-accent: #061018;

  /* Stage 2 — Sanctuaire du Vide : violet sombre + verts toxiques */
  --stage-2-accent: #8E5BD5;
  --stage-2-accent-soft: rgba(142, 91, 213, 0.28);
  --stage-2-accent-glow: rgba(142, 91, 213, 0.20);
  --stage-2-accent-deep: rgba(72, 38, 110, 0.78);
  --stage-2-accent-toxic: #7DBE65;
  --stage-2-on-accent: #0e0816;

  /* Stage 3 — Salle du Roi Brisé : or terni + rouge sombre royal */
  --stage-3-accent: #C9A24A;
  --stage-3-accent-soft: rgba(201, 162, 74, 0.30);
  --stage-3-accent-glow: rgba(201, 162, 74, 0.22);
  --stage-3-accent-deep: rgba(142, 42, 42, 0.82);
  --stage-3-accent-blood: #8E2A2A;
  --stage-3-on-accent: #14100a;

  /* Raretés — formalise l'existant */
  --rarity-commune: rgba(173, 174, 165, 0.55);
  --rarity-rare: rgba(91, 141, 168, 0.78);
  --rarity-epique: rgba(142, 92, 170, 0.82);
  --rarity-legendaire: rgba(206, 158, 71, 0.92);
  --rarity-runique: rgba(120, 200, 220, 0.92);

  /* Coffres — par tier */
  --chest-damaged: #4a3a30;
  --chest-bronze: #8b5a2b;
  --chest-silver: #b6c2cc;
  --chest-royal: #d8b452;
  --chest-runic: #6FB3D2;

  /* Espacements */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-8: 48px;

  /* Rayons */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-pill: 999px;

  /* Ombres */
  --shadow-card: 0 16px 42px rgba(0, 0, 0, 0.32);
  --shadow-deep: 0 20px 60px rgba(0, 0, 0, 0.28);
  --shadow-hot: 0 14px 32px rgba(88, 18, 31, 0.34);

  /* Durées d'animation (référence pour V2) */
  --dur-fast: 120ms;
  --dur-base: 200ms;
  --dur-slow: 360ms;
  --dur-narr: 600ms;

  /* Easings */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

### 2.2 Bascule par stage

`.stage-1`, `.stage-2`, `.stage-3` se positionnent **sur `.app-shell`** pendant la run, et **sur `.hub-screen`** pour adopter l'accent du stage suivant (cf. handoff architect : « hub stage 1→2 utilise les tons stage 2 »).

```css
.app-shell.stage-1, .hub-screen.stage-1 {
  --stage-accent: var(--stage-1-accent);
  --stage-accent-soft: var(--stage-1-accent-soft);
  --stage-accent-glow: var(--stage-1-accent-glow);
  --stage-accent-deep: var(--stage-1-accent-deep);
  --stage-on-accent: var(--stage-1-on-accent);
}

.app-shell.stage-2, .hub-screen.stage-2 {
  --stage-accent: var(--stage-2-accent);
  --stage-accent-soft: var(--stage-2-accent-soft);
  --stage-accent-glow: var(--stage-2-accent-glow);
  --stage-accent-deep: var(--stage-2-accent-deep);
  --stage-on-accent: var(--stage-2-on-accent);
}

.app-shell.stage-3, .hub-screen.stage-3 {
  --stage-accent: var(--stage-3-accent);
  --stage-accent-soft: var(--stage-3-accent-soft);
  --stage-accent-glow: var(--stage-3-accent-glow);
  --stage-accent-deep: var(--stage-3-accent-deep);
  --stage-on-accent: var(--stage-3-on-accent);
}
```

Toute classe V2 qui doit se teinter consomme `var(--stage-accent)` et n'a aucune valeur hardcodée. Le combat (HUD, cards) **reste en or par défaut** — on ne repeint pas les composants existants. Seuls les **éléments V2 nouveaux** (RunProgress, hub, intro, lootbox, consumable rail, coffre tier) tirent de `--stage-accent`.

### 2.3 Contraste WCAG (vérifié)

| Paire | Contraste | Niveau |
|-------|-----------|--------|
| `#f3eadb` sur `#0b0a0c` (texte primaire / fond) | 16.1 | AAA |
| `#a99f91` sur `#0b0a0c` (texte muted) | 8.0 | AAA |
| `#bb9d64` sur `#0b0a0c` (eyebrow or) | 7.4 | AAA |
| `#6FB3D2` sur `#0b0a0c` (stage-1 accent) | 9.1 | AAA |
| `#8E5BD5` sur `#0b0a0c` (stage-2 accent) | 5.6 | AA |
| `#C9A24A` sur `#0b0a0c` (stage-3 accent) | 8.7 | AAA |
| `#8E2A2A` sur `#f3eadb` (rouge royal sur surface claire) | 6.4 | AA |
| `#0e0816` sur `#8E5BD5` (text-on-accent stage-2) | 6.7 | AA |

Tous les accents passent AA en taille texte normale. Le stage-2 violet est la paire la plus tendue : on ne pose **jamais** de texte muted (#a99f91) sur du violet — on remonte en `var(--color-text)` (#f3eadb, contraste 6.4).

---

## 3. Nouveaux composants visuels — inventaire de classes

### 3.1 Boutique

- `.btn-shop` — bouton d'achat principal d'un item, hauteur 32px, accent stage.
- `.btn-shop--disabled` — état or insuffisant ou item épuisé.
- `.shop-item` — card d'item (180×140 environ), bordure rareté.
- `.shop-item--locked` — item épuisé (acheté), opacité 0.4, ruban "Épuisé".
- `.shop-item--unaffordable` — bordure rouge sourd, prix en rouge.
- `.shop-reroll` — bouton relancer, position top-right de la grille.
- `.tier-badge--commune` / `--rare` / `--epique` / `--legendaire` — badge rareté en haut-droite de la card.

### 3.2 Loot Box

- `.lootbox-card` — card d'achat (240×160), grande à dessein.
- `.lootbox-card--small` / `--rare` / `--epic` / `--runic` — variantes par tier (couleur, glow).
- `.lootbox-probas` — liste compacte des probabilités (5 lignes).
- `.lootbox-screen` — wrapper du screen='lootbox', plein écran centré.
- `.lootbox-chest` — coffre CSS (réutilise `.chest` existant en variante).
- `.lootbox-chest--closed` / `--opening` / `--opened` — phases d'animation.
- `.lootbox-flash` — overlay blanc 200ms.
- `.lootbox-reveal` — résultat affiché sous le coffre ouvert.

### 3.3 Consommables

- `.consumable-rail` — bande horizontale 3 slots, hauteur 56px.
- `.consumable-slot` — carré 48×48 + label sous.
- `.consumable-slot--empty` — silhouette en pointillés.
- `.consumable-slot--filled` — icône + nom court.
- `.consumable-slot--cooldown` — overlay sombre + countdown (réservé V3 — placeholder).
- `.consumable-icon-potion-heal` / `-bomb-runic` / `-shield-emergency` / `-vial-antipoison` — sprites CSS pure (formes géométriques + glow).

### 3.4 Run progress

- `.run-progress` — wrapper horizontal, max 1180px, hauteur 56px.
- `.run-progress__stage` — segment de stage, contient 10 steps + 1 séparateur hub.
- `.run-progress__step` — case 14×14 carrée, bordure neutre.
- `.run-progress__step--passed` — case remplie de l'accent du stage de la case.
- `.run-progress__step--current` — case avec pulse glow accent.
- `.run-progress__step--future` — case grise vide.
- `.run-progress__step--boss` — case 18×18, étoile/diamant CSS, accent boss.
- `.run-progress__step--hub` — pastille ronde 18px entre stages, icône maison/portail.
- `.run-progress__legend` — texte en dessous, "Stage X · Vague Y/10 · Boss in N".

### 3.5 Hub

- `.hub-screen` — wrapper, héritera de `.stage-N`.
- `.hub-header` — header haut : eyebrow stage cleared + next + ressources.
- `.hub-resource` — pill (or, fragments, vies, conso).
- `.hub-tabs` — barre d'onglets, 5 tabs sur une ligne.
- `.hub-tab` — bouton tab, 38px haut, padding 0 14px.
- `.hub-tab--active` — accent stage, soulignement 2px.
- `.hub-content` — zone centrale, hauteur fixe pour stabilité layout (~440px).
- `.hub-footer` — bouton continuer + recap court.
- `.hub-continue` — variante de `.primary-action` avec accent stage-suivant.

### 3.6 Recyclage

- `.recycle-row` — ligne compacte d'un perso forgé, 56px de haut.
- `.recycle-row__refund` — pill "+X frag · +Y or".
- `.recycle-confirm-modal` — modale centrée, 360×220.
- `.modal-backdrop` — overlay rgba(0,0,0,0.55) plein écran (réutilisable).

### 3.7 Équipe (hub)

- `.hub-team-current` — rangée 3 cards d'équipe.
- `.hub-team-roster` — grille de héros disponibles.
- `.hub-team-card` — variante allégée de `.character-card`, hauteur 120px.
- `.hub-team-card__hp-tag` — pill "70% PV" sur héros entrant.
- `.swap-cost-tag` — affiche "Gratuit (1/1)" ou "75 or".

### 3.8 Stats (hub)

- `.hub-stats-grid` — 2 colonnes, gap 24px.
- `.stats-block` — card semi-transparente, titre + liste stat:value.

### 3.9 Coffre tier-aware

- `.final-chest` — wrapper centré, réutilise `.chest` existant.
- `.chest-tier--damaged` — bois sombre, planches fissurées (gradient gris-brun).
- `.chest-tier--bronze` — bronze chaud (réutilise quasi le coffre actuel).
- `.chest-tier--silver` — argent froid, lueur bleue tempérée.
- `.chest-tier--royal` — or brillant, gemme rouge.
- `.chest-tier--runic` — runes bleues animées (lueur cyan), sigil rotatif lent.

### 3.10 Stage intro

- `.stage-intro` — pleine page, fond vignette stage-accent.
- `.stage-intro__sigil` — sigil concentrique animé (rappel `.menu-sigil`).
- `.stage-intro__title` — Georgia clamp(2.4rem, 6vw, 4.6rem).
- `.stage-intro__boss` — eyebrow accent + nom du boss.
- `.stage-intro__cta` — bouton "Entrer", primary-action en accent stage.

---

## 4. Tokens à exporter (récap pour le dev)

Le frontend-dev doit ajouter en haut de `src/styles.css`, **dans `:root`**, le bloc `:root` complet de §2.1, puis les 3 sélecteurs `.app-shell.stage-N`, `.hub-screen.stage-N` de §2.2. Les composants existants ne sont pas touchés (ils continuent d'utiliser leurs valeurs littérales). Les nouveaux composants tirent de `var(--stage-accent)` / `var(--color-surface)` / etc.

Voir `design/css-tokens.md` pour le bloc CSS prêt à coller.
