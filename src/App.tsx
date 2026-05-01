import type { Dispatch } from "react";
import * as React from "react";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  ROSTER,
  RARITY_LABEL,
  STARTER_IDS,
  CREATION_COST,
} from "./data/characters";
import type {
  Rarity,
  SpecialType,
  Special,
  CharacterTemplate,
} from "./data/characters";
import {
  INTENTS,
  MODIFIERS,
  STAGE_CONFIGS,
  STAGE_INTRO_LINES,
  stageFromFight,
  waveFromFight,
} from "./data/stages";
import type {
  Stage,
  StageConfig,
  EnemyIntent,
  EnemyIntentKind,
  EncounterModifier,
} from "./data/stages";
import {
  CONSUMABLE_DEFS,
  REWARD_POOL,
  createConsumable,
} from "./data/consumables";
import type {
  Consumable,
  ConsumableKind,
  ConsumableSlots,
  RewardOption,
  RewardType,
} from "./data/consumables";
import {
  SHOP_POOLS,
  LOOTBOX_PRICES,
  LOOTBOX_TABLES,
} from "./data/shop";
import type {
  ShopItem,
  ShopItemEffect,
  LootBoxTier,
  LootBoxResult,
  LootBoxWeights,
} from "./data/shop";
import {
  BOSS_RELIC_POOL,
  BOSS_RUNIC_RELIC_POOL,
} from "./data/relics";
import type {
  RunRelic,
  BossRelicChoice,
} from "./data/relics";
import {
  mapPersonaToVariant,
  mapEnemyNameToVariant,
  computeHeroMood,
  computeEnemyMood,
} from "./utils/mascotMapping";
import type {
  MascotVariant,
  MascotMood,
  MascotSize,
} from "./utils/mascotMapping";
import { HeroMascot } from "./components/HeroMascot";
type Screen =
  | "menu"
  | "collection"
  | "creator"
  | "team"
  | "stage-intro"
  | "combat"
  | "reward"
  | "boss-relic-choice"
  | "hub"
  | "lootbox"
  | "gameover"
  | "howto"
  | "stats"
  | "options";
type CreatorRole = "blade" | "mage" | "warden";

type ChestTier = "damaged" | "bronze" | "silver" | "royal" | "runic";

type HubTab = "shop" | "lootbox" | "recycle" | "team" | "stats";

type HubState = {
  stageJustCleared: Stage;
  nextStage: Stage;
  shopItems: ShopItem[];
  shopRerolls: number;
  freeSwapsUsed: 0 | 1;
  activeTab: HubTab;
};

type PendingLootbox = {
  tier: LootBoxTier;
  opened: boolean;
  result: LootBoxResult | null;
};

type CombatCharacter = CharacterTemplate & {
  hp: number;
  shield: number;
  attackTimer: number;
  specialCd: number;
  cooldownMod: number;
};

type Enemy = {
  id: string;
  name: string;
  trait: string;
  traitDetail: string;
  maxHp: number;
  hp: number;
  shield: number;
  attack: number;
  attackTimer: number;
  attackInterval: number;
  baseInterval: number;
  intent: EnemyIntent;
  boss: boolean;
  // V4 — variant pour HeroMascot (optionnel ; legacy save sans champ tolérée)
  mascot?: MascotVariant;
};

type SaveData = {
  unlockedIds: string[];
  customCharacters: CharacterTemplate[];
  gold: number;
  fragments: number;
  bestFight: number;
  chestsOpened: number;
  saveVersion: number;
  bestStage: Stage;
  finalBossDefeats: number;
  lifetimeLootboxes: number;
  // === V3 ===
  settings: Settings;
  lootboxPity: LootboxPity;
  // === V5.1 — Phase 4 ===
  // Snapshot d'une run en cours, ou null si aucune. Mis à jour aux transitions
  // sûres uniquement (jamais mid-fight).
  currentRun: SerializedRunState | null;
};

type ChestReward =
  | { type: "character"; characterId: string }
  | { type: "fragments"; amount: number }
  | { type: "gold"; amount: number };

type FlashEvent = {
  id: string;
  kind: "hit" | "magic" | "heal" | "shield" | "boss";
  x: number;
  y: number;
  age: number;
  label?: string;
};

// === V5.1 T24 — RelicTriggerEvent ===
// Event éphémère émis quand une relique a un effet visible côté combat.
// Lu par le HUD (toast) et par CombatHero (pulse glow si targetCharId match).
// ttlMs décrémenté dans advanceCombat, filtré quand <= 0.
type RelicTriggerEvent = {
  id: string;
  relicId: string;
  relicName: string;
  message: string;
  targetCharId?: string;
  ttlMs: number;
};

// === V3 types ===
type CombatSpeed = 1 | 1.25 | 1.5;
type Settings = { combatSpeed: CombatSpeed };
type LootboxPity = { sinceLastRare: number; sinceLastEpic: number };
type AnimTrajectory = "physical" | "magic" | "heal" | "shield" | "poison";

type FloatingNumberVariant =
  | "damage-physical"
  | "damage-magic"
  | "heal"
  | "shield"
  | "poison"
  | "burn"
  | "crit";

type CombatAnimEvent =
  | { id: string; kind: "attack-started"; sourceId: string; isSpecial?: boolean; createdAt: number; ttlMs: number }
  | { id: string; kind: "projectile"; sourceId: string; targetId: string; trajectory: AnimTrajectory; isSpecial?: boolean; createdAt: number; ttlMs: number }
  | { id: string; kind: "target-hit"; targetId: string; isAlly: boolean; createdAt: number; ttlMs: number }
  | { id: string; kind: "damage-number"; targetId: string; isAlly: boolean; amount: number; variant: FloatingNumberVariant; createdAt: number; ttlMs: number }
  | { id: string; kind: "heal-number"; targetId: string; isAlly: boolean; amount: number; createdAt: number; ttlMs: number }
  | { id: string; kind: "shield-number"; targetId: string; isAlly: boolean; amount: number; createdAt: number; ttlMs: number }
  | { id: string; kind: "ko"; targetId: string; isAlly: boolean; createdAt: number; ttlMs: number }
  | { id: string; kind: "boss-phase"; phase: 1 | 2; createdAt: number; ttlMs: number };

type RunStats = {
  damageDealt: number;
  damageTaken: number;
  healingDone: number;
  shieldGiven: number;
  shieldBlocked: number;
  skillsUsed: number;
  enemiesDefeated: number;
  bossesDefeated: number;
  livesLost: number;
};

type RunState = {
  lives: number;
  fight: number;
  stage: Stage;
  wave: number;
  wins: number;
  team: CombatCharacter[];
  enemy: Enemy;
  modifier: EncounterModifier;
  stats: RunStats;
  log: string[];
  consumables: ConsumableSlots;
  relics: RunRelic[];
  shopDiscountPercent: number;
  blessingsUsed: number;
  // === V3 ===
  animQueue: CombatAnimEvent[];
  bossIntroAt: number | null;
  bossPhase: 0 | 1 | 2;
  bossPhase1Triggered: boolean;
  bossPhase2Triggered: boolean;
  // === V5.1 T24 — feedback visuel reliques ===
  // Champ volatile : non sérialisé dans currentRun (cf. SerializedRunState).
  relicTriggers: RelicTriggerEvent[];
};

// === V5.1 — Phase 4 — Run checkpoint serialization ===
// Sauvée aux 4 transitions sûres : START_RUN, CHOOSE_REWARD (post-victoire),
// CHOOSE_BOSS_RELIC, ENTER_HUB, HUB_CONTINUE (= end-stage). On exclut les
// champs volatiles (animQueue, bossIntroAt, flashes) et l'enemy (regenérée
// au prochain combat à partir de fight).
type ResumeScreen = "stage-intro" | "hub" | "boss-relic-choice";
type SerializedRunState = {
  lives: number;
  fight: number;
  stage: Stage;
  wave: number;
  wins: number;
  team: CombatCharacter[];
  consumables: ConsumableSlots;
  relics: RunRelic[];
  stats: RunStats;
  modifier: EncounterModifier;
  shopDiscountPercent: number;
  blessingsUsed: number;
  bossPhase: 0 | 1 | 2;
  bossPhase1Triggered: boolean;
  bossPhase2Triggered: boolean;
  // Hub state (présent uniquement si la dernière transition était hub-related)
  hub: HubState | null;
  // Pending boss relic choice (présent uniquement si la dernière transition
  // était CHOOSE_REWARD sur boss et la modale de relique attend)
  pendingBossRelics: BossRelicChoice | null;
  // Sélection de stage en cours (présent si on était sur stage-intro)
  stageIntro: { stage: Stage } | null;
  // Écran à restaurer à la reprise.
  resumeScreen: ResumeScreen;
};

type GameState = {
  screen: Screen;
  save: SaveData;
  selectedIds: string[];
  run: RunState | null;
  rewardOptions: RewardOption[];
  chest: { opened: boolean; reward?: ChestReward; tier?: ChestTier } | null;
  flashes: FlashEvent[];
  notice: string;
  hub: HubState | null;
  stageIntro: { stage: Stage } | null;
  pendingLootbox: PendingLootbox | null;
  pendingRecycle: { characterId: string } | null;
  pendingConsumable: { kind: ConsumableKind; source: "shop" | "reward" } | null;
  pendingBossRelics: BossRelicChoice | null;
};

// === V3 — Settings & lootbox pity (extension to SaveData) ===

type CreatorDraft = {
  name: string;
  rarity: Rarity;
  role: CreatorRole;
  specialType: SpecialType;
};

type Action =
  | { type: "NAVIGATE"; screen: Screen }
  | { type: "TOGGLE_CHARACTER"; id: string }
  | { type: "START_RUN" }
  | { type: "TICK"; delta: number }
  | { type: "USE_SPECIAL"; id: string }
  | { type: "CHOOSE_REWARD"; id: string }
  | { type: "ABANDON_RUN" }
  | { type: "CREATE_CHARACTER"; character: CharacterTemplate }
  | { type: "OPEN_CHEST" }
  | { type: "ENTER_STAGE_INTRO"; stage: Stage }
  | { type: "START_STAGE" }
  | { type: "ENTER_HUB" }
  | { type: "HUB_SET_TAB"; tab: HubTab }
  | { type: "HUB_BUY_SHOP_ITEM"; itemId: string }
  | { type: "HUB_REROLL_SHOP" }
  | { type: "HUB_BUY_LOOTBOX"; tier: LootBoxTier }
  | { type: "OPEN_LOOTBOX" }
  | { type: "CLOSE_LOOTBOX" }
  | { type: "HUB_RECYCLE_REQUEST"; characterId: string }
  | { type: "HUB_RECYCLE_CONFIRM" }
  | { type: "HUB_RECYCLE_CANCEL" }
  | { type: "HUB_SWAP_HERO"; outId: string; inId: string }
  | { type: "HUB_CONTINUE" }
  | { type: "USE_CONSUMABLE"; slotIndex: number }
  | { type: "ADD_CONSUMABLE"; kind: ConsumableKind }
  | { type: "REPLACE_CONSUMABLE"; slotIndex: number; kind: ConsumableKind }
  | { type: "DISCARD_PENDING_CONSUMABLE" }
  | { type: "CHOOSE_BOSS_RELIC"; relicId: string }
  // === V3 ===
  | { type: "SET_COMBAT_SPEED"; speed: CombatSpeed }
  | { type: "BOSS_INTRO_DISMISS" }
  // === V5.1 — Phase 4 — Run checkpoint ===
  | { type: "CONTINUE_RUN" }
  | { type: "DISCARD_SAVED_RUN" };

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => void;
    __vt_pending?: Set<unknown>;
    __game_test_skip_roulette?: () => void;
    __game_test_skip_boss_intro?: () => void;
  }
}

const STORAGE_KEY = "runebound-cards-save-v1";
const PLAYER_ATTACK_INTERVAL = 1280;

const ROLE_LABEL: Record<CreatorRole, string> = {
  blade: "Lame",
  mage: "Mage",
  warden: "Gardien",
};

function makeId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function allCharacters(save: SaveData) {
  return [...ROSTER, ...save.customCharacters];
}

function getTemplate(id: string, customCharacters: CharacterTemplate[] = []) {
  return [...ROSTER, ...customCharacters].find((character) => character.id === id);
}

function cleanCustomCharacters(value: unknown): CharacterTemplate[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((character, index) => {
      const raw = character as Partial<CharacterTemplate>;
      const rarity = raw.rarity && RARITY_LABEL[raw.rarity] ? raw.rarity : "common";
      const specialType = raw.special?.type ?? "attack";
      const special: Special = {
        name: String(raw.special?.name || "Rune forgee").slice(0, 28),
        type: specialType === "heal" || specialType === "shield" ? specialType : "attack",
        power: Math.max(6, Math.min(48, Number(raw.special?.power) || 16)),
        cooldown: Math.max(4200, Math.min(9600, Number(raw.special?.cooldown) || 6200)),
      };

      const rawRole = raw.role;
      const role: CreatorRole | undefined =
        rawRole === "blade" || rawRole === "mage" || rawRole === "warden"
          ? rawRole
          : undefined;
      const template: CharacterTemplate = {
        id: String(raw.id || `custom-${index}`),
        name: String(raw.name || "Sans-nom").slice(0, 28),
        rarity,
        maxHp: Math.max(24, Math.min(90, Number(raw.maxHp) || 40)),
        physical: Math.max(1, Math.min(20, Number(raw.physical) || 5)),
        magic: Math.max(1, Math.min(20, Number(raw.magic) || 5)),
        special,
        custom: true,
        role,
      };
      // V5.1 P5 — clamp aux caps de rôle (migration silencieuse).
      return clampCustomTemplate(template);
    })
    .slice(0, 30);
}

function defaultSave(): SaveData {
  return {
    unlockedIds: STARTER_IDS,
    customCharacters: [],
    gold: 0,
    fragments: 0,
    bestFight: 0,
    chestsOpened: 0,
    saveVersion: 4,
    bestStage: 1,
    finalBossDefeats: 0,
    lifetimeLootboxes: 0,
    settings: { combatSpeed: 1 },
    lootboxPity: { sinceLastRare: 0, sinceLastEpic: 0 },
    currentRun: null,
  };
}

function clampSpeed(value: unknown): CombatSpeed {
  if (value === 1.25) return 1.25;
  if (value === 1.5) return 1.5;
  return 1;
}

function normalizeSettings(raw: unknown): Settings {
  if (!raw || typeof raw !== "object") return { combatSpeed: 1 };
  const obj = raw as { combatSpeed?: unknown };
  return { combatSpeed: clampSpeed(obj.combatSpeed) };
}

function normalizeLootboxPity(raw: unknown): LootboxPity {
  if (!raw || typeof raw !== "object") return { sinceLastRare: 0, sinceLastEpic: 0 };
  const obj = raw as { sinceLastRare?: unknown; sinceLastEpic?: unknown };
  const r = Number(obj.sinceLastRare);
  const e = Number(obj.sinceLastEpic);
  return {
    sinceLastRare: Number.isFinite(r) && r >= 0 ? Math.floor(r) : 0,
    sinceLastEpic: Number.isFinite(e) && e >= 0 ? Math.floor(e) : 0,
  };
}

function clampStage(value: unknown): Stage {
  const n = Number(value);
  if (n === 2) return 2;
  if (n === 3) return 3;
  return 1;
}

// === V5.1 — Phase 4 — Validation defensive du snapshot de run sérialisé ===
// On accepte uniquement les structures qui ressemblent à un SerializedRunState.
// Toute incohérence => null (la run est perdue mais le reste de la save reste).
function normalizeCurrentRun(raw: unknown): SerializedRunState | null {
  if (!raw || typeof raw !== "object") return null;
  try {
    const obj = raw as Partial<SerializedRunState> & Record<string, unknown>;
    if (!Array.isArray(obj.team) || obj.team.length === 0) return null;
    if (!Array.isArray(obj.consumables) || obj.consumables.length !== 3) return null;
    if (!Array.isArray(obj.relics)) return null;
    if (!obj.stats || typeof obj.stats !== "object") return null;
    if (!obj.modifier || typeof obj.modifier !== "object") return null;
    const fight = Number(obj.fight);
    const wave = Number(obj.wave);
    const wins = Number(obj.wins);
    const lives = Number(obj.lives);
    if (!Number.isFinite(fight) || fight < 1) return null;
    if (!Number.isFinite(wave) || wave < 1) return null;
    if (!Number.isFinite(wins) || wins < 0) return null;
    if (!Number.isFinite(lives) || lives < 0) return null;
    const resumeScreen = obj.resumeScreen;
    if (
      resumeScreen !== "stage-intro" &&
      resumeScreen !== "hub" &&
      resumeScreen !== "boss-relic-choice"
    ) {
      return null;
    }
    return {
      lives,
      fight,
      stage: clampStage(obj.stage),
      wave,
      wins,
      team: (obj.team as CombatCharacter[]).map((m) => clampCustomCombatant(m)),
      consumables: obj.consumables as ConsumableSlots,
      relics: migrateRelics(obj.relics as RunRelic[]),
      stats: obj.stats as RunStats,
      modifier: obj.modifier as EncounterModifier,
      shopDiscountPercent: Number.isFinite(obj.shopDiscountPercent)
        ? Number(obj.shopDiscountPercent)
        : 0,
      blessingsUsed: Number.isFinite(obj.blessingsUsed) ? Number(obj.blessingsUsed) : 0,
      bossPhase:
        obj.bossPhase === 1 ? 1 : obj.bossPhase === 2 ? 2 : 0,
      bossPhase1Triggered: Boolean(obj.bossPhase1Triggered),
      bossPhase2Triggered: Boolean(obj.bossPhase2Triggered),
      hub: obj.hub && typeof obj.hub === "object" ? (obj.hub as HubState) : null,
      pendingBossRelics:
        obj.pendingBossRelics && typeof obj.pendingBossRelics === "object"
          ? (obj.pendingBossRelics as BossRelicChoice)
          : null,
      stageIntro:
        obj.stageIntro && typeof obj.stageIntro === "object"
          ? { stage: clampStage((obj.stageIntro as { stage?: unknown }).stage) }
          : null,
      resumeScreen,
    };
  } catch {
    return null;
  }
}

function normalizeSave(raw: Partial<SaveData> | null): SaveData {
  const base = defaultSave();
  const customCharacters = cleanCustomCharacters(raw?.customCharacters);
  const unlocked = new Set([
    ...(raw?.unlockedIds ?? []),
    ...STARTER_IDS,
    ...customCharacters.map((character) => character.id),
  ]);
  const rawAny = (raw ?? {}) as Record<string, unknown>;
  // === V5.1 — Phase 4 — currentRun migration ===
  // Saves saveVersion < 4 : pas de champ currentRun à hériter (perte indolore).
  // Saves saveVersion >= 4 : on tente de lire et valider currentRun.
  const incomingVersion = Number(raw?.saveVersion);
  const hasCurrentRunField = incomingVersion >= 4;
  let currentRun: SerializedRunState | null = null;
  if (hasCurrentRunField && rawAny.currentRun !== undefined && rawAny.currentRun !== null) {
    currentRun = normalizeCurrentRun(rawAny.currentRun);
    if (currentRun === null && rawAny.currentRun !== null) {
      // currentRun présent mais corrompu — on log pour faciliter le debug.
      console.warn(
        "[runebound] currentRun présent mais invalide, ignoré (run perdue, save préservée).",
      );
    }
  }
  return {
    unlockedIds: [...unlocked].filter((id) => Boolean(getTemplate(id, customCharacters))),
    customCharacters,
    gold: Number.isFinite(raw?.gold) ? Number(raw?.gold) : base.gold,
    fragments: Number.isFinite(raw?.fragments) ? Number(raw?.fragments) : base.fragments,
    bestFight: Number.isFinite(raw?.bestFight) ? Number(raw?.bestFight) : base.bestFight,
    chestsOpened: Number.isFinite(raw?.chestsOpened)
      ? Number(raw?.chestsOpened)
      : base.chestsOpened,
    saveVersion: 4,
    bestStage: clampStage(raw?.bestStage),
    finalBossDefeats: Number.isFinite(raw?.finalBossDefeats)
      ? Number(raw?.finalBossDefeats)
      : base.finalBossDefeats,
    lifetimeLootboxes: Number.isFinite(raw?.lifetimeLootboxes)
      ? Number(raw?.lifetimeLootboxes)
      : base.lifetimeLootboxes,
    settings: normalizeSettings(rawAny.settings),
    lootboxPity: normalizeLootboxPity(rawAny.lootboxPity),
    currentRun,
  };
}

// V5.1 P5 — Caps par rôle pour la forge custom.
// Rationale : sans cap, un Warden legendary atteint 76 HP > 50 HP de Seraphine
// legendaire native. On verrouille chaque rôle dans une fenêtre cohérente
// (tank tanke, mage spike, blade DPS) sans dépasser les natifs OP.
const ROLE_STAT_CAPS: Record<CreatorRole, { maxHp: number; physical: number; magic: number }> = {
  blade: { maxHp: 60, physical: 16, magic: 4 },
  mage: { maxHp: 48, physical: 4, magic: 18 },
  warden: { maxHp: 65, physical: 8, magic: 8 },
};

function createCustomCharacter(draft: CreatorDraft): CharacterTemplate {
  const roleStats: Record<CreatorRole, { maxHp: number; physical: number; magic: number }> = {
    blade: { maxHp: 42, physical: 9, magic: 2 },
    mage: { maxHp: 34, physical: 2, magic: 10 },
    warden: { maxHp: 56, physical: 5, magic: 4 },
  };
  const rarityBonus: Record<Rarity, { hp: number; attack: number; special: number }> = {
    common: { hp: 0, attack: 0, special: 0 },
    rare: { hp: 6, attack: 1, special: 5 },
    epic: { hp: 12, attack: 2, special: 10 },
    legendary: { hp: 20, attack: 4, special: 18 },
  };
  const specialName: Record<SpecialType, string> = {
    attack: "Rune d'assaut",
    heal: "Rune de soin",
    shield: "Rune de garde",
  };
  const specialBase: Record<SpecialType, number> = {
    attack: 18,
    heal: 18,
    shield: 10,
  };
  const base = roleStats[draft.role];
  const bonus = rarityBonus[draft.rarity];
  const name = draft.name.trim().slice(0, 28) || "Sans-nom";
  const cap = ROLE_STAT_CAPS[draft.role];

  return {
    id: makeId("custom"),
    name,
    rarity: draft.rarity,
    maxHp: Math.min(cap.maxHp, base.maxHp + bonus.hp),
    physical: Math.min(cap.physical, base.physical + bonus.attack),
    magic: Math.min(cap.magic, base.magic + bonus.attack),
    special: {
      name: specialName[draft.specialType],
      type: draft.specialType,
      power: specialBase[draft.specialType] + bonus.special,
      cooldown: draft.rarity === "legendary" ? 7600 : draft.rarity === "epic" ? 7000 : 6200,
    },
    custom: true,
    role: draft.role,
  };
}

// V5.1 P5 — Heuristique : déduit un rôle depuis les stats (custom legacy sans champ role).
function inferCreatorRole(template: { physical: number; magic: number; maxHp: number }): CreatorRole {
  if (template.physical >= template.magic + 3) return "blade";
  if (template.magic >= template.physical + 3) return "mage";
  return "warden";
}

// V5.1 P5 — Clampe un CharacterTemplate custom aux caps de son rôle.
function clampCustomTemplate(template: CharacterTemplate): CharacterTemplate {
  if (!template.custom) return template;
  const role: CreatorRole = template.role ?? inferCreatorRole(template);
  const cap = ROLE_STAT_CAPS[role];
  const maxHp = Math.min(template.maxHp, cap.maxHp);
  const physical = Math.min(template.physical, cap.physical);
  const magic = Math.min(template.magic, cap.magic);
  if (
    maxHp === template.maxHp &&
    physical === template.physical &&
    magic === template.magic &&
    template.role === role
  ) {
    return template;
  }
  return { ...template, maxHp, physical, magic, role };
}

// V5.1 P5 — Clampe un CombatCharacter (run en cours) aux caps de rôle (legacy save).
function clampCustomCombatant(member: CombatCharacter): CombatCharacter {
  if (!member.custom) return member;
  const clamped = clampCustomTemplate(member);
  if (clamped === member) return member;
  return {
    ...member,
    maxHp: clamped.maxHp,
    physical: clamped.physical,
    magic: clamped.magic,
    role: clamped.role,
    hp: Math.min(member.hp, clamped.maxHp),
  };
}

// V5.1 P5 — Migre les reliques OP des saves anciennes :
// - reviveAllOnDefeatOnce → reviveSingleOnKO (50%) en préservant le flag `used`.
// - permanentAllStatsPercent : conservé en lecture (l'effet a déjà été appliqué
//   au team buffé au moment du choix, donc ne pas re-buffer ici). On ne strip
//   pas le champ pour préserver l'identité de la relique.
function migrateRelics(relics: RunRelic[] | undefined): RunRelic[] {
  if (!Array.isArray(relics)) return [];
  return relics.map((r) => {
    if (r.reviveAllOnDefeatOnce && !r.reviveSingleOnKO) {
      const used = Boolean(r.reviveAllOnDefeatOnce.used);
      const { reviveAllOnDefeatOnce: _drop, ...rest } = r;
      void _drop;
      return {
        ...rest,
        reviveSingleOnKO: { hpPercent: 50, used },
      };
    }
    return r;
  });
}

// === V5.1 — Phase 4 — Détection de corruption au chargement ===
// Drapeau global pour la bannière du menu (T18). Reset à chaque loadSave().
let __saveCorruptionDetected = false;
function loadSave(): SaveData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      __saveCorruptionDetected = false;
      return normalizeSave(null);
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(stored);
    } catch (parseErr) {
      console.warn("[runebound] Save corrompue (JSON parse failed) — defaultSave fallback.", parseErr);
      __saveCorruptionDetected = true;
      return defaultSave();
    }
    __saveCorruptionDetected = false;
    return normalizeSave(parsed as Partial<SaveData> | null);
  } catch (err) {
    console.warn("[runebound] Save corrompue (exception inattendue) — defaultSave fallback.", err);
    __saveCorruptionDetected = true;
    return defaultSave();
  }
}

function createCombatant(template: CharacterTemplate): CombatCharacter {
  return {
    ...template,
    hp: template.maxHp,
    shield: 0,
    attackTimer: Math.random() * 520,
    specialCd: 0,
    cooldownMod: 1,
  };
}




const RECYCLE_REFUND: Record<Rarity, { fragments: number; gold: number }> = {
  common: { fragments: 5, gold: 10 },
  rare: { fragments: 6, gold: 25 },
  epic: { fragments: 17, gold: 60 },
  legendary: { fragments: 42, gold: 120 },
};


function pickBossRelics(pool: Omit<RunRelic, "id">[], n: number): RunRelic[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length)).map((r) => ({
    ...r,
    id: makeId("relic"),
  }));
}

