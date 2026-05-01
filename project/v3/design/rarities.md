# Raretés V3 — palette + effets

> Skills appliqués : `motion-performance-guardian` (cap 4 boucles infinite simultanées, halos = box-shadow et non filter), `reduced-motion-accessibility-guardian` (toutes anims raretés désactivées en reduced-motion, fallback bordure statique).

## 1. Vue d'ensemble

| Rareté | Couleur dominante | Border | Glow | Particules idle | Animation idle |
|--------|-------------------|--------|------|-----------------|----------------|
| **Commun** | gris stone | `#6b6e75` 1px | aucun | 0 | statique |
| **Rare** | bleu froid | `#5BA3D0` 2px | soft 16px 30% | 2 bleues, cycle 4s | aucune (particules font le travail) |
| **Épique** | violet profond | `#9C6BD9` 2px gradient | 22px 40% pulsant 3s | 4 violettes | glow pulse 3s |
| **Légendaire** | or profond | `#E0B450` 3px gradient or animé 6s | 30px 55% | 6 dorées + sparks 5s | bordure animée 6s + sparks |
| **Mythique** (placeholder, non actif V3) | blanc nacré + or | `#F5E6D8` 3px | faisceau lent | réservé | RESERVED — opacity 0 |

**Style** : dark fantasy premium. **Pas fluo. Pas saturé.** Toutes les couleurs testées sur fond `#0b0a0c` pour contraste AA minimum.

## 2. Tokens CSS — bloc prêt à coller (extension de `:root`)

