# Wireframes — V2 Progression

Tous les layouts cibles **1280×720**, marges identiques à `.app-shell` (~22px horizontal). On ne touche pas aux composants combat existants ; on les **encadre** avec du nouveau (RunProgress au-dessus, ConsumableRail en dessous).

---

## 1. RunProgress (T5)

### Intention
Donner au joueur un repère permanent : où je suis, combien de vagues avant le boss, combien de stages restants, où sont les hubs.

### Position
- En **combat** : tout en haut de `.combat-screen`, **avant** `.combat-hud`. Marge inférieure 8px.
- En **hub** : intégré au `.hub-header`, après le titre eyebrow (sous-titre du header).
- Largeur cible 1180px (max-width comme `.screen`), centré.

### Layout (ASCII, échelle 1:1 environ)

```
+-----------------------------------------------------------------------------+
| STAGE 1 · CRYPTES FROIDES        Vague 4/10 · Boss dans 6 vagues            |
|                                                                             |
| [#][#][#][o][.][.][.][.][.][B] === [H] === [.][.][.][.][.][.][.][.][.][B]   |
|  1  2  3  4  5  6  7  8  9  10  hub   11 12 13 14 15 16 17 18 19  20        |
|                                                                             |
|                                              === [H] === [.] ... [B*]       |
|                                                hub        21..29   30 final |
+-----------------------------------------------------------------------------+
```

Tient sur 1 ligne en 1180px : 30 cases × ~14px + 2 hub markers ×18px + 4 séparateurs = ~480px. Restant 700px pour padding, légende textuelle, gauche/droite.

**Mais** on choisit un layout 2-lignes pour la lisibilité :
- Ligne 1 : eyebrow stage actuel + texte "Vague Y/10 · Boss dans N".
- Ligne 2 : la barre complète des 30 + 2 hubs.

Hauteur totale max **56px**.

### Anatomie d'un step

- `.run-progress__step` : 14×14, `border-radius: 3px`, `border: 1px solid var(--color-border)`.
- Passé : `background: var(--stage-accent-soft)`, bordure `var(--stage-accent-deep)`.
- Courant : pulse glow `box-shadow: 0 0 12px var(--stage-accent-glow)`, scale 1.15.
- Futur : transparent, bordure neutre.
- Boss (10/20/30) : 18×18, rotated 45deg (losange), bordure or `var(--accent)`. Si stage 3 final → ajouter inner star.
- Hub markers : ronds 18×18 entre stages, icône maison CSS (pseudo-element : trapèze + carré). Couleur : eyebrow gold.

### États
- **Default combat** : current step pulse.
- **Hub** : current step est sur le hub marker correspondant (entre stage X et Y) ; pulse sur le H.
- **Stage 3 finale** : le step 30 a un glow accent stage-3 + icône couronne (CSS : losange + crénelure top via box-shadow).

### Animations
- Pulse du step courant : 1400ms ease-in-out infinite alternate, opacité 0.6→1, glow box-shadow 8px→16px.
- Au passage de vague : la case devient passée → transition 240ms `--ease-out` sur `background-color`.
- **prefers-reduced-motion** : pulse remplacé par `outline: 2px solid var(--stage-accent)`. Pas d'animation.

### Accessibilité
- `role="progressbar"`, `aria-label="Progression de la run"`, `aria-valuemin=1 aria-valuemax=30 aria-valuenow={fight}`.
- Texte légende lisible (sr-only superflu vu le texte explicite).

---

## 2. Stage Intro Screen (T4 — owned by dev mais wireframé ici)

### Intention
Marquer la transition narrative. < 2s utilisateur. Le stage **mérite d'exister** — le joueur n'est pas en train de "loader", il est en train d'arriver.

### Layout 1280×720

```
+-----------------------------------------------------------------------------+
|                                                                             |
|                                                                             |
|                  [vignette colorée par --stage-accent-glow]                 |
|                                                                             |
|                                  ◇                                          |
|                                ◇   ◇      <- sigil 200×200 concentrique     |
|                                  ◇                                          |
|                                                                             |
|                              STAGE 1                                        |
|                       LES CRYPTES FROIDES                                   |
|                                                                             |
|              "Le froid mord les os. Les runes attendent."                   |
|                                                                             |
|                  Boss à venir : Gardien des Cendres                         |
|                                                                             |
|                        [   Entrer   ]   <- primary-action, accent stage     |
|                                                                             |
+-----------------------------------------------------------------------------+
```

