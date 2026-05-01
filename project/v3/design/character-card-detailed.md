# CharacterCardDetailed V3

> Skills appliqués : `motion-performance-guardian` (animation hover ponctuelle, pas continue ; bordure animée légendaire 6s ≠ 60fps coûteux), `reduced-motion-accessibility-guardian` (hover sans translation, bordure animée désactivée).

## 1. Où est utilisée la carte

| Contexte | Mode |
|----------|------|
| Collection (HubScreen onglet "Cartes") | `default` (cliquable, hover, sélection) |
| Reveal après roulette lootbox | `reveal` (entrée animée, pas de hover) |
| Reveal coffre final tier-aware | `reveal` |
| Creator preview | `default` (immutable) |

**Pas utilisée en combat.** Le combat conserve `CombatHero` compact (décision V3 §[2026-04-29] [architect] CharacterCardDetailed).

## 2. Dimensions

- **Cible principale** : 220 × 320 px (220 large, 320 haut). Tient en grille collection 4 colonnes sur 1280×720 (4 × 220 + 3 × 16 gap = 928px, le reste étant marges/padding).
- **Variante compacte** : 200 × 280 px (utilisable si la grille évolue à 5 colonnes).
- Les deux variantes partagent le même layout interne, seuls les paddings et tailles de portrait diffèrent légèrement.

Le dev expose une prop `size?: 'md' | 'sm'` (default `'md'`) qui injecte une classe `.character-card-detailed--sm`.

## 3. ASCII mockup — layout exhaustif

```
┌──────────────────────────────────────────┐  ← border 2px (rareté)
│ [BADGE-RARETÉ]              [BADGE-RÔLE] │  ← haut : 2 badges (24px)
│                                          │
│              Ronan Gourmand              │  ← Nom (18-20px, color rareté)
│             ──────────────               │  ← séparateur 1px
│                                          │
│            ┌──────────────┐              │
│            │              │              │
│            │   PORTRAIT   │              │  ← 140×140, conserver style runique V1/V2
│            │   RUNIQUE    │              │
│            │              │              │
│            └──────────────┘              │
│                                          │
│   PV   PH   MG    VIT   SOIN   _         │  ← stats grid 2×3 (icones + valeurs)
│   58    6    8     4     14    -         │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ❖ Festin noir                      │  │  ← compétence (encadré)
│  │ Soigne l'allié le plus blessé,     │  │
│  │ surplus → bouclier (italique).     │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ✦ Trait : soins excessifs → bouclier.   │  ← 1 ligne, italique
│                                          │
│  Fragments : 3   ·   Rang II             │  ← pied (optionnel, présent si > 0)
└──────────────────────────────────────────┘
```

## 4. Hiérarchie typographique

| Élément | Taille | Weight | Couleur | Police |
|---------|--------|--------|---------|--------|
| Nom (h2) | 18px (220 width) / 20px (variant md) | 600 | `--rarity-{kind}-text` (proche border) | Georgia serif |
| Badges (rareté/rôle) | 11px | 500 | text-strong sur fond rareté/role | sans-serif uppercase letter-spacing 0.06em |
| Stats label (PV/PH/MG/VIT/SOIN) | 10px | 500 uppercase | `--color-text-muted` | sans-serif |
| Stats valeur | 16px | 600 | `--color-text-strong` | Georgia serif |
| Compétence titre (`❖`) | 13px | 600 | `--color-text-strong` | sans-serif |
| Compétence description | 11.5px | 400 italic | `--color-text-muted` | sans-serif |
| Trait (`✦`) | 11.5px | 400 italic | `--color-text` | sans-serif |
| Fragments / Rang | 11px | 500 | `--color-text-gold` (fragments) / `--color-text-muted` (rang) | sans-serif |

## 5. Badges

- **Rareté** (haut-gauche) : pill 20–24px haut, padding 2/8, border 1px, fond rareté soft. Texte = "COMMUN" / "RARE" / "ÉPIQUE" / "LÉGENDAIRE" / "MYTHIQUE" en uppercase.
- **Rôle** (haut-droite) : pill identique, sans bordure colorée (border `--color-border`), fond `rgba(0,0,0,0.45)`. Texte = "ATTAQUANT" / "MAGE" / "SOIGNEUR" / "TANK" / "SUPPORT".

## 6. États