À ajouter dans `:root` (juste après les tokens raretés V2 existants — qu'on garde pour compat). Les tokens V2 (`--rarity-commune`, `--rarity-rare`, etc.) restent en place pour les classes V2. On ajoute des tokens **enrichis** sous le namespace `--rarity-{kind}-{prop}`.

```css
:root {
  /* ===== V3 — raretés enrichies (extension) ===== */

  /* Commun */
  --rarity-common-border: #6b6e75;
  --rarity-common-bg: rgba(28, 26, 30, 0.75);
  --rarity-common-glow: transparent;
  --rarity-common-text: #d8d2c4;
  --rarity-common-particle: transparent;

  /* Rare */
  --rarity-rare-border: #5BA3D0;
  --rarity-rare-bg: rgba(18, 26, 38, 0.78);
  --rarity-rare-glow: rgba(91, 163, 208, 0.30);
  --rarity-rare-text: #aac8df;
  --rarity-rare-particle: rgba(91, 163, 208, 0.7);

  /* Épique */
  --rarity-epic-border: #9C6BD9;
  --rarity-epic-bg: rgba(26, 18, 36, 0.80);
  --rarity-epic-glow: rgba(156, 107, 217, 0.40);
  --rarity-epic-text: #cbafe2;
  --rarity-epic-particle: rgba(156, 107, 217, 0.75);

  /* Légendaire */
  --rarity-legendary-border: #E0B450;
  --rarity-legendary-border-deep: #c79438;
  --rarity-legendary-bg: rgba(36, 26, 14, 0.82);
  --rarity-legendary-glow: rgba(224, 180, 80, 0.55);
  --rarity-legendary-glow-strong: rgba(224, 180, 80, 0.75);
  --rarity-legendary-text: #f0d99a;
  --rarity-legendary-particle: rgba(224, 180, 80, 0.85);
  --rarity-legendary-spark: rgba(255, 235, 180, 0.95);

  /* Mythique — placeholder, non actif V3 */
  --rarity-mythic-border: #F5E6D8;
  --rarity-mythic-bg: rgba(40, 36, 28, 0.85);
  --rarity-mythic-glow: rgba(245, 230, 216, 0.65);
  --rarity-mythic-text: #f7efe2;
  --rarity-mythic-particle: rgba(245, 230, 216, 0.9);
}
```

## 3. Classes — bloc prêt à coller

```css
/* =========================================================================
 * V3 — RARETÉS (classes communes pour CharacterCardDetailed et reveal)
 * ========================================================================= */

.rarity-common {
  border: 1px solid var(--rarity-common-border);
  background: var(--rarity-common-bg);
}
.rarity-common .character-card-detailed__name { color: var(--rarity-common-text); }

.rarity-rare {
  border: 2px solid var(--rarity-rare-border);
  background: var(--rarity-rare-bg);
  box-shadow: 0 0 16px var(--rarity-rare-glow);
}
.rarity-rare .character-card-detailed__name { color: var(--rarity-rare-text); }
.rarity-rare::before {
  /* container pour particules idle (rendu en JS — 2 spans positionnés) */
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.rarity-epic {
  border: 2px solid var(--rarity-epic-border);
  background: var(--rarity-epic-bg);
  box-shadow: 0 0 22px var(--rarity-epic-glow);
  animation: rarity-epic-pulse 3000ms ease-in-out infinite alternate;
}
.rarity-epic .character-card-detailed__name { color: var(--rarity-epic-text); }
@keyframes rarity-epic-pulse {
  from { box-shadow: 0 0 18px rgba(156, 107, 217, 0.30); }
  to   { box-shadow: 0 0 28px rgba(156, 107, 217, 0.55); }
}

.rarity-legendary {
  border: 3px solid transparent;
  background:
    linear-gradient(var(--rarity-legendary-bg), var(--rarity-legendary-bg)) padding-box,
    linear-gradient(135deg, var(--rarity-legendary-border-deep), var(--rarity-legendary-border) 35%, var(--rarity-legendary-spark) 50%, var(--rarity-legendary-border) 65%, var(--rarity-legendary-border-deep)) border-box;
  background-size: 100% 100%, 220% 220%;
  background-position: 0 0, 0 0;
  box-shadow: 0 0 30px var(--rarity-legendary-glow);
  animation: rarity-legendary-border 6000ms linear infinite;
}
.rarity-legendary .character-card-detailed__name { color: var(--rarity-legendary-text); }
@keyframes rarity-legendary-border {
  0%   { background-position: 0 0, 0% 50%; }
  100% { background-position: 0 0, 220% 50%; }
}

.rarity-mythic-placeholder {
  /* Réservé V3 — aucune carte mythique en production. Tokens prêts pour V4. */
  border: 3px solid var(--rarity-mythic-border);
  background: var(--rarity-mythic-bg);
  box-shadow: 0 0 36px var(--rarity-mythic-glow);
  opacity: 0; /* RESERVED — non rendu visible en V3. */
}

/* Particules idle — rendues en JS, animées par boucles décalées */
.rarity-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  bottom: 8px;
}
.rarity-particle--rare {
  background: var(--rarity-rare-particle);
  box-shadow: 0 0 6px var(--rarity-rare-particle);
  animation: rarity-particle-rise 4000ms ease-in-out infinite;
}
.rarity-particle--epic {
  background: var(--rarity-epic-particle);
  box-shadow: 0 0 8px var(--rarity-epic-particle);
  animation: rarity-particle-rise 3500ms ease-in-out infinite;
}
.rarity-particle--legendary {
  background: var(--rarity-legendary-particle);
  box-shadow: 0 0 10px var(--rarity-legendary-particle);
  animation: rarity-particle-rise 3200ms ease-in-out infinite;
}

@keyframes rarity-particle-rise {
  0%   { opacity: 0; transform: translate(var(--p-x, 0), 0) scale(0.5); }
  20%  { opacity: 0.85; }
  80%  { opacity: 0.85; }
  100% { opacity: 0; transform: translate(var(--p-x, 0), -120%) scale(1); }
}

/* Sparks ponctuels légendaires — éléments JS qui apparaissent aléatoirement */
.rarity-spark--legendary {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--rarity-legendary-spark);
  box-shadow: 0 0 10px var(--rarity-legendary-spark);
  pointer-events: none;
  animation: rarity-spark 720ms ease-out forwards;
}
@keyframes rarity-spark {
  0%   { opacity: 0; transform: scale(0.4); }
  30%  { opacity: 1; }
  100% { opacity: 0; transform: scale(1.4); }
}

/* Reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .rarity-epic,
  .rarity-legendary { animation: none !important; }
  .rarity-particle--rare,
  .rarity-particle--epic,
  .rarity-particle--legendary,
  .rarity-spark--legendary { animation: none !important; opacity: 0 !important; }
  .rarity-legendary {
    /* Bordure or statique */
    background:
      linear-gradient(var(--rarity-legendary-bg), var(--rarity-legendary-bg)) padding-box,
      linear-gradient(135deg, var(--rarity-legendary-border-deep), var(--rarity-legendary-border)) border-box;
  }
}
```

## 4. Comportement par rareté en détail

### 4.1 Commun
- Border 1px gris pierre. Aucun glow. Aucune particule. Carte la plus sobre. Le contraste avec les raretés supérieures fait que **commun = défaut**, pas une absence.

### 4.2 Rare
- Border 2px bleu froid. Glow soft 16px à 30% d'opacité (statique).
- 2 particules bleues qui s'élèvent en cycle 4s (positions X aléatoires fixées au mount, pas regénérées à chaque frame).
- Le composant React monte 2 `<span class="rarity-particle rarity-particle--rare" style="--p-x: ...; left: ...; animation-delay: ..." />`.

### 4.3 Épique
- Border 2px violet (gradient subtil pour donner de la profondeur).
- Glow 22px qui pulse en cycle 3s (animation `rarity-epic-pulse`).
- 4 particules violettes en cycle 3.5s décalées.

### 4.4 Légendaire
- Border 3px en gradient or animé : `background-position` se déplace en 6s pour donner l'effet "or qui circule".
- Glow 30px à 55% (statique fort).
- 6 particules dorées + sparks ponctuels (`rarity-spark--legendary`) déclenchés en JS toutes les 800-1500ms (timing aléatoire borné).
- C'est la rareté la plus chargée visuellement — réservée aux moments forts.

### 4.5 Mythique (placeholder)
- Tokens déclarés mais classe `.rarity-mythic-placeholder` est `opacity: 0` en V3.
- Quand activée plus tard : faisceau blanc-or, animation lente premium 5s+ cycle. Token de référence prêt pour V4.

## 5. Cap simultané

Une seule rareté légendaire visible à la fois en collection ne pose pas de problème. **Mais** si un user a 4 légendaires sur une page, ça fait 4 boucles `infinite` en parallèle.

**Garde-fou** : la classe `.rarity-legendary` continue de s'animer mais le composant React pose un attribut `data-rarity-active="false"` au-delà de la 3e carte légendaire visible (visibility-aware via IntersectionObserver). En pratique : seule la rareté **dans le viewport** anime. Les autres montrent la bordure or statique.

Implementation note pour le dev : c'est une optimisation tier 2. En tier 1 (ship V3), on accepte les 4 boucles si la page collection a peu de chances d'en montrer plus (cap drop par les pity).

## 6. Contraste — vérification

| Texte | Sur fond | Ratio |
|-------|----------|-------|
| `#d8d2c4` (commun) | `rgba(28,26,30,0.75)` ≈ `#1c1a1e` | ≈ 11.8:1 ✓ AA large |
| `#aac8df` (rare) | `#121a26` | ≈ 10.4:1 ✓ |
| `#cbafe2` (épique) | `#1a1224` | ≈ 9.6:1 ✓ |
| `#f0d99a` (légendaire) | `#241a0e` | ≈ 11.2:1 ✓ |
| `#f7efe2` (mythique) | `#28241c` | ≈ 14.0:1 ✓ |

## 7. Mapping rareté → classe

Le dev mappe la rareté française (Commune/Rare/Épique/Légendaire) du modèle V2 vers les classes V3 :

```ts
const rarityClass: Record<Rarity, string> = {
  Commune: 'rarity-common',
  Rare: 'rarity-rare',
  Épique: 'rarity-epic',
  Légendaire: 'rarity-legendary',
  // Mythique: 'rarity-mythic-placeholder', // RESERVED
};
```

Les classes V2 (`.rarity-rare` shop-item, `.lootbox-card--rare`, etc.) **continuent d'exister** en parallèle pour compat. Les nouvelles classes V3 ne se substituent pas : elles s'ajoutent.

## 8. Notes pour le dev

- Les particules idle (rare/épique/légendaire) sont rendues **par le composant `CharacterCardDetailed`** lui-même au mount. Pas de système global de particules.
- Les sparks légendaires sont déclenchés via un `setInterval` 800-1500ms (Math.random borné) qui crée un `<span>` éphémère retiré au `animationend`. Cap absolu : 1 spark vivant par carte à la fois.
- `prefers-reduced-motion` est query-listenée : si l'utilisateur change le réglage en cours de jeu, les particules s'arrêtent.