### Spécifs
- Background : `body` existant + ajout `radial-gradient(circle at 50% 35%, var(--stage-accent-glow), transparent 38rem)`.
- Sigil : reuse `.menu-sigil` structure (3 spans imbriqués), classe variante `.stage-intro__sigil` qui swap les bordures vers `var(--stage-accent-deep)`.
- Title `STAGE N` : eyebrow gold, 0.78rem.
- Title nom : Georgia 4.6rem, color `var(--color-text-strong)`.
- Phrase d'ambiance : Italic, `var(--color-text-muted)`, 1.1rem, max-width 520px.
- Boss line : eyebrow accent stage + Georgia 1.4rem.
- CTA `#stage-intro-enter` : primary-action variant, 220px width, accent stage-deep en background.

### Animations
- Mount : screen-in 320ms (existant) + sigil rotation 5s ease-in-out infinite.
- Glow vignette : opacity 0→1 sur 600ms.
- CTA hover : translate-1 + accent glow.
- **reduced-motion** : screen-in devient `opacity 0→1` 200ms sans translate ; sigil ne tourne pas.

### Accessibilité
- `<h1>` pour le nom du stage.
- Focus auto sur le bouton "Entrer" au mount (focus management).
- Bouton activable Enter/Space.

---

## 3. Hub Screen (T8)

### Intention
Antichambre dense entre 2 stages. 5 fonctions accessibles d'un clic. Ne JAMAIS scroller en 1280×720.

### Layout 1280×720

```
+-----------------------------------------------------------------------------+
| HUB · STAGE 1 TERMINÉ — PROCHAIN : LE SANCTUAIRE DU VIDE                    |
|                                                                             |
| [or 240]  [frag 18]  [vies 3/3]  [conso 1/3]                                |
| ----------------------------- run progress ------------------------------   |
|                                                                             |
| [Boutique][Loot Box][Recyclage][Équipe][Stats]                              |
+-----------------------------------------------------------------------------+
|                                                                             |
|                          ZONE CENTRALE — onglet actif                       |
|                                  (440px)                                    |
|                                                                             |
+-----------------------------------------------------------------------------+
| Vous gardez 240 or pour le prochain stage.    [Continuer vers le Stage 2 →] |
+-----------------------------------------------------------------------------+
```

### Bloc par bloc

**Header (90px)**
- Eyebrow : "HUB · STAGE 1 TERMINÉ — PROCHAIN : LE SANCTUAIRE DU VIDE"
- Sous-titre : 4 pills `.hub-resource` alignés à gauche : or / fragments / vies / consommables.
- RunProgress en dessous (56px).

**Tabs (50px)**
- Rangée de 5 boutons collés, gap 4px.
- Tab actif : underline 2px `var(--stage-accent)`, background légèrement plus clair.
- IDs : `#hub-tab-shop`, `#hub-tab-lootbox`, `#hub-tab-recycle`, `#hub-tab-team`, `#hub-tab-stats`.

**Content (440px hauteur fixe)**
- Hauteur fixe pour éviter sauts de layout entre onglets.
- Scroll interne **interdit** : si overflow, c'est qu'on a mal compacté.

**Footer (60px)**
- À gauche : ligne d'info contextuelle ("Vous gardez X or pour le prochain stage").
- À droite : `#hub-continue` bouton primary-action variant accent stage suivant. Toujours actif (le joueur peut partir nu si il veut).

### États du hub
- `stageJustCleared=1` → `.hub-screen.stage-2` (accent du stage suivant).
- `stageJustCleared=2` → `.hub-screen.stage-3`.
- (Pas de hub après stage 3.)

### Animations
- Switch d'onglet : cross-fade 150ms (fade-out content 75ms + fade-in 75ms). Pas de slide horizontal — ça mange du temps en 1280px.
- Hover tab : background-color 120ms.
- **reduced-motion** : pas de fade, swap immédiat.