| État | Effet visuel |
|------|--------------|
| `default` | bordure rareté + glow rareté soft (cf. `rarities.md`) |
| `hover` | translateY(-3px), glow rareté renforcé (1.4× opacity), 180ms `var(--ease-impact)` |
| `selected` | anneau extérieur (outline 2px stage-accent, offset 4px) |
| `locked` | filter: saturate(0.5) brightness(0.7) ; pas de hover ; cursor not-allowed |
| `mode=reveal` | entrée scale 0.9 → 1 + opacity 0 → 1 sur 380ms `var(--ease-impact)` |

```css
.character-card-detailed {
  width: 220px;
  height: 320px;
  display: grid;
  grid-template-rows: auto 1fr auto auto auto auto;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-surface-card);
  position: relative;
  cursor: pointer;
  transition: transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out);
}
.character-card-detailed:hover {
  transform: translateY(-3px);
}
.character-card-detailed.is-selected {
  outline: 2px solid var(--stage-accent);
  outline-offset: 4px;
}
.character-card-detailed.is-locked {
  filter: saturate(0.5) brightness(0.7);
  pointer-events: none;
}
.character-card-detailed--reveal {
  animation: card-reveal-mount 380ms var(--ease-impact) both;
}
@keyframes card-reveal-mount {
  0%   { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1);   opacity: 1; }
}

.character-card-detailed__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.character-card-detailed__name {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.05rem;
  text-align: center;
  color: var(--color-text-strong);
}
.character-card-detailed__portrait {
  width: 140px; height: 140px;
  margin: 0 auto;
  /* Réutilise le style de portrait runique existant V1/V2 */
}
.character-card-detailed__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-1);
  font-size: 0.72rem;
}
.character-card-detailed__stat {
  display: grid;
  grid-template-rows: auto auto;
  text-align: center;
  color: var(--color-text-muted);
}
.character-card-detailed__stat strong {
  color: var(--color-text-strong);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1rem;
}
.character-card-detailed__skill {
  border: 1px solid var(--color-border);
  background: rgba(0,0,0,0.25);
  border-radius: var(--radius-sm);
  padding: var(--space-2);
  display: grid;
  gap: 2px;
}
.character-card-detailed__skill-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-strong);
}
.character-card-detailed__skill-desc {
  font-size: 0.72rem;
  font-style: italic;
  color: var(--color-text-muted);
  line-height: 1.3;
}
.character-card-detailed__trait {
  font-size: 0.72rem;
  font-style: italic;
  color: var(--color-text);
}
.character-card-detailed__footer {
  display: flex;
  gap: var(--space-2);
  justify-content: space-between;
  font-size: 0.7rem;
}
.character-card-detailed__fragments {
  color: var(--color-text-gold);
}
.character-card-detailed__rank {
  color: var(--color-text-muted);
}
```

## 7. Bordure animée légendaire

La rareté légendaire (cf. `rarities.md`) applique une bordure dorée animée subtile (rotation très lente d'un dégradé). Détail dans `rarities.md` §4.4. Désactivée en `prefers-reduced-motion`.

## 8. Reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  .character-card-detailed:hover {
    transform: none !important;
  }
  .character-card-detailed--reveal {
    animation: none !important;
    opacity: 1;
  }
}
```

## 9. Accessibilité

- Le conteneur est un `button` ou `div role="button" tabindex="0"` (selon contexte interactif ou non).
- `aria-label` complet (ex. `aria-label="Ronan Gourmand, épique, soigneur, 58 PV, 6 PH, 8 MG, vitesse 4. Compétence Festin noir. Trait : soins excessifs deviennent bouclier."`).
- Le focus visible utilise l'outline `--stage-accent` (même que `is-selected`, mais offset différent : 2px).
- Hiérarchie heading : `<h2>` pour le nom de la carte (ou `<h3>` selon contexte de page — le dev arbitre).
- Contraste : tous les textes ≥ AA sur le fond `--color-surface-card` (vérifié pour les 7 couleurs typo §4).

## 10. Props composant

```ts
type CharacterCardDetailedProps = {
  character: Character;          // type V2 existant
  mode?: 'default' | 'reveal';   // default
  size?: 'md' | 'sm';            // md par défaut
  isSelected?: boolean;
  isLocked?: boolean;
  onClick?: (id: string) => void;
  fragments?: number;            // si > 0, affiche le pied
  rank?: number;                 // si défini, affiche "Rang N"
  showRoleBadge?: boolean;       // default true
  showRarityBadge?: boolean;     // default true
};
```
