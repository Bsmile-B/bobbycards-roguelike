# Passation Architect → Designer

## Ce que tu dois absolument retenir

1. **On étend, on ne refond pas.** Le HUD combat (`CombatHud`, `CombatHero`, `EnemyCard`, `CombatFooter` dans `src/App.tsx`) reste en l'état. Tes designs doivent s'intégrer **autour**, pas remplacer. Pour les consommables en combat : un mini-rail discret de 3 slots sous le `CombatFooter`, c'est tout.
2. **3 stages = 3 ambiances visuelles distinctes mais cohérentes.** Le brief est explicite : Stage 1 bleu froid (pierre, runes), Stage 2 violet sombre (magie, vide), Stage 3 or terni/rouge sombre (royal, brisé). Toutes les surfaces du jeu (combat, hub, transitions) doivent **rappeler** le stage courant via un accent — pas tout repeindre, juste l'accent (bordures, glow, eyebrow, runes décoratives).
3. **Dark fantasy sobre déjà établi.** Va lire `src/styles.css` (lignes 1–120 suffisent pour le fond et les surfaces) avant tout design. La palette de base (`#0b0a0c`, `#ede7dc`, surfaces `rgba(18,16,19,0.78)` avec `backdrop-filter: blur`) est posée. Tu ajoutes des tokens d'accent par stage, tu ne renverses pas la base.
4. **1280x720 strict.** Le HUD combat actuel tient déjà à l'étroit. Pour le hub avec 5 onglets + zone centrale + bouton continuer, on n'a pas le luxe de marges généreuses. Pense compact, dense lisible, comme l'écran combat.
5. **Pas de dépendances graphiques externes.** CSS pur, pas d'images, pas d'icônes SVG depuis CDN. Les visuels actuels sont 100% CSS (cf. `.portrait`, `.menu-sigil`, `.chest`, `.enemy-figure`). Les coffres, les loot boxes, les runes, les badges : CSS.

## Décisions déjà prises (cf. decisions.md)

- **Extension par sur-greffe** : on garde le reducer central, on ajoute screens et actions, on ne sort pas en multiples fichiers sauf dépassement critique.
- **Nommage des phases** : `stage-intro`, `hub`, `lootbox` (les sous-vues recycle/team/stats/shop sont des onglets, pas des screens).
- **localStorage tolérant** : pas de bump de clé, juste `saveVersion: 2` injecté.
- **Consommables = mini-HUD** : 3 slots ajoutés sous le HUD combat existant, pas de refonte du panneau bas.

## Tâches qui te sont assignées

- **T5** — Composant RunProgress (barre 3 stages × 10 vagues + hub markers).
- **T7** — Design system : tokens CSS par stage.
- **T8** — Wireframe hub (header + 5 onglets + bouton continuer).
- **T11** — Wireframe boutique.
- **T14** — Wireframe + transitions CSS écran lootbox (coffre fermé → flash → révélation).
- **T16** — Wireframe onglet recyclage + modale de confirmation.
- **T18** — Wireframe onglet équipe au hub.
- **T22** — Wireframe inventaire consommables (intégration mini-HUD combat + UI hub).
- **T25** — Wireframe coffre final tier-aware (5 visuels : abîmé/bronze/argent/royal/runique).

Livrables attendus dans `project/design/` :
- `design-system.md` (tokens, palettes par stage).
- `run-progress.md`.
- `hub.md`, `shop.md`, `lootbox.md`, `recycle.md`, `hub-team.md`, `consumables.md`, `chest.md`.

## Composants à wireframer (récap synthétique)

| Composant | Où | États clés |
|-----------|-----|-----------|
| RunProgress | combat header + hub header | passé / courant / futur / boss / hub |
| StageIntroScreen | screen='stage-intro' | nom stage, numéro, boss à venir, bouton entrer |
| HubScreen | screen='hub' | header (or/fragments/vies/conso), 5 tabs, zone, bouton continuer |
| ShopTab | onglet hub | liste 4-6 items, achetable/épuisé/insuffisant, bouton reroll |
| LootboxTab | onglet hub | 4 tiers visibles, probas affichées, bouton acheter |
| LootboxScreen | screen='lootbox' | coffre fermé → flash → révélation, retour |
| RecycleTab | onglet hub | liste persos forgés, modale "définitif" |
| HubTeamTab | onglet hub | équipe actuelle, disponibles, badge "1 swap gratuit" |
| HubStatsTab | onglet hub | stats run cumulées (lecture seule) |
| ConsumableRail | sous CombatFooter + en hub | 3 slots, vide/rempli, bouton utiliser |
| ChestTierVisual | screen='gameover' | 5 variantes : damaged/bronze/silver/royal/runic |

## Tone & cohérence (rappel)

- **Stage 1 — Cryptes froides** : pierre froide, runes bleues, palette `--stage-1-accent` autour du bleu acier (cf. `rgba(48, 84, 92, ...)` déjà présent dans `body`).
- **Stage 2 — Sanctuaire du Vide** : violet sombre, ambiance occulte, accents magie. Pousse le `rgba(...purple)` sans virer au pastel.
- **Stage 3 — Salle du Roi Brisé** : or terni + rouge sombre (les `rgba(117, 19, 36, ...)` existants sont une bonne base). Ambiance ruines royales, pas clinquant.
- **Hub** : prend l'accent du stage **suivant** (le hub stage 1→2 utilise les tons stage 2). Justification : c'est l'antichambre du prochain stage.

## Pièges à éviter

- **Ne pas casser les `id` HTML existants** : `start-run`, `nav-creator`, `creator-name`, `creator-rarity`, `create-character`, `team-start`, `abandon-run`, `reward-0..2`, `open-chest`. Les tests Playwright en dépendent (cf. `test-actions/*.json`, coordonnées en pixels).
- **Ne pas faire flotter les modales hors écran** en 1280x720 : les modales (recyclage, remplacer consommable) doivent se centrer dans la zone visible et ne pas requérir scroll.
- **Pas d'animation longue (>800ms)** pour la lootbox : le test Playwright avance le temps virtuel discrètement, pas de timing absolu fragile.
- **Les 5 onglets doivent tenir sur une ligne** dans le header du hub. Si trop long en français, raccourcis lisibles.
- **Cohérence avec le combat** : les bordures, le `border-radius` (~8px globalement), les `backdrop-filter: blur(12px)` et la typographie Georgia/Times pour les titres existent déjà. Réutilise.
- **Les consommables ne doivent pas voler de l'attention au combat** : le rail est petit, sobre, à droite ou en bas, pas un panneau plein écran.