### Accessibilité
- `role="tablist"` sur `.hub-tabs`, `role="tab"` sur chaque, `aria-selected` sync.
- Flèches gauche/droite naviguent entre tabs.
- Tab key entre dans le content.

---

## 4. Onglet Boutique (T11)

### Intention
6 items max alignés clairement avec prix, rareté, effet en une phrase. Bouton "Relancer" accessible mais pas dominant.

### Layout (zone content 1180×440)

```
+-----------------------------------------------------------------------------+
| Boutique des Cryptes                          [Relancer la boutique · 15 or]|
|                                                                             |
|   +--------+ +--------+ +--------+   +--------+ +--------+ +--------+      |
|   | item 1 | | item 2 | | item 3 |   | item 4 | | item 5 | | item 6 |      |
|   |        | |        | |        |   |        | |        | |        |      |
|   |  25 or | |  40 or | |  30 or |   |  50 or | |  25 or | |  35 or |      |
|   | [Acheter][[Acheter][[Acheter]    [[Acheter][[Acheter][[Acheter]        |
|   +--------+ +--------+ +--------+   +--------+ +--------+ +--------+      |
+-----------------------------------------------------------------------------+
```

Grille `repeat(3, 1fr) / repeat(2, 1fr)` (3 col × 2 lignes), gap 12px. Chaque card 360×190 environ.

### Anatomie d'une `.shop-item`

```
+-----------------------------+
| ✦ Potion de sang froid      |  <- titre Georgia 1.05rem, max 2 lignes
| [COMMUNE]                   |  <- tier-badge top-right
|                             |
| Soigne 20% de l'équipe.     |  <- description, 0.86rem muted
|                             |
| 25 or             [Acheter] |  <- footer : prix or + btn-shop
+-----------------------------+
```

Bordure : `var(--rarity-commune|rare|epique|legendaire)`. Background `var(--color-surface)`.

### États

| État | Visuel |
|------|--------|
| Achetable | bordure rareté pleine, btn-shop accent stage |
| Or insuffisant | btn-shop disabled (opacity 0.45), prix en `var(--stage-3-accent-blood)`, ruban "Or insuffisant" en bas |
| Épuisé (déjà acheté) | filter grayscale(0.8) + opacity 0.5, btn remplacé par badge "Épuisé" |
| Inventaire conso plein (item conso) | btn-shop déclenche modale "Remplacer ?" au clic — état card normal |

### Animations
- Achat réussi : flash rapide accent (background-color → accent-soft → revient) sur 280ms, puis transition vers --locked.
- Or animé : la pill or du header tick visuellement (compteur diminue par steps de ~10/frame sur 320ms ease-out). Voir `animations.md`.
- Hover card : translate-1 + bordure +20% saturation 180ms.
- **reduced-motion** : pas de translate, pas de tick — l'or jump à la valeur finale.

### IDs
- `#shop-buy-{0..5}` ou `#shop-buy-{itemId}`.
- `#shop-reroll`.

### Accessibilité
- Chaque card est un `<article>`. Le bouton acheter porte un `aria-label="Acheter Potion de sang froid pour 25 or"`.
- Or insuffisant : `aria-disabled="true"` + texte explicatif visible.

---

## 5. Onglet Loot Box (T14 partie hub)

### Intention
Présenter les 4 tiers d'un coup avec leurs probas, prix, et bouton acheter. La loot box runique apparaît grisée/cachée tant que non débloquée.

### Layout (zone content 1180×440)

```
+-----------------------------------------------------------------------------+
| Loot Boxes                                                                  |
|                                                                             |
|   +-------------+ +-------------+ +-------------+ +-------------+          |
|   | PETITE      | | RARE        | | ÉPIQUE      | | RUNIQUE     |          |
|   | (small)     | | (rare)      | | (epic)      | | (verrouillée)|         |
|   |             | |             | |             | |             |          |
|   | 50% frag    | | 45% frag    | | 40% frag    | | bonus boss  |          |
|   | 30% or      | | 30% rare    | | 35% épique  | |             |          |
|   | 18% commun  | | 20% or      | | 20% rare    | |             |          |
|   |  2% rare    | |  5% épique  | |  5% légend. | |             |          |
|   |             | |             | |             | |             |          |
|   |  50 or      | | 120 or      | | 250 or      | | non achet.  |          |
|   | [Ouvrir]    | | [Ouvrir]    | | [Ouvrir]    | | [-]         |          |
|   +-------------+ +-------------+ +-------------+ +-------------+          |
+-----------------------------------------------------------------------------+
```

