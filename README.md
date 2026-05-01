# Bobbycard Roguelike

A React/TypeScript roguelite card battler. Compose three heroes, fight through three stages, beat the runic boss, open the chest. Build a deeper run each time with relics, shop items, lootboxes, and a custom forge.

> **Status:** prototype V5.2 — playable end-to-end, build clean, golden-path test green.

---

## Highlights

- **Roguelite loop** — 3 stages × 3 fights + boss, runic boss at stage 3, final chest with 5 tiers
- **16 starters + unlimited forge** — blade / mage / warden roles with role-capped stats
- **Semi-auto combat** — auto-attacks tick on a timer, click skills to react, enemy intents telegraph next move
- **Persistent run save** — close the tab mid-run, click *Continue* on the next launch, resume exactly where you left off (checkpoints at each combat / hub / boss-relic transition)
- **Visible economy** — gold, fragments, lootbox pity counter, recycle, shop with stage-locked items
- **Reliques system** — boss reliques and runic reliques with live in-combat feedback (pulse + toast)
- **Direction artistique** — peach / cream / ink color system, sticker-shadow pattern, CSS-only mascots with 17 variants and 6 moods

## Stack

| Layer | Tool |
|---|---|
| UI | React 18 |
| Language | TypeScript 5 (strict, 0 `any`) |
| Build | Vite 8 |
| Tests | Playwright |
| Persistence | `localStorage` (key `runebound-cards-save-v1`, version 4) |
| Fonts | Google Fonts (Lilita One, Nunito, JetBrains Mono) |

No state library, no UI library, no CSS framework — single `src/App.tsx` reducer + `src/styles.css` token system.

---

## Quick start

```bash
npm install
npm run dev          # http://127.0.0.1:5173
```

```bash
npm run build        # tsc -b && vite build → dist/
npm run preview      # serve dist/
npm test             # Playwright golden-path
npm run test:ui      # Playwright UI mode
```

First run requires `npx playwright install chromium` to download the browser binary.

---

## Project structure

```
.
├── index.html                  # Vite entry, Google Fonts preconnect
├── playwright.config.ts        # E2E config, webServer = npm run dev
├── package.json
├── tsconfig.json
├── vite.config.ts
│
├── src/
│   ├── main.tsx                # React mount + global CSS imports
│   ├── App.tsx                 # Reducer + all screens (~6400 lines)
│   ├── styles.css              # Tokens + components (~6900 lines)
│   │
│   ├── data/                   # Game data, no React imports
│   │   ├── characters.ts       # ROSTER, RARITY_LABEL, role caps
│   │   ├── stages.ts           # STAGE_CONFIGS, INTENTS, MODIFIERS
│   │   ├── shop.ts             # SHOP_POOLS, LOOTBOX_TABLES
│   │   ├── relics.ts           # BOSS_RELIC_POOL, BOSS_RUNIC_RELIC_POOL
│   │   └── consumables.ts      # CONSUMABLE_DEFS, REWARD_POOL
│   │
│   ├── components/
│   │   └── HeroMascot.tsx      # 17-variant CSS mascot, 5 sizes, 6 moods
│   │
│   ├── utils/
│   │   └── mascotMapping.ts    # persona → variant, mood from combat state
│   │
│   └── styles/
│       └── mascot.css          # mascot palettes per variant
│
├── tests/
│   ├── golden-path.spec.ts     # menu → 3 stages → boss → chest → menu
│   └── helpers.ts              # getGameState, advanceTime, waitForScreen
│
├── test-actions/               # 18 JSON action scenarios (legacy)
│
└── project/                    # Specs, decisions, design docs
    ├── brief.md                # V2 brief
    ├── specs.md                # V2 specs
    ├── decisions.md            # Architectural decisions log
    ├── design/                 # Design system, wireframes, animations
    ├── handoffs/               # Architect → designer → dev handoffs
    ├── v3/                     # V3 — game feel, animations, polish
    ├── v4/                     # V4 — first DA attempt (deprecated)
    └── v5/                     # V5 — peach DA + audit reports
        ├── rapport-etat-et-roadmap.md
        ├── synthese-audit-multi-agents.md
        └── decisions.md
```

---

## Game flow

```
Menu
 ├─→ How to play / Stats / Options
 │
 └─→ Team Select (3 heroes)
      ↓
      Stage Intro (1, 2, 3)
      ↓
      Combat (3 normal waves + 1 boss per stage)
      ↓
      Reward (gold / fragment / character / relic)
      ↓
      ┌─────────────────┐
      │ if boss → Boss Relic Choice (3 options) │
      └─────────────────┘
      ↓
      Hub (shop, lootbox, recycle, team swap, stats)
      ↓
      → Next Stage Intro (loop)
      ↓
      Final Boss (Stage 3 wave 4) → Final Chest (5 tiers based on perf)
      ↓
      Game Over → Menu
```