// Applique les effets per-combat des reliques (au debut d'un combat) :
// - startingShieldBonus -> bouclier de depart sur l'equipe vivante
// - firstSkillFreeEachCombat -> reset specialCd a 0 pour 1 personnage
// On ajoute aussi nextFightShield (existant) sur la meme passe.
// V5.1 T24 — émet aussi des RelicTriggerEvent pour chaque relique active afin
// de signaler visuellement leur déclenchement au start of combat.
function applyStartOfCombatRelics(
  team: CombatCharacter[],
  relics: RunRelic[],
): { team: CombatCharacter[]; triggers: RelicTriggerEvent[] } {
  let next = team;
  const triggers: RelicTriggerEvent[] = [];
  let totalShield = 0;
  for (const r of relics) {
    if (r.startingShieldBonus) totalShield += r.startingShieldBonus;
    if (r.nextFightShield) totalShield += r.nextFightShield;
  }
  if (totalShield > 0) {
    next = next.map((m) => (m.hp > 0 ? { ...m, shield: m.shield + totalShield } : m));
    const sourceRelic =
      relics.find((r) => r.startingShieldBonus) ??
      relics.find((r) => r.nextFightShield);
    if (sourceRelic) {
      triggers.push({
        id: makeId("relic-fx"),
        relicId: sourceRelic.id,
        relicName: sourceRelic.name,
        message: `${sourceRelic.name} : +${totalShield} BCL équipe`,
        ttlMs: RELIC_TRIGGER_TTL_MS,
      });
    }
  }
  const freeSkillRelic = relics.find((r) => r.firstSkillFreeEachCombat);
  if (freeSkillRelic && next.length > 0) {
    // On reset le cooldown du premier perso vivant
    let targetId: string | undefined;
    let done = false;
    next = next.map((m) => {
      if (!done && m.hp > 0) {
        done = true;
        targetId = m.id;
        return { ...m, specialCd: 0 };
      }
      return m;
    });
    if (targetId) {
      triggers.push({
        id: makeId("relic-fx"),
        relicId: freeSkillRelic.id,
        relicName: freeSkillRelic.name,
        message: `${freeSkillRelic.name} : skill prête`,
        targetCharId: targetId,
        ttlMs: RELIC_TRIGGER_TTL_MS,
      });
    }
  }
  // Reliques passives "permanentes" : on les annonce une fois par combat
  // pour que le joueur sache qu'elles s'appliquent (pas d'effet mécanique ici).
  for (const r of relics) {
    if (r.permanentMagicPercent && r.permanentMagicPercent > 0) {
      triggers.push({
        id: makeId("relic-fx"),
        relicId: r.id,
        relicName: r.name,
        message: `${r.name} active : +${r.permanentMagicPercent}% magie`,
        ttlMs: RELIC_TRIGGER_TTL_MS,
      });
    }
    if (r.permanentPhysicalPercent && r.permanentPhysicalPercent > 0) {
      triggers.push({
        id: makeId("relic-fx"),
        relicId: r.id,
        relicName: r.name,
        message: `${r.name} active : +${r.permanentPhysicalPercent}% phys.`,
        ttlMs: RELIC_TRIGGER_TTL_MS,
      });
    }
    if (r.combatGoldPercent && r.combatGoldPercent > 0) {
      triggers.push({
        id: makeId("relic-fx"),
        relicId: r.id,
        relicName: r.name,
        message: `${r.name} active : +${r.combatGoldPercent}% or`,
        ttlMs: RELIC_TRIGGER_TTL_MS,
      });
    }
    if (r.regenPerEnemyTurn && r.regenPerEnemyTurn > 0) {
      triggers.push({
        id: makeId("relic-fx"),
        relicId: r.id,
        relicName: r.name,
        message: `${r.name} active : +${r.regenPerEnemyTurn} PV/tour`,
        ttlMs: RELIC_TRIGGER_TTL_MS,
      });
    }
  }
  return { team: next, triggers };
}

function applyBossRelicEffect(run: RunState, relic: RunRelic): RunState {
  let team = run.team;
  if (relic.permanentMaxHpPercent && relic.permanentMaxHpPercent > 0) {
    const pct = relic.permanentMaxHpPercent / 100;
    team = team.map((m) => {
      const bonus = Math.max(1, Math.round(m.maxHp * pct));
      return {
        ...m,
        maxHp: m.maxHp + bonus,
        hp: m.hp > 0 ? m.hp + bonus : m.hp,
      };
    });
  }
  if (relic.permanentMagicPercent && relic.permanentMagicPercent > 0) {
    const pct = relic.permanentMagicPercent / 100;
    team = team.map((m) => ({
      ...m,
      magic: Math.max(1, Math.round(m.magic * (1 + pct))),
    }));
  }
  if (relic.permanentPhysicalPercent && relic.permanentPhysicalPercent > 0) {
    const pct = relic.permanentPhysicalPercent / 100;
    team = team.map((m) => ({
      ...m,
      physical: Math.max(1, Math.round(m.physical * (1 + pct))),
    }));
  }
  if (relic.permanentAllStatsPercent && relic.permanentAllStatsPercent > 0) {
    const pct = relic.permanentAllStatsPercent / 100;
    team = team.map((m) => {
      const hpBonus = Math.max(1, Math.round(m.maxHp * pct));
      return {
        ...m,
        maxHp: m.maxHp + hpBonus,
        hp: m.hp > 0 ? m.hp + hpBonus : m.hp,
        physical: Math.max(1, Math.round(m.physical * (1 + pct))),
        magic: Math.max(1, Math.round(m.magic * (1 + pct))),
      };
    });
  }
  return { ...run, team };
}

function computeRecycleRefund(rarity: Rarity): { fragments: number; gold: number } {
  return RECYCLE_REFUND[rarity];
}

// === V3 — Pity helpers ===
function applyPityToWeights(
  weights: LootBoxWeights,
  pity: LootboxPity,
): LootBoxWeights {
  // Bumps en points absolus sur la table de poids existante.
  // Rare : +5 pts à 5, +10 pts à 8. Epic : +5 pts à 12.
  let rareBump = 0;
  let epicBump = 0;
  if (pity.sinceLastRare >= 8) rareBump = 10;
  else if (pity.sinceLastRare >= 5) rareBump = 5;
  if (pity.sinceLastEpic >= 12) epicBump = 5;

  // On retire des fragments en compensation pour ne pas booster le total au-delà du raisonnable.
  const compensationRare = Math.min(weights.fragments, rareBump);
  const compensationEpic = Math.min(
    Math.max(0, weights.fragments - compensationRare),
    epicBump,
  );

  return {
    fragments: weights.fragments - compensationRare - compensationEpic,
    gold: weights.gold,
    common: weights.common,
    rare: weights.rare + rareBump,
    epic: weights.epic + epicBump,
    legendary: weights.legendary,
  };
}

function nextPityAfterDraw(
  pity: LootboxPity,
  result: LootBoxResult,
): LootboxPity {
  // Reset si on a tiré du rare+ (character or fragments-converted from rare+)
  let drewRarePlus = false;
  let drewEpicPlus = false;
  if (result.kind === "character") {
    drewRarePlus = result.rarity === "rare" || result.rarity === "epic" || result.rarity === "legendary";
    drewEpicPlus = result.rarity === "epic" || result.rarity === "legendary";
  } else if (result.kind === "fragments-converted") {
    // Un duplicata d'un rare+ compte aussi comme draw rare+.
    // On ne connaît pas la rareté ici par sécurité — on considère que c'est rare+ (cas rare).
    drewRarePlus = true;
  }
  return {
    sinceLastRare: drewRarePlus ? 0 : pity.sinceLastRare + 1,
    sinceLastEpic: drewEpicPlus ? 0 : pity.sinceLastEpic + 1,
  };
}

function rollLootbox(
  tier: LootBoxTier,
  unlockedIds: string[],
  customCharacters: CharacterTemplate[],
  pity: LootboxPity = { sinceLastRare: 0, sinceLastEpic: 0 },
): LootBoxResult {
  const weights = applyPityToWeights(LOOTBOX_TABLES[tier], pity);
  const total =
    weights.fragments + weights.gold + weights.common + weights.rare + weights.epic + weights.legendary;
  let roll = Math.random() * total;

  if ((roll -= weights.fragments) < 0) {
    const base =
      tier === "small" ? 8 : tier === "rare" ? 18 : tier === "epic" ? 32 : 28;
    const amount = base + Math.floor(Math.random() * Math.max(4, Math.round(base * 0.4)));
    return { kind: "fragments", amount };
  }
  if ((roll -= weights.gold) < 0) {
    const base =
      tier === "small" ? 25 : tier === "rare" ? 60 : tier === "epic" ? 130 : 100;
    const amount = base + Math.floor(Math.random() * Math.max(6, Math.round(base * 0.4)));
    return { kind: "gold", amount };
  }

  const targetRarity: Rarity =
    (roll -= weights.common) < 0
      ? "common"
      : (roll -= weights.rare) < 0
        ? "rare"
        : (roll -= weights.epic) < 0
          ? "epic"
          : "legendary";

  const allTemplates = [...ROSTER, ...customCharacters];
  const candidates = allTemplates.filter((c) => c.rarity === targetRarity);
  if (candidates.length === 0) {
    return { kind: "fragments", amount: 12 };
  }
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  if (unlockedIds.includes(pick.id)) {
    const conv = Math.max(4, Math.round(CREATION_COST[targetRarity] / 2));
    return { kind: "fragments-converted", amount: conv, from: pick.name };
  }
  return { kind: "character", characterId: pick.id, rarity: targetRarity };
}

function pickShopItems(stage: Stage): ShopItem[] {
  const pool = SHOP_POOLS[stage];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(5, shuffled.length)).map((it) => ({
    ...it,
    id: makeId("shop"),
  }));
}

function computeChestTier(state: GameState): ChestTier {
  const run = state.run;
  if (!run) return "damaged";
  const bosses = run.stats.bossesDefeated;
  if (run.fight >= 30 && bosses >= 3) {
    if (run.lives >= 2 && run.blessingsUsed === 0) return "runic";
    return "royal";
  }
  if (bosses >= 2) return "silver";
  if (bosses >= 1) return "bronze";
  return "damaged";
}

function createEncounterModifier(fight: number): EncounterModifier {
  if (fight % 10 === 0) {
    return {
      kind: "boss",
      label: "Portail du boss",
      detail: "La salle tremble. L'ennemi est renforce.",
      enemyAttackMod: 1.08,
      enemyHpMod: 1.12,
      playerAttackMod: 1,
      cooldownTickMod: 1,
    };
  }

  return MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
}

function pickEnemyIntent(boss: boolean): EnemyIntent {
  const pool = boss ? INTENTS : INTENTS.filter((intent) => intent.kind !== "heavy" || Math.random() > 0.28);
  return pool[Math.floor(Math.random() * pool.length)];
}

function intentInterval(baseInterval: number, intent: EnemyIntent) {
  return Math.max(820, Math.round(baseInterval * intent.intervalMod));
}

function createEnemy(fight: number, modifier: EncounterModifier): Enemy {
  const boss = fight % 10 === 0;
  const stage = stageFromFight(fight);
  const config = STAGE_CONFIGS[stage];
  let name: string;
  let trait: string;
  let traitDetail: string;
  if (boss) {
    name = config.bossName;
    trait = config.bossTrait;
    traitDetail = config.bossDetail;
  } else {
    const pool = config.enemyPool;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    name = pick.name;
    trait = pick.trait;
    traitDetail = pick.traitDetail;
  }
  const hpBase = 42 + fight * 7;
  const attackBase = 6 + Math.floor(fight * 1.25);
  let intent = pickEnemyIntent(boss);
  let baseInterval = boss ? 1350 : 1650;
  let maxHp = Math.round((boss ? hpBase * 2.25 : hpBase) * modifier.enemyHpMod);
  let attack = Math.round((boss ? attackBase * 1.55 : attackBase) * modifier.enemyAttackMod);
  let startingShield = modifier.kind === "thorns" ? Math.max(4, Math.round(attack * 0.9)) : 0;

  if (boss) {
    if (stage === 1) {
      attack = Math.round(attack * 1.05);
      intent = INTENTS.find((i) => i.kind === "heavy") ?? intent;
    } else if (stage === 2) {
      startingShield += 14;
      maxHp = Math.round(maxHp * 1.05);
      intent = INTENTS.find((i) => i.kind === "hex") ?? intent;
    } else if (stage === 3) {
      baseInterval = 1100;
      attack = Math.round(attack * 1.1);
    }
  }

  return {
    id: makeId("enemy"),
    name,
    trait,
    traitDetail,
    maxHp,
    hp: maxHp,
    shield: startingShield,
    attack,
    attackTimer: 350,
    attackInterval: intentInterval(baseInterval, intent),
    baseInterval,
    intent,
    boss,
    mascot: mapEnemyNameToVariant(name, boss, stage),
  };
}

function createRewardOptions(run?: RunState): RewardOption[] {
  // V2 enrichi : on garde le pool stat existant et on injecte de l'or, fragments,
  // mini-soin et mini-lootbox quand le contexte le permet.
  const extras: Omit<RewardOption, "id">[] = [
    { type: "heal", title: "Repos bref", detail: "Rend 35% des PV max" },
    { type: "shield", title: "Cercle d'os", detail: "+8 bouclier au prochain combat" },
  ];
  const baseSorted = [...REWARD_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
  // Pour les boss, on remplace une option par un "Cercle d'os" si pas deja la.
  const finalPool = baseSorted;
  if (run && run.enemy && run.enemy.boss) {
    const has = finalPool.some((r) => r.type === "shield");
    if (!has) finalPool[0] = extras[1];
  }
  return finalPool.map((reward) => ({ ...reward, id: makeId("reward") }));
}

function createRunStats(): RunStats {
  return {
    damageDealt: 0,
    damageTaken: 0,
    healingDone: 0,
    shieldGiven: 0,
    shieldBlocked: 0,
    skillsUsed: 0,
    enemiesDefeated: 0,
    bossesDefeated: 0,
    livesLost: 0,
  };
}

function initialState(): GameState {
  const save = loadSave();
  return {
    screen: "menu",
    save,
    selectedIds: save.unlockedIds.slice(0, 3),
    run: null,
    rewardOptions: [],
    chest: null,
    flashes: [],
    notice: "",
    hub: null,
    stageIntro: null,
    pendingLootbox: null,
    pendingRecycle: null,
    pendingConsumable: null,
    pendingBossRelics: null,
  };
}

function hpRatio(current: number, max: number) {
  return Math.max(0, Math.min(100, (current / max) * 100));
}

function aliveTeam(team: CombatCharacter[]) {
  return team.filter((member) => member.hp > 0);
}

function addLog(log: string[], entry: string) {
  return [entry, ...log].slice(0, 6);
}

function reviveTeam(team: CombatCharacter[]) {
  return team.map((member) => ({
    ...member,
    hp: member.maxHp,
    shield: 0,
    attackTimer: Math.random() * 400,
    specialCd: Math.min(member.specialCd, 1200),
  }));
}

function addFlash(
  flashes: FlashEvent[],
  kind: FlashEvent["kind"],
  x: number,
  y: number,
  label?: string,
) {
  return [...flashes, { id: makeId("fx"), kind, x, y, age: 0, label }].slice(-22);
}

function ageFlashes(flashes: FlashEvent[], delta: number) {
  return flashes
    .map((flash) => ({ ...flash, age: flash.age + delta }))
    .filter((flash) => flash.age < 720);
}

// === V3 — animQueue helpers ===
const ANIM_QUEUE_CAP = 12;

function pushAnim(queue: CombatAnimEvent[], event: CombatAnimEvent): CombatAnimEvent[] {
  const next = [...queue, event];
  if (next.length > ANIM_QUEUE_CAP) {
    return next.slice(next.length - ANIM_QUEUE_CAP);
  }
  return next;
}

function ageAnimQueue(queue: CombatAnimEvent[], delta: number): CombatAnimEvent[] {
  // Les events portent leur createdAt côté wall-clock (Date.now()) — on filtre par âge.
  // Mais pour rester déterministe avec advanceTime, on accepte aussi un decrément basé sur ttlMs.
  // Approche : on diminue ttlMs de delta et on filtre quand <= 0.
  return queue
    .map((ev) => ({ ...ev, ttlMs: ev.ttlMs - delta }))
    .filter((ev) => ev.ttlMs > 0);
}

// === V5.1 T24 — Relic trigger helpers ===
const RELIC_TRIGGER_TTL_MS = 1500;
const RELIC_TRIGGER_CAP = 6;

function pushRelicTrigger(
  triggers: RelicTriggerEvent[],
  trigger: Omit<RelicTriggerEvent, "id" | "ttlMs"> & { ttlMs?: number },
): RelicTriggerEvent[] {
  const next = [
    ...triggers,
    {
      id: makeId("relic-fx"),
      ttlMs: trigger.ttlMs ?? RELIC_TRIGGER_TTL_MS,
      relicId: trigger.relicId,
      relicName: trigger.relicName,
      message: trigger.message,
      targetCharId: trigger.targetCharId,
    },
  ];
  if (next.length > RELIC_TRIGGER_CAP) {
    return next.slice(next.length - RELIC_TRIGGER_CAP);
  }
  return next;
}

function ageRelicTriggers(
  triggers: RelicTriggerEvent[],
  delta: number,
): RelicTriggerEvent[] {
  return triggers
    .map((t) => ({ ...t, ttlMs: t.ttlMs - delta }))
    .filter((t) => t.ttlMs > 0);
}

// Variantes pour appel direct dans advanceCombat / useSpecial.
function animAttackStarted(sourceId: string, isSpecial = false): CombatAnimEvent {
  return { id: makeId("anim"), kind: "attack-started", sourceId, isSpecial, createdAt: Date.now(), ttlMs: 320 };
}
function animProjectile(sourceId: string, targetId: string, trajectory: AnimTrajectory, isSpecial = false): CombatAnimEvent {
  return { id: makeId("anim"), kind: "projectile", sourceId, targetId, trajectory, isSpecial, createdAt: Date.now(), ttlMs: 600 };
}
function animTargetHit(targetId: string, isAlly: boolean): CombatAnimEvent {
  return { id: makeId("anim"), kind: "target-hit", targetId, isAlly, createdAt: Date.now(), ttlMs: 240 };
}
function animDamageNumber(targetId: string, isAlly: boolean, amount: number, variant: FloatingNumberVariant): CombatAnimEvent {
  return { id: makeId("anim"), kind: "damage-number", targetId, isAlly, amount, variant, createdAt: Date.now(), ttlMs: 800 };
}
function animHealNumber(targetId: string, isAlly: boolean, amount: number): CombatAnimEvent {
  return { id: makeId("anim"), kind: "heal-number", targetId, isAlly, amount, createdAt: Date.now(), ttlMs: 800 };
}
function animShieldNumber(targetId: string, isAlly: boolean, amount: number): CombatAnimEvent {
  return { id: makeId("anim"), kind: "shield-number", targetId, isAlly, amount, createdAt: Date.now(), ttlMs: 800 };
}
function animBossPhase(phase: 1 | 2): CombatAnimEvent {
  return { id: makeId("anim"), kind: "boss-phase", phase, createdAt: Date.now(), ttlMs: 1000 };
}

function basicDamage(member: CombatCharacter) {
  return Math.max(1, Math.round(member.physical + member.magic * 0.55));
}

function damageEnemy(enemy: Enemy, damage: number) {
  const shieldDamage = Math.min(enemy.shield, damage);
  const hpDamage = Math.min(enemy.hp, damage - shieldDamage);
  return {
    enemy: {
      ...enemy,
      shield: enemy.shield - shieldDamage,
      hp: Math.max(0, enemy.hp - hpDamage),
    },
    hpDamage,
    shieldDamage,
  };
}

// === V5.1 — Phase 4 — Sérialisation du run pour checkpoint ===
// Extrait les champs sûrs et stables. Ne touche pas aux champs volatiles
// (animQueue, bossIntroAt, log) ni à l'enemy (regénérée au prochain combat).
function serializeRun(
  run: RunState,
  resumeScreen: ResumeScreen,
  hub: HubState | null,
  pendingBossRelics: BossRelicChoice | null,
  stageIntro: { stage: Stage } | null,
): SerializedRunState {
  return {
    lives: run.lives,
    fight: run.fight,
    stage: run.stage,
    wave: run.wave,
    wins: run.wins,
    // Reset attackTimer et specialCd partiellement pour ne pas reprendre
    // mid-cooldown sur un timing arbitraire — les cooldowns spéciaux sont
    // préservés (gameplay), les attackTimer sont relus à 0.
    team: run.team.map((m) => ({ ...m, attackTimer: 0 })),
    consumables: run.consumables,
    relics: run.relics,
    stats: run.stats,
    modifier: run.modifier,
    shopDiscountPercent: run.shopDiscountPercent,
    blessingsUsed: run.blessingsUsed,
    bossPhase: run.bossPhase,
    bossPhase1Triggered: run.bossPhase1Triggered,
    bossPhase2Triggered: run.bossPhase2Triggered,
    hub,
    pendingBossRelics,
    stageIntro,
    resumeScreen,
  };
}

// === V5.1 — Phase 4 — Reconstruction d'un RunState complet depuis un snapshot ===
// L'enemy est regénéré (volatile, pas sauvegardé). animQueue/bossIntroAt
// repartent à zéro. Les attackTimer ont été reset à la sérialisation.
function rehydrateRun(snap: SerializedRunState): RunState {
  const enemy = createEnemy(snap.fight, snap.modifier);
  return {
    lives: snap.lives,
    fight: snap.fight,
    stage: snap.stage,
    wave: snap.wave,
    wins: snap.wins,
    team: snap.team.map((m) => ({ ...m, attackTimer: 0 })),
    enemy,
    modifier: snap.modifier,
    stats: snap.stats,
    log: ["Run reprise."],
    consumables: snap.consumables,
    relics: snap.relics,
    shopDiscountPercent: snap.shopDiscountPercent,
    blessingsUsed: snap.blessingsUsed,
    animQueue: [],
    bossIntroAt: null,
    bossPhase: snap.bossPhase,
    bossPhase1Triggered: snap.bossPhase1Triggered,
    bossPhase2Triggered: snap.bossPhase2Triggered,
    relicTriggers: [],
  };
}

function finishRun(state: GameState, run: RunState, flashes: FlashEvent[]): GameState {
  const finalState: GameState = {
    ...state,
    run: { ...run, lives: 0, log: addLog(run.log, "La run s'eteint.") },
  };
  const tier = computeChestTier(finalState);
  const finalBossDefeats =
    tier === "royal" || tier === "runic"
      ? state.save.finalBossDefeats + 1
      : state.save.finalBossDefeats;
  return {
    ...finalState,
    screen: "gameover",
    rewardOptions: [],
    chest: { opened: false, tier },
    flashes,
    save: {
      ...state.save,
      bestFight: Math.max(state.save.bestFight, run.wins),
      bestStage: clampStage(Math.max(state.save.bestStage, run.stage)),
      finalBossDefeats,
      // V5.1 P4 — fin de run = clear du checkpoint.
      currentRun: null,
    },
    hub: null,
    stageIntro: null,
    pendingLootbox: null,
    pendingRecycle: null,
    pendingConsumable: null,
    pendingBossRelics: null,
    notice: "Run terminee",
  };
}

function handleVictory(state: GameState, run: RunState, flashes: FlashEvent[]): GameState {
  const victoryLine = run.enemy.boss
    ? `Boss vaincu au combat ${run.fight}.`
    : `Victoire au combat ${run.fight}.`;
  const nextRun = {
    ...run,
    wins: run.fight,
    enemy: { ...run.enemy, hp: 0 },
    stats: {
      ...run.stats,
      enemiesDefeated: run.stats.enemiesDefeated + 1,
      bossesDefeated: run.stats.bossesDefeated + (run.enemy.boss ? 1 : 0),
    },
    log: addLog(run.log, victoryLine),
  };
  return {
    ...state,
    screen: "reward",
    run: nextRun,
    rewardOptions: createRewardOptions(nextRun),
    flashes,
    save: {
      ...state.save,
      bestFight: Math.max(state.save.bestFight, run.fight),
      bestStage: clampStage(Math.max(state.save.bestStage, run.stage)),
    },
    notice: victoryLine,
  };
}

function resolveTeamDefeat(state: GameState, run: RunState, flashes: FlashEvent[]): GameState {
  // V5.1 P5 — Sceau d'aube eternelle (nouveau) : ressuscite a 50% au premier KO,
  // donc ce hook ne devrait quasi jamais voir une relique encore "non used" ici.
  // On garde une compat rétroactive pour les saves anciennes (relique présente
  // mais wipe complet si hook KO non triggé en pratique impossible) — fallback :
  // ressusciter le premier membre KO à 50% PV.
  const reviveIdx = run.relics.findIndex(
    (r) => r.reviveSingleOnKO && !r.reviveSingleOnKO.used,
  );
  if (reviveIdx >= 0) {
    const reliccfg = run.relics[reviveIdx].reviveSingleOnKO;
    const pct = reliccfg ? reliccfg.hpPercent : 50;
    const targetIdx = run.team.findIndex((m) => m.hp <= 0);
    if (targetIdx >= 0) {
      const target = run.team[targetIdx];
      const restoredHp = Math.max(1, Math.floor((target.maxHp * pct) / 100));
      const updatedTeam = run.team.map((m, i) =>
        i === targetIdx ? { ...m, hp: restoredHp, shield: 0 } : m,
      );
      const reviveRelic = run.relics[reviveIdx];
      const updatedRelics = run.relics.map((r, i) =>
        i === reviveIdx && r.reviveSingleOnKO
          ? { ...r, reviveSingleOnKO: { ...r.reviveSingleOnKO, used: true } }
          : r,
      );
      return {
        ...state,
        run: {
          ...run,
          team: updatedTeam,
          relics: updatedRelics,
          log: addLog(run.log, `Sceau d'aube ressuscite ${target.name} a ${pct}%.`),
          // V5.1 T24 — pulse sur le héros ressuscité (fallback wipe).
          relicTriggers: pushRelicTrigger(run.relicTriggers, {
            relicId: reviveRelic.id,
            relicName: reviveRelic.name,
            message: `${reviveRelic.name} : ${target.name} ressuscité à ${pct}%`,
            targetCharId: target.id,
            ttlMs: 2200,
          }),
        },
        flashes: addFlash(flashes, "heal", 26, 49, "Aube"),
        notice: "Sceau de l'aube eternelle declenche.",
      };
    }
  }

  if (run.lives <= 1) {
    return finishRun(
      state,
      { ...run, stats: { ...run.stats, livesLost: run.stats.livesLost + 1 } },
      flashes,
    );
  }

  // Shield-on-life-lost relique (Pacte de ronces)
  const shieldOnLifeLost = run.relics.reduce(
    (acc, r) => acc + (r.shieldOnLifeLost ?? 0),
    0,
  );
  const shieldRelic = run.relics.find(
    (r) => r.shieldOnLifeLost && r.shieldOnLifeLost > 0,
  );
  const reviveTeamMembers = reviveTeam(run.team).map((m) =>
    shieldOnLifeLost > 0 ? { ...m, shield: m.shield + shieldOnLifeLost } : m,
  );
  // V5.1 T24 — feedback pour Pacte de ronces.
  const nextTriggers =
    shieldRelic && shieldOnLifeLost > 0
      ? pushRelicTrigger(run.relicTriggers, {
          relicId: shieldRelic.id,
          relicName: shieldRelic.name,
          message: `${shieldRelic.name} : +${shieldOnLifeLost} BCL équipe`,
        })
      : run.relicTriggers;
  const nextRun = {
    ...run,
    lives: run.lives - 1,
    team: reviveTeamMembers,
    modifier: createEncounterModifier(run.fight),
    stats: { ...run.stats, livesLost: run.stats.livesLost + 1 },
    log: addLog(run.log, "Une vie globale se consume. L'equipe se releve."),
    relicTriggers: nextTriggers,
  };
  const rebuiltRun = {
    ...nextRun,
    enemy: createEnemy(run.fight, nextRun.modifier),
  };

  return {
    ...state,
    run: rebuiltRun,
    flashes: addFlash(flashes, "shield", 26, 49),
    notice: `Vie globale perdue. ${rebuiltRun.lives} restantes.`,
  };
}

function advanceCombat(state: GameState, delta: number): GameState {
  if (state.screen !== "combat" || !state.run) {
    return { ...state, flashes: ageFlashes(state.flashes, delta) };
  }

  // === V3 — Boss intro guard : on ne tick pas le combat pendant l'intro,
  // mais on âge les flashes et la queue d'anims pour ne pas geler le rendu.
  if (state.run.bossIntroAt !== null) {
    const elapsed = Date.now() - state.run.bossIntroAt;
    if (elapsed < 1600) {
      return {
        ...state,
        flashes: ageFlashes(state.flashes, delta),
        run: {
          ...state.run,
          animQueue: ageAnimQueue(state.run.animQueue, delta),
          relicTriggers: ageRelicTriggers(state.run.relicTriggers, delta),
        },
      };
    }
    // Sinon on consomme l'intro et on continue le tick normal ce frame-ci.
    return advanceCombat(
      { ...state, run: { ...state.run, bossIntroAt: null } },
      delta,
    );
  }

  const speed = state.save.settings.combatSpeed;
  // Le delta logique de combat est scaled par la vitesse ; les timers internes vont plus vite.
  const scaledDelta = delta * speed;
  let flashes = ageFlashes(state.flashes, delta);
  let animQueue = ageAnimQueue(state.run.animQueue, delta);
  let relicTriggers = ageRelicTriggers(state.run.relicTriggers, delta);
  let enemy = { ...state.run.enemy };
  let team = state.run.team.map((member) => ({
    ...member,
    attackTimer: member.hp > 0 ? member.attackTimer + scaledDelta : member.attackTimer,
    specialCd: Math.max(0, member.specialCd - scaledDelta * state.run!.modifier.cooldownTickMod),
  }));
  let log = state.run.log;
  let stats = { ...state.run.stats };
  const playerAttackInterval = Math.round(PLAYER_ATTACK_INTERVAL * state.run.modifier.playerAttackMod);

  // Bonus de degats contre boss (relique Couronne fissuree)
  const bossDmgPct = enemy.boss
    ? state.run.relics.reduce(
        (acc, r) => acc + (r.nextFightBossDamageBonus ?? 0),
        0,
      )
    : 0;
  const bossDmgMul = 1 + bossDmgPct;

  for (let i = 0; i < team.length; i += 1) {
    const member = team[i];
    while (member.hp > 0 && member.attackTimer >= playerAttackInterval && enemy.hp > 0) {
      member.attackTimer -= playerAttackInterval;
      const damage = Math.max(
        1,
        Math.round(basicDamage(member) * bossDmgMul),
      );
      const result = damageEnemy(enemy, damage);
      enemy = result.enemy;
      stats = { ...stats, damageDealt: stats.damageDealt + result.hpDamage };
      const isMagic = member.magic > member.physical;
      flashes = addFlash(
        flashes,
        isMagic ? "magic" : "hit",
        76,
        40 + i * 9,
        result.hpDamage > 0 ? `-${result.hpDamage}` : `BCL -${result.shieldDamage}`,
      );
      // === V3 anim events ===
      animQueue = pushAnim(animQueue, animAttackStarted(member.id, false));
      animQueue = pushAnim(animQueue, animProjectile(member.id, enemy.id, isMagic ? "magic" : "physical", false));
      animQueue = pushAnim(animQueue, animTargetHit(enemy.id, false));
      if (result.hpDamage > 0) {
        animQueue = pushAnim(animQueue, animDamageNumber(enemy.id, false, result.hpDamage, isMagic ? "damage-magic" : "damage-physical"));
      } else if (result.shieldDamage > 0) {
        animQueue = pushAnim(animQueue, animShieldNumber(enemy.id, false, result.shieldDamage));
      }
      log = addLog(log, `${member.name} inflige ${damage}.`);
    }
  }

  // === V3 — boss phase thresholds ===
  let bossPhase: 0 | 1 | 2 = state.run.bossPhase;
  let bossPhase1Triggered = state.run.bossPhase1Triggered;
  let bossPhase2Triggered = state.run.bossPhase2Triggered;
  if (enemy.boss && enemy.maxHp > 0) {
    const ratio = enemy.hp / enemy.maxHp;
    if (!bossPhase1Triggered && ratio < 0.5 && ratio > 0) {
      bossPhase1Triggered = true;
      bossPhase = 1;
      animQueue = pushAnim(animQueue, animBossPhase(1));
      log = addLog(log, "Le boss change de phase.");
    }
    if (!bossPhase2Triggered && ratio < 0.3 && ratio > 0) {
      bossPhase2Triggered = true;
      bossPhase = 2;
      animQueue = pushAnim(animQueue, animBossPhase(2));
    }
  }

  let run = {
    ...state.run,
    enemy,
    team,
    stats,
    log,
    animQueue,
    bossPhase,
    bossPhase1Triggered,
    bossPhase2Triggered,
    relicTriggers,
  };

  if (enemy.hp <= 0) {
    flashes = addFlash(flashes, enemy.boss ? "boss" : "hit", 76, 48);
    return handleVictory(state, run, flashes);
  }

  enemy = { ...enemy, attackTimer: enemy.attackTimer + scaledDelta };
  team = team.map((member) => ({ ...member }));

  while (enemy.attackTimer >= enemy.attackInterval && aliveTeam(team).length > 0) {
    enemy.attackTimer -= enemy.attackInterval;
    const intent = enemy.intent;

    if (intent.kind === "guard") {
      const shieldGain = Math.max(4, Math.round(enemy.attack * 1.15));
      enemy = { ...enemy, shield: enemy.shield + shieldGain };
      flashes = addFlash(flashes, "shield", 76, 45, `+${shieldGain}`);
      animQueue = pushAnim(animQueue, animShieldNumber(enemy.id, false, shieldGain));
      log = addLog(log, `${enemy.name} se protege (${shieldGain} BCL).`);
    } else if (intent.kind === "hex") {
      const rawDamage = Math.max(1, Math.round(enemy.attack * intent.multiplier));
      let totalDamage = 0;
      let totalBlocked = 0;
      animQueue = pushAnim(animQueue, animAttackStarted(enemy.id, false));
      team = team.map((member, index) => {
        if (member.hp <= 0) {
          return member;
        }
        const shieldBlock = Math.min(member.shield, rawDamage);
        const damage = rawDamage - shieldBlock;
        totalDamage += damage;
        totalBlocked += shieldBlock;
        flashes = addFlash(
          flashes,
          "magic",
          23,
          34 + index * 16,
          damage > 0 ? `-${damage}` : "BCL",
        );
        // V3 — wave to ally
        animQueue = pushAnim(animQueue, animProjectile(enemy.id, member.id, "magic", false));
        animQueue = pushAnim(animQueue, animTargetHit(member.id, true));
        if (damage > 0) {
          animQueue = pushAnim(animQueue, animDamageNumber(member.id, true, damage, "damage-magic"));
        }
        return {
          ...member,
          shield: member.shield - shieldBlock,
          hp: Math.max(0, member.hp - damage),
          specialCd: member.specialCd + 520,
        };
      });
      stats = {
        ...stats,
        damageTaken: stats.damageTaken + totalDamage,
        shieldBlocked: stats.shieldBlocked + totalBlocked,
      };
      log = addLog(log, `${enemy.name} lance un malefice (${totalDamage}).`);
    } else {
      const targets = aliveTeam(team);
      const target =
        enemy.trait === "Pillard"
          ? [...targets].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]
          : targets[Math.floor(Math.random() * targets.length)];
      const index = team.findIndex((member) => member.id === target.id);
      const rawDamage = Math.max(1, Math.round(enemy.attack * intent.multiplier));
      const shieldBlock = Math.min(team[index].shield, rawDamage);
      const damage = rawDamage - shieldBlock;
      team[index] = {
        ...team[index],
        shield: team[index].shield - shieldBlock,
        hp: Math.max(0, team[index].hp - damage),
      };
      stats = {
        ...stats,
        damageTaken: stats.damageTaken + damage,
        shieldBlocked: stats.shieldBlocked + shieldBlock,
      };
      flashes = addFlash(
        flashes,
        intent.kind === "heavy" || enemy.boss ? "boss" : "hit",
        23,
        34 + index * 16,
        damage > 0 ? `-${damage}` : "BCL",
      );
      // V3 anim
      animQueue = pushAnim(animQueue, animAttackStarted(enemy.id, false));
      animQueue = pushAnim(animQueue, animProjectile(enemy.id, team[index].id, "physical", false));
      animQueue = pushAnim(animQueue, animTargetHit(team[index].id, true));
      if (damage > 0) {
        animQueue = pushAnim(animQueue, animDamageNumber(team[index].id, true, damage, "damage-physical"));
      }
      log = addLog(
        log,
        `${enemy.name} utilise ${intent.label} sur ${team[index].name} (${damage}).`,
      );
    }

    const nextIntent = pickEnemyIntent(enemy.boss);
    enemy = {
      ...enemy,
      intent: nextIntent,
      attackInterval: intentInterval(enemy.baseInterval, nextIntent),
    };

    // Regen relique (Sceau de regeneration)
    const regen = state.run.relics.reduce(
      (acc, r) => acc + (r.regenPerEnemyTurn ?? 0),
      0,
    );
    if (regen > 0) {
      team = team.map((m) =>
        m.hp > 0 ? { ...m, hp: Math.min(m.maxHp, m.hp + regen) } : m,
      );
      // V5.1 T24 — pulse de regen sur tous les vivants.
      const regenRelic = state.run.relics.find(
        (r) => r.regenPerEnemyTurn && r.regenPerEnemyTurn > 0,
      );
      if (regenRelic) {
        const firstAlive = team.find((m) => m.hp > 0);
        relicTriggers = pushRelicTrigger(relicTriggers, {
          relicId: regenRelic.id,
          relicName: regenRelic.name,
          message: `${regenRelic.name} : +${regen} PV`,
          targetCharId: firstAlive?.id,
        });
      }
    }
  }

  // V5.1 P5 — Sceau d'aube eternelle (per-KO revive) : si un hero vient de tomber
  // et que la relique n'est pas encore utilisée, on le relève à `hpPercent`.
  let relics = state.run.relics;
  const reviveIdx = relics.findIndex(
    (r) => r.reviveSingleOnKO && !r.reviveSingleOnKO.used,
  );
  if (reviveIdx >= 0) {
    const koIdx = team.findIndex((m) => m.hp <= 0);
    if (koIdx >= 0) {
      const reliccfg = relics[reviveIdx].reviveSingleOnKO;
      const pct = reliccfg ? reliccfg.hpPercent : 50;
      const target = team[koIdx];
      const restoredHp = Math.max(1, Math.floor((target.maxHp * pct) / 100));
      team = team.map((m, i) =>
        i === koIdx ? { ...m, hp: restoredHp, shield: 0 } : m,
      );
      const reviveRelic = relics[reviveIdx];
      relics = relics.map((r, i) =>
        i === reviveIdx && r.reviveSingleOnKO
          ? { ...r, reviveSingleOnKO: { ...r.reviveSingleOnKO, used: true } }
          : r,
      );
      log = addLog(log, `Sceau d'aube ressuscite ${target.name} a ${pct}%.`);
      flashes = addFlash(flashes, "heal", 26, 34 + koIdx * 16, "Aube");
      // V5.1 T24 — pulse sur le héros ressuscité.
      relicTriggers = pushRelicTrigger(relicTriggers, {
        relicId: reviveRelic.id,
        relicName: reviveRelic.name,
        message: `${reviveRelic.name} : ${target.name} ressuscité à ${pct}%`,
        targetCharId: target.id,
        ttlMs: 2200,
      });
    }
  }

  run = { ...run, enemy, team, stats, log, animQueue, relics, relicTriggers };

  if (aliveTeam(team).length === 0) {
    return resolveTeamDefeat(state, run, flashes);
  }

  return {
    ...state,
    run,
    flashes,
  };
}