4 cards en `repeat(4, 1fr)`, gap 12px. Chaque card ~280×400.

### Anatomie d'une `.lootbox-card`

- Titre : Georgia 1.4rem, accent par tier (small=teal, rare=blue, epic=purple, runic=cyan-glow).
- Coffre miniature CSS (variante `.chest` 80×60).
- Liste des probas en `.lootbox-probas` : 5 lignes, font 0.84rem muted.
- Prix en gros : Georgia 1.6rem accent or.
- CTA : btn-shop large (full-width).

### États

| Tier | Visuel idle | Visuel hover |
|------|-------------|--------------|
| small | bordure `var(--stage-1-accent)` 40% | + glow stage-1 |
| rare | bordure rare bleu | + glow rare |
| epic | bordure violet | + glow violet |
| runic | bordure runique cyan + lueur pulsée | n/a si verrouillé |

Verrouillé → opacity 0.4, btn `disabled`, message "Récompense post-boss exceptionnel".

### IDs
- `#lootbox-buy-small`, `#lootbox-buy-rare`, `#lootbox-buy-epic`.

---

## 6. Lootbox Screen (animation d'ouverture, T14)

### Intention
Petit moment de magie. Coffre fermé, clic, flash, révélation. Total **< 800ms** d'animation (contrainte test).

### Layout pleine page

```
+-----------------------------------------------------------------------------+
|                                                                             |
|                            (vignette accent tier)                           |
|                                                                             |
|                                                                             |
|                              ┌─────────┐                                    |
|                              │  COFFRE │  <- 200×140                        |
|                              │   FERMÉ │                                    |
|                              └─────────┘                                    |
|                                                                             |
|                          [Cliquez pour ouvrir]                              |
|                                                                             |
|                                                                             |
|             (après ouverture, sous le coffre, hauteur 80px:)                |
|                          ✦ +18 fragments runiques ✦                         |
|                                                                             |
|                            [   Récupérer   ]                                |
|                                                                             |
+-----------------------------------------------------------------------------+
```

### Phases (séquence)

| Phase | Durée | Visuel |
|-------|-------|--------|
| `--closed` (idle) | ∞ | coffre fermé, légère oscillation 1.6s, CTA "Cliquez pour ouvrir" en dessous |
| `--opening` | 200ms | clic → flash blanc opacity 0→1 (80ms) → 1→0 (120ms) |
| `--opened` | 280ms | lid rotation -16° (réutilise `.chest.opened`), reveal du contenu fade-in 280ms |
| `--revealed` (idle) | ∞ | coffre ouvert, résultat affiché, CTA "Récupérer" |

### IDs
- `#lootbox-open` (le coffre lui-même est cliquable, ou un bouton invisible par-dessus).
- `#lootbox-close` (= "Récupérer").

### Animations détaillées
Voir `animations.md` §5.

### Accessibilité
- Coffre est un `<button>` accessible clavier. `aria-label="Ouvrir la loot box rare"`.
- Reveal : `aria-live="polite"` sur la zone résultat, le screen reader annonce "+18 fragments runiques".
- **reduced-motion** : pas de flash, pas de rotation. Le coffre passe directement de --closed à --revealed avec un fade simple 200ms.

---

## 7. Onglet Recyclage (T16)

### Intention
Liste sobre des persos forgés disponibles, avec preview du remboursement. Confirmation **obligatoire** car action irréversible.

### Layout (zone content 1180×440)

```
+-----------------------------------------------------------------------------+
| Recyclage des personnages forgés                                            |
| Action définitive. Seuls les personnages forgés non sélectionnés peuvent... |
|                                                                             |
| ┌───────────────────────────────────────────────────────────────────────┐  |
| │ [portrait] Lyra Vesperal       [ÉPIQUE forgé]   +17 frag · +60 or  [Recycler]│  |
| ├───────────────────────────────────────────────────────────────────────┤  |
| │ [portrait] Korm Vent-de-Suie   [RARE forgé]      +6 frag · +25 or  [Recycler]│  |
| ├───────────────────────────────────────────────────────────────────────┤  |
| │ [portrait] Test Custom         [COMMUNE forgé]   +5 frag · +10 or  [Recycler]│  |
| └───────────────────────────────────────────────────────────────────────┘  |
|                                                                             |
| (si vide:)  Aucun personnage forgé recyclable.                              |
+-----------------------------------------------------------------------------+
```

