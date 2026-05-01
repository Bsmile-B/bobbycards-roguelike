/**
 * Bobbycard V5.1 — Playwright helpers (Phase 2)
 *
 * Tous les helpers consomment les hooks de test exposés par App.tsx :
 *   - window.render_game_to_text() : JSON complet de l'état (string)
 *   - window.advanceTime(ms)       : dispatch un TICK (combat virtuel)
 *   - window.__game_test_skip_roulette?()    : skip animation lootbox
 *   - window.__game_test_skip_boss_intro?()  : skip cinematique boss
 */
import type { Page } from "playwright/test";

export interface GameStateSnapshot {
  screen?: string;
  notice?: string | null;
  selectedIds?: string[];
  save?: {
    gold?: number;
    fragments?: number;
    bestFight?: number;
    saveVersion?: number;
    bestStage?: number;
    finalBossDefeats?: number;
    lifetimeLootboxes?: number;
    [k: string]: unknown;
  };
  run?: {
    fight?: number;
    stage?: number;
    wave?: number;
    wins?: number;
    lives?: number;
    bossIn?: number;
    bossIntroActive?: boolean;
    [k: string]: unknown;
  } | null;
  hub?: unknown;
  stageIntro?: unknown;
  lootbox?: unknown;
  pendingBossRelics?: { tier?: string; options?: Array<{ name?: string; detail?: string }> } | null;
  chestTier?: string | null;
  [k: string]: unknown;
}

export async function getGameState(page: Page): Promise<GameStateSnapshot> {
  // render_game_to_text retourne un string JSON. On parse côté Node pour rester typé.
  const raw = await page.evaluate(() => {
    const fn = (window as unknown as { render_game_to_text?: () => string }).render_game_to_text;
    return typeof fn === "function" ? fn() : null;
  });
  if (!raw) return {};
  try {
    return JSON.parse(raw) as GameStateSnapshot;
  } catch {
    return {};
  }
}

export async function advanceTime(page: Page, ms: number): Promise<void> {
  await page.evaluate((delta) => {
    const fn = (window as unknown as { advanceTime?: (ms: number) => void }).advanceTime;
    if (typeof fn === "function") fn(delta);
  }, ms);
}

export async function skipRoulette(page: Page): Promise<void> {
  await page.evaluate(() => {
    const fn = (window as unknown as { __game_test_skip_roulette?: () => void }).__game_test_skip_roulette;
    if (typeof fn === "function") fn();
  });
}

export async function skipBossIntro(page: Page): Promise<void> {
  await page.evaluate(() => {
    const fn = (window as unknown as { __game_test_skip_boss_intro?: () => void }).__game_test_skip_boss_intro;
    if (typeof fn === "function") fn();
  });
}

export interface WaitForScreenOptions {
  /** Plafond total avant échec (ms). */
  timeoutMs?: number;
  /** Quantum de temps virtuel injecté à chaque itération si on est en combat. */
  tickMs?: number;
  /** Pause réelle entre deux ticks (laisse React rerender). */
  realPauseMs?: number;
  /** Si défini, on skip automatiquement la boss intro lorsqu'elle est active. */
  autoSkipBossIntro?: boolean;
}

/**
 * Boucle jusqu'à ce que `screen === target`. Pousse `advanceTime` à chaque
 * itération pour faire avancer le combat. Sans cela on dépend du setInterval
 * 260ms et le combat met 30+ secondes réelles.
 */
export async function waitForScreen(
  page: Page,
  target: string,
  opts: WaitForScreenOptions = {},
): Promise<GameStateSnapshot> {
  const {
    timeoutMs = 60_000,
    tickMs = 1500,
    realPauseMs = 50,
    autoSkipBossIntro = true,
  } = opts;
  const start = Date.now();
  let last: GameStateSnapshot = {};
  while (Date.now() - start < timeoutMs) {
    last = await getGameState(page);
    if (last.screen === target) return last;
    if (autoSkipBossIntro && last.run?.bossIntroActive) {
      await skipBossIntro(page);
    }
    if (last.screen === "combat") {
      await advanceTime(page, tickMs);
    }
    await page.waitForTimeout(realPauseMs);
  }
  throw new Error(
    `waitForScreen timeout: expected "${target}", last screen="${last.screen}" run=${JSON.stringify(last.run)}`,
  );
}

/**
 * Boucle jusqu'à ce qu'une des conditions screen apparaisse. Utile pour les
 * branches (boss-relic-choice vs hub vs gameover après un combat).
 */
export async function waitForOneOfScreens(
  page: Page,
  targets: string[],
  opts: WaitForScreenOptions = {},
): Promise<GameStateSnapshot> {
  const {
    timeoutMs = 60_000,
    tickMs = 1500,
    realPauseMs = 50,
    autoSkipBossIntro = true,
  } = opts;
  const start = Date.now();
  let last: GameStateSnapshot = {};
  const set = new Set(targets);
  while (Date.now() - start < timeoutMs) {
    last = await getGameState(page);
    if (last.screen && set.has(last.screen)) return last;
    if (autoSkipBossIntro && last.run?.bossIntroActive) {
      await skipBossIntro(page);
    }
    if (last.screen === "combat") {
      await advanceTime(page, tickMs);
    }
    await page.waitForTimeout(realPauseMs);
  }
  throw new Error(
    `waitForOneOfScreens timeout: expected one of [${targets.join(", ")}], last screen="${last.screen}"`,
  );
}