function useSpecial(state: GameState, id: string): GameState {
  if (state.screen !== "combat" || !state.run) {
    return state;
  }

  let flashes = [...state.flashes];
  let enemy = { ...state.run.enemy };
  let team = state.run.team.map((member) => ({ ...member }));
  const index = team.findIndex((member) => member.id === id);
  const caster = team[index];

  if (!caster || caster.hp <= 0 || caster.specialCd > 0) {
    return state;
  }

  let log = state.run.log;
  let stats = { ...state.run.stats, skillsUsed: state.run.stats.skillsUsed + 1 };
  let animQueue = state.run.animQueue;
  animQueue = pushAnim(animQueue, animAttackStarted(caster.id, true));

  if (caster.special.type === "attack") {
    const bossDmgPct = enemy.boss
      ? state.run.relics.reduce(
          (acc, r) => acc + (r.nextFightBossDamageBonus ?? 0),
          0,
        )
      : 0;
    const bossDmgMul = 1 + bossDmgPct;
    const damage = Math.round(
      (caster.special.power + Math.round(caster.magic * 0.8)) * bossDmgMul,
    );
    const result = damageEnemy(enemy, damage);
    enemy = result.enemy;
    stats = { ...stats, damageDealt: stats.damageDealt + result.hpDamage };
    flashes = addFlash(
      flashes,
      "magic",
      76,
      45,
      result.hpDamage > 0 ? `-${result.hpDamage}` : `BCL -${result.shieldDamage}`,
    );
    animQueue = pushAnim(animQueue, animProjectile(caster.id, enemy.id, "magic", true));
    animQueue = pushAnim(animQueue, animTargetHit(enemy.id, false));
    if (result.hpDamage > 0) {
      animQueue = pushAnim(animQueue, animDamageNumber(enemy.id, false, result.hpDamage, "damage-magic"));
    } else if (result.shieldDamage > 0) {
      animQueue = pushAnim(animQueue, animShieldNumber(enemy.id, false, result.shieldDamage));
    }
    log = addLog(log, `${caster.name} lance ${caster.special.name} (${damage}).`);
  }

  if (caster.special.type === "heal") {
    const targets = aliveTeam(team);
    const target = targets.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    const targetIndex = team.findIndex((member) => member.id === target.id);
    const healed = Math.min(
      caster.special.power,
      team[targetIndex].maxHp - team[targetIndex].hp,
    );
    team[targetIndex] = {
      ...team[targetIndex],
      hp: Math.min(team[targetIndex].maxHp, team[targetIndex].hp + caster.special.power),
    };
    stats = { ...stats, healingDone: stats.healingDone + healed };
    flashes = addFlash(flashes, "heal", 23, 34 + targetIndex * 16, `+${healed}`);
    animQueue = pushAnim(animQueue, animProjectile(caster.id, team[targetIndex].id, "heal", true));
    if (healed > 0) {
      animQueue = pushAnim(animQueue, animHealNumber(team[targetIndex].id, true, healed));
    }
    log = addLog(log, `${caster.name} rend ${caster.special.power} PV.`);
  }

  if (caster.special.type === "shield") {
    const shieldedTargets = team.filter((member) => member.hp > 0).length;
    team = team.map((member) =>
      member.hp > 0
        ? { ...member, shield: member.shield + caster.special.power }
        : member,
    );
    stats = {
      ...stats,
      shieldGiven: stats.shieldGiven + caster.special.power * shieldedTargets,
    };
    flashes = addFlash(flashes, "shield", 25, 48, `+${caster.special.power}`);
    team.forEach((m) => {
      if (m.hp > 0) {
        animQueue = pushAnim(animQueue, animProjectile(caster.id, m.id, "shield", true));
        animQueue = pushAnim(animQueue, animShieldNumber(m.id, true, caster.special.power));
      }
    });
    log = addLog(log, `${caster.name} dresse un bouclier.`);
  }

  team[index] = {
    ...team[index],
    specialCd: Math.round(caster.special.cooldown * caster.cooldownMod),
  };

  const run = { ...state.run, team, enemy, stats, log, animQueue };

  if (enemy.hp <= 0) {
    return handleVictory(state, run, flashes);
  }

  return { ...state, run, flashes };
}

function applyReward(team: CombatCharacter[], reward: RewardOption) {
  if (reward.type === "hp") {
    return team.map((member) => ({
      ...member,
      maxHp: member.maxHp + 8,
      hp: member.hp + 8,
    }));
  }

  if (reward.type === "physical") {
    return team.map((member) => ({ ...member, physical: member.physical + 2 }));
  }

  if (reward.type === "magic") {
    return team.map((member) => ({ ...member, magic: member.magic + 2 }));
  }

  if (reward.type === "heal") {
    return team.map((member) => ({
      ...member,
      hp: Math.min(member.maxHp, member.hp + Math.ceil(member.maxHp * 0.35)),
    }));
  }

  if (reward.type === "shield") {
    return team.map((member) => ({ ...member, shield: member.shield + 8 }));
  }

  if (reward.type === "cooldown") {
    return team.map((member) => ({
      ...member,
      cooldownMod: Math.max(0.65, member.cooldownMod - 0.08),
    }));
  }

  if (reward.type === "refresh") {
    return team.map((member) => ({
      ...member,
      shield: member.shield + 3,
      specialCd: 0,
    }));
  }

  return team.map((member) => ({
    ...member,
    physical: member.physical + 3,
    magic: member.magic + 3,
    hp: Math.max(1, member.hp - 6),
  }));
}