Hauteur de ligne 56px. Si plus de 7 lignes, scroll interne sur la liste seulement.

### Anatomie d'une `.recycle-row`

`grid-template-columns: 48px 1fr auto auto auto`

- Portrait small (48×48, reuse `.portrait-small`).
- Nom (Georgia 1rem) + sous-ligne "forgé · stat hint" (muted 0.78rem).
- Tier-badge (rareté).
- Refund pill : icône frag + valeur · icône or + valeur.
- Bouton `.btn-shop--recycle` : "Recycler".

### Modale de confirmation

```
              +--------------------------------------+
              |                                      |
              |   Recycler Lyra Vesperal ?           |
              |                                      |
              |   Cette action est définitive.       |
              |   Vous récupérerez 17 fragments      |
              |   et 60 or.                          |
              |                                      |
              |   [ Annuler ]    [ Recycler ]        |
              |                                      |
              +--------------------------------------+
```

- Centrée à 360×220, `.recycle-confirm-modal`.
- Backdrop `rgba(0,0,0,0.55)`, `backdrop-filter: blur(4px)`.
- Bouton "Recycler" en accent rouge sang `var(--stage-3-accent-blood)` pour signifier action lourde.
- Slide-up 200ms à l'ouverture.

### IDs
- `#recycle-row-{characterId}`.
- `#recycle-confirm`, `#recycle-cancel`.

### Animations
- Slide-up modale 200ms `--ease-out` (translateY +12 → 0, opacity 0 → 1).
- **reduced-motion** : fade simple 120ms.

### Accessibilité
- Modale = `role="alertdialog"`, focus trap dedans, focus initial sur "Annuler" (option safe par défaut).
- Esc ferme.
- Backdrop click ferme = "Annuler".

---

## 8. Onglet Équipe (T18)

### Intention
Voir l'équipe actuelle, voir les héros disponibles, swap sur 1 clic. Coût visible.

### Layout (zone content 1180×440)

```
+-----------------------------------------------------------------------------+
| Équipe actuelle                       [Swap gratuit disponible (1)]         |
|                                                                             |
| ┌──────────┐ ┌──────────┐ ┌──────────┐                                     |
| │ HÉROS A  │ │ HÉROS B  │ │ HÉROS C  │                                     |
| │ HP 80/80 │ │ HP 65/80 │ │ HP 80/80 │                                     |
| └──────────┘ └──────────┘ └──────────┘                                     |
|                                                                             |
| Héros disponibles (cliquez pour remplacer un titulaire)                     |
| ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                |
| │ ...   │ │ ...   │ │ ...   │ │ ...   │ │ ...   │ │ ...   │                |
| └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘                |
|                                                                             |
| Le héros entrant rejoint à 70% de ses PV max.                               |
+-----------------------------------------------------------------------------+
```

### Interaction de swap

1. Clic sur un héros disponible → rangée actuelle clignote, instruction "Choisissez le titulaire à remplacer".
2. Clic sur un titulaire → swap immédiat. Si freeSwapsUsed=0, gratuit ; sinon prompt "Confirmer 75 or" inline (pas de modale, juste le bouton change de label).
3. État compteur en haut-droite : "Swap gratuit disponible (1)" ou "1 swap utilisé · 75 or pour le suivant".

### Anatomie d'une `.hub-team-card` (équipe actuelle)

- 280×120 ou 200×140, plus compact que `.character-card`.
- Portrait 48×48, nom Georgia 1rem, HP meter 80%.
- Si surligné par swap-pending : bordure pulse `var(--stage-accent)`.

### Anatomie d'un héros disponible

- 140×140 grid `repeat(6, 1fr)`.
- Portrait 56×56, nom petit, rareté badge.
- Si non éligible (déjà titulaire) : disabled.

