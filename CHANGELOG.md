# Changelog

All notable changes to this project are documented here. Format inspired by [Keep a Changelog](https://keepachangelog.com).

---

## [V5.2] — 2026-04-30

### Added
- Three new menu screens: `howto` (How to play), `stats` (detailed run statistics), `options` (combat speed selector)
- Six pills on the menu showing best fight, best stage, bosses defeated, chests opened, current gold, fragments
- Footer "Bobbycard V5.2 — Prototype" on menu
- Stable IDs: `#nav-howto`, `#nav-stats`, `#nav-options`, `#howto-back`, `#stats-back`, `#options-back`, `#option-speed-{1,1-25,1-5}`

### Changed
- Modale backgrounds migrated from dark `#181428` (V3 residue) to cream `var(--paper)` with ink border 3px and sticker shadow
- Modale backdrop changed from `rgba(8,6,18,0.85)` to `rgba(38,26,61,0.6)` ink translucent + light blur
- Save corruption banner: now cream with `border-left` 6px coral and ⚠ icon, instead of semi-transparent red
- Menu copy color changed from pale `#a99f91` to readable `var(--ink-soft)`
- Menu stats colors changed from `#938b80` / `#f0dfc2` to `var(--ink-soft)` / `var(--ink)`

### Fixed
- All residual dark hex codes (`#181428`, `#322a52`, `rgba(8,6,18,...)`) removed from `App.tsx` and `styles.css`

### Bundle
- CSS: 173.76 kB (gzip 32.08 kB)
- JS: 318.49 kB (gzip 93.94 kB)

---

## [V5.1] — 2026-04-30

### Added — Phase 1 (Architecture split)
- `src/data/characters.ts` — ROSTER, RARITY_LABEL, role caps
- `src/data/stages.ts` — STAGE_CONFIGS, INTENTS, MODIFIERS
- `src/data/shop.ts` — SHOP_POOLS, LOOTBOX_TABLES
- `src/data/relics.ts` — BOSS_RELIC_POOL, BOSS_RUNIC_RELIC_POOL
- `src/data/consumables.ts` — CONSUMABLE_DEFS, REWARD_POOL
- `src/components/HeroMascot.tsx` — 17-variant CSS mascot component
- `src/utils/mascotMapping.ts` — persona → variant mapping
- `src/styles/mascot.css` — mascot palettes per variant

### Added — Phase 2 (Tests)
- `playwright.config.ts`
- `tests/golden-path.spec.ts` — menu → 3 stages → boss → chest → menu
- `tests/helpers.ts` — `getGameState`, `advanceTime`, `waitForScreen`
- `npm test` and `npm run test:ui` scripts

### Changed — Phase 3 (DA)
- `:root` tokens migrated from violet `#1a1530` to peach `#ffd6c2`
- 17 mascot variants recolored: cream skin, role-specific hat colors
- Sticker-shadow pattern (3px ink border + offset Y shadow) applied to all cards, buttons, hub tabs, chests
- Three distinct skyboxes per stage: peach + sky / peach + grape / peach + gold
- All OKLCH color values replaced with hex (better browser fallback)

### Added — Phase 4 (Run checkpoints)
- `SerializedRunState` type and `currentRun` field in `SaveData`
- `saveVersion` bumped 3 → 4 with silent migration
- Save written at: `START_RUN`, `CHOOSE_REWARD`, `ENTER_HUB`, `HUB_CONTINUE`, `CHOOSE_BOSS_RELIC`
- *Continue run* button on menu (`#continue-run`) when checkpoint exists
- Confirmation modal when starting a new run while a checkpoint exists
- *Reset save* button (`#reset-save`) with confirmation modal
- Save-corruption banner with `role="alert"`

### Changed — Phase 5 (Balance)
- **Sceau d'aube éternelle**: `reviveAllOnDefeatOnce` (revive whole team @ 100% HP) → `reviveSingleOnKO` (revive 1 hero @ 50% HP, once per run, triggered per-KO)
- **Couronne du Roi Brisé**: split into two distinct relics (+10% max HP / +10% physical & magic) instead of single +15% on all stats
- **Forge stat caps by role**: blade ≤ 60 HP / ≤ 16 phys / ≤ 4 magic; mage ≤ 48 HP / ≤ 4 phys / ≤ 18 magic; warden ≤ 65 HP / ≤ 8 phys / ≤ 8 magic — fixes Warden 76-HP exploit
- Save migration: out-of-cap custom characters silently clamped on load

### Added — Phase 6 (Visible feedback)
- `#pity-counter` widget on lootbox screen with progress bars (rare X/8, epic X/12)
- `RelicTriggerEvent` queue in `RunState`, surfaced in combat as:
  - Coral pulse on the affected hero card (`.is-relic-pulse`)
  - Bottom toast with relic name + message (`#relic-trigger-log`, `aria-live="polite"`)
- Five reliques instrumented: regen, shield, first-skill-free, revive, gold bonus
- Native HTML `title` tooltips on combat modifier labels

---

## [V4] — Deprecated (replaced by V5)

Initial DA attempt with cartoon-candy violet aesthetic. Rejected by stakeholder; the actual reference was a peach/cream HTML standalone. Kept for archeology in `project/v4/`.

---

## [V3] — Game feel

Animation queue, projectiles, floating numbers, boss intro overlay, lootbox roulette, pity system, combat speed selector (1× / 1.25× / 1.5×), `prefers-reduced-motion` support.

---

## [V2] — Progression & economy

Hub with 5 tabs (shop, lootbox, recycle, team, stats), gold/fragment economy, lootboxes with weighted tables, consumables (4 types, 3 slots), forge custom characters, recycle for fragments, save versioning.

---

## [V1] — Foundations

Reducer architecture, semi-auto combat with skills and cooldowns, 16 starter heroes, 3 stages with bosses, basic team selection, final chest with 5 tiers, localStorage persistence, test hooks (`render_game_to_text`, `advanceTime`).