function openChest(
  save: SaveData,
  tier: ChestTier = "damaged",
): { save: SaveData; reward: ChestReward } {
  const locked = ROSTER.filter((character) => !save.unlockedIds.includes(character.id));
  const roll = Math.random();
  const tierMultiplier: Record<ChestTier, number> = {
    damaged: 0.6,
    bronze: 1,
    silver: 1.4,
    royal: 1.8,
    runic: 2.4,
  };
  const charChance: Record<ChestTier, number> = {
    damaged: 0.2,
    bronze: 0.4,
    silver: 0.55,
    royal: 0.7,
    runic: 0.85,
  };
  const fragChance: Record<ChestTier, number> = {
    damaged: 0.6,
    bronze: 0.7,
    silver: 0.78,
    royal: 0.85,
    runic: 0.92,
  };
  const mul = tierMultiplier[tier];

  if (locked.length > 0 && roll < charChance[tier]) {
    const character = locked[Math.floor(Math.random() * locked.length)];
    return {
      reward: { type: "character", characterId: character.id },
      save: {
        ...save,
        unlockedIds: [...save.unlockedIds, character.id],
        chestsOpened: save.chestsOpened + 1,
      },
    };
  }

  if (roll < fragChance[tier]) {
    const amount = Math.round((12 + Math.floor(Math.random() * 13)) * mul);
    return {
      reward: { type: "fragments", amount },
      save: {
        ...save,
        fragments: save.fragments + amount,
        chestsOpened: save.chestsOpened + 1,
      },
    };
  }

  const amount = Math.round((30 + Math.floor(Math.random() * 31)) * mul);
  return {
    reward: { type: "gold", amount },
    save: {
      ...save,
      gold: save.gold + amount,
      chestsOpened: save.chestsOpened + 1,
    },
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "NAVIGATE":
      return {
        ...state,
        screen: action.screen,
        notice: "",
      };
    case "TOGGLE_CHARACTER": {
      if (!state.save.unlockedIds.includes(action.id)) {
        return state;
      }
      const exists = state.selectedIds.includes(action.id);
      const selectedIds = exists
        ? state.selectedIds.filter((id) => id !== action.id)
        : state.selectedIds.length < 3
          ? [...state.selectedIds, action.id]
          : [...state.selectedIds.slice(1), action.id];
      return { ...state, selectedIds };
    }
    case "START_RUN": {
      const templates = state.selectedIds
        .map((id) => getTemplate(id, state.save.customCharacters))
        .filter(Boolean) as CharacterTemplate[];
      if (templates.length !== 3) {
        return { ...state, screen: "team", notice: "Selection incomplete" };
      }
      const modifier = createEncounterModifier(1);
      const run: RunState = {
        lives: 3,
        fight: 1,
        stage: 1,
        wave: 1,
        wins: 0,
        team: templates.map(createCombatant),
        enemy: createEnemy(1, modifier),
        modifier,
        stats: createRunStats(),
        log: ["La run commence."],
        consumables: [null, null, null],
        relics: [],
        shopDiscountPercent: 0,
        blessingsUsed: 0,
        animQueue: [],
        bossIntroAt: null,
        bossPhase: 0,
        bossPhase1Triggered: false,
        bossPhase2Triggered: false,
        relicTriggers: [],
      };
      return {
        ...state,
        screen: "stage-intro",
        stageIntro: { stage: 1 },
        run,
        rewardOptions: [],
        chest: null,
        flashes: [],
        hub: null,
        pendingLootbox: null,
        pendingRecycle: null,
        pendingConsumable: null,
        pendingBossRelics: null,
        notice: "",
        // V5.1 P4 — checkpoint initial : run en cours, écran stage-intro.
        save: {
          ...state.save,
          currentRun: serializeRun(run, "stage-intro", null, null, { stage: 1 }),
        },
      };
    }
    case "TICK":
      return advanceCombat(state, action.delta);
    case "USE_SPECIAL":
      return useSpecial(state, action.id);
    case "CHOOSE_REWARD": {
      if (!state.run) {
        return state;
      }
      const reward = state.rewardOptions.find((option) => option.id === action.id);
      if (!reward) {
        return state;
      }
      const currentStage = state.run.stage;
      const wasBoss = state.run.fight % 10 === 0;
      const wasFinalBoss = state.run.fight === 30;

      // Bonus de or sur boss : +80..120 pour stage 1/2, +120..160 pour stage 3.
      let bonusGold = 0;
      const saveBase = state.save;
      if (wasBoss && !wasFinalBoss) {
        bonusGold = 80 + Math.floor(Math.random() * 41);
      } else if (wasBoss && wasFinalBoss) {
        bonusGold = 120 + Math.floor(Math.random() * 41);
      } else if (state.run.fight % 5 === 0) {
        bonusGold = 18 + Math.floor(Math.random() * 12);
      } else {
        bonusGold = 8 + Math.floor(Math.random() * 8);
      }
      // Relique "Bourse runique" : +X% or de combat
      const goldRelicPct = state.run.relics.reduce(
        (acc, r) => acc + (r.combatGoldPercent ?? 0),
        0,
      );
      let goldRelicTriggers: RelicTriggerEvent[] = state.run.relicTriggers;
      if (goldRelicPct > 0) {
        const before = bonusGold;
        bonusGold = Math.round(bonusGold * (1 + goldRelicPct / 100));
        const goldRelic = state.run.relics.find(
          (r) => r.combatGoldPercent && r.combatGoldPercent > 0,
        );
        if (goldRelic && bonusGold > before) {
          goldRelicTriggers = pushRelicTrigger(goldRelicTriggers, {
            relicId: goldRelic.id,
            relicName: goldRelic.name,
            message: `${goldRelic.name} : +${bonusGold - before} or bonus`,
          });
        }
      }
      const save = {
        ...saveBase,
        gold: saveBase.gold + bonusGold,
      };

      // Fin de run : boss final → choix de relique runique puis gameover
      if (wasFinalBoss) {
        const team = applyReward(state.run.team, reward);
        const updatedRun: RunState = {
          ...state.run,
          team,
          log: addLog(state.run.log, "Boss final vaincu. Une relique runique appelle."),
          relicTriggers: goldRelicTriggers,
        };
        const options = pickBossRelics(BOSS_RUNIC_RELIC_POOL, 3);
        const pendingBossRelics: BossRelicChoice = { options, tier: "runic" };
        return {
          ...state,
          screen: "boss-relic-choice",
          rewardOptions: [],
          run: updatedRun,
          save: {
            ...save,
            bestFight: Math.max(save.bestFight, state.run.fight),
            bestStage: 3,
            // V5.1 P4 — checkpoint avant choix relique runique.
            currentRun: serializeRun(
              updatedRun,
              "boss-relic-choice",
              null,
              pendingBossRelics,
              null,
            ),
          },
          pendingBossRelics,
          notice: `Boss final vaincu. +${bonusGold} or.`,
        };
      }

      // Boss stage 1 ou 2 → choix d'une relique de boss parmi 3, puis hub.
      if (wasBoss && (currentStage === 1 || currentStage === 2)) {
        const team = applyReward(state.run.team, reward).map((member) => ({
          ...member,
          hp: Math.min(member.maxHp, member.hp + Math.ceil(member.maxHp * 0.5)),
        }));
        const options = pickBossRelics(BOSS_RELIC_POOL, 3);
        const updatedRun: RunState = {
          ...state.run,
          team,
          log: addLog(state.run.log, `Boss vaincu. Choix d'une relique.`),
          relicTriggers: goldRelicTriggers,
        };
        const pendingBossRelics: BossRelicChoice = { options, tier: "boss" };
        return {
          ...state,
          screen: "boss-relic-choice",
          rewardOptions: [],
          run: updatedRun,
          save: {
            ...save,
            // V5.1 P4 — checkpoint avant choix relique boss (stage 1/2).
            currentRun: serializeRun(
              updatedRun,
              "boss-relic-choice",
              null,
              pendingBossRelics,
              null,
            ),
          },
          pendingBossRelics,
          notice: `Stage ${currentStage} termine. +${bonusGold} or.`,
        };
      }

      // Vague normale : on enchaine.
      const nextFight = state.run.fight + 1;
      const modifier = createEncounterModifier(nextFight);
      const nextStage = stageFromFight(nextFight);
      const nextWave = waveFromFight(nextFight);
      const teamRew = applyReward(state.run.team, reward).map((member) => ({
        ...member,
        hp: Math.min(member.maxHp, member.hp + Math.ceil(member.maxHp * 0.16)),
        attackTimer: Math.random() * 420,
      }));
      const startRes = applyStartOfCombatRelics(teamRew, state.run.relics);
      const team = startRes.team;
      const newEnemy = createEnemy(nextFight, modifier);
      // V5.1 T24 — combine victory-time triggers (gold relic) avec start-of-combat.
      const goldOnly = goldRelicTriggers.filter(
        (t) => !state.run!.relicTriggers.some((old) => old.id === t.id),
      );
      const mergedTriggers = [...startRes.triggers, ...goldOnly].slice(
        -RELIC_TRIGGER_CAP,
      );
      const newRun: RunState = {
        ...state.run,
        fight: nextFight,
        stage: nextStage,
        wave: nextWave,
        team,
        enemy: newEnemy,
        modifier,
        log: [`${reward.title} choisi.`, `Combat ${nextFight}.`],
        bossIntroAt: newEnemy.boss ? Date.now() : null,
        bossPhase: 0,
        bossPhase1Triggered: false,
        bossPhase2Triggered: false,
        animQueue: [],
        relicTriggers: mergedTriggers,
      };
      return {
        ...state,
        screen: "combat",
        rewardOptions: [],
        run: newRun,
        save: {
          ...save,
          // V5.1 P4 — checkpoint après reward (vague normale). Resume = stage-intro
          // du combat à venir : si l'utilisateur ferme l'onglet ici, il reprend
          // par stage-intro et appuie "Start" pour relancer le combat (sans
          // perdre la progression). On stocke la run telle qu'elle sera après
          // le passage par stage-intro → START_STAGE.
          currentRun: serializeRun(newRun, "stage-intro", null, null, { stage: nextStage }),
        },
        notice: nextFight % 10 === 0 ? "Boss imminent" : `+${bonusGold} or`,
      };
    }
    case "ABANDON_RUN": {
      if (!state.run || state.screen !== "combat") {
        return state;
      }
      return finishRun(state, state.run, state.flashes);
    }
    case "CREATE_CHARACTER": {
      const cost = CREATION_COST[action.character.rarity];
      if (state.save.fragments < cost) {
        return { ...state, notice: `Il manque ${cost - state.save.fragments} fragments.` };
      }
      const save = {
        ...state.save,
        fragments: state.save.fragments - cost,
        customCharacters: [...state.save.customCharacters, action.character],
        unlockedIds: [...state.save.unlockedIds, action.character.id],
      };
      const selectedIds =
        state.selectedIds.length < 3
          ? [...state.selectedIds, action.character.id]
          : state.selectedIds;
      return {
        ...state,
        save,
        selectedIds,
        screen: "collection",
        notice:
          cost > 0
            ? `${action.character.name} forge pour ${cost} fragments.`
            : `${action.character.name} rejoint la collection.`,
      };
    }
    case "OPEN_CHEST": {
      if (state.screen !== "gameover" || state.chest?.opened) {
        return state;
      }
      const tier = state.chest?.tier ?? "damaged";
      const result = openChest(state.save, tier);
      return {
        ...state,
        save: result.save,
        chest: { opened: true, reward: result.reward, tier },
        notice: "Coffre ouvert",
      };
    }

    // ====================== V2 actions ======================

    case "ENTER_STAGE_INTRO": {
      return {
        ...state,
        screen: "stage-intro",
        stageIntro: { stage: action.stage },
        notice: "",
      };
    }

    case "START_STAGE": {
      if (!state.run || !state.stageIntro) return state;
      const stage = state.stageIntro.stage;
      const fight =
        stage === 1 ? Math.max(1, state.run.fight) : stage === 2 ? 11 : 21;
      const modifier = createEncounterModifier(fight);
      const startRes = applyStartOfCombatRelics(state.run.team, state.run.relics);
      const newEnemy = createEnemy(fight, modifier);
      return {
        ...state,
        screen: "combat",
        stageIntro: null,
        run: {
          ...state.run,
          fight,
          stage,
          wave: waveFromFight(fight),
          team: startRes.team,
          enemy: newEnemy,
          modifier,
          log: addLog(state.run.log, `Stage ${stage} demarre.`),
          bossIntroAt: newEnemy.boss ? Date.now() : null,
          bossPhase: 0,
          bossPhase1Triggered: false,
          bossPhase2Triggered: false,
          animQueue: [],
          relicTriggers: startRes.triggers,
        },
        notice: "",
      };
    }

    case "ENTER_HUB": {
      if (!state.run) return state;
      const stageCleared = state.run.stage;
      if (stageCleared === 3) return state;
      const nextStage: Stage = (stageCleared + 1) as Stage;
      const hub: HubState = {
        stageJustCleared: stageCleared,
        nextStage,
        shopItems: pickShopItems(nextStage),
        shopRerolls: 0,
        freeSwapsUsed: 0,
        activeTab: "shop",
      };
      return {
        ...state,
        screen: "hub",
        hub,
        // V5.1 P4 — checkpoint à l'entrée hub.
        save: {
          ...state.save,
          currentRun: serializeRun(state.run, "hub", hub, null, null),
        },
      };
    }

    case "HUB_SET_TAB": {
      if (!state.hub) return state;
      return { ...state, hub: { ...state.hub, activeTab: action.tab } };
    }

    case "HUB_BUY_SHOP_ITEM": {
      if (!state.hub || !state.run) return state;
      const item = state.hub.shopItems.find((it) => it.id === action.itemId);
      if (!item) return state;
      const price = Math.max(
        0,
        Math.round(item.price * (1 - state.run.shopDiscountPercent / 100)),
      );
      if (state.save.gold < price) {
        return { ...state, notice: "Or insuffisant." };
      }

      let run = state.run;
      let save = { ...state.save, gold: state.save.gold - price };
      let pendingLootbox: PendingLootbox | null = state.pendingLootbox;
      let nextScreen: Screen = state.screen;
      const eff = item.effect;

      if (eff.kind === "heal-team-percent") {
        run = {
          ...run,
          team: run.team.map((m) => ({
            ...m,
            hp: m.hp > 0 ? Math.min(m.maxHp, m.hp + Math.ceil(m.maxHp * (eff.percent / 100))) : m.hp,
          })),
        };
      } else if (eff.kind === "shield-next-fight") {
        run = {
          ...run,
          relics: [
            ...run.relics,
            {
              id: makeId("relic"),
              name: item.name,
              detail: item.detail,
              source: "shop",
              nextFightShield: eff.amount,
            },
          ],
        };
      } else if (eff.kind === "stat-boost-stage") {
        const team =
          eff.stat === "physical"
            ? run.team.map((m) => ({
                ...m,
                physical: Math.round(m.physical * (1 + eff.percent / 100)),
              }))
            : run.team.map((m) => ({
                ...m,
                magic: Math.round(m.magic * (1 + eff.percent / 100)),
              }));
        run = { ...run, team };
      } else if (eff.kind === "cooldown-next-fight") {
        run = {
          ...run,
          relics: [
            ...run.relics,
            {
              id: makeId("relic"),
              name: item.name,
              detail: item.detail,
              source: "shop",
              nextFightCooldownMod: eff.percent / 100,
            },
          ],
        };
      } else if (eff.kind === "lootbox") {
        pendingLootbox = { tier: eff.tier, opened: false, result: null };
        nextScreen = "lootbox";
      } else if (eff.kind === "consumable") {
        const idx = run.consumables.findIndex((c) => c === null);
        if (idx === -1) {
          // Inventaire plein → ouvrir la modale de remplacement.
          // L'or est déjà déduit (save) ; le hub.shopItems sera filtré ci-dessous.
          const hubFull = {
            ...state.hub,
            shopItems: state.hub.shopItems.filter((s) => s.id !== item.id),
          };
          return {
            ...state,
            save,
            hub: hubFull,
            pendingConsumable: { kind: eff.consumable, source: "shop" },
            notice: `Inventaire plein : remplacer ou abandonner ?`,
          };
        }
        const next = [...run.consumables];
        next[idx] = createConsumable(eff.consumable);
        run = { ...run, consumables: next };
      } else if (eff.kind === "blessing-life") {
        if (run.lives >= 3) {
          return { ...state, notice: "Vies au max." };
        }
        run = { ...run, lives: run.lives + 1, blessingsUsed: run.blessingsUsed + 1 };
      } else if (eff.kind === "boss-damage-bonus") {
        run = {
          ...run,
          relics: [
            ...run.relics,
            {
              id: makeId("relic"),
              name: item.name,
              detail: item.detail,
              source: "shop",
              nextFightBossDamageBonus: eff.percent / 100,
            },
          ],
        };
      } else if (eff.kind === "first-ko-revive") {
        run = {
          ...run,
          relics: [
            ...run.relics,
            {
              id: makeId("relic"),
              name: item.name,
              detail: item.detail,
              source: "shop",
              reviveOnFirstKO: { percent: eff.percent, used: false },
            },
          ],
        };
      }

      const hub = {
        ...state.hub,
        shopItems: state.hub.shopItems.filter((s) => s.id !== item.id),
      };
      return {
        ...state,
        screen: nextScreen,
        run,
        save,
        hub,
        pendingLootbox,
        notice: `Achete : ${item.name} (-${price} or)`,
      };
    }

    case "HUB_REROLL_SHOP": {
      if (!state.hub) return state;
      if (state.save.gold < 15) {
        return { ...state, notice: "15 or requis pour relancer." };
      }
      return {
        ...state,
        save: { ...state.save, gold: state.save.gold - 15 },
        hub: {
          ...state.hub,
          shopItems: pickShopItems(state.hub.nextStage),
          shopRerolls: state.hub.shopRerolls + 1,
        },
        notice: "Boutique relancee.",
      };
    }

    case "HUB_BUY_LOOTBOX": {
      if (!state.hub) return state;
      const price = LOOTBOX_PRICES[action.tier];
      if (action.tier === "runic" || price === 0) {
        return { ...state, notice: "Loot box runique non achetable." };
      }
      if (state.save.gold < price) {
        return { ...state, notice: "Or insuffisant." };
      }
      return {
        ...state,
        screen: "lootbox",
        save: { ...state.save, gold: state.save.gold - price },
        pendingLootbox: { tier: action.tier, opened: false, result: null },
      };
    }

    case "OPEN_LOOTBOX": {
      if (!state.pendingLootbox || state.pendingLootbox.opened) return state;
      const result = rollLootbox(
        state.pendingLootbox.tier,
        state.save.unlockedIds,
        state.save.customCharacters,
        state.save.lootboxPity,
      );
      const nextPity = nextPityAfterDraw(state.save.lootboxPity, result);
      let save = {
        ...state.save,
        lifetimeLootboxes: state.save.lifetimeLootboxes + 1,
        lootboxPity: nextPity,
      };
      if (result.kind === "fragments" || result.kind === "fragments-converted") {
        save = { ...save, fragments: save.fragments + result.amount };
      } else if (result.kind === "gold") {
        save = { ...save, gold: save.gold + result.amount };
      } else if (result.kind === "character") {
        save = {
          ...save,
          unlockedIds: [...save.unlockedIds, result.characterId],
        };
      }
      return {
        ...state,
        save,
        pendingLootbox: { ...state.pendingLootbox, opened: true, result },
      };
    }

    case "SET_COMBAT_SPEED": {
      return {
        ...state,
        save: { ...state.save, settings: { ...state.save.settings, combatSpeed: action.speed } },
      };
    }

    case "BOSS_INTRO_DISMISS": {
      if (!state.run) return state;
      return { ...state, run: { ...state.run, bossIntroAt: null } };
    }

    // === V5.1 — Phase 4 — Reprise d'une run sauvegardée ===
    case "CONTINUE_RUN": {
      const snap = state.save.currentRun;
      if (!snap) return state;
      const run = rehydrateRun(snap);
      // Selectedids = ids de l'équipe restaurée (nécessaire si l'utilisateur
      // revient au team picker plus tard).
      const selectedIds = run.team.map((m) => m.id);
      const screen: Screen = snap.resumeScreen;
      return {
        ...state,
        screen,
        run,
        selectedIds,
        rewardOptions: [],
        chest: null,
        flashes: [],
        hub: snap.hub,
        stageIntro: snap.stageIntro,
        pendingLootbox: null,
        pendingRecycle: null,
        pendingConsumable: null,
        pendingBossRelics: snap.pendingBossRelics,
        notice: "Run reprise.",
      };
    }

    case "DISCARD_SAVED_RUN": {
      // Efface seulement le checkpoint, sans toucher au reste de la save.
      // Utilisé si l'utilisateur clique "Nouvelle run" et confirme l'écrasement.
      return {
        ...state,
        save: { ...state.save, currentRun: null },
      };
    }

    case "CLOSE_LOOTBOX": {
      return {
        ...state,
        screen: state.hub ? "hub" : "menu",
        pendingLootbox: null,
      };
    }

    case "HUB_RECYCLE_REQUEST": {
      return { ...state, pendingRecycle: { characterId: action.characterId } };
    }

    case "HUB_RECYCLE_CANCEL": {
      return { ...state, pendingRecycle: null };
    }

    case "HUB_RECYCLE_CONFIRM": {
      if (!state.pendingRecycle) return state;
      const id = state.pendingRecycle.characterId;
      const target = state.save.customCharacters.find((c) => c.id === id);
      if (!target) {
        return { ...state, pendingRecycle: null };
      }
      const refund = computeRecycleRefund(target.rarity);
      const customCharacters = state.save.customCharacters.filter((c) => c.id !== id);
      const unlockedIds = state.save.unlockedIds.filter((u) => u !== id);
      return {
        ...state,
        pendingRecycle: null,
        save: {
          ...state.save,
          customCharacters,
          unlockedIds,
          fragments: state.save.fragments + refund.fragments,
          gold: state.save.gold + refund.gold,
        },
        notice: `${target.name} recycle (+${refund.fragments} fragments, +${refund.gold} or).`,
      };
    }

    case "HUB_SWAP_HERO": {
      if (!state.hub || !state.run) return state;
      if (!state.selectedIds.includes(action.outId)) return state;
      const inTemplate = getTemplate(action.inId, state.save.customCharacters);
      if (!inTemplate) return state;
      const cost = state.hub.freeSwapsUsed === 0 ? 0 : 75;
      if (state.save.gold < cost) {
        return { ...state, notice: `Il manque ${cost - state.save.gold} or.` };
      }
      const selectedIds = state.selectedIds.map((id) => (id === action.outId ? action.inId : id));
      // Le heros entrant arrive a 70% PV, les autres conservent.
      const team = state.run.team.map((member) => {
        if (member.id === action.outId) {
          const fresh = createCombatant(inTemplate);
          fresh.hp = Math.max(1, Math.round(fresh.maxHp * 0.7));
          return fresh;
        }
        return member;
      });
      return {
        ...state,
        selectedIds,
        save: { ...state.save, gold: state.save.gold - cost },
        run: { ...state.run, team },
        hub: {
          ...state.hub,
          freeSwapsUsed: state.hub.freeSwapsUsed === 0 ? 1 : 1,
        },
        notice:
          cost === 0
            ? `${inTemplate.name} rejoint l'equipe (gratuit).`
            : `${inTemplate.name} rejoint l'equipe (-${cost} or).`,
      };
    }

    case "HUB_CONTINUE": {
      if (!state.hub || !state.run) return state;
      const nextStage = state.hub.nextStage;
      const updatedRun: RunState = { ...state.run, stage: nextStage, wave: 1 };
      const stageIntro = { stage: nextStage };
      return {
        ...state,
        screen: "stage-intro",
        stageIntro,
        hub: null,
        run: updatedRun,
        notice: "",
        // V5.1 P4 — checkpoint à la fin du stage (sortie du hub).
        save: {
          ...state.save,
          currentRun: serializeRun(updatedRun, "stage-intro", null, null, stageIntro),
        },
      };
    }

    case "USE_CONSUMABLE": {
      if (!state.run) return state;
      const slot = state.run.consumables[action.slotIndex];
      if (!slot) return state;
      if (state.screen !== "combat") {
        return { ...state, notice: "Utilisable seulement en combat." };
      }
      const consumables = [...state.run.consumables];
      consumables[action.slotIndex] = null;
      let team = state.run.team;
      let enemy = state.run.enemy;
      let stats = state.run.stats;

      if (slot.kind === "potion-heal") {
        team = team.map((m) =>
          m.hp > 0
            ? { ...m, hp: Math.min(m.maxHp, m.hp + Math.ceil(m.maxHp * 0.3)) }
            : m,
        );
      } else if (slot.kind === "bomb-runic") {
        const dmg = 25;
        const result = damageEnemy(enemy, dmg);
        enemy = result.enemy;
        stats = { ...stats, damageDealt: stats.damageDealt + result.hpDamage };
      } else if (slot.kind === "shield-emergency") {
        team = team.map((m) => (m.hp > 0 ? { ...m, shield: m.shield + 15 } : m));
      } else if (slot.kind === "vial-antipoison") {
        // Simple : retire le malefice en cours en remettant l'intent a "strike".
        enemy = {
          ...enemy,
          intent: INTENTS[0],
          attackInterval: intentInterval(enemy.baseInterval, INTENTS[0]),
        };
      }

      return {
        ...state,
        run: {
          ...state.run,
          consumables,
          team,
          enemy,
          stats,
          log: addLog(state.run.log, `${slot.name} utilise.`),
        },
        notice: `${slot.name} utilise.`,
      };
    }

    case "ADD_CONSUMABLE": {
      if (!state.run) return state;
      const idx = state.run.consumables.findIndex((c) => c === null);
      if (idx === -1) {
        return {
          ...state,
          pendingConsumable: { kind: action.kind, source: "reward" },
          notice: "Inventaire plein : remplacer ou abandonner ?",
        };
      }
      const next = [...state.run.consumables];
      next[idx] = createConsumable(action.kind);
      return { ...state, run: { ...state.run, consumables: next } };
    }

    case "REPLACE_CONSUMABLE": {
      if (!state.run) return state;
      const next = [...state.run.consumables];
      next[action.slotIndex] = createConsumable(action.kind);
      return {
        ...state,
        run: { ...state.run, consumables: next },
        pendingConsumable: null,
        notice: `Slot ${action.slotIndex + 1} remplace.`,
      };
    }

    case "DISCARD_PENDING_CONSUMABLE": {
      if (!state.pendingConsumable) return state;
      return {
        ...state,
        pendingConsumable: null,
        notice: "Nouveau consommable abandonne.",
      };
    }

    case "CHOOSE_BOSS_RELIC": {
      if (!state.run || !state.pendingBossRelics) return state;
      const relic = state.pendingBossRelics.options.find((r) => r.id === action.relicId);
      if (!relic) return state;
      const isRunic = state.pendingBossRelics.tier === "runic";

      // Applique l'effet immediat sur le run state (PV max, bouclier de depart, stats permanentes...)
      let run = applyBossRelicEffect(state.run, relic);
      run = { ...run, relics: [...run.relics, relic] };

      if (isRunic) {
        // Boss final → coffre runique / royal en gameover
        const finalBossDefeats = state.save.finalBossDefeats + 1;
        const finalRunState: GameState = { ...state, run };
        const tier = computeChestTier(finalRunState);
        return {
          ...state,
          screen: "gameover",
          rewardOptions: [],
          run,
          chest: { opened: false, tier },
          save: {
            ...state.save,
            finalBossDefeats,
            // V5.1 P4 — fin de run (boss final) = clear du checkpoint.
            currentRun: null,
          },
          pendingBossRelics: null,
          hub: null,
          stageIntro: null,
          pendingLootbox: null,
          pendingRecycle: null,
          pendingConsumable: null,
          notice: `Relique runique acquise — coffre ${tier}`,
        };
      }

      // Boss stage 1 / 2 → hub
      const currentStage = run.stage;
      const nextStage: Stage = (currentStage + 1) as Stage;
      // Note: bonusFreeSwapsNextHub est cosmetique pour le moment — le hub n'a qu'un slot
      // de swap gratuit (0|1). A etendre si freeSwapsUsed devient un compteur.
      const hub: HubState = {
        stageJustCleared: currentStage,
        nextStage,
        shopItems: pickShopItems(nextStage),
        shopRerolls: 0,
        freeSwapsUsed: 0,
        activeTab: "shop",
      };
      const updatedRun: RunState = {
        ...run,
        log: addLog(run.log, `${relic.name} acquis.`),
      };
      return {
        ...state,
        screen: "hub",
        run: updatedRun,
        hub,
        pendingBossRelics: null,
        notice: `${relic.name} acquis.`,
        // V5.1 P4 — checkpoint après choix relique boss : run au hub.
        save: {
          ...state.save,
          currentRun: serializeRun(updatedRun, "hub", hub, null, null),
        },
      };
    }

    default:
      return state;
  }
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "?") + (parts[1]?.[0] || "");
}

function specialMark(type: SpecialType) {
  if (type === "heal") {
    return "+";
  }
  if (type === "shield") {
    return "II";
  }
  return "X";
}

// =========================================================================
// === V5 — Bundle Bobbycard DA helpers (mapEnemyToDAType, mapSkillToSpellType,
// === RARITIES_V5, CHEST_TIERS_V5, HeroPortrait, Sparkles)
// === Cf. project/v5/decisions.md — couleur hero par rareté, pas par perso.
// =========================================================================

type DAEnemyType = "slime" | "bat" | "boss";
type DAEnemyPalette = { c: string; cream: string; glow: string };

function mapEnemyToDAType(name: string, isBoss: boolean): { type: DAEnemyType; palette: DAEnemyPalette } {
  const lower = name.toLowerCase();
  if (isBoss) {
    if (lower.includes("cendre") || lower.includes("gardien") || lower.includes("ember")) {
      return { type: "boss", palette: { c: "#ff8b6f", cream: "#3a1a1a", glow: "#ffb38b" } };
    }
    if (lower.includes("vide") || lower.includes("sorci") || lower.includes("void")) {
      return { type: "boss", palette: { c: "#b563ff", cream: "#2a1a3a", glow: "#d4a3ff" } };
    }
    if (lower.includes("roi") || lower.includes("bris") || lower.includes("brisé") || lower.includes("king")) {
      return { type: "boss", palette: { c: "#ff5fa2", cream: "#3a1a2a", glow: "#ffa3cf" } };
    }
    return { type: "boss", palette: { c: "#ff5fa2", cream: "#3a1a2a", glow: "#ffa3cf" } };
  }
  if (
    lower.includes("bat") ||
    lower.includes("chauve") ||
    lower.includes("fant") ||
    lower.includes("ghost") ||
    lower.includes("spectre") ||
    lower.includes("ombre")
  ) {
    return { type: "bat", palette: { c: "#b563ff", cream: "#2a1f3a", glow: "#d4a3ff" } };
  }
  return { type: "slime", palette: { c: "#7dbe65", cream: "#3a4a2a", glow: "#aedb8e" } };
}

type SpellType = "magic" | "phys" | "heal" | "aoe";

function mapSkillToSpellType(special: Special, c?: { physical?: number; magic?: number }): SpellType {
  if (special.type === "heal") return "heal";
  if (special.type === "shield") return "magic";
  // attack
  const lower = special.name.toLowerCase();
  if (lower.includes("aoe") || lower.includes("onde") || lower.includes("cendre") || lower.includes("vide") || lower.includes("brisé") || lower.includes("brise")) {
    return "aoe";
  }
  if (c && typeof c.physical === "number" && typeof c.magic === "number") {
    return c.physical >= c.magic ? "phys" : "magic";
  }
  return "magic";
}

function mapAnimTrajectoryToSpellType(traj: AnimTrajectory): SpellType {
  if (traj === "heal") return "heal";
  if (traj === "shield") return "magic";
  if (traj === "physical") return "phys";
  if (traj === "poison") return "aoe";
  return "magic";
}

type RarityV5Props = {
  color: string;
  deep: string;
  cream: string;
  particles: number;
  idle: "static" | "shimmer" | "pulse" | "breathe" | "wobble";
  sparkColor: string;
};

const RARITIES_V5: Record<Rarity | "mythic", RarityV5Props> = {
  common: {
    color: "var(--rarity-common)",
    deep: "var(--rarity-common-deep)",
    cream: "var(--rarity-common-cream)",
    particles: 0,
    idle: "static",
    sparkColor: "#bcc4d0",
  },
  rare: {
    color: "var(--rarity-rare)",
    deep: "var(--rarity-rare-deep)",
    cream: "var(--rarity-rare-cream)",
    particles: 3,
    idle: "shimmer",
    sparkColor: "#7ad8f5",
  },
  epic: {
    color: "var(--rarity-epic)",
    deep: "var(--rarity-epic-deep)",
    cream: "var(--rarity-epic-cream)",
    particles: 5,
    idle: "pulse",
    sparkColor: "#d49bff",
  },
  legendary: {
    color: "var(--rarity-legendary)",
    deep: "var(--rarity-legendary-deep)",
    cream: "var(--rarity-legendary-cream)",
    particles: 8,
    idle: "breathe",
    sparkColor: "#ffd97a",
  },
  mythic: {
    color: "var(--rarity-mythic)",
    deep: "var(--rarity-mythic-deep)",
    cream: "var(--rarity-mythic-cream)",
    particles: 12,
    idle: "wobble",
    sparkColor: "#ffa3cf",
  },
};

function getRarityProps(r: Rarity): RarityV5Props {
  return RARITIES_V5[r];
}

// Couleur héros chero combat (concrète, pas var()) — pour les style inline du bundle
const RARITY_COMBAT_COLOR: Record<Rarity, string> = {
  common: "#9aa3b2",
  rare: "#4ec5e8",
  epic: "#b563ff",
  legendary: "#ffb938",
};

type ChestTierColors = { ccolor: string; cdeep: string; cglow: string; name: string };

const CHEST_TIERS_V5: Record<ChestTier, ChestTierColors> = {
  damaged: { ccolor: "#a8957c", cdeep: "#6b5847", cglow: "#c9b89c", name: "ABÎMÉ" },
  bronze: { ccolor: "#d97a3c", cdeep: "#8a4218", cglow: "#ffa66b", name: "BRONZE" },
  silver: { ccolor: "#b8c4d4", cdeep: "#677687", cglow: "#e0eaf5", name: "ARGENT" },
  royal: { ccolor: "#ffc845", cdeep: "#b87f00", cglow: "#ffe082", name: "ROYAL" },
  runic: { ccolor: "#5fdfff", cdeep: "#1f7fa8", cglow: "#a3eaff", name: "RUNIQUE" },
};

function getChestTierColors(tier: ChestTier): ChestTierColors {
  return CHEST_TIERS_V5[tier];
}

// === HeroPortrait V5 (cards.jsx L39-70) ===
function HeroPortrait({ rarity }: { rarity: RarityV5Props }): React.ReactElement {
  return (
    <div className="hp-wrap">
      <div
        className="hp-spotlight"
        style={{ background: `radial-gradient(circle, ${rarity.color}55, transparent 70%)` } as React.CSSProperties}
      />
      <div className="hp-body">
        <div className="hp-head">
          <div className="hp-hat" style={{ background: rarity.color, borderColor: "var(--ink)" } as React.CSSProperties}>
            <div className="hp-hat-band" />
            <div className="hp-hat-pom" style={{ background: rarity.cream } as React.CSSProperties} />
          </div>
          <div className="hp-eyes">
            <div className="hp-eye"><div className="hp-pupil" /></div>
            <div className="hp-eye"><div className="hp-pupil" /></div>
          </div>
          <div className="hp-cheek hp-cheek--l" />
          <div className="hp-cheek hp-cheek--r" />
          <div className="hp-mouth" />
        </div>
        <div className="hp-cape" style={{ background: rarity.color } as React.CSSProperties}>
          <div className="hp-cape-shine" />
        </div>
      </div>
    </div>
  );
}

// === Sparkles V5 (cards.jsx L72-97) ===
function Sparkles({ count, color }: { count: number; color: string }): React.ReactElement | null {
  if (count === 0) return null;
  const sparks: React.ReactElement[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + i * 0.7;
    const r = 60 + (i % 3) * 18;
    const dx = Math.cos(angle) * r;
    const dy = Math.sin(angle) * r;
    const delay = (i * 0.35) % 3;
    const size = 4 + (i % 4);
    sparks.push(
      <span
        key={i}
        className="sparkle"
        style={{
          ["--dx" as string]: `${dx}px`,
          ["--dy" as string]: `${dy}px`,
          width: size,
          height: size,
          background: color,
          color,
          animationDelay: `${delay}s`,
        } as React.CSSProperties}
      />,
    );
  }
  return <div className="sparkles">{sparks}</div>;
}

// === BossHpBar V5 (combat.jsx L162-170) ===
function BossHpBar({
  bossName,
  phase,
  hp,
  hpMax,
}: {
  bossName: string;
  phase: number;
  hp: number;
  hpMax: number;
}): React.ReactElement {
  const pct = Math.max(0, Math.min(100, (hp / Math.max(1, hpMax)) * 100));
  return (
    <div className="combat-boss-bar" aria-label={`Barre de vie boss : ${bossName}`}>
      <div className="cbb-name">
        <span className="cbb-star">★</span>
        {bossName}
        <span className="cbb-phase">— Phase {phase + 1}</span>
      </div>
      <div className="cbb-bar">
        <div className="cbb-fill" style={{ width: `${pct}%` }} />
        <div className="cbb-divider" style={{ left: "50%" }} />
        <div className="cbb-text">
          {hp} / {hpMax}
        </div>
      </div>
    </div>
  );
}