### Animations
- Hover available card : translate-1 + bordure stage-accent.
- Swap done : flash bref 200ms sur les 2 cards échangées.
- **reduced-motion** : pas de flash, juste un re-render.

### IDs
- `#team-swap-{outId}-{inId}` (composé au clic).
- Alternative simple : 2 actions : `#team-pick-in-{inId}` puis `#team-pick-out-{outId}`.

### Accessibilité
- `aria-live` sur la zone d'instruction.
- Tab navigation parcourt les héros disponibles puis les titulaires.

---

## 9. Onglet Stats (T20 — wireframe simple)

### Intention
Lecture seule. Le joueur curieux. Pas de décision à prendre ici.

### Layout (zone content 1180×440)

```
+-----------------------------------------------------------------------------+
| Statistiques de la run                                                      |
|                                                                             |
| ┌─────────────────────────┐  ┌─────────────────────────┐                   |
| │ Combat                  │  │ Stage                   │                   |
| │                         │  │                         │                   |
| │ Dégâts infligés    1240 │  │ Boss vaincus      1/3   │                   |
| │ Dégâts subis        680 │  │ Vies restantes    3/3   │                   |
| │ Soins prodigués     320 │  │ Vagues parcourues  10   │                   |
| │ Compétences           8 │  │ Stage actuel        1   │                   |
| │ K.O.                  1 │  │                         │                   |
| └─────────────────────────┘  └─────────────────────────┘                   |
+-----------------------------------------------------------------------------+
```

`.hub-stats-grid: grid-template-columns: 1fr 1fr; gap: 24px`. Chaque bloc `.stats-block` est une simple liste `<dl>`.

### Pas d'interaction.
- Animations : screen-in standard à l'arrivée sur l'onglet.

---

## 10. Inventaire consommables en combat (T22)

### Intention
3 slots discrets sous le `CombatFooter`. Pas de scroll, pas d'overlay. Le combat reste roi.

### Position

```
+-----------------------------------------------------------------------------+
|                          (combat-screen ...)                                |
|                          (battlefield, hud, combat-footer existants)        |
+-----------------------------------------------------------------------------+
| [SLOT 1: empty]   [SLOT 2: Potion soin]   [SLOT 3: empty]                   |
+-----------------------------------------------------------------------------+
```

`.consumable-rail` : largeur 1120px (alignée avec `.combat-footer`), centré, hauteur **56px**, marge top 8px.

### Anatomie d'un `.consumable-slot`

- 56×56 carré + label sous.
- Vide : bordure pointillée `1px dashed var(--color-border)`, intérieur transparent, sigil "+" muted au centre.
- Rempli : bordure pleine couleur du kind (potion=verte, bombe=rouge, bouclier=or, fiole=violette), icône CSS au centre, label nom court (8 caractères max) sous le slot, font 0.72rem muted.
- Hover (rempli) : glow stage-accent + cursor pointer + tooltip "Cliquez pour utiliser".
- Disabled (en attendant tour ennemi) : opacity 0.6, cursor not-allowed.

### Icônes CSS pour les 4 kinds

- `potion-heal` : flacon (rounded-rectangle bas + petit cou) en `--accent-soft` avec `radial-gradient` vert (`#8dbf8d`).
- `bomb-runic` : cercle plein rouge sang + petit cube blanc (mèche) au top.
- `shield-emergency` : losange or `var(--accent)` + croix latine au centre.
- `vial-antipoison` : tube long fin avec gradient violet → vert.

### États en hub (achat)

Même rail visible en bas du HubScreen footer (mini-version 32×32) pour rappeler le contenu.

### Animations
- Slot rempli : sigil pulse 1800ms infini doux.
- Use : flash blanc sur le slot (160ms) + scale 1.2→0 + label fade out (240ms). Slot redevient vide.
- Plein à l'achat : modal `replace-consumable-modal` (réutilise `.recycle-confirm-modal` design).
- **reduced-motion** : pas de pulse, pas de flash. Slot disparaît instantanément.

### IDs
- `#consumable-{0}`, `#consumable-{1}`, `#consumable-{2}` (toujours présents même vides, click vide = no-op).

