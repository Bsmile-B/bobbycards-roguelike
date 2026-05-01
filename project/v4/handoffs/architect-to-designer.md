# Passation Architect → UI Designer V4

## Skills à charger en proactif (avant de commencer le design)

- `anthropic-skills:reduced-motion-accessibility-guardian`
- `anthropic-skills:motion-performance-guardian`

Ces deux skills doivent informer chaque keyframe que tu produis : reduced-motion + budget GPU.

## Ce que tu dois absolument retenir

1. **Inspiration, pas copie**. Le fichier `da-template-extracted.html` est une référence visuelle. **Ne copie pas littéralement** — adapte au jeu existant. L'utilisateur a dit explicitement *« tu peux te basé dessus »* — pas *« porte-le ».
2. **Cerne ink 3px + sticker shadow `0 6px 0 rgba(38,26,61,0.45)` est la signature**. Toute carte, bouton, pill qui ne l'a pas casse l'identité. Le sticker shadow n'a **pas de blur** — c'est l'offset Y pur qui crée l'effet "autocollant".
3. **Cap GPU réel** : translate-only en infinite est gratuit. Les boucles à surveiller sont **filter blur**, **box-shadow animé**, **multi-prop simultané**. Limite-toi à 4 simultanées de ces catégories en combat. Float-y translate sur 7 cartes : OK. Pulse-halo (filter+opacity) sur 7 cartes : KO.
4. **Mythique est ACTIVÉE** côté visuel (rose nacré `#ff5fa2`, wobble, sparkles). **Aucun perso mythique n'existe dans le jeu V4** — c'est un placeholder visuel. Le drop reste à 0%.
5. **Phase F = on garde les noms V2** (Cryptes Froides / Sanctuaire du Vide / Salle du Roi Brisé). La DA candy joyeuse contraste volontairement avec les noms gothiques — c'est une force, pas un bug.
6. **App.tsx est figé côté gameplay**. Tu travailles essentiellement dans `src/styles.css`. Le frontend-dev s'occupe du composant `<HeroMascot>` (T4) et des intégrations React (T7, T11, T13, T28).

## Décisions déjà prises (cf. `project/v4/decisions.md`)

- **Tokens : rename in-place + extension** — les anciens noms restent (`--color-bg`, `--rarity-commune`, etc.), valeurs candy. Nouveaux ajoutés (`--bg-deep`, `--brand-coral`, `--ink`, `--font-display`, etc.).
- **HeroMascot : nouveau composant React** (pas un CSS-only modifier). 16 variants × 5 sizes × 6 moods.
- **Phase F : pas de renommage stages** par défaut.
- **Float-y permanent acceptée** sur 7 cartes en combat (translate-only).
- **Mythique : visuel actif, drop désactivé**.
- **Google Fonts en CDN accepté** (proto local). Self-host à reconsidérer pour déploiement public.
- **Pas de bump saveVersion** — reste à 3.

## Tâches qui te sont assignées

V4-T2, T5, T6, T8, T9, T10, T12, T14, T15, T16, T17, T18, T19, T20, T21, T22, T23, T24, T25, T26, T27, T29, T30, T31. Soit 24 tâches sur 33.

## Livrables attendus dans `project/v4/design/`

### 1. `design-system.md`