// === SpellLayer V5 (combat-center > 4 spell--*) ===
function SpellLayer({ activeType, tick }: { activeType: SpellType | null; tick: number }): React.ReactElement {
  return (
    <div className="combat-center" aria-hidden="true">
      <div key={`m-${tick}-${activeType === "magic"}`} className={`spell spell--magic ${activeType === "magic" ? "is-active" : ""}`}>
        <div className="spell-orb" />
        <div className="spell-trail" />
      </div>
      <div key={`p-${tick}-${activeType === "phys"}`} className={`spell spell--phys ${activeType === "phys" ? "is-active" : ""}`}>
        <div className="spell-arrow" />
      </div>
      <div key={`h-${tick}-${activeType === "heal"}`} className={`spell spell--heal ${activeType === "heal" ? "is-active" : ""}`}>
        <div className="spell-cross" />
        <div className="spell-cross spell-cross--2" />
        <div className="spell-cross spell-cross--3" />
      </div>
      <div key={`a-${tick}-${activeType === "aoe"}`} className={`spell spell--aoe ${activeType === "aoe" ? "is-active" : ""}`}>
        <div className="spell-shock" />
      </div>
    </div>
  );
}

function CharacterPortrait({
  character,
  small,
}: {
  character: CharacterTemplate;
  small?: boolean;
}) {
  const variant = mapPersonaToVariant(character);
  const size: MascotSize = small ? "sm" : "md";
  return (
    <span
      className={`portrait rarity-${character.rarity} portrait-${character.special.type} ${
        character.id === "ronan" ? "portrait-ronan" : ""
      } ${small ? "portrait-small" : ""}`}
      aria-hidden="true"
    >
      <HeroMascot variant={variant} size={size} mood="idle" />
    </span>
  );
}

function CharacterCard({
  character,
  selected,
  locked,
  onClick,
}: {
  character: CharacterTemplate;
  selected?: boolean;
  locked?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={`character-card rarity-${character.rarity} ${selected ? "selected" : ""} ${
        locked ? "locked" : ""
      }`}
      onClick={onClick}
      disabled={locked}
      type="button"
    >
      <span className="card-visual-row">
        <CharacterPortrait character={character} />
        <span className="card-topline">
          <span>{character.name}</span>
          <span>
            {character.custom ? `Forge ${RARITY_LABEL[character.rarity]}` : RARITY_LABEL[character.rarity]}
          </span>
        </span>
      </span>
      <span className="stats-row">
        <span>PV {character.maxHp}</span>
        <span>PH {character.physical}</span>
        <span>MG {character.magic}</span>
      </span>
      <span className="special-line">{character.special.name}</span>
    </button>
  );
}