### Accessibilité
- `aria-label="Slot 1 : Potion de soin. Cliquez pour utiliser."`.
- Si vide : `aria-label="Slot 1 : vide"` et `aria-disabled="true"`.

---

## 11. Coffre final tier-aware (T25)

### Intention
Récompense émotionnelle finale. 5 visuels, 5 ressentis. Le runic doit faire dire "wow" même en CSS pur.

### Layout (gameover-screen)

Réutilise `.gameover-screen` + `.chest-result` existants. On greffe la **classe** `.chest-tier--{tier}` sur le wrapper `.chest`.

```
+-----------------------------------------------------------------------------+
|                                                                             |
|                              GAME OVER                                      |
|                       Run terminée — Stage 3 vaincu                         |
|                                                                             |
|                          ┌─────────────────┐                                |
|                          │     (coffre)    │   <- visuel selon tier         |
|                          │                 │                                |
|                          └─────────────────┘                                |
|                                                                             |
|                          [Ouvrir le coffre royal]                           |
|                                                                             |
|         (après ouverture)                                                   |
|         +85 fragments · +220 or · Lyra des Aubes (légendaire) débloquée     |
|                                                                             |
|                          [Retour au menu]                                   |
|                                                                             |
+-----------------------------------------------------------------------------+
```

### Variantes visuelles

Tous : structure `.chest .chest-lid + .chest-body` existante. Seuls les **gradients et accents** changent.

| Tier | Couleur principale | Accent | Effet ambiance |
|------|--------------------|--------|----------------|
| `damaged` | gris-brun `#3a2e26 → #1a130f` | bordure terne `rgba(120,90,70,0.3)`, **pas** d'accent or | filtre `saturate(0.6) brightness(0.85)`, lid légèrement décalé pour suggérer "abîmé" |
| `bronze` | bronze chaud `#8b5a2b → #2a1a0e` (= coffre actuel quasiment) | bordure or `rgba(206,158,71,0.6)` | drop-shadow `rgba(206,158,71,0.2)` |
| `silver` | argent `#b6c2cc → #1a2026` | bordure cyan-gris `rgba(170,200,220,0.7)` | drop-shadow `rgba(150,180,200,0.25)`, légère lueur froide |
| `royal` | or éclatant `#d8b452 → #4a3210` | bordure or vif `rgba(245,205,140,0.85)` | drop-shadow `rgba(206,158,71,0.45)`, gemme rouge en lock CSS (`::before` losange `var(--stage-3-accent-blood)`) |
| `runic` | bleu runique `#6FB3D2 → #1a2840` + or | bordure cyan glow + or `rgba(120,200,220,0.85)` | sigils animés en `::after` (3 cercles concentriques rotation lente 8s), drop-shadow double (cyan + or) |

### Détails CSS clés

```css
.chest-tier--damaged .chest-lid,
.chest-tier--damaged .chest-body {
  background: linear-gradient(135deg, #3a2e26, #1a130f 74%);
  border-color: rgba(120, 90, 70, 0.3);
  filter: saturate(0.6) brightness(0.85);
}

.chest-tier--royal::before {
  content: "";
  position: absolute;
  top: 32px; left: 50%;
  width: 14px; height: 14px;
  transform: translateX(-50%) rotate(45deg);
  background: var(--stage-3-accent-blood);
  box-shadow: 0 0 16px rgba(142, 42, 42, 0.7);
}

.chest-tier--runic::after {
  content: "";
  position: absolute; inset: -16px;
  border: 1px solid rgba(120, 200, 220, 0.3);
  border-radius: 50%;
  animation: chest-runes 8000ms linear infinite;
}
```

### Animations
- Mount : screen-in standard. Coffre apparaît fermé.
- Royal/runic : sigil glow pulse 2.4s infinite alternate.
- Open : reuse `.chest.opened` + ajout flash spécifique au tier (royal=or, runic=cyan), 320ms.
- **reduced-motion** : pas de rotation runique, pas de pulse. Glow remplacé par bordure statique.

### IDs
- `#open-chest` (existant, **conservé**).
- Texte du bouton variable : "Ouvrir le coffre [bronze|argent|royal|runique|abîmé]".

### Accessibilité
- `aria-label` du bouton open varie avec le tier.
- Reveal en `aria-live="polite"`.