Save is written at: `START_RUN`, `CHOOSE_REWARD`, `ENTER_HUB`, `HUB_CONTINUE`, `CHOOSE_BOSS_RELIC`. Never mid-fight.

---

## Test hooks (dev / e2e)

Exposed on `window` in dev/preview builds:

| Hook | Purpose |
|---|---|
| `window.render_game_to_text()` | Returns full game state snapshot as JSON (screen, save, run, hub, rewards, animations) |
| `window.advanceTime(ms)` | Dispatches a `TICK` action, advances combat / animations by `ms` |
| `window.__game_test_skip_roulette()` | Skips lootbox roulette animation |
| `window.__game_test_skip_boss_intro()` | Dismisses boss intro overlay |

Used by `tests/helpers.ts` and the 18 JSON scripts in `test-actions/`.

---

## Stable selectors (do not rename)

Used by Playwright + `test-actions/`:

| Selector | Where |
|---|---|
| `#start-run`, `#continue-run`, `#reset-save` | Menu |
| `#nav-howto`, `#nav-stats`, `#nav-options`, `#nav-creator` | Menu navigation |
| `#team-start` | Team select |
| `#stage-intro-enter` | Stage intro |
| `#abandon-run` | Combat |
| `#reward-{0..2}` | Reward grid |
| `#boss-relic-{0..2}` | Boss relic choice |
| `#hub-tab-{shop,lootbox,recycle,team,stats}` | Hub navigation |
| `#hub-continue` | Hub → next stage |
| `#shop-buy-{idx}`, `#shop-reroll` | Shop |
| `#lootbox-open`, `#lootbox-close`, `#lootbox-skip-roulette` | Lootbox |
| `#open-chest` | Final chest |
| `#boss-intro-skip` | Boss intro overlay |
| `#pity-counter` | Lootbox pity widget |
| `#confirm-new-run` / `#cancel-new-run` | Confirm modal |
| `#confirm-reset` / `#cancel-reset` | Reset save modal |

---

## Development phases

| Phase | Theme | Scope |
|---|---|---|
| **V1** | Foundations | Reducer, combat, basic team / starters / 3 stages |
| **V2** | Progression & economy | Hub, shop, lootbox, consumables, recycle, forge, save versioning |
| **V3** | Game feel | Animation queue, projectiles, floating numbers, boss intro, lootbox roulette, pity, speed selector |
| **V4** | DA "Joyful Direction" (deprecated) | Candy / dark-violet attempt — rejected by stakeholder, replaced in V5 |
| **V5.1** | Reset, structure & correct DA | 6 phases — see `project/v5/rapport-etat-et-roadmap.md` |
| **V5.2** | Menu polish & contrasts | New `howto` / `stats` / `options` screens, modale cleanup, contrast pass |

### V5.1 phases (in order)

1. **Phase 1 — Architecture split**: data modules + HeroMascot + mascot.css extracted
2. **Phase 2 — Playwright golden path**: first automated regression coverage
3. **Phase 3 — DA peach**: token migration, mascot recolor, sticker-shadow pattern, 3 distinct skyboxes
4. **Phase 4 — Run checkpoints**: `currentRun` snapshot in save, *Continue* button, corruption banner, reset
5. **Phase 5 — Balance**: nerf Sceau d'aube (revive 1 @ 50% instead of revive all), split Couronne du Roi Brisé, role caps on forge
6. **Phase 6 — Visible feedback**: pity counter UI, relic trigger pulses + toasts, modifier tooltips

Full report: [`project/v5/synthese-audit-multi-agents.md`](project/v5/synthese-audit-multi-agents.md).

---

## Roadmap

| Phase | Goal | Effort |
|---|---|---|
| **V6** | Onboarding (interactive tutorial), balance pass over the whole run, win screen with recap | ~45h |
| **V7** | Audio (8 SFX + 3 ambiences), screen transitions, full options screen | ~25h |
| **V8** | Deep refactor — split `App.tsx` into screens/components, extract reducer, unit tests | ~25h |
| **V9+** | Replayability — random events, choice of paths, ascensions, achievements | 50h+ |

See `project/v5/rapport-etat-et-roadmap.md` for tickets and rationale.

---

## Constraints (locked unless explicitly changed)

- TypeScript strict, **no `any`**
- `npm run build` and `npm test` must stay green
- Stable IDs above must not be renamed
- Save format `runebound-cards-save-v1` is migrated silently — never destructively
- `prefers-reduced-motion` is honored (animations off on `*::before, *::after`)
- Target viewport 1280×720 (no responsive yet)
- No bitmap assets — everything CSS / SVG inline
- Cap 4 simultaneous infinite animations in combat (perf guard from V3)

---

## License

MIT — see [LICENSE](LICENSE).