function nextBossIn(fight: number) {
  const remainder = fight % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

function teamSummary(team: CombatCharacter[]) {
  return team.reduce(
    (summary, member) => ({
      hp: summary.hp + Math.max(0, member.hp),
      maxHp: summary.maxHp + member.maxHp,
      shield: summary.shield + member.shield,
      physical: summary.physical + member.physical,
      magic: summary.magic + member.magic,
      alive: summary.alive + (member.hp > 0 ? 1 : 0),
      ready: summary.ready + (member.hp > 0 && member.specialCd <= 0 ? 1 : 0),
    }),
    { hp: 0, maxHp: 0, shield: 0, physical: 0, magic: 0, alive: 0, ready: 0 },
  );
}

function CombatHud({
  run,
  bestFight,
  onAbandon,
}: {
  run: RunState;
  bestFight: number;
  onAbandon: () => void;
}) {
  const summary = teamSummary(run.team);
  const bossIn = nextBossIn(run.fight);
  const hpPercent = hpRatio(summary.hp, summary.maxHp || 1);
  const bossProgress = bossIn === 0 ? 10 : 10 - bossIn;

  return (
    <section className="combat-hud">
      <div className="hud-primary">
        <div className="hud-tile">
          <span>Combat</span>
          <strong>{run.fight}</strong>
        </div>
        <div className="hud-tile">
          <span>Vies</span>
          <strong>{run.lives}</strong>
        </div>
        <div className="hud-tile">
          <span>Boss</span>
          <strong>{bossIn === 0 ? "Maintenant" : `${bossIn}`}</strong>
        </div>
        <div
          className="hud-tile hud-modifier"
          title={`${run.modifier.label} — ${run.modifier.detail}`}
        >
          <span>Salle</span>
          <strong>{run.modifier.label}</strong>
        </div>
        <div className="hud-tile">
          <span>Record</span>
          <strong>{bestFight}</strong>
        </div>
        <button id="abandon-run" onClick={onAbandon} type="button">
          Abandonner
        </button>
      </div>

      <div className="hud-panels">
        <article className="hud-panel">
          <div className="hud-panel-title">
            <span>Equipe</span>
            <strong>{summary.alive}/3 actifs</strong>
          </div>
          <div className="meter hud-meter">
            <span style={{ width: `${hpPercent}%` }} />
          </div>
          <div className={`boss-track ${bossIn <= 1 ? "boss-track-danger" : ""}`}>
            {Array.from({ length: 10 }, (_, index) => (
              <span key={index} className={index < bossProgress ? "filled" : ""} />
            ))}
          </div>
          <div className="hud-stat-grid">
            <span>PV {summary.hp}/{summary.maxHp}</span>
            <span>BCL {summary.shield}</span>
            <span>PH {summary.physical}</span>
            <span>MG {summary.magic}</span>
            <span>Skills {summary.ready}/3</span>
          </div>
        </article>

        <article className="hud-panel">
          <div className="hud-panel-title">
            <span>Stats run</span>
            <strong>{run.stats.enemiesDefeated} K.O</strong>
          </div>
          <div className="hud-stat-grid dense">
            <span>DGT {run.stats.damageDealt}</span>
            <span>Recu {run.stats.damageTaken}</span>
            <span>Soin {run.stats.healingDone}</span>
            <span>Boucl. {run.stats.shieldGiven}</span>
            <span>Bloque {run.stats.shieldBlocked}</span>
            <span>Skills {run.stats.skillsUsed}</span>
            <span>Boss {run.stats.bossesDefeated}</span>
            <span>Vies perdues {run.stats.livesLost}</span>
          </div>
        </article>
      </div>
    </section>
  );
}

// === V3 — Anim classes derived from animQueue ===
type CardAnimState = {
  attackingIds: Set<string>;
  attackingSpecialIds: Set<string>;
  hitIds: Set<string>;
  flashIds: Set<string>;
};

function computeCardAnimState(queue: CombatAnimEvent[]): CardAnimState {
  const now = Date.now();
  const attackingIds = new Set<string>();
  const attackingSpecialIds = new Set<string>();
  const hitIds = new Set<string>();
  const flashIds = new Set<string>();
  for (const ev of queue) {
    const age = now - ev.createdAt;
    if (age < 0) continue;
    if (ev.kind === "attack-started" && age < 220) {
      attackingIds.add(ev.sourceId);
      if (ev.isSpecial) attackingSpecialIds.add(ev.sourceId);
    } else if (ev.kind === "target-hit") {
      if (age < 90) flashIds.add(ev.targetId);
      if (age < 180) hitIds.add(ev.targetId);
    }
  }
  return { attackingIds, attackingSpecialIds, hitIds, flashIds };
}

function CombatHero({
  member,
  onSpecial,
  anim,
  index = 0,
  relicPulse = false,
}: {
  member: CombatCharacter;
  onSpecial: (id: string) => void;
  anim?: CardAnimState;
  index?: number;
  relicPulse?: boolean;
}) {
  const cooldown = Math.ceil(member.specialCd / 1000);
  const cdPct = member.specialCd > 0 ? Math.min(100, (1 - member.specialCd / Math.max(1, member.special.cooldown)) * 100) : 100;
  const ready = member.hp > 0 && member.specialCd <= 0;
  const isAttacking = anim?.attackingIds.has(member.id) ?? false;
  const isAttackingSpecial = anim?.attackingSpecialIds.has(member.id) ?? false;
  const isHit = anim?.hitIds.has(member.id) ?? false;
  const ko = member.hp <= 0;
  const color = RARITY_COMBAT_COLOR[member.rarity];
  const role = ROLE_FROM_STATS_V5(member);
  const pct = Math.max(0, (member.hp / Math.max(1, member.maxHp)) * 100);
  const hpColor = pct > 50 ? "var(--hp-good)" : pct > 25 ? "var(--hp-warn)" : "var(--hp-low)";
  const handleClick = () => {
    if (!ready) return;
    onSpecial(member.id);
  };
  return (
    <div
      className={`chero ${isAttacking ? "is-attacking" : ""} ${isAttackingSpecial ? "is-casting" : ""} ${ko ? "is-ko" : ""} ${ready ? "is-selected" : ""} ${isHit ? "is-hit" : ""} ${relicPulse ? "is-relic-pulse" : ""}`}
      style={{ ["--hidx" as string]: index } as React.CSSProperties}
      data-card-id={member.id}
      onClick={handleClick}
      role="button"
      aria-label={`${member.name} ${ready ? "compétence prête" : "compétence en recharge"}`}
      aria-disabled={!ready}
    >
      <div
        className="chero-glow"
        style={{ background: `radial-gradient(circle, ${color}66, transparent 70%)` } as React.CSSProperties}
      />
      <div className="chero-frame">
        <div
          className="chero-portrait"
          style={{ background: `linear-gradient(180deg, ${color}33, #1a1530)` } as React.CSSProperties}
        >
          <div className="chero-rays" />
          <div className="chero-mascot">
            <div className="chero-hat" style={{ background: color } as React.CSSProperties} />
            <div className="chero-head" />
            <div className="chero-eye chero-eye--l" />
            <div className="chero-eye chero-eye--r" />
            <div className="chero-mouth" />
            <div className="chero-cape" style={{ background: color } as React.CSSProperties} />
          </div>
          {isAttackingSpecial && (
            <div
              className="chero-cast-ring"
              style={{ borderColor: color, boxShadow: `0 0 20px ${color}` } as React.CSSProperties}
            />
          )}
        </div>
        <div className="chero-bottom">
          <div className="chero-name">{member.name}</div>
          <div className="chero-role">{role}</div>
          <div className="chero-bar">
            <div
              className="chero-bar-fill"
              style={{ width: `${pct}%`, background: hpColor } as React.CSSProperties}
            />
            <div className="chero-bar-text">
              {Math.max(0, member.hp)}/{member.maxHp}
            </div>
          </div>
          <div className="chero-cooldown">
            <div
              className="chero-cooldown-fill"
              style={{ width: `${cdPct}%`, background: color } as React.CSSProperties}
            />
          </div>
        </div>
      </div>
      {/* Bouton skill caché Playwright/clavier — invisible mais focusable */}
      <button
        type="button"
        className="chero-special-trigger"
        onClick={(e) => {
          e.stopPropagation();
          onSpecial(member.id);
        }}
        disabled={member.hp <= 0 || member.specialCd > 0}
        aria-label={`${member.special.name} ${member.specialCd > 0 ? `${cooldown}s` : "Prêt"}`}
        style={{ position: "absolute", inset: 0, opacity: 0, pointerEvents: "none" }}
      >
        {member.special.name}
      </button>
    </div>
  );
}

// V5 — fonction utilitaire role display "Lame" / "Mage" / "Gardien" — copiée plus bas mais
// défini ici pour dépendance avant déclaration. (ROLE_FROM_STATS est défini plus bas pour
// CharacterCardDetailed. On le duplique en signature compatible.)
function ROLE_FROM_STATS_V5(c: { physical: number; magic: number }): "Lame" | "Mage" | "Gardien" {
  if (c.physical >= c.magic && c.physical >= 7) return "Lame";
  if (c.magic > c.physical && c.magic >= 7) return "Mage";
  return "Gardien";
}

function EnemyCard({
  enemy,
  bossPhase: _bossPhase = 0,
  anim,
}: {
  enemy: Enemy;
  bossPhase?: 0 | 1 | 2;
  anim?: CardAnimState;
}) {
  const isAttacking = anim?.attackingIds.has(enemy.id) ?? false;
  const isHit = anim?.hitIds.has(enemy.id) ?? false;
  const da = mapEnemyToDAType(enemy.name, enemy.boss);
  const pct = Math.max(0, (enemy.hp / Math.max(1, enemy.maxHp)) * 100);
  // Map enemy intent kind → bundle intent style
  const intentKind: "attack" | "debuff" | "aoe" =
    enemy.intent.kind === "hex" ? "debuff" : enemy.boss && enemy.intent.kind === "heavy" ? "aoe" : "attack";
  const intentIcon =
    intentKind === "debuff" ? "☁" : intentKind === "aoe" ? "✦" : enemy.intent.kind === "guard" ? "🛡" : "⚔";
  return (
    <div
      className={`enemy ${enemy.boss ? "enemy--boss" : ""} ${isAttacking ? "is-attacking" : ""} ${isHit ? "is-hit" : ""}`}
      style={{ ["--ec" as string]: da.palette.c, ["--eg" as string]: da.palette.glow } as React.CSSProperties}
      data-enemy-id={enemy.id}
      data-card-id={enemy.id}
    >
      <div className="enemy-glow" />
      <div className="enemy-frame">
        <div
          className="enemy-portrait"
          style={{ background: `linear-gradient(180deg, ${da.palette.cream}, #0a0818)` } as React.CSSProperties}
        >
          {da.type === "slime" && (
            <div className="e-slime" style={{ background: da.palette.c } as React.CSSProperties}>
              <div className="e-slime-shine" />
              <div className="e-eye e-eye--l" />
              <div className="e-eye e-eye--r" />
              <div className="e-mouth" />
              <div className="e-drop e-drop--1" />
              <div className="e-drop e-drop--2" />
            </div>
          )}
          {da.type === "bat" && (
            <div className="e-bat" style={{ background: da.palette.c } as React.CSSProperties}>
              <div className="e-bat-wing e-bat-wing--l" />
              <div className="e-bat-wing e-bat-wing--r" />
              <div className="e-eye e-eye--l" />
              <div className="e-eye e-eye--r" />
              <div className="e-fangs" />
            </div>
          )}
          {da.type === "boss" && (
            <div className="e-boss" style={{ background: da.palette.c } as React.CSSProperties}>
              <div className="e-boss-crown" />
              <div className="e-boss-glow" />
              <div className="e-eye e-eye--l" />
              <div className="e-eye e-eye--r" />
              <div className="e-boss-mouth" />
              <div className="e-boss-spike e-boss-spike--l" />
              <div className="e-boss-spike e-boss-spike--r" />
              <div className="e-boss-aura" />
            </div>
          )}
        </div>
        <div className="enemy-name">{enemy.name}</div>
        <div className="enemy-bar">
          <div className="enemy-bar-fill" style={{ width: `${pct}%` } as React.CSSProperties} />
          <div className="enemy-bar-text">
            {Math.max(0, enemy.hp)}/{enemy.maxHp}
          </div>
        </div>
      </div>
      <div className={`intent intent--${intentKind}`} aria-label={enemy.intent.label}>
        <span className="intent-icon">{intentIcon}</span>
        <span className="intent-v">{enemy.intent.detail}</span>
      </div>
    </div>
  );
}

// === V5 — Helpers footer combat (M1) ===
function mapSkillToIconV5(special: Special, c?: { physical?: number; magic?: number }): string {
  const t = mapSkillToSpellType(special, c);
  if (t === "heal") return "✚";
  if (t === "phys") return "⚡";
  if (t === "aoe") return "✦";
  return "✦";
}

function getConsumableIconV5(kind: ConsumableKind): string {
  switch (kind) {
    case "potion-heal": return "❤";
    case "bomb-runic": return "⚡";
    case "shield-emergency": return "✦";
    case "vial-antipoison": return "✚";
    default: return "◆";
  }
}

function getConsumableColorV5(kind: ConsumableKind): string {
  switch (kind) {
    case "potion-heal": return "var(--hp-good)";
    case "bomb-runic": return "var(--rage)";
    case "shield-emergency": return "var(--shield)";
    case "vial-antipoison": return "var(--poison)";
    default: return "var(--brand-grape)";
  }
}

function CombatFooter({
  run,
  combatSpeed,
  onSpecial,
  onConsumable,
  onSpeed,
}: {
  run: RunState;
  combatSpeed: CombatSpeed;
  onSpecial: (id: string) => void;
  onConsumable: (idx: number) => void;
  onSpeed: (s: CombatSpeed) => void;
}) {
  const [pulseSk, setPulseSk] = useState<number | null>(null);
  const team = run.team;
  const consumables: (Consumable | null)[] = [
    run.consumables[0] ?? null,
    run.consumables[1] ?? null,
    run.consumables[2] ?? null,
  ];
  const speeds: { value: CombatSpeed; label: string; id: string }[] = [
    { value: 1, label: "×1", id: "speed-1" },
    { value: 1.25, label: "×1.25", id: "speed-1-25" },
    { value: 1.5, label: "×1.5", id: "speed-1-5" },
  ];

  return (
    <div className="combat-footer">
      <div className="combat-skills">
        {team.map((member, i) => {
          const ready = member.hp > 0 && member.specialCd <= 0;
          const color = RARITY_COMBAT_COLOR[member.rarity];
          const icon = mapSkillToIconV5(member.special, member);
          const cdMax = Math.max(1, member.special.cooldown * member.cooldownMod);
          const cdPct = ready ? 100 : Math.min(100, ((cdMax - member.specialCd) / cdMax) * 100);
          const cdLabel = ready ? "PRÊT" : `${(member.specialCd / 1000).toFixed(1)}s`;
          const handle = () => {
            if (!ready) return;
            setPulseSk(i);
            window.setTimeout(() => setPulseSk(null), 400);
            onSpecial(member.id);
          };
          return (
            <button
              key={member.id}
              type="button"
              className={`sk ${ready ? "sk--ready" : "sk--cooling"} ${pulseSk === i ? "is-pulse" : ""}`}
              onClick={handle}
              disabled={!ready}
              aria-label={`${member.special.name} ${ready ? "prêt" : `recharge ${cdLabel}`}`}
            >
              <div
                className="sk-icon"
                style={{
                  background: color,
                  boxShadow: ready ? `0 0 16px ${color}` : "none",
                } as React.CSSProperties}
              >
                <span>{icon}</span>
                {ready && (
                  <div
                    className="sk-icon-pulse"
                    style={{ borderColor: color } as React.CSSProperties}
                  />
                )}
              </div>
              <div className="sk-meta">
                <div className="sk-name">{member.special.name}</div>
                <div className="sk-cd">{cdLabel}</div>
              </div>
              {!ready && (
                <div className="sk-cdbar">
                  <div
                    className="sk-cdbar-fill"
                    style={{ width: `${cdPct}%`, background: color } as React.CSSProperties}
                  />
                </div>
              )}
              <div className="sk-key">{i + 1}</div>
            </button>
          );
        })}
      </div>
      <div className="combat-consumables">
        {consumables.map((cons, idx) => {
          if (!cons) {
            return (
              <button
                key={`cons-empty-${idx}`}
                id={`consumable-${idx}`}
                type="button"
                className="cons cons--empty"
                disabled
                aria-label={`Slot ${idx + 1} vide`}
                aria-disabled="true"
              >
                <div className="cons-name">Slot vide</div>
              </button>
            );
          }
          return (
            <button
              key={`cons-${idx}-${cons.id}`}
              id={`consumable-${idx}`}
              type="button"
              className="cons"
              onClick={() => onConsumable(idx)}
              aria-label={`Utiliser ${cons.name}`}
            >
              <div
                className="cons-icon"
                style={{ background: getConsumableColorV5(cons.kind) } as React.CSSProperties}
              >
                {getConsumableIconV5(cons.kind)}
              </div>
              <div className="cons-name">{cons.name}</div>
              <div className="cons-qty">×1</div>
            </button>
          );
        })}
      </div>
      <div className="combat-speed" role="radiogroup" aria-label="Vitesse de combat">
        {speeds.map((s) => (
          <button
            key={s.id}
            id={s.id}
            type="button"
            role="radio"
            aria-checked={combatSpeed === s.value}
            className={`speed-btn ${combatSpeed === s.value ? "speed-btn--active" : ""}`}
            onClick={() => onSpeed(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChestResult({ reward }: { reward: ChestReward }) {
  if (reward.type === "character") {
    const character = getTemplate(reward.characterId);
    return (
      <div className="chest-result">
        <span>Nouveau personnage</span>
        {character && <CharacterCard character={character} selected />}
      </div>
    );
  }

  return (
    <div className="chest-result compact-result">
      <span>{reward.type === "fragments" ? "Fragments" : "Or"}</span>
      <strong>+{reward.amount}</strong>
    </div>
  );
}

// ====================== V2 components ======================

function RunProgress({
  fight,
  stage,
  wave,
}: {
  fight: number;
  stage: Stage;
  wave: number;
}) {
  // V5 — émet 30 dots `pp pp--s{1,2,3} pp--cur pp--boss pp--done` selon le bundle.
  // 1 dot = 1 fight ; dots 10/20/30 = boss.
  void stage;
  void wave;
  return (
    <div
      id="run-progress"
      className="combat-progress"
      role="progressbar"
      aria-label="Progression de la run"
      aria-valuemin={1}
      aria-valuemax={30}
      aria-valuenow={fight}
    >
      {Array.from({ length: 30 }).map((_, i) => {
        const stageIdx = Math.floor(i / 10);
        const fightNum = i + 1;
        const done = fightNum < fight;
        const cur = fightNum === fight;
        const isBoss = (i + 1) % 10 === 0;
        return (
          <span
            key={i}
            className={`pp pp--s${stageIdx + 1} ${done ? "pp--done" : ""} ${cur ? "pp--cur" : ""} ${isBoss ? "pp--boss" : ""}`}
          />
        );
      })}
    </div>
  );
}

function StageIntroScreen({
  stage,
  onEnter,
}: {
  stage: Stage;
  onEnter: () => void;
}) {
  const config = STAGE_CONFIGS[stage];
  return (
    <section className={`screen stage-intro stage-${stage}`}>
      <div className="stage-intro__sigil" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="stage-intro__eyebrow">STAGE {stage}</div>
      <h1 className="stage-intro__title">{config.name}</h1>
      <p className="stage-intro__atmosphere">{STAGE_INTRO_LINES[stage]}</p>
      <div className="stage-intro__boss">Boss : {config.bossName}</div>
      <button
        id="stage-intro-enter"
        className="stage-intro__cta primary-action"
        onClick={onEnter}
        autoFocus
        type="button"
      >
        Entrer
      </button>
    </section>
  );
}

function ConsumableSlot({
  slot,
  index,
  onUse,
  inCombat,
}: {
  slot: Consumable | null;
  index: number;
  onUse: (idx: number) => void;
  inCombat: boolean;
}) {
  if (!slot) {
    return (
      <button
        id={`consumable-${index}`}
        className="consumable-slot consumable-slot--empty"
        type="button"
        aria-label={`Slot ${index + 1} : vide`}
        aria-disabled="true"
        disabled
      >
        <span className="consumable-slot__icon" aria-hidden="true" />
        <span className="consumable-slot__label">
          <strong>Vide</strong>
          <span>—</span>
        </span>
      </button>
    );
  }
  return (
    <button
      id={`consumable-${index}`}
      className="consumable-slot consumable-slot--filled"
      type="button"
      onClick={() => onUse(index)}
      disabled={!inCombat}
      aria-label={`Slot ${index + 1} : ${slot.name}. ${inCombat ? "Cliquez pour utiliser." : "Disponible en combat."}`}
    >
      <span className="consumable-slot__icon" aria-hidden="true">
        <span className={`consumable-icon-${slot.kind}`} />
      </span>
      <span className="consumable-slot__label">
        <strong>{slot.name}</strong>
        <span>{slot.detail}</span>
      </span>
    </button>
  );
}

function ConsumableRail({
  consumables,
  inCombat,
  onUse,
}: {
  consumables: ConsumableSlots;
  inCombat: boolean;
  onUse: (idx: number) => void;
}) {
  const padded: ConsumableSlots = [
    consumables[0] ?? null,
    consumables[1] ?? null,
    consumables[2] ?? null,
  ];
  return (
    <section className="consumable-rail" aria-label="Inventaire consommables">
      {padded.map((slot, idx) => (
        <ConsumableSlot
          key={`slot-${idx}-${slot?.id ?? "empty"}`}
          slot={slot}
          index={idx}
          onUse={onUse}
          inCombat={inCombat}
        />
      ))}
    </section>
  );
}

function HubResource({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="hub-resource">
      {label} <strong>{value}</strong>
    </span>
  );
}

function HubHeader({ hub, run, save }: { hub: HubState; run: RunState; save: SaveData }) {
  const consoFilled = run.consumables.filter((c) => c !== null).length;
  return (
    <header className="hub-header">
      <div className="hub-header__eyebrow">
        HUB — Stage {hub.stageJustCleared} termine / Prochain : Stage {hub.nextStage}
      </div>
      <div className="hub-header__resources">
        <HubResource label="Or" value={save.gold} />
        <HubResource label="Fragments" value={save.fragments} />
        <HubResource label="Vies" value={`${run.lives}/3`} />
        <HubResource label="Conso" value={`${consoFilled}/3`} />
      </div>
      <RunProgress fight={run.fight} stage={run.stage} wave={run.wave} />
    </header>
  );
}

function HubTabs({
  active,
  onChange,
}: {
  active: HubTab;
  onChange: (tab: HubTab) => void;
}) {
  const tabs: { id: HubTab; label: string }[] = [
    { id: "shop", label: "Boutique" },
    { id: "lootbox", label: "Loot Box" },
    { id: "recycle", label: "Recyclage" },
    { id: "team", label: "Equipe" },
    { id: "stats", label: "Stats" },
  ];
  return (
    <nav className="hub-tabs" role="tablist" aria-label="Onglets du hub">
      {tabs.map((t) => (
        <button
          key={t.id}
          id={`hub-tab-${t.id}`}
          className={`hub-tab ${active === t.id ? "hub-tab--active is-active" : ""}`}
          role="tab"
          aria-selected={active === t.id}
          type="button"
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

function ShopTab({
  hub,
  gold,
  dispatch,
}: {
  hub: HubState;
  gold: number;
  dispatch: Dispatch<Action>;
}) {
  return (
    <div role="tabpanel" aria-labelledby="hub-tab-shop">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <strong style={{ fontFamily: "Georgia, serif", fontSize: "1.15rem" }}>
          Boutique du Stage {hub.nextStage}
        </strong>
        <button
          id="shop-reroll"
          className="shop-reroll"
          type="button"
          onClick={() => dispatch({ type: "HUB_REROLL_SHOP" })}
          disabled={gold < 15}
        >
          Relancer (15 or)
        </button>
      </div>
      {hub.shopItems.length === 0 ? (
        <div className="recycle-empty">Boutique vide. Relancez pour de nouveaux items.</div>
      ) : (
        <div className="shop-grid">
          {hub.shopItems.map((item, idx) => {
            const unaffordable = gold < item.price;
            return (
              <article
                key={item.id}
                className={`shop-item rarity-${item.rarity === "common" ? "commune" : item.rarity === "rare" ? "rare" : item.rarity === "epic" ? "epique" : "legendaire"} ${unaffordable ? "shop-item--unaffordable" : ""}`}
              >
                <span
                  className={`tier-badge tier-badge--${item.rarity === "common" ? "commune" : item.rarity === "rare" ? "rare" : item.rarity === "epic" ? "epique" : "legendaire"}`}
                >
                  {RARITY_LABEL[item.rarity]}
                </span>
                <div className="shop-item__title">{item.name}</div>
                <div className="shop-item__detail">{item.detail}</div>
                <div className="shop-item__footer">
                  <span className="shop-item__price">{item.price} or</span>
                  <button
                    id={`shop-buy-${idx}`}
                    className="btn-shop"
                    type="button"
                    aria-label={`Acheter ${item.name} pour ${item.price} or`}
                    aria-disabled={unaffordable}
                    disabled={unaffordable}
                    onClick={() => dispatch({ type: "HUB_BUY_SHOP_ITEM", itemId: item.id })}
                  >
                    Acheter
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LootboxTab({
  gold,
  pity,
  dispatch,
}: {
  gold: number;
  pity: LootboxPity;
  dispatch: Dispatch<Action>;
}) {
  const cards: { tier: LootBoxTier; title: string; mod: string }[] = [
    { tier: "small", title: "Petite", mod: "small" },
    { tier: "rare", title: "Rare", mod: "rare" },
    { tier: "epic", title: "Epique", mod: "epic" },
    { tier: "runic", title: "Runique", mod: "runic" },
  ];
  // V5.1 T23 — Pity counter visible.
  // Seuils : rare bump à 5 (+5pts) / 8 (+10pts), epic bump à 12 (+5pts).
  // On expose deux barres de progression : "prochaine rare" (cap 8) et
  // "prochaine épique" (cap 12), avec hint cohérent au niveau actuel.
  const PITY_RARE_CAP = 8;
  const PITY_EPIC_CAP = 12;
  const rareCount = Math.min(pity.sinceLastRare, PITY_RARE_CAP);
  const epicCount = Math.min(pity.sinceLastEpic, PITY_EPIC_CAP);
  const rarePct = (rareCount / PITY_RARE_CAP) * 100;
  const epicPct = (epicCount / PITY_EPIC_CAP) * 100;
  const rareIn = Math.max(0, PITY_RARE_CAP - pity.sinceLastRare);
  const epicIn = Math.max(0, PITY_EPIC_CAP - pity.sinceLastEpic);
  const rareHint =
    pity.sinceLastRare >= 8
      ? "Garantie renforcée (+10 pts rare)"
      : pity.sinceLastRare >= 5
        ? "Garantie active (+5 pts rare)"
        : rareIn === 1
          ? "Rare boostée dans 1 ouverture"
          : `Rare boostée dans ${rareIn} ouvertures`;
  const epicHint =
    pity.sinceLastEpic >= 12
      ? "Garantie active (+5 pts épique)"
      : epicIn === 1
        ? "Épique boostée dans 1 ouverture"
        : `Épique boostée dans ${epicIn} ouvertures`;
  return (
    <div role="tabpanel" aria-labelledby="hub-tab-lootbox">
      <strong style={{ fontFamily: "Georgia, serif", fontSize: "1.15rem" }}>Loot Box</strong>
      <div
        id="pity-counter"
        className="pity-counter"
        role="group"
        aria-label="Compteurs de garantie progressive"
      >
        <div className="pity-row" data-pity-kind="rare">
          <div className="pity-row__head">
            <span className="pity-row__icon" aria-hidden="true">🎲</span>
            <span className="pity-row__label">Pity rare</span>
            <span className="pity-row__count">
              {rareCount}/{PITY_RARE_CAP}
            </span>
          </div>
          <div
            className="pity-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={PITY_RARE_CAP}
            aria-valuenow={rareCount}
            aria-label={`Pity rare ${rareCount} sur ${PITY_RARE_CAP}`}
          >
            <div className="pity-bar__fill" style={{ width: `${rarePct}%` }} />
          </div>
          <div className="pity-row__hint">{rareHint}</div>
        </div>
        <div className="pity-row" data-pity-kind="epic">
          <div className="pity-row__head">
            <span className="pity-row__icon" aria-hidden="true">🎲</span>
            <span className="pity-row__label">Pity épique</span>
            <span className="pity-row__count">
              {epicCount}/{PITY_EPIC_CAP}
            </span>
          </div>
          <div
            className="pity-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={PITY_EPIC_CAP}
            aria-valuenow={epicCount}
            aria-label={`Pity épique ${epicCount} sur ${PITY_EPIC_CAP}`}
          >
            <div className="pity-bar__fill" style={{ width: `${epicPct}%` }} />
          </div>
          <div className="pity-row__hint">{epicHint}</div>
        </div>
      </div>
      <div className="lootbox-grid" style={{ marginTop: 12 }}>
        {cards.map((c) => {
          const price = LOOTBOX_PRICES[c.tier];
          const w = LOOTBOX_TABLES[c.tier];
          const locked = c.tier === "runic";
          const unaffordable = !locked && gold < price;
          return (
            <article
              key={c.tier}
              className={`lootbox-card lootbox-card--${c.mod} ${locked ? "lootbox-card--locked" : ""}`}
            >
              <div className="lootbox-card__title">{c.title}</div>
              <ul className="lootbox-probas">
                <li>Fragments {w.fragments}%</li>
                <li>Or {w.gold}%</li>
                {w.common > 0 && <li>Commun {w.common}%</li>}
                {w.rare > 0 && <li>Rare {w.rare}%</li>}
                {w.epic > 0 && <li>Epique {w.epic}%</li>}
                {w.legendary > 0 && <li>Legendaire {w.legendary}%</li>}
              </ul>
              <div className="lootbox-card__price">{locked ? "—" : `${price} or`}</div>
              {!locked && (
                <button
                  id={`lootbox-buy-${c.tier}`}
                  className="btn-shop"
                  type="button"
                  disabled={unaffordable}
                  aria-disabled={unaffordable}
                  onClick={() => dispatch({ type: "HUB_BUY_LOOTBOX", tier: c.tier })}
                >
                  Acheter
                </button>
              )}
              {locked && <div style={{ color: "var(--color-text-muted)" }}>Non achetable</div>}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function RecycleTab({
  customCharacters,
  selectedIds,
  dispatch,
}: {
  customCharacters: CharacterTemplate[];
  selectedIds: string[];
  dispatch: Dispatch<Action>;
}) {
  const recyclables = customCharacters.filter(
    (c) => !STARTER_IDS.includes(c.id) && !selectedIds.includes(c.id),
  );
  return (
    <div role="tabpanel" aria-labelledby="hub-tab-recycle">
      <strong style={{ fontFamily: "Georgia, serif", fontSize: "1.15rem" }}>Recyclage</strong>
      {recyclables.length === 0 ? (
        <div className="recycle-empty">Aucun personnage forge a recycler.</div>
      ) : (
        <div className="recycle-list" style={{ marginTop: 12 }}>
          {recyclables.map((c) => {
            const refund = computeRecycleRefund(c.rarity);
            return (
              <div key={c.id} className="recycle-row">
                <CharacterPortrait character={c} small />
                <span className="recycle-row__name">{c.name}</span>
                <span
                  className={`tier-badge tier-badge--${c.rarity === "common" ? "commune" : c.rarity === "rare" ? "rare" : c.rarity === "epic" ? "epique" : "legendaire"}`}
                >
                  {RARITY_LABEL[c.rarity]}
                </span>
                <span className="recycle-row__refund">
                  +{refund.fragments} frag · +{refund.gold} or
                </span>
                <button
                  className="btn-shop"
                  type="button"
                  onClick={() =>
                    dispatch({ type: "HUB_RECYCLE_REQUEST", characterId: c.id })
                  }
                >
                  Recycler
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RecycleConfirmModal({
  pendingRecycle,
  customCharacters,
  dispatch,
}: {
  pendingRecycle: { characterId: string } | null;
  customCharacters: CharacterTemplate[];
  dispatch: Dispatch<Action>;
}) {
  if (!pendingRecycle) return null;
  const target = customCharacters.find((c) => c.id === pendingRecycle.characterId);
  if (!target) return null;
  const refund = computeRecycleRefund(target.rarity);
  return (
    <>
      <div
        className="modal-backdrop open"
        onClick={() => dispatch({ type: "HUB_RECYCLE_CANCEL" })}
        aria-hidden="true"
      />
      <div
        className="recycle-confirm-modal open"
        role="alertdialog"
        aria-labelledby="recycle-modal-title"
        aria-describedby="recycle-modal-warn"
        onKeyDown={(e) => {
          if (e.key === "Escape") dispatch({ type: "HUB_RECYCLE_CANCEL" });
        }}
      >
        <h3 id="recycle-modal-title" className="recycle-confirm-modal__title">
          Recycler {target.name} ?
        </h3>
        <p id="recycle-modal-warn" className="recycle-confirm-modal__warn">
          Cette action est definitive. +{refund.fragments} fragments, +{refund.gold} or.
        </p>
        <div className="recycle-confirm-modal__actions">
          <button
            id="recycle-cancel"
            className="shop-reroll"
            type="button"
            autoFocus
            onClick={() => dispatch({ type: "HUB_RECYCLE_CANCEL" })}
          >
            Annuler
          </button>
          <button
            id="recycle-confirm"
            className="btn-shop"
            type="button"
            onClick={() => dispatch({ type: "HUB_RECYCLE_CONFIRM" })}
          >
            Recycler
          </button>
        </div>
      </div>
    </>
  );
}

function ReplaceConsumableModal({
  pending,
  consumables,
  dispatch,
}: {
  pending: { kind: ConsumableKind; source: "shop" | "reward" } | null;
  consumables: ConsumableSlots;
  dispatch: Dispatch<Action>;
}) {
  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dispatch({ type: "DISCARD_PENDING_CONSUMABLE" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending, dispatch]);

  if (!pending) return null;
  const def = CONSUMABLE_DEFS[pending.kind];

  return (
    <>
      <div
        className="modal-backdrop open"
        onClick={() => dispatch({ type: "DISCARD_PENDING_CONSUMABLE" })}
        aria-hidden="true"
      />
      <div
        id="replace-consumable-modal"
        className="replace-consumable-modal open"
        role="dialog"
        aria-labelledby="replace-consumable-title"
        aria-describedby="replace-consumable-desc"
      >
        <h3 id="replace-consumable-title" className="replace-consumable-modal__title">
          Inventaire plein
        </h3>
        <p id="replace-consumable-desc" className="replace-consumable-modal__warn">
          Nouveau : <strong>{def.name}</strong> — {def.detail}
        </p>
        <div className="replace-consumable-modal__slots">
          {[0, 1, 2].map((idx) => {
            const slot = consumables[idx] ?? null;
            return (
              <button
                key={idx}
                id={`replace-slot-${idx}`}
                className="replace-consumable-modal__slot"
                type="button"
                onClick={() =>
                  dispatch({
                    type: "REPLACE_CONSUMABLE",
                    slotIndex: idx,
                    kind: pending.kind,
                  })
                }
                autoFocus={idx === 0}
              >
                <span className="replace-consumable-modal__slot-num">Slot {idx + 1}</span>
                <strong>{slot ? slot.name : "Vide"}</strong>
                <span>{slot ? slot.detail : "—"}</span>
              </button>
            );
          })}
        </div>
        <div className="replace-consumable-modal__actions">
          <button
            id="replace-discard"
            className="shop-reroll"
            type="button"
            onClick={() => dispatch({ type: "DISCARD_PENDING_CONSUMABLE" })}
          >
            Abandonner le nouveau
          </button>
        </div>
      </div>
    </>
  );
}

function BossRelicChoiceScreen({
  pending,
  dispatch,
}: {
  pending: BossRelicChoice;
  dispatch: Dispatch<Action>;
}) {
  const isRunic = pending.tier === "runic";
  return (
    <section className={`screen boss-relic-screen ${isRunic ? "boss-relic-screen--runic" : ""}`}>
      <div className="section-heading">
        <span className="eyebrow">{isRunic ? "Relique runique" : "Relique de boss"}</span>
        <h1>{isRunic ? "Une relique runique vous appelle" : "Choisissez une relique"}</h1>
      </div>
      <div className="boss-relic-grid">
        {pending.options.map((relic, idx) => (
          <article key={relic.id} className="boss-relic-card">
            <div className="boss-relic-card__title">{relic.name}</div>
            <div className="boss-relic-card__detail">{relic.detail}</div>
            <button
              id={`boss-relic-${idx}`}
              className="primary-action boss-relic-card__cta"
              type="button"
              onClick={() => dispatch({ type: "CHOOSE_BOSS_RELIC", relicId: relic.id })}
            >
              Choisir cette relique
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function TeamTab({
  run,
  selectedIds,
  unlockedCharacters,
  customCharacters,
  freeSwapsUsed,
  dispatch,
}: {
  run: RunState;
  selectedIds: string[];
  unlockedCharacters: CharacterTemplate[];
  customCharacters: CharacterTemplate[];
  freeSwapsUsed: 0 | 1;
  dispatch: Dispatch<Action>;
}) {
  const [pendingIn, setPendingIn] = useState<string | null>(null);
  const available = unlockedCharacters.filter((c) => !selectedIds.includes(c.id));
  return (
    <div role="tabpanel" aria-labelledby="hub-tab-team">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <strong style={{ fontFamily: "Georgia, serif", fontSize: "1.15rem" }}>Equipe</strong>
        <span className="swap-cost-tag">
          {freeSwapsUsed === 0 ? "Swap gratuit disponible (1)" : "75 or par swap"}
        </span>
      </div>
      <div className="hub-team-current">
        {run.team.map((m) => (
          <div
            key={m.id}
            className={`hub-team-card ${pendingIn ? "swap-target" : ""}`}
            onClick={() => {
              if (pendingIn) {
                dispatch({
                  type: "HUB_SWAP_HERO",
                  outId: m.id,
                  inId: pendingIn,
                });
                setPendingIn(null);
              }
            }}
            role={pendingIn ? "button" : undefined}
            id={pendingIn ? `team-swap-${m.id}-${pendingIn}` : undefined}
          >
            <CharacterPortrait character={m} small />
            <div>
              <strong>{m.name}</strong>
              <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                {RARITY_LABEL[m.rarity]} · {m.hp}/{m.maxHp} PV
              </div>
            </div>
          </div>
        ))}
      </div>
      <strong style={{ fontFamily: "Georgia, serif", fontSize: "1rem" }}>
        Heros disponibles
      </strong>
      <div className="hub-team-roster" style={{ marginTop: 8 }}>
        {available.length === 0 && (
          <span style={{ color: "var(--color-text-muted)" }}>Aucun autre heros debloque.</span>
        )}
        {available.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`hub-team-card ${pendingIn === c.id ? "swap-target" : ""}`}
            onClick={() => setPendingIn(pendingIn === c.id ? null : c.id)}
          >
            <CharacterPortrait character={c} small />
            <div>
              <strong>{c.name}</strong>
              <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                {RARITY_LABEL[c.rarity]}
              </div>
            </div>
          </button>
        ))}
      </div>
      {pendingIn && (
        <div style={{ marginTop: 12, color: "var(--color-text-muted)" }}>
          Cliquez sur un heros de l'equipe pour le remplacer.
        </div>
      )}
      <div style={{ display: "none" }}>
        {/* Stable IDs pour Playwright même quand pendingIn=null */}
        {run.team.flatMap((m) =>
          available.map((a) => (
            <button
              key={`${m.id}-${a.id}`}
              id={`team-swap-${m.id}-${a.id}`}
              type="button"
              onClick={() =>
                dispatch({ type: "HUB_SWAP_HERO", outId: m.id, inId: a.id })
              }
            />
          )),
        )}
      </div>
    </div>
  );
}

function StatsTab({ run, save }: { run: RunState; save: SaveData }) {
  return (
    <div role="tabpanel" aria-labelledby="hub-tab-stats">
      <strong style={{ fontFamily: "Georgia, serif", fontSize: "1.15rem" }}>Resume</strong>
      <div className="hub-stats-grid" style={{ marginTop: 12 }}>
        <article className="stats-block">
          <h4 className="stats-block__title">Run en cours</h4>
          <dl>
            <dt>Stage</dt>
            <dd>{run.stage}</dd>
            <dt>Combat</dt>
            <dd>{run.fight}</dd>
            <dt>Vies</dt>
            <dd>{run.lives}</dd>
            <dt>Degats infliges</dt>
            <dd>{run.stats.damageDealt}</dd>
            <dt>Degats subis</dt>
            <dd>{run.stats.damageTaken}</dd>
            <dt>Soins</dt>
            <dd>{run.stats.healingDone}</dd>
            <dt>Skills utilisees</dt>
            <dd>{run.stats.skillsUsed}</dd>
            <dt>K.O</dt>
            <dd>{run.stats.enemiesDefeated}</dd>
            <dt>Boss</dt>
            <dd>{run.stats.bossesDefeated}</dd>
            <dt>Vies perdues</dt>
            <dd>{run.stats.livesLost}</dd>
          </dl>
        </article>
        <article className="stats-block">
          <h4 className="stats-block__title">Save globale</h4>
          <dl>
            <dt>Or</dt>
            <dd>{save.gold}</dd>
            <dt>Fragments</dt>
            <dd>{save.fragments}</dd>
            <dt>Meilleur combat</dt>
            <dd>{save.bestFight}</dd>
            <dt>Meilleur stage</dt>
            <dd>{save.bestStage}</dd>
            <dt>Boss finaux</dt>
            <dd>{save.finalBossDefeats}</dd>
            <dt>Lootboxes ouvertes</dt>
            <dd>{save.lifetimeLootboxes}</dd>
            <dt>Coffres ouverts</dt>
            <dd>{save.chestsOpened}</dd>
          </dl>
        </article>
      </div>
    </div>
  );
}

function HubScreen({
  hub,
  run,
  save,
  selectedIds,
  unlockedCharacters,
  customCharacters,
  pendingRecycle,
  dispatch,
}: {
  hub: HubState;
  run: RunState;
  save: SaveData;
  selectedIds: string[];
  unlockedCharacters: CharacterTemplate[];
  customCharacters: CharacterTemplate[];
  pendingRecycle: { characterId: string } | null;
  dispatch: Dispatch<Action>;
}) {
  return (
    <section className={`screen hub-screen stage-${hub.nextStage}`}>
      <HubHeader hub={hub} run={run} save={save} />
      <HubTabs
        active={hub.activeTab}
        onChange={(tab) => dispatch({ type: "HUB_SET_TAB", tab })}
      />
      <div className="hub-content">
        {hub.activeTab === "shop" && (
          <ShopTab hub={hub} gold={save.gold} dispatch={dispatch} />
        )}
        {hub.activeTab === "lootbox" && (
          <LootboxTab gold={save.gold} pity={save.lootboxPity} dispatch={dispatch} />
        )}
        {hub.activeTab === "recycle" && (
          <RecycleTab
            customCharacters={customCharacters}
            selectedIds={selectedIds}
            dispatch={dispatch}
          />
        )}
        {hub.activeTab === "team" && (
          <TeamTab
            run={run}
            selectedIds={selectedIds}
            unlockedCharacters={unlockedCharacters}
            customCharacters={customCharacters}
            freeSwapsUsed={hub.freeSwapsUsed}
            dispatch={dispatch}
          />
        )}
        {hub.activeTab === "stats" && <StatsTab run={run} save={save} />}
      </div>
      <div className="hub-footer">
        <span style={{ color: "var(--color-text-muted)", fontSize: "0.86rem" }}>
          Stage suivant : {STAGE_CONFIGS[hub.nextStage].name}
        </span>
        <button
          id="hub-continue"
          className="hub-continue primary-action"
          type="button"
          onClick={() => dispatch({ type: "HUB_CONTINUE" })}
        >
          Continuer vers le prochain stage
        </button>
      </div>
      <RecycleConfirmModal
        pendingRecycle={pendingRecycle}
        customCharacters={customCharacters}
        dispatch={dispatch}
      />
    </section>
  );
}

function LootboxScreen({
  pendingLootbox,
  customCharacters,
  dispatch,
}: {
  pendingLootbox: PendingLootbox;
  customCharacters: CharacterTemplate[];
  dispatch: Dispatch<Action>;
}) {
  const [phase, setPhase] = useState<LootboxPhase>("idle");
  const rouletteSkipRef = useRef<(() => void) | null>(null);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const result = pendingLootbox.result;
  const finalRarity: Rarity | "fragments" | "gold" = useMemo(() => {
    if (!result) return "fragments";
    if (result.kind === "fragments" || result.kind === "fragments-converted") return "fragments";
    if (result.kind === "gold") return "gold";
    return result.rarity;
  }, [result]);

  const items = useMemo(
    () => (result ? buildRouletteItems(result, finalRarity) : []),
    [result, finalRarity],
  );

  // Expose le hook test global
  useEffect(() => {
    window.__game_test_skip_roulette = () => {
      if (rouletteSkipRef.current) {
        rouletteSkipRef.current();
      } else if (phase === "shake" || phase === "idle") {
        setPhase("reveal");
      }
    };
    return () => {
      window.__game_test_skip_roulette = undefined;
    };
  }, [phase]);

  const handleOpen = () => {
    if (phase !== "idle" || pendingLootbox.opened) return;
    if (reduced) {
      // Idle → reveal direct
      dispatch({ type: "OPEN_LOOTBOX" });
      setPhase("reveal");
      return;
    }
    setPhase("shake");
    window.setTimeout(() => {
      // Dispatch result calc puis bascule en roulette
      dispatch({ type: "OPEN_LOOTBOX" });
      setPhase("roulette");
    }, 320);
  };

  const onRouletteComplete = () => {
    setPhase("reveal");
  };

  const finalRarityV3: Rarity = result && result.kind === "character" ? result.rarity : "common";

  const character: CharacterTemplate | null = useMemo(() => {
    if (!result || result.kind !== "character") return null;
    const all = [...ROSTER, ...customCharacters];
    return all.find((c) => c.id === result.characterId) ?? null;
  }, [result, customCharacters]);

  const contentLabel = result
    ? result.kind === "fragments"
      ? `+${result.amount} fragments`
      : result.kind === "fragments-converted"
        ? `+${result.amount} fragments (${result.from} converti)`
        : result.kind === "gold"
          ? `+${result.amount} or`
          : "Personnage debloque !"
    : "";

  const isLegendaryReveal = finalRarityV3 === "legendary" && phase === "reveal";

  return (
    <section className={`screen lootbox-screen ${isLegendaryReveal ? "is-revealing-legendary" : ""}`}>
      {phase === "idle" || phase === "shake" ? (
        <>
          <div
            className={`lootbox-chest chest chest-tier--${pendingLootbox.tier === "small" ? "damaged" : pendingLootbox.tier === "rare" ? "bronze" : pendingLootbox.tier === "epic" ? "royal" : "runic"} ${phase === "shake" ? "is-shaking" : ""}`}
            onClick={handleOpen}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleOpen();
            }}
            role="button"
            tabIndex={0}
            id="lootbox-open"
            aria-label="Ouvrir le coffre"
          >
            <div className="chest-lid" />
            <div className="chest-body" />
          </div>
          <div className="lootbox-reveal" aria-live="polite">
            <div className="lootbox-reveal__line">Cliquez pour ouvrir</div>
          </div>
        </>
      ) : null}

      {phase === "roulette" && result ? (
        <LootRoulette
          items={items}
          finalIndex={LOOT_ROULETTE_FINAL_INDEX}
          onComplete={onRouletteComplete}
          reducedMotion={reduced}
          testHookRef={rouletteSkipRef}
        />
      ) : null}

      {phase === "reveal" && result ? (
        <RarityReveal
          rarity={finalRarityV3}
          contentLabel={contentLabel}
          character={character}
          onContinue={() => dispatch({ type: "CLOSE_LOOTBOX" })}
        />
      ) : null}

      <button
        id="lootbox-skip-roulette"
        type="button"
        style={{ position: "absolute", left: -9999, top: -9999 }}
        onClick={() => window.__game_test_skip_roulette?.()}
        aria-hidden="true"
      >
        Skip
      </button>
    </section>
  );
}

type FinalChestPhase = "idle" | "shake" | "opening" | "beam" | "reveal";

function FinalChest({
  tier,
  opened,
  reward,
  onOpen,
  customCharacters = [],
}: {
  tier: ChestTier;
  opened: boolean;
  reward: ChestReward | null;
  onOpen: () => void;
  customCharacters?: CharacterTemplate[];
}) {
  const labels: Record<ChestTier, string> = {
    damaged: "abime",
    bronze: "bronze",
    silver: "argent",
    royal: "royal",
    runic: "runique",
  };
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [phase, setPhase] = useState<FinalChestPhase>("idle");

  // When the parent flips `opened` (action OPEN_CHEST dispatched), keep our
  // local sequence in sync. If we were idle, jump straight to reveal (covers
  // legacy paths or reduced-motion).
  useEffect(() => {
    if (opened && phase === "idle") {
      setPhase("reveal");
    }
    if (!opened && phase !== "idle") {
      setPhase("idle");
    }
  }, [opened, phase]);

  const handleOpen = () => {
    if (phase !== "idle" || opened) return;
    if (reduced) {
      // Reduced motion: skip directly to reveal — the action is dispatched once.
      onOpen();
      setPhase("reveal");
      return;
    }
    setPhase("shake");
    window.setTimeout(() => {
      setPhase("opening");
      // Open the chest (parent dispatch) at the start of the opening flash.
      onOpen();
    }, 320);
    window.setTimeout(() => {
      setPhase("beam");
    }, 320 + 400);
    window.setTimeout(() => {
      setPhase("reveal");
    }, 320 + 400 + 300);
  };

  const beamClass = `chest-beam chest-beam--${tier}`;

  // Resolve the character template if the reward is a character — for the
  // CharacterCardDetailed in the reveal phase.
  const rewardCharacter =
    reward && reward.type === "character"
      ? getTemplate(reward.characterId, customCharacters) ?? null
      : null;

  const tierColors = getChestTierColors(tier);
  const isOpening = phase === "opening" || phase === "beam" || phase === "reveal";
  return (
    <>
      <div
        className={`final-chest chest chest--${tier} chest-tier--${tier} ${
          phase === "shake" ? `is-shaking is-shaking--${tier}` : ""
        } ${isOpening ? "opened is-opening" : ""}`}
        style={{
          ["--ccolor" as string]: tierColors.ccolor,
          ["--cdeep" as string]: tierColors.cdeep,
          ["--cglow" as string]: tierColors.cglow,
        } as React.CSSProperties}
      >
        <div className="chest-shadow" aria-hidden="true" />
        <div className="chest-aura" aria-hidden="true" />
        <div className="chest-body" aria-hidden="true">
          <div className={`chest-lid ${isOpening ? "is-opening" : ""}`}>
            <div className="chest-lid-band-top" />
            <div className="chest-lid-keyhole" />
            <span className="chest-lid-stud chest-lid-stud--l" />
            <span className="chest-lid-stud chest-lid-stud--r" />
          </div>
          <div className="chest-box">
            <div className="chest-box-band" />
            <div className="chest-box-lock" />
            {tier === "runic" && (
              <>
                <span className="chest-rune chest-rune--1">✦</span>
                <span className="chest-rune chest-rune--2">✧</span>
                <span className="chest-rune chest-rune--3">✦</span>
              </>
            )}
          </div>
          {(phase === "opening" || phase === "beam") && <span className="chest-burst" />}
        </div>
        {(phase === "beam" || phase === "reveal") && (
          <span className={beamClass} aria-hidden="true" />
        )}
      </div>
      {phase === "opening" && !reduced && <span className="chest-flash" aria-hidden="true" />}
      {phase === "idle" && !opened && (
        <button
          id="open-chest"
          className="btn btn--primary primary-action"
          aria-label={`Ouvrir le coffre ${labels[tier]}`}
          onClick={handleOpen}
          type="button"
        >
          Ouvrir le coffre {labels[tier]}
        </button>
      )}
      {phase === "reveal" && reward && (
        <div
          className="chest-reveal"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {rewardCharacter ? (
            <CharacterCardDetailed character={rewardCharacter} mode="reveal" />
          ) : (
            <ChestResult reward={reward} />
          )}
        </div>
      )}
    </>
  );
}

// =========================================================================
// === V3 — Components
// =========================================================================

const ROLE_FROM_STATS = (c: CharacterTemplate): "Lame" | "Mage" | "Gardien" => {
  if (c.physical >= c.magic && c.physical >= 7) return "Lame";
  if (c.magic > c.physical && c.magic >= 7) return "Mage";
  return "Gardien";
};

const RARITY_V3_LABEL: Record<Rarity, string> = {
  common: "Commun",
  rare: "Rare",
  epic: "Epique",
  legendary: "Legendaire",
};

function CharacterCardDetailed({
  character,
  mode = "static",
  size = "md",
  isSelected = false,
  isLocked = false,
  onClick,
  fragments,
  rank,
  showRoleBadge = true,
  showRarityBadge = true,
}: {
  character: CharacterTemplate;
  mode?: "static" | "reveal";
  size?: "md" | "sm";
  isSelected?: boolean;
  isLocked?: boolean;
  onClick?: () => void;
  fragments?: number;
  rank?: number;
  showRoleBadge?: boolean;
  showRarityBadge?: boolean;
}) {
  void size;
  void showRoleBadge;
  void showRarityBadge;
  const role = ROLE_FROM_STATS(character);
  const rarity = character.rarity;
  const rprops = getRarityProps(rarity);
  const rfr =
    rarity === "common"
      ? "Commune"
      : rarity === "rare"
        ? "Rare"
        : rarity === "epic"
          ? "Épique"
          : "Légendaire";
  const skillKind = character.special.type;
  const skillIcon = skillKind === "heal" ? "✚" : skillKind === "shield" ? "🛡" : "✦";
  const skillKindLabel =
    skillKind === "attack" ? "Attaque" : skillKind === "heal" ? "Soin" : "Bouclier";
  const ariaLabel = `${character.name}, rareté ${RARITY_V3_LABEL[rarity]}, rôle ${role}, PV ${character.maxHp}, physique ${character.physical}, magie ${character.magic}, compétence ${character.special.name}`;
  const filledStars = Math.max(1, Math.min(5, rank ?? rarityToStars(rarity)));
  const Wrapper: "button" | "div" = onClick ? "button" : "div";
  const wrapperProps = onClick
    ? { onClick, type: "button" as const, "aria-label": ariaLabel }
    : { "aria-label": ariaLabel };
  return (
    <Wrapper
      className={`pcard pcard--${rarity} ${isSelected ? "is-hover" : ""} ${isLocked ? "is-locked" : ""} ${mode === "reveal" ? "pcard--reveal" : ""} character-card-detailed rarity-${rarity}`}
      style={{
        ["--rcolor" as string]: rprops.color,
        ["--rdeep" as string]: rprops.deep,
        ["--rcream" as string]: rprops.cream,
      } as React.CSSProperties}
      {...wrapperProps}
    >
      <div className="pcard-halo" />
      <Sparkles count={rprops.particles} color={rprops.sparkColor} />
      <div className="pcard-frame">
        <div className="pcard-top">
          <div className="pcard-rank">RANG {romanizeRank(filledStars)}</div>
          <div className="pcard-rarity-badge">
            <span className="rrb-dot" /> {rfr}
          </div>
        </div>
        <div className={`pcard-portrait pcard-portrait--${rprops.idle}`}>
          {isLocked ? (
            <div className="pcard-locked">
              <div className="pcard-q">?</div>
              <div className="pcard-locked-tag">À DÉBLOQUER</div>
            </div>
          ) : (
            <HeroPortrait rarity={rprops} />
          )}
        </div>
        <div className="pcard-name">{isLocked ? "???" : character.name}</div>
        <div className="pcard-role">{isLocked ? "À débloquer" : role}</div>
        <div className="pcard-stats">
          <PCardStat icon="❤" label="PV" v={character.maxHp} color="var(--hp-good)" />
          <PCardStat icon="⚔" label="ATQ" v={character.physical} color="var(--rage)" />
          <PCardStat icon="✦" label="MAG" v={character.magic} color="var(--mana)" />
          <PCardStat icon="⚡" label="VIT" v={Math.round((character.physical + character.magic) / 2)} color="var(--brand-sun)" />
          <PCardStat icon="🛡" label="DEF" v={Math.max(1, Math.round(character.maxHp / 8))} color="var(--shield)" />
          <PCardStat icon="✚" label="CD" v={Math.round(character.special.cooldown / 1000)} color="var(--hp-good)" />
        </div>
        <div className="pcard-skill">
          <div className="pcard-skill-head">
            <span className="pcard-skill-icon">{skillIcon}</span>
            <span className="pcard-skill-name">{character.special.name}</span>
          </div>
          <div className="pcard-skill-desc">
            {skillKindLabel} · {character.special.power}
          </div>
        </div>
        <div className="pcard-trait">
          <span className="pcard-trait-tag">TRAIT</span>
          <span className="pcard-trait-name">
            {character.custom ? `Forge ${RARITY_V3_LABEL[rarity]}` : RARITY_V3_LABEL[rarity]}
          </span>
        </div>
        <div className="pcard-foot">
          <div className="pcard-foot-l">
            <span className="pcard-frag">◆ {fragments ?? 0}</span>
            <span className="pcard-frag-lbl">FRAGMENTS</span>
          </div>
          <div className="pcard-rank-stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`rs ${i < filledStars ? "rs--on" : ""}`}>★</span>
            ))}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

function PCardStat({ icon, label, v, color }: { icon: string; label: string; v: number | string; color: string }) {
  return (
    <div className="stat">
      <div className="stat-icon" style={{ background: color } as React.CSSProperties}>{icon}</div>
      <div className="stat-meta">
        <div className="stat-v">{v}</div>
        <div className="stat-l">{label}</div>
      </div>
    </div>
  );
}

function rarityToStars(r: Rarity): number {
  return r === "common" ? 1 : r === "rare" ? 2 : r === "epic" ? 3 : 4;
}

function romanizeRank(n: number): string {
  const r = ["I", "II", "III", "IV", "V"];
  return r[Math.max(0, Math.min(4, n - 1))] ?? "I";
}

// === V3 — SpeedSelector ===
function SpeedSelector({
  current,
  onChange,
}: {
  current: CombatSpeed;
  onChange: (s: CombatSpeed) => void;
}) {
  const speeds: { value: CombatSpeed; label: string; id: string }[] = [
    { value: 1, label: "x1", id: "speed-1" },
    { value: 1.25, label: "x1.25", id: "speed-1-25" },
    { value: 1.5, label: "x1.5", id: "speed-1-5" },
  ];
  return (
    <div className="speed-selector" role="radiogroup" aria-label="Vitesse de combat">
      {speeds.map((s) => (
        <button
          key={s.id}
          id={s.id}
          type="button"
          role="radio"
          aria-checked={current === s.value}
          className={`speed-selector__btn ${current === s.value ? "is-active" : ""}`}
          onClick={() => onChange(s.value)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// === V3 — Floating numbers ===
function variantClass(v: FloatingNumberVariant): string {
  return `floating-num--${v}`;
}

function variantSign(v: FloatingNumberVariant): "+" | "-" {
  return v === "heal" || v === "shield" ? "+" : "-";
}

function variantSuffix(v: FloatingNumberVariant): string {
  switch (v) {
    case "damage-physical":
      return "PH";
    case "damage-magic":
      return "MAG";
    case "heal":
      return "SOIN";
    case "shield":
      return "BCL";
    case "poison":
      return "POISON";
    case "burn":
      return "BRULURE";
    case "crit":
      return "";
  }
}

function variantLabel(v: FloatingNumberVariant, amount: number): string {
  switch (v) {
    case "damage-physical":
      return `-${amount} PH`;
    case "damage-magic":
      return `-${amount} MAG`;
    case "heal":
      return `+${amount} SOIN`;
    case "shield":
      return `+${amount} BCL`;
    case "poison":
      return `POISON -${amount}`;
    case "burn":
      return `BRULURE -${amount}`;
    case "crit":
      return `CRIT -${amount}`;
  }
}

function formatGroupedLabel(variant: FloatingNumberVariant, parts: number[]): string {
  if (parts.length <= 1) return variantLabel(variant, parts[0] ?? 0);
  const sign = variantSign(variant);
  const suffix = variantSuffix(variant);
  if (parts.length === 2) {
    const body = parts.map((n) => `${sign}${n}`).join(" / ");
    if (variant === "poison" || variant === "burn") {
      return `${suffix} ${body}`;
    }
    return suffix ? `${body} ${suffix}` : body;
  }
  if (parts.length === 3) {
    const body = parts.map((n) => `${sign}${n}`).join(" / ");
    if (variant === "poison" || variant === "burn") {
      return `${suffix} ${body}`;
    }
    return suffix ? `${body} ${suffix}` : body;
  }
  // 4+ → cumulative
  const total = parts.reduce((a, b) => a + b, 0);
  if (variant === "poison" || variant === "burn") {
    return `${suffix} ${sign}${total} (cumul)`;
  }
  return suffix ? `${sign}${total} ${suffix} (cumul)` : `${sign}${total} (cumul)`;
}

type GroupedFloatingNumber = {
  id: string;
  variant: FloatingNumberVariant;
  targetId: string;
  isAlly: boolean;
  parts: number[];
  createdAt: number;
};

const GROUP_WINDOW_MS = 120;

// Pure helper: groups damage/heal/shield events on the same target+variant
// when they arrive within GROUP_WINDOW_MS of each other.
// Crit and status (poison/burn) are never grouped.
function groupFloatingNumbers(events: CombatAnimEvent[]): GroupedFloatingNumber[] {
  // Sort by createdAt ascending for stable grouping.
  const sorted = [...events]
    .filter((e) => e.kind === "damage-number" || e.kind === "heal-number" || e.kind === "shield-number")
    .sort((a, b) => a.createdAt - b.createdAt);
  const out: GroupedFloatingNumber[] = [];
  for (const ev of sorted) {
    let variant: FloatingNumberVariant;
    let amount: number;
    let targetId: string;
    let isAlly: boolean;
    if (ev.kind === "damage-number") {
      variant = ev.variant;
      amount = ev.amount;
      targetId = ev.targetId;
      isAlly = ev.isAlly;
    } else if (ev.kind === "heal-number") {
      variant = "heal";
      amount = ev.amount;
      targetId = ev.targetId;
      isAlly = ev.isAlly;
    } else {
      variant = "shield";
      amount = ev.amount;
      targetId = ev.targetId;
      isAlly = ev.isAlly;
    }
    // Crit / poison / burn never group.
    if (variant === "crit" || variant === "poison" || variant === "burn") {
      out.push({
        id: ev.id,
        variant,
        targetId,
        isAlly,
        parts: [amount],
        createdAt: ev.createdAt,
      });
      continue;
    }
    // Find an existing group with same target + variant within window of last part.
    const last = out[out.length - 1];
    const candidate = [...out].reverse().find(
      (g) =>
        g.variant === variant &&
        g.targetId === targetId &&
        ev.createdAt - g.createdAt < GROUP_WINDOW_MS,
    );
    if (candidate && candidate === last) {
      candidate.parts.push(amount);
      candidate.createdAt = ev.createdAt; // anchor on most recent for sliding window
    } else if (candidate) {
      candidate.parts.push(amount);
      candidate.createdAt = ev.createdAt;
    } else {
      out.push({
        id: ev.id,
        variant,
        targetId,
        isAlly,
        parts: [amount],
        createdAt: ev.createdAt,
      });
    }
  }
  return out;
}

function FloatingNumber({
  variant,
  value,
  parts,
  position,
  zigzagSlot,
}: {
  variant: FloatingNumberVariant;
  value: number;
  parts?: number[];
  position: { x: number; y: number };
  zigzagSlot: 0 | 1 | 2;
}) {
  const offsets = [-12, 0, 12];
  const style: React.CSSProperties = {
    left: `${position.x}%`,
    top: `${position.y}%`,
    // @ts-expect-error CSS custom property
    "--fnum-offset-x": `${offsets[zigzagSlot]}px`,
  };
  const label = parts && parts.length > 1
    ? formatGroupedLabel(variant, parts)
    : variantLabel(variant, value);
  return (
    <span className={`floating-num ${variantClass(variant)}`} style={style}>
      {label}
    </span>
  );
}

// === V3 — Projectile ===
function Projectile({
  origin,
  target,
  trajectory,
  isSpecial,
}: {
  origin: { x: number; y: number };
  target: { x: number; y: number };
  trajectory: AnimTrajectory;
  isSpecial: boolean;
}) {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const style: React.CSSProperties = {
    left: `${origin.x}%`,
    top: `${origin.y}%`,
    // @ts-expect-error CSS custom property
    "--proj-distance-x": `${dx}vw`,
    "--proj-distance-y": `${dy}vh`,
  };
  if (trajectory === "shield") {
    return <span className={`projectile projectile--shield ${isSpecial ? "projectile--special" : ""}`} style={{ left: `${target.x}%`, top: `${target.y}%` }} />;
  }
  if (trajectory === "heal") {
    return <span className="projectile projectile-heal-particle" style={style} />;
  }
  if (trajectory === "poison") {
    return <span className="projectile projectile-poison-particle" style={style} />;
  }
  return <span className={`projectile projectile--${trajectory} ${isSpecial ? "projectile--special" : ""}`} style={style} />;
}

// Position approximation for a card by id (ally ids in team, enemy id is unique).
function locateCard(
  id: string,
  team: CombatCharacter[],
  enemyId: string,
): { x: number; y: number } {
  if (id === enemyId) return { x: 76, y: 45 };
  const idx = team.findIndex((m) => m.id === id);
  if (idx < 0) return { x: 50, y: 50 };
  return { x: 23, y: 34 + idx * 16 };
}

// === V3 — CombatAnimationLayer ===
function CombatAnimationLayer({
  queue,
  team,
  enemyId,
}: {
  queue: CombatAnimEvent[];
  team: CombatCharacter[];
  enemyId: string;
}) {
  const groupedNumbers = useMemo(() => groupFloatingNumbers(queue), [queue]);
  return (
    <div className="combat-anim-layer" aria-hidden="true">
      {queue.map((ev) => {
        if (ev.kind === "projectile") {
          const origin = locateCard(ev.sourceId, team, enemyId);
          const target = locateCard(ev.targetId, team, enemyId);
          return (
            <Projectile
              key={ev.id}
              origin={origin}
              target={target}
              trajectory={ev.trajectory}
              isSpecial={Boolean(ev.isSpecial)}
            />
          );
        }
        return null;
      })}
      {groupedNumbers.map((g) => {
        const pos = locateCard(g.targetId, team, enemyId);
        const slot = (g.id.charCodeAt(g.id.length - 1) % 3) as 0 | 1 | 2;
        return (
          <FloatingNumber
            key={g.id}
            variant={g.variant}
            value={g.parts[0] ?? 0}
            parts={g.parts.length > 1 ? g.parts : undefined}
            position={pos}
            zigzagSlot={slot}
          />
        );
      })}
    </div>
  );
}

// === V3 — Boss Intro Overlay ===
const BOSS_PHRASES: Record<Stage, string> = {
  1: "Les braises te connaissent, petite etincelle. Elles ont deja tout brule... et elles ont encore faim.",
  2: "Oh, tu es venu ? Reste un peu. Je collectionne les sourires comme le tien.",
  3: "Ah ! Un sujet. Agenouille-toi — je collectionne les couronnes plus petites que la mienne.",
};

function BossIntroOverlay({
  enemy,
  stage,
  onDone,
}: {
  enemy: Enemy;
  stage: Stage;
  onDone: () => void;
}) {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    const ms = reduced ? 800 : 1600;
    const t = window.setTimeout(onDone, ms);
    return () => window.clearTimeout(t);
  }, [onDone, reduced]);

  const stageAccents: Record<Stage, { name: string; glow: string; deep: string }> = {
    1: { name: "#E0B450", glow: "rgba(224,180,80,0.5)", deep: "rgba(140,100,40,0.7)" },
    2: { name: "#9C6BD9", glow: "rgba(156,107,217,0.5)", deep: "rgba(80,40,140,0.7)" },
    3: { name: "#E0654F", glow: "rgba(224,101,79,0.55)", deep: "rgba(140,40,40,0.75)" },
  };
  const accent = stageAccents[stage];

  const style: React.CSSProperties = {
    // @ts-expect-error CSS custom properties
    "--boss-accent": accent.name,
    "--boss-accent-glow": accent.glow,
    "--boss-accent-deep": accent.deep,
  };

  const bossVariant: MascotVariant =
    enemy.mascot ?? (stage === 1 ? "boss-cinder" : stage === 2 ? "boss-void" : "boss-king");

  return (
    <div
      className={`boss-intro-overlay stage-${stage}`}
      style={style}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="boss-intro-name"
    >
      <div className="boss-intro__aura boss-intro-overlay__mascot" aria-hidden="true">
        <HeroMascot variant={bossVariant} size="xl" mood="angry" side="enemy" />
      </div>
      <h1 id="boss-intro-name" className="boss-intro__name boss-intro-overlay__name">
        {enemy.name}
      </h1>
      <div className="boss-intro__subtitle">BOSS DE STAGE</div>
      <p className="boss-intro__phrase boss-intro-overlay__phrase">{BOSS_PHRASES[stage]}</p>
      <button
        id="boss-intro-skip"
        className="boss-intro-skip"
        type="button"
        onClick={onDone}
        aria-label="Passer l'intro du boss"
      >
        Passer
      </button>
      <div aria-live="assertive" className="visually-hidden">{`Boss : ${enemy.name}, stage ${stage}.`}</div>
    </div>
  );
}

// === V3 — Lootbox refondu ===
type LootboxPhase = "idle" | "shake" | "roulette" | "reveal" | "opened";

const LOOT_ROULETTE_ITEMS = 18;
const LOOT_ROULETTE_FINAL_INDEX = 14;
const LOOT_ITEM_WIDTH = 140;
const LOOT_ITEM_GAP = 16;

type RouletteItem = {
  id: string;
  rarity: Rarity | "fragments" | "gold";
  label: string;
};

function buildRouletteItems(result: LootBoxResult, finalRarity: Rarity | "fragments" | "gold"): RouletteItem[] {
  const items: RouletteItem[] = [];
  const decoys: (Rarity | "fragments" | "gold")[] = ["fragments", "gold", "common", "rare", "epic", "legendary"];
  for (let i = 0; i < LOOT_ROULETTE_ITEMS; i += 1) {
    if (i === LOOT_ROULETTE_FINAL_INDEX) {
      items.push({
        id: `final-${i}`,
        rarity: finalRarity,
        label: result.kind === "fragments" || result.kind === "fragments-converted"
          ? `+${result.amount} frag`
          : result.kind === "gold"
            ? `+${result.amount} or`
            : "Personnage",
      });
    } else {
      // Bias positions 16/17 ≥ rareté finale pour effet "presque".
      let pick: Rarity | "fragments" | "gold";
      if (i === 16 || i === 17) {
        if (finalRarity === "legendary" || finalRarity === "epic") {
          pick = "legendary";
        } else {
          pick = "rare";
        }
      } else {
        pick = decoys[Math.floor(Math.random() * decoys.length)];
      }
      items.push({
        id: `decoy-${i}`,
        rarity: pick,
        label:
          pick === "fragments" ? "Fragments" : pick === "gold" ? "Or" : RARITY_V3_LABEL[pick],
      });
    }
  }
  return items;
}

function rarityClassFor(r: Rarity | "fragments" | "gold"): string {
  if (r === "fragments" || r === "gold") return "rarity-common";
  return `rarity-${r}`;
}

function LootRoulette({
  items,
  finalIndex,
  onComplete,
  reducedMotion,
  testHookRef,
}: {
  items: RouletteItem[];
  finalIndex: number;
  onComplete: () => void;
  reducedMotion: boolean;
  testHookRef: React.MutableRefObject<(() => void) | null>;
}) {
  const [translatePx, setTranslatePx] = useState(0);
  const startRef = React.useRef<number | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const completedRef = React.useRef(false);

  const totalDuration = reducedMotion ? 200 : 2500;
  // Centre cible : item finalIndex centré.
  const itemFull = LOOT_ITEM_WIDTH + LOOT_ITEM_GAP;
  const targetX = -(finalIndex * itemFull) + (640 - LOOT_ITEM_WIDTH / 2);

  useEffect(() => {
    let cancelled = false;
    const easeOut = (t: number) => {
      // Approximation cubic-bezier(.12,.85,.25,1) via cubic ease-out simple : 1 - (1-t)^3.
      return 1 - Math.pow(1 - t, 3);
    };
    const tick = (ts: number) => {
      if (cancelled) return;
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(1, elapsed / totalDuration);
      setTranslatePx(targetX * easeOut(progress));
      if (progress >= 1) {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    testHookRef.current = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      setTranslatePx(targetX);
      onComplete();
    };

    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      testHookRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // V5 — palette mini-portrait par rareté (chests.jsx L73-77)
  const miniPalette: Record<string, { c: string; cream: string }> = {
    common: { c: "#9aa3b2", cream: "#ecedf0" },
    rare: { c: "#4ec5e8", cream: "#e0f4fb" },
    epic: { c: "#b563ff", cream: "#f1e3ff" },
    legendary: { c: "#ffb938", cream: "#fff2d1" },
    mythic: { c: "#ff5fa2", cream: "#ffe1ee" },
    fragments: { c: "#7a6c92", cream: "#ecedf0" },
    gold: { c: "#ffb938", cream: "#fff2d1" },
  };
  return (
    <div className="loot-roulette rou">
      <div className="rou-frame">
        <div className="rou-marker" aria-hidden="true" />
        <div className="loot-roulette__marker" aria-hidden="true" />
        <div className="rou-fade rou-fade--l" aria-hidden="true" />
        <div className="rou-fade rou-fade--r" aria-hidden="true" />
        <div
          id="loot-roulette-strip"
          className="loot-roulette__strip rou-strip"
          style={{ transform: `translate3d(${translatePx}px, 0, 0)` }}
        >
          {items.map((it, idx) => {
            const pal = miniPalette[it.rarity] ?? miniPalette.common;
            return (
              <div
                key={it.id}
                className={`loot-roulette__item rou-item rou-item--${it.rarity} ${rarityClassFor(it.rarity)} ${idx === finalIndex && completedRef.current ? "is-winner" : ""}`}
              >
                <div
                  className="mini-portrait"
                  style={{ background: `linear-gradient(180deg, ${pal.cream}, white)` } as React.CSSProperties}
                >
                  <div className="mini-head">
                    <div className="mini-hat" style={{ background: pal.c } as React.CSSProperties} />
                    <div className="mini-eye mini-eye--l" />
                    <div className="mini-eye mini-eye--r" />
                    <div className="mini-mouth" />
                  </div>
                </div>
                <div className="rou-item-name">{it.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RarityReveal({
  rarity,
  contentLabel,
  character,
  onContinue,
}: {
  rarity: Rarity;
  contentLabel: string;
  character: CharacterTemplate | null;
  onContinue: () => void;
}) {
  return (
    <div
      className={`rarity-reveal rarity-reveal--${rarity}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={character ? `Personnage ${RARITY_V3_LABEL[rarity]} : ${character.name}` : contentLabel}
    >
      <div className="reveal-card">
        {character ? (
          <CharacterCardDetailed character={character} mode="reveal" />
        ) : (
          <div className={`character-card-detailed rarity-${rarity}`} style={{ display: "grid", placeItems: "center" }}>
            <strong style={{ fontSize: "1.1rem" }}>{contentLabel}</strong>
          </div>
        )}
      </div>
      {(rarity === "rare" || rarity === "epic" || rarity === "legendary") && (
        <>
          <span className={`reveal-particle reveal-particle--${rarity}`} style={{ left: "20%", top: "30%", "--burst-x": "-60px", "--burst-y": "-40px" } as React.CSSProperties} />
          <span className={`reveal-particle reveal-particle--${rarity}`} style={{ left: "75%", top: "30%", "--burst-x": "60px", "--burst-y": "-40px" } as React.CSSProperties} />
          <span className={`reveal-particle reveal-particle--${rarity}`} style={{ left: "20%", top: "70%", "--burst-x": "-50px", "--burst-y": "50px" } as React.CSSProperties} />
          <span className={`reveal-particle reveal-particle--${rarity}`} style={{ left: "75%", top: "70%", "--burst-x": "50px", "--burst-y": "50px" } as React.CSSProperties} />
        </>
      )}
      <button id="lootbox-close" className="primary-action" type="button" onClick={onContinue} style={{ marginTop: 24 }}>
        Recuperer
      </button>
    </div>
  );
}

function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [draft, setDraft] = useState<CreatorDraft>({
    name: "",
    rarity: "common",
    role: "blade",
    specialType: "attack",
  });
  // === V5.1 — Phase 4 — UI menu states ===
  const [confirmNewRun, setConfirmNewRun] = useState(false);
  const [confirmResetSave, setConfirmResetSave] = useState(false);
  // Détection de corruption au chargement (T18). On lit le drapeau global posé
  // par loadSave() dans un effet une seule fois pour ne pas le perdre au render.
  const [saveCorrupted, setSaveCorrupted] = useState<boolean>(() => __saveCorruptionDetected);
  const dismissCorruptionBanner = () => setSaveCorrupted(false);
  const runLocked =
    state.screen === "combat" ||
    state.screen === "reward" ||
    state.screen === "stage-intro" ||
    state.screen === "hub" ||
    state.screen === "lootbox" ||
    state.screen === "boss-relic-choice";
  const stageClass = state.run ? `stage-${state.run.stage}` : "";
  const characters = useMemo(() => allCharacters(state.save), [state.save]);
  const unlockedCharacters = useMemo(
    () => characters.filter((character) => state.save.unlockedIds.includes(character.id)),
    [characters, state.save.unlockedIds],
  );
  const previewCharacter = useMemo(() => createCustomCharacter(draft), [draft]);
  const creationCost = CREATION_COST[draft.rarity];
  const canCreate = state.save.fragments >= creationCost;
  // V3 — derive card anim classes from animQueue. Recomputed every render
  // (state.run.animQueue changes shape on each TICK while events are alive).
  const combatAnimState = useMemo<CardAnimState>(
    () =>
      state.run
        ? computeCardAnimState(state.run.animQueue)
        : { attackingIds: new Set(), attackingSpecialIds: new Set(), hitIds: new Set(), flashIds: new Set() },
    [state.run],
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.save));
  }, [state.save]);

  useEffect(() => {
    if (state.screen !== "combat" || window.__vt_pending) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      dispatch({ type: "TICK", delta: 260 });
    }, 260);
    return () => window.clearInterval(interval);
  }, [state.screen]);

  useEffect(() => {
    window.advanceTime = (ms: number) => {
      dispatch({ type: "TICK", delta: Math.max(16, ms) });
    };
    window.__game_test_skip_boss_intro = () => {
      dispatch({ type: "BOSS_INTRO_DISMISS" });
    };
    window.render_game_to_text = () =>
      JSON.stringify({
        coordinateSystem: "UI percentages, origin top-left, x grows right, y grows down",
        screen: state.screen,
        notice: state.notice,
        save: {
          unlocked: state.save.unlockedIds.length,
          custom: state.save.customCharacters.length,
          gold: state.save.gold,
          fragments: state.save.fragments,
          bestFight: state.save.bestFight,
          saveVersion: state.save.saveVersion,
          bestStage: state.save.bestStage,
          finalBossDefeats: state.save.finalBossDefeats,
          lifetimeLootboxes: state.save.lifetimeLootboxes,
          settings: state.save.settings,
          lootboxPity: state.save.lootboxPity,
        },
        selectedIds: state.selectedIds,
        run: state.run
            ? {
              fight: state.run.fight,
              stage: state.run.stage,
              wave: state.run.wave,
              wins: state.run.wins,
              lives: state.run.lives,
              bossIn: nextBossIn(state.run.fight),
              modifier: {
                label: state.run.modifier.label,
                detail: state.run.modifier.detail,
              },
              stats: state.run.stats,
              enemy: {
                name: state.run.enemy.name,
                trait: state.run.enemy.trait,
                intent: state.run.enemy.intent.label,
                boss: state.run.enemy.boss,
                hp: state.run.enemy.hp,
                maxHp: state.run.enemy.maxHp,
                shield: state.run.enemy.shield,
              },
              team: state.run.team.map((member) => ({
                id: member.id,
                name: member.name,
                hp: member.hp,
                maxHp: member.maxHp,
                shield: member.shield,
                specialReady: member.specialCd <= 0,
              })),
              consumables: state.run.consumables.map((c) =>
                c ? { kind: c.kind, name: c.name } : null,
              ),
              relics: state.run.relics.map((r) => ({
                name: r.name,
                source: r.source,
                detail: r.detail,
              })),
              shopDiscountPercent: state.run.shopDiscountPercent,
              blessingsUsed: state.run.blessingsUsed,
              animQueueLength: state.run.animQueue.length,
              bossIntroActive: state.run.bossIntroAt !== null,
              bossPhase: state.run.bossPhase,
              log: state.run.log.slice(0, 3),
            }
          : null,
        rewards: state.rewardOptions.map((reward) => reward.title),
        chest: state.chest,
        chestTier: state.chest?.tier ?? null,
        hub: state.hub
          ? {
              stageJustCleared: state.hub.stageJustCleared,
              nextStage: state.hub.nextStage,
              activeTab: state.hub.activeTab,
              shopItemsCount: state.hub.shopItems.length,
              shopItems: state.hub.shopItems.map((it) => ({
                name: it.name,
                price: it.price,
                rarity: it.rarity,
              })),
              freeSwapsUsed: state.hub.freeSwapsUsed,
              shopRerolls: state.hub.shopRerolls,
            }
          : null,
        stageIntro: state.stageIntro,
        lootbox: state.pendingLootbox
          ? {
              tier: state.pendingLootbox.tier,
              opened: state.pendingLootbox.opened,
              result: state.pendingLootbox.result,
            }
          : null,
        pendingRecycle: state.pendingRecycle,
        pendingConsumable: state.pendingConsumable
          ? {
              new: CONSUMABLE_DEFS[state.pendingConsumable.kind].name,
              kind: state.pendingConsumable.kind,
              source: state.pendingConsumable.source,
              slot0: state.run?.consumables[0]?.name ?? null,
              slot1: state.run?.consumables[1]?.name ?? null,
              slot2: state.run?.consumables[2]?.name ?? null,
              modal: `Modale de remplacement: slot 0 = ${state.run?.consumables[0]?.name ?? "vide"}, slot 1 = ${state.run?.consumables[1]?.name ?? "vide"}, slot 2 = ${state.run?.consumables[2]?.name ?? "vide"}, nouveau = ${CONSUMABLE_DEFS[state.pendingConsumable.kind].name}`,
            }
          : null,
        pendingBossRelics: state.pendingBossRelics
          ? {
              tier: state.pendingBossRelics.tier,
              options: state.pendingBossRelics.options.map((r) => ({
                name: r.name,
                detail: r.detail,
              })),
            }
          : null,
      });
  }, [state]);

  const startDisabled = state.selectedIds.length !== 3;

  return (
    <main className={`app-shell ${stageClass}`}>
      <canvas className="test-canvas" width="1280" height="720" aria-hidden="true" />
      <header className={`topbar ${runLocked ? "topbar-locked" : ""}`}>
        <button
          className="brand"
          onClick={() => {
            if (!runLocked) {
              dispatch({ type: "NAVIGATE", screen: "menu" });
            }
          }}
          aria-disabled={runLocked}
        >
          Runebound Cards
        </button>
        {!runLocked && (
          <nav>
            <button onClick={() => dispatch({ type: "NAVIGATE", screen: "collection" })}>
              Collection
            </button>
            <button id="nav-creator" onClick={() => dispatch({ type: "NAVIGATE", screen: "creator" })}>
              Atelier
            </button>
            <button onClick={() => dispatch({ type: "NAVIGATE", screen: "team" })}>Equipe</button>
          </nav>
        )}
        <div className="wallet">
          <span>{state.save.gold} or</span>
          <span>{state.save.fragments} fragments</span>
        </div>
      </header>

      {state.notice && <div className="notice">{state.notice}</div>}

      {state.screen === "menu" && (
        <section className="screen menu-screen">
          {/* V5.1 P4 — Bannière de save corrompue (T18) — V5.2 contrast pass */}
          {saveCorrupted && (
            <div className="notice notice--warning" role="alert">
              <span>
                Votre sauvegarde a été détectée comme corrompue. Cliquez sur « Réinitialiser la sauvegarde » ci-dessous pour repartir à zéro, ou{" "}
                <button
                  type="button"
                  className="link-action"
                  onClick={dismissCorruptionBanner}
                  style={{ display: "inline" }}
                >
                  ignorer
                </button>
                .
              </span>
            </div>
          )}
          <div className="menu-copy">
            <span className="eyebrow">Prototype roguelite</span>
            <h1>Runebound Cards</h1>
            <p>Composez trois cartes, traversez les combats, ouvrez le coffre final.</p>
            <div className="menu-actions menu-actions-grid">
              <div className="menu-actions row-primary">
                {/* V5.1 P4 — Bouton Continuer la run, visible uniquement si snapshot existe */}
                {state.save.currentRun && (
                  <button
                    id="continue-run"
                    className="primary-action"
                    onClick={() => dispatch({ type: "CONTINUE_RUN" })}
                  >
                    Continuer la run
                  </button>
                )}
                <button
                  id="start-run"
                  className={state.save.currentRun ? "" : "primary-action"}
                  onClick={() => {
                    if (state.save.currentRun) {
                      setConfirmNewRun(true);
                    } else {
                      dispatch({ type: "NAVIGATE", screen: "team" });
                    }
                  }}
                >
                  Nouvelle run
                </button>
              </div>
              <div className="menu-actions row-secondary">
                <button onClick={() => dispatch({ type: "NAVIGATE", screen: "collection" })}>
                  Collection
                </button>
                <button onClick={() => dispatch({ type: "NAVIGATE", screen: "creator" })}>
                  Atelier
                </button>
              </div>
              <div className="menu-actions row-tertiary">
                <button
                  id="nav-howto"
                  type="button"
                  onClick={() => dispatch({ type: "NAVIGATE", screen: "howto" })}
                >
                  Comment jouer
                </button>
                <button
                  id="nav-stats"
                  type="button"
                  onClick={() => dispatch({ type: "NAVIGATE", screen: "stats" })}
                >
                  Statistiques
                </button>
                <button
                  id="nav-options"
                  type="button"
                  onClick={() => dispatch({ type: "NAVIGATE", screen: "options" })}
                >
                  Options
                </button>
              </div>
              <div className="menu-actions row-link">
                <button
                  id="reset-save"
                  className="link-action"
                  onClick={() => setConfirmResetSave(true)}
                >
                  Réinitialiser la sauvegarde
                </button>
              </div>
            </div>
            <div className="menu-stats-pills" aria-label="Statistiques rapides">
              <span className="stat-pill">🏆 Meilleur combat <strong>{state.save.bestFight}</strong></span>
              <span className="stat-pill">⚔️ Meilleur stage <strong>{state.save.bestStage}</strong></span>
              <span className="stat-pill">👑 Boss vaincus <strong>{state.save.finalBossDefeats}</strong></span>
              <span className="stat-pill">📦 Coffres <strong>{state.save.chestsOpened}</strong></span>
              <span className="stat-pill">💰 Or <strong>{state.save.gold}</strong></span>
              <span className="stat-pill">💎 Fragments <strong>{state.save.fragments}</strong></span>
            </div>
            <div className="menu-footer">
              Bobbycard V5.2 — Prototype
            </div>
          </div>
          <div className="menu-sigil" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          {/* V5.1 P4 — Modale confirmation Nouvelle run (écrase la run en cours) — V5.2 contrast */}
          {confirmNewRun && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-new-run-title"
              className="modal-backdrop modal-backdrop--ink"
            >
              <div className="modal-card modal-card--cream">
                <h2 id="confirm-new-run-title">Écraser la run en cours ?</h2>
                <p>
                  Une run est déjà sauvegardée. Si vous continuez, elle sera définitivement perdue.
                </p>
                <div className="modal-actions">
                  <button
                    id="cancel-new-run"
                    type="button"
                    className="btn-secondary"
                    onClick={() => setConfirmNewRun(false)}
                  >
                    Annuler
                  </button>
                  <button
                    id="confirm-new-run"
                    type="button"
                    className="primary-action"
                    onClick={() => {
                      setConfirmNewRun(false);
                      dispatch({ type: "DISCARD_SAVED_RUN" });
                      dispatch({ type: "NAVIGATE", screen: "team" });
                    }}
                  >
                    Nouvelle run
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* V5.1 P4 — Modale confirmation Réinitialiser sauvegarde — V5.2 contrast */}
          {confirmResetSave && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-reset-title"
              className="modal-backdrop modal-backdrop--ink"
            >
              <div className="modal-card modal-card--cream">
                <h2 id="confirm-reset-title">Réinitialiser la sauvegarde ?</h2>
                <p>
                  Toute votre progression (or, fragments, personnages débloqués, run en cours) sera effacée. Cette action est irréversible.
                </p>
                <div className="modal-actions">
                  <button
                    id="cancel-reset"
                    type="button"
                    className="btn-secondary"
                    onClick={() => setConfirmResetSave(false)}
                  >
                    Annuler
                  </button>
                  <button
                    id="confirm-reset"
                    type="button"
                    className="primary-action"
                    onClick={() => {
                      try {
                        localStorage.removeItem(STORAGE_KEY);
                      } catch (err) {
                        console.warn("[runebound] Suppression localStorage impossible.", err);
                      }
                      window.location.reload();
                    }}
                  >
                    Tout réinitialiser
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {state.screen === "collection" && (
        <section className="screen">
          <div className="section-heading">
            <span className="eyebrow">Collection</span>
            <h1>Personnages</h1>
            <button
              className="link-action"
              onClick={() => dispatch({ type: "NAVIGATE", screen: "creator" })}
            >
              Forger avec fragments
            </button>
          </div>
          <div className="collection-grid collection-grid--detailed">
            {characters.map((character) => (
              <CharacterCardDetailed
                key={character.id}
                character={character}
                isLocked={!state.save.unlockedIds.includes(character.id)}
              />
            ))}
          </div>
        </section>
      )}

      {state.screen === "creator" && (
        <section className="screen creator-screen">
          <div className="section-heading">
            <span className="eyebrow">Atelier</span>
            <h1>Creer un personnage</h1>
          </div>
          <div className="creator-layout">
            <form
              className="creator-form"
              onSubmit={(event) => {
                event.preventDefault();
                dispatch({ type: "CREATE_CHARACTER", character: previewCharacter });
                setDraft({ name: "", rarity: "common", role: "blade", specialType: "attack" });
              }}
            >
              <label>
                Nom
                <input
                  id="creator-name"
                  value={draft.name}
                  maxLength={28}
                  placeholder="Nom du heros"
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                />
              </label>
              <label>
                Role
                <select
                  value={draft.role}
                  onChange={(event) =>
                    setDraft({ ...draft, role: event.target.value as CreatorRole })
                  }
                >
                  <option value="blade">Lame</option>
                  <option value="mage">Mage</option>
                  <option value="warden">Gardien</option>
                </select>
              </label>
              <label>
                Capacite
                <select
                  value={draft.specialType}
                  onChange={(event) =>
                    setDraft({ ...draft, specialType: event.target.value as SpecialType })
                  }
                >
                  <option value="attack">Attaque</option>
                  <option value="heal">Soin</option>
                  <option value="shield">Bouclier</option>
                </select>
              </label>
              <label>
                Rarete
                <select
                  id="creator-rarity"
                  value={draft.rarity}
                  onChange={(event) =>
                    setDraft({ ...draft, rarity: event.target.value as Rarity })
                  }
                >
                  <option value="common">Commune - 0 fragments</option>
                  <option value="rare">Rare - 15 fragments</option>
                  <option value="epic">Epique - 35 fragments</option>
                  <option value="legendary">Legendaire - 70 fragments</option>
                </select>
              </label>
              <div className="forge-cost">
                <span>Cout</span>
                <strong>{creationCost} fragments</strong>
              </div>
              <button
                id="create-character"
                className="primary-action"
                disabled={!canCreate}
                type="submit"
              >
                Creer
              </button>
            </form>
            <div className="creator-preview">
              <CharacterCardDetailed character={previewCharacter} isSelected />
              <div className="creator-note">
                <span>{ROLE_LABEL[draft.role]}</span>
                <span>{canCreate ? "Pret a forger" : "Fragments insuffisants"}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {state.screen === "team" && (
        <section className="screen team-screen">
          <div className="section-heading">
            <span className="eyebrow">Selection</span>
            <h1>Equipe de trois</h1>
          </div>
          <div className="selected-line">
            {state.selectedIds
              .map((id) => getTemplate(id, state.save.customCharacters)?.name)
              .join(" / ") || "Aucun"}
          </div>
          <div className="collection-grid">
            {unlockedCharacters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                selected={state.selectedIds.includes(character.id)}
                onClick={() => dispatch({ type: "TOGGLE_CHARACTER", id: character.id })}
              />
            ))}
          </div>
          <button
            id="team-start"
            className="primary-action wide-action"
            onClick={() => dispatch({ type: "START_RUN" })}
            disabled={startDisabled}
          >
            Lancer la run
          </button>
        </section>
      )}

      {state.screen === "stage-intro" && state.stageIntro && (
        <StageIntroScreen
          stage={state.stageIntro.stage}
          onEnter={() => dispatch({ type: "START_STAGE" })}
        />
      )}

      {state.screen === "combat" && state.run && (
        <>
          {/* V5 M4 — HUD V2 sorti hors du combat-screen (sibling au-dessus) pour respecter 1232×720 */}
          <CombatHud
            run={state.run}
            bestFight={state.save.bestFight}
            onAbandon={() => dispatch({ type: "ABANDON_RUN" })}
          />
        <section
          className={`screen combat-screen ${
            state.save.settings.combatSpeed === 1.25 ? "speed-125" : state.save.settings.combatSpeed === 1.5 ? "speed-150" : ""
          } ${
            state.run.enemy.boss || nextBossIn(state.run.fight) <= 1 ? "boss-pressure" : ""
          }`}
        >
          {/* V5 — 4 layers de fond animés (palette nuit violet/rose) */}
          <div className="combat-bg combat-bg--sky" aria-hidden="true" />
          <div className="combat-bg combat-bg--clouds" aria-hidden="true" />
          <div className="combat-bg combat-bg--mist" aria-hidden="true" />
          <div className="combat-bg combat-bg--specks" aria-hidden="true" />

          {/* V5 — Top : stage pill + run progress + ressources */}
          <div className="combat-top">
            <div className="combat-stage-pill">
              <span className="csp-icon">▲</span>
              ACTE {romanizeRank(state.run.stage)} · VAGUE {state.run.wave}
            </div>
            <RunProgress
              fight={state.run.fight}
              stage={state.run.stage}
              wave={state.run.wave}
            />
            <div className="combat-resources">
              <span className="cres">
                <span className="cres-icon" style={{ background: "var(--brand-sun)" } as React.CSSProperties}>$</span>
                <b>{state.save.gold}</b>
              </span>
              <span className="cres">
                <span className="cres-icon" style={{ background: "var(--brand-grape)" } as React.CSSProperties}>◆</span>
                <b>{state.save.fragments}</b>
              </span>
            </div>
          </div>

          {/* V5 — Boss bar au-dessus du field */}
          {state.run.enemy.boss && (
            <BossHpBar
              bossName={state.run.enemy.name}
              phase={state.run.bossPhase}
              hp={Math.max(0, state.run.enemy.hp)}
              hpMax={state.run.enemy.maxHp}
            />
          )}

          <div className="battlefield combat-field">
            <div className="combat-floor" aria-hidden="true" />
            <div className="combat-floor-grid" aria-hidden="true" />
            <div className="effects-layer">
              {state.flashes.map((flash) => (
                <span
                  key={flash.id}
                  className={`impact impact-${flash.kind}`}
                  style={{ left: `${flash.x}%`, top: `${flash.y}%` }}
                >
                  {flash.label}
                </span>
              ))}
            </div>
            <CombatAnimationLayer
              queue={state.run.animQueue}
              team={state.run.team}
              enemyId={state.run.enemy.id}
            />
            <div className="team-column combat-side combat-side--heroes">
              {state.run.team.map((member, idx) => {
                // V5.1 T24 — pulse glow si une relique récente cible ce héros.
                const relicPulse = state.run!.relicTriggers.some(
                  (t) => t.targetCharId === member.id,
                );
                return (
                  <CombatHero
                    key={member.id}
                    member={member}
                    onSpecial={(id) => dispatch({ type: "USE_SPECIAL", id })}
                    anim={combatAnimState}
                    index={idx}
                    relicPulse={relicPulse}
                  />
                );
              })}
            </div>

            {/* V5 — Spell layer (combat-center > 4 spell--*) */}
            <SpellLayer
              activeType={(() => {
                // Détermine le spell actif depuis animQueue : prendre le dernier projectile (V3)
                const recent = [...state.run.animQueue]
                  .reverse()
                  .find((ev) => ev.kind === "projectile");
                if (recent && recent.kind === "projectile") {
                  return mapAnimTrajectoryToSpellType(recent.trajectory);
                }
                return null;
              })()}
              tick={state.run.animQueue.length}
            />

            <div className="combat-side combat-side--enemies">
              <EnemyCard
                enemy={state.run.enemy}
                bossPhase={state.run.bossPhase}
                anim={combatAnimState}
              />
            </div>
          </div>

          <CombatFooter
            run={state.run}
            combatSpeed={state.save.settings.combatSpeed}
            onSpecial={(id) => dispatch({ type: "USE_SPECIAL", id })}
            onConsumable={(idx) => dispatch({ type: "USE_CONSUMABLE", slotIndex: idx })}
            onSpeed={(s) => dispatch({ type: "SET_COMBAT_SPEED", speed: s })}
          />
          <div className="combat-aria-live" aria-live="polite" aria-atomic="true">
            {state.run.bossPhase >= 1 ? "Le boss change de phase." : ""}
          </div>
          {/* V5.1 T24 — Toasts éphémères des reliques actives. */}
          {state.run.relicTriggers.length > 0 && (
            <div
              id="relic-trigger-log"
              className="relic-trigger-log"
              aria-live="polite"
              aria-atomic="false"
            >
              {state.run.relicTriggers.slice(-3).map((t) => (
                <div
                  key={t.id}
                  className="relic-trigger-toast"
                  data-relic-id={t.relicId}
                >
                  <span className="relic-trigger-toast__sigil" aria-hidden="true">
                    ✦
                  </span>
                  <span className="relic-trigger-toast__msg">{t.message}</span>
                </div>
              ))}
            </div>
          )}
          {state.run.bossIntroAt !== null && (
            <BossIntroOverlay
              enemy={state.run.enemy}
              stage={state.run.stage}
              onDone={() => dispatch({ type: "BOSS_INTRO_DISMISS" })}
            />
          )}
        </section>
        </>
      )}

      {state.screen === "hub" && state.hub && state.run && (
        <HubScreen
          hub={state.hub}
          run={state.run}
          save={state.save}
          selectedIds={state.selectedIds}
          unlockedCharacters={unlockedCharacters}
          customCharacters={state.save.customCharacters}
          pendingRecycle={state.pendingRecycle}
          dispatch={dispatch}
        />
      )}

      {state.screen === "lootbox" && state.pendingLootbox && (
        <LootboxScreen
          pendingLootbox={state.pendingLootbox}
          customCharacters={state.save.customCharacters}
          dispatch={dispatch}
        />
      )}

      {state.screen === "boss-relic-choice" && state.pendingBossRelics && (
        <BossRelicChoiceScreen
          pending={state.pendingBossRelics}
          dispatch={dispatch}
        />
      )}

      {state.run && state.pendingConsumable && (
        <ReplaceConsumableModal
          pending={state.pendingConsumable}
          consumables={state.run.consumables}
          dispatch={dispatch}
        />
      )}

      {state.screen === "reward" && state.run && (
        <section className="screen reward-screen">
          <div className="section-heading">
            <span className="eyebrow">Victoire</span>
            <h1>Choisissez un bonus</h1>
          </div>
          <div className="reward-grid">
            {state.rewardOptions.map((reward, index) => (
              <button
                id={`reward-${index}`}
                key={reward.id}
                className="reward-card"
                onClick={() => dispatch({ type: "CHOOSE_REWARD", id: reward.id })}
                type="button"
              >
                <span>{reward.title}</span>
                <strong>{reward.detail}</strong>
              </button>
            ))}
          </div>
        </section>
      )}

      {state.screen === "gameover" && (
        <section className="screen gameover-screen">
          <div className="section-heading">
            <span className="eyebrow">Game over</span>
            <h1>La run est terminee</h1>
          </div>
          <FinalChest
            tier={state.chest?.tier ?? "damaged"}
            opened={Boolean(state.chest?.opened)}
            reward={state.chest?.reward ?? null}
            onOpen={() => dispatch({ type: "OPEN_CHEST" })}
            customCharacters={state.save.customCharacters}
          />
          <div className="menu-actions">
            <button onClick={() => dispatch({ type: "NAVIGATE", screen: "team" })}>
              Repartir
            </button>
            <button onClick={() => dispatch({ type: "NAVIGATE", screen: "collection" })}>
              Collection
            </button>
          </div>
        </section>
      )}

      {state.screen === "howto" && (
        <section className="screen howto-screen">
          <div className="section-heading">
            <span className="eyebrow">Aide</span>
            <h1>Comment jouer</h1>
          </div>
          <div className="howto-grid">
            <article className="cream-sticker-card">
              <h3>🎯 Objectif</h3>
              <p>Composez 3 héros, traversez 3 stages, battez le boss runique pour ouvrir le coffre final.</p>
            </article>
            <article className="cream-sticker-card">
              <h3>⚔️ Combat</h3>
              <p>Chaque héros attaque automatiquement. Cliquez sur les compétences pour les activer (cooldown). Réagissez aux intentions ennemies.</p>
            </article>
            <article className="cream-sticker-card">
              <h3>🎒 Hub</h3>
              <p>Entre les stages, achetez de l’or, ouvrez des coffres, recyclez vos doublons en fragments, et forgez des héros customs à l’atelier.</p>
            </article>
            <article className="cream-sticker-card">
              <h3>🏆 Reliques</h3>
              <p>Chaque boss vous donne 3 choix de reliques. Empilez-les pour devenir invincible.</p>
            </article>
          </div>
          <div className="menu-actions" style={{ marginTop: 18 }}>
            <button
              id="howto-back"
              type="button"
              className="primary-action"
              onClick={() => dispatch({ type: "NAVIGATE", screen: "menu" })}
            >
              Retour
            </button>
          </div>
        </section>
      )}

      {state.screen === "stats" && (
        <section className="screen stats-screen">
          <div className="section-heading">
            <span className="eyebrow">Profil</span>
            <h1>Statistiques</h1>
          </div>
          <div className="stats-grid">
            <article className="cream-sticker-card">
              <h3>📈 Progression</h3>
              <dl>
                <dt>Meilleur combat</dt>
                <dd>{state.save.bestFight}</dd>
                <dt>Meilleur stage</dt>
                <dd>{state.save.bestStage}</dd>
                <dt>Boss finaux vaincus</dt>
                <dd>{state.save.finalBossDefeats}</dd>
              </dl>
            </article>
            <article className="cream-sticker-card">
              <h3>📦 Loot</h3>
              <dl>
                <dt>Coffres ouverts</dt>
                <dd>{state.save.chestsOpened}</dd>
                <dt>Lootboxes ouvertes</dt>
                <dd>{state.save.lifetimeLootboxes}</dd>
                <dt>Or actuel</dt>
                <dd>{state.save.gold}</dd>
                <dt>Fragments</dt>
                <dd>{state.save.fragments}</dd>
              </dl>
            </article>
            <article className="cream-sticker-card">
              <h3>👥 Roster</h3>
              <dl>
                <dt>Personnages débloqués</dt>
                <dd>{state.save.unlockedIds.length} / {ROSTER.length + state.save.customCharacters.length}</dd>
                <dt>Personnages customs</dt>
                <dd>{state.save.customCharacters.length}</dd>
              </dl>
            </article>
            <article className="cream-sticker-card">
              <h3>🎲 Pity counter</h3>
              <dl>
                <dt>Tirages depuis dernier rare</dt>
                <dd>{state.save.lootboxPity.sinceLastRare} / 8</dd>
                <dt>Tirages depuis dernier épique</dt>
                <dd>{state.save.lootboxPity.sinceLastEpic} / 12</dd>
              </dl>
            </article>
          </div>
          <div className="menu-actions" style={{ marginTop: 18 }}>
            <button
              id="stats-back"
              type="button"
              className="primary-action"
              onClick={() => dispatch({ type: "NAVIGATE", screen: "menu" })}
            >
              Retour
            </button>
          </div>
        </section>
      )}

      {state.screen === "options" && (
        <section className="screen options-screen">
          <div className="section-heading">
            <span className="eyebrow">Paramètres</span>
            <h1>Options</h1>
          </div>
          <div className="options-grid">
            <article className="cream-sticker-card">
              <h3>⚡ Combat</h3>
              <div className="options-row">
                <span className="label">Vitesse</span>
                <div className="controls" role="radiogroup" aria-label="Vitesse de combat">
                  {[1, 1.25, 1.5].map((s) => {
                    const speed = s as CombatSpeed;
                    const active = state.save.settings.combatSpeed === speed;
                    return (
                      <button
                        key={speed}
                        id={`option-speed-${String(speed).replace(".", "-")}`}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        className={active ? "is-active" : ""}
                        onClick={() => dispatch({ type: "SET_COMBAT_SPEED", speed })}
                      >
                        {speed}×
                      </button>
                    );
                  })}
                </div>
              </div>
            </article>
            <article className="cream-sticker-card">
              <h3>🎬 Animations</h3>
              <div className="options-row">
                <span className="label">Réduites</span>
                <div className="controls">
                  <button type="button" disabled aria-disabled="true">
                    Suit le système
                  </button>
                </div>
              </div>
              <div className="options-row">
                <span className="hint">Respecte automatiquement <code>prefers-reduced-motion</code> du système.</span>
              </div>
            </article>
            <article className="cream-sticker-card">
              <h3>🔊 Audio</h3>
              <div className="options-row">
                <span className="label">Volume</span>
                <div className="controls">
                  <button type="button" disabled aria-disabled="true">—</button>
                </div>
              </div>
              <div className="options-row">
                <span className="hint">Audio à venir.</span>
              </div>
            </article>
          </div>
          <div className="menu-actions" style={{ marginTop: 18 }}>
            <button
              id="options-back"
              type="button"
              className="primary-action"
              onClick={() => dispatch({ type: "NAVIGATE", screen: "menu" })}
            >
              Retour
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