- Tableau complet des tokens (avec valeurs hex / oklch + commentaire d'usage).
- Hiérarchie typographique (H1 64px Lilita One stroke 2px ink → body 14-17px Nunito).
- Échelle d'espacement et radius.
- Catalogue des variantes de boutons.
- Patrons signature (cerne ink + sticker shadow + radius xl pour les cartes premium).

### 2. `mascots.md`

Composition CSS détaillée pour chacun des 16 variants :
- `bobby` (mascotte par défaut, neutre, peut accueillir Custom Characters forgés)
- `rogue`, `mage`, `guardian`, `gourmand` (héros)
- `slime`, `bat`, `ghost`, `witch`, `plant`, `guard`, `golem`, `soldier` (ennemis communs)
- `boss-cinder`, `boss-void`, `boss-king` (boss stages 1/2/3)

Pour chacun : couleurs (skin, hat, cape, eye, cheek, mouth), accessoires éventuels (ailes pour bat, chapeau pointu pour witch, couronne brisée pour boss-king), ajustements moods (KO = yeux X, hurt = yeux écrasés, attacking = bouche ouverte).

Objectif : 100% CSS, 0 SVG, 0 emoji obligatoire (mais tu peux utiliser des emojis pour les accessoires s'ils s'intègrent — couronne `👑` pour boss-king, par exemple, **si** ton design le justifie).

### 3. `cards.md`

Refonte des classes V2/V3 existantes avec nouveaux tokens et patterns :
- `.character-card-detailed` (V3) : layout double-inset, halo radial, idle anim par rareté.
- `.combat-hero` (V1, refondue) : compact 50px mascotte.
- `.enemy-card` (V1, refondue) : avec teinte stage.
- `.boss-hp-bar` (V3) : ink violet bg + nom mythic.
- `.run-progress` (V2) : paper bg + dots stage colorés.
- Boutons, pills, modales, tabs.

### 4. `chests-roulette.md`

Coffres tier-aware (5 tiers : damaged, bronze, silver, royal, runic) avec aura radial colorée, lid + body + studs + lock + animation d'ouverture (lid rotateX + chest-burst). Pour le runic, ajoute 3 runes glow cyan en pulse-halo.

Roulette avec marker coral pointu central (4px + triangles haut/bas en pseudo-element), fade gauche/droite 80px, items 110px en cards rareté avec mascotte mini.

### 5. `skyboxes.md`

Composition exacte des gradients pour chaque stage :
- Stage 1 (Cryptes Froides → "ciel pâle givré") : `bg-sky-day` clair avec touche bleu glacier.
- Stage 2 (Sanctuaire du Vide → "crépuscule magique") : `bg-sky-dusk` violet → orange.
- Stage 3 (Salle du Roi Brisé → "couronnement doré") : `bg-sky-dusk` doré → cream.
- Hub par défaut : `bg-night` étoilé violet.

### 6. `motion.md`

Catalogue keyframes :
- `float-y` (3-4s, translate ±6px)
- `shimmer-x` (4s linear)
- `pulse-halo` (3s)
- `breathe` (6s scale 1.04 + rotate 0.5deg)
- `wobble` (5s rotate ±1.5deg)
- `spin-slow`, `spark`
- `chero-attack` (0.45s translate(20,-10) rotate(4))
- `enemy-attack` (symétrique)
- `chero-attack-special` (amplitude majorée)
- `proj-fly`, `proj-fly-heal`
- `fnum-rise` (1.6s)
- `chest-burst` (1.2s scaleY 0.4→2.4)
- `chest-flash-fullscreen`, `chest-lid-rotate`, `chest-beam-rise` (déjà V3.1)

Reduced-motion : bloc final qui désactive tout ce qui est infinite + alternatives statiques (outline pour rareté, opacity step pour flashes).

### 7. `tokens-extras.md` (optionnel mais utile)

Tokens supplémentaires spécifiques à des composants (ex: `--mascot-skin-default`, `--chest-lid-rotation-end`). À documenter pour aider le frontend-dev à comprendre quoi piloter.

## Pièges à éviter

- **Ne supprime pas de tokens existants** sans audit. Beaucoup de classes V2/V3 utilisent `--rarity-commune` (FR), `--stage-1-accent-deep`, `--accent-soft`. Si tu supprimes, tu casses. Préfère **rebinding** (ex: `--accent: var(--brand-coral)`).
- **Pas de filter blur sur halo de carte légendaire/mythique × 5 cartes en combat**. Combat a des halos sur boss seulement. Hors combat (collection / lootbox reveal), max 1 carte affichée → OK.
- **Pas de SVG line art runique**. Tu remplaces par des cercles colorés, des emojis text, ou du CSS pur.
- **Cohérence cream/ink** : sur surface cream, texte ink. Sur surface dark (`bg-deep`), texte paper/cream. Ne mélange pas.
- **Lilita One ne va PAS sur du body text long**. Sa graisse fatigue. Réserve-la aux titres, noms, valeurs numériques, boutons. Le body courant reste Nunito.
- **`prefers-reduced-motion`** : la DA originale fait `*::before, *::after { animation: none; transition: none; }` global. C'est très large mais efficace. À étendre aux nouvelles classes que tu ajoutes.
- **App.tsx 5551 lignes** : si tu as besoin de demander un composant React supplémentaire, demande-le explicitement au frontend-dev — n'essaie pas de tout faire en CSS si c'est plus simple en React.

## Communication

Si tu dois clarifier un point, append dans `project/v4/questions.md` au format `### [TO:architect] ...`. L'orchestrateur route.

Bon design.
