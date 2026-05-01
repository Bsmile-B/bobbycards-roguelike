# Contributing

This is a personal prototype, but the structure below is what reviewers and future contributors should follow.

## Before any change

```bash
npm install
npm run build   # must pass: 0 TS errors
npm test        # must pass: 2/2 specs
```

If either is red on `main`, fix that first — don't stack new work on a broken tree.

## Locked invariants

These must not change without an explicit decision logged in `project/decisions.md`:

1. **TypeScript strict, no `any`** — use proper types or `unknown` + narrow.
2. **Stable selectors** — every `id` listed in the README "Stable selectors" table is referenced by tests. Renaming = updating tests in the same commit.
3. **Save format** — `runebound-cards-save-v1` is migrated silently. Never break a previous version.
4. **Test hooks on `window`** — `render_game_to_text`, `advanceTime`, `__game_test_*` are part of the public dev API.
5. **`prefers-reduced-motion`** — every new animation must be wrapped in the existing reduced-motion guard.

## Where to put things

| What | Where |
|---|---|
| New game data (characters, stages, items, relics) | `src/data/*.ts` |
| New utility (pure function, no React) | `src/utils/*.ts` |
| New visual component | `src/components/*.tsx` + `src/styles/*.css` |
| New screen | Currently inlined in `App.tsx` (will move to `src/screens/` in V8) |
| Global tokens / shared classes | `src/styles.css` (`:root` + atoms) |
| Specs / decisions / handoffs | `project/v{N}/` per phase |

## Naming

- React components: `PascalCase`
- Hooks / utils: `camelCase`
- Tokens: `--kebab-case`
- IDs (DOM): `kebab-case`, prefixed by domain (`#hub-...`, `#shop-...`, `#reward-...`)
- Test specs: `tests/<feature>.spec.ts`

## Commits

Conventional, imperative, one logical change per commit. Body explains *why*, not *what*.

```
fix combat: revive on per-KO instead of wipe-only

Sceau d'aube was triggering only when the whole team wiped, which made
runic boss fight a deterministic re-roll. Move trigger into advanceCombat
hp <= 0 check so it fires on the first KO, restores 1 hero at 50% HP,
once per run.
```

## Pull requests

A PR should:

- Describe the change in 2-4 lines
- Mention which phase / ticket it belongs to (V5.x, V6, etc.)
- List the screens/states impacted
- Include `npm run build` and `npm test` output (paste tail of CI is enough)
- Add or update tests for any new selector or screen

Do **not**:

- Mix a refactor with a feature in the same PR
- Add `any` to silence TypeScript
- Skip `npm test` because "it works locally"
- Push to `main` directly — go through a PR even for solo work

## Decisions

Any non-obvious choice (architecture, scope cut, balance tweak, accessibility trade-off) goes in `project/v{N}/decisions.md` in the format:

```
## [YYYY-MM-DD] [author] short title

**Context:** what was the situation and why a choice was needed
**Options:** A / B / C with one-line summary each
**Decision:** A
**Rationale:** why A wins, what we accept losing
**Consequences:** what changes downstream, what's now locked, what to revisit
```

This is the source of truth, not commit messages.
