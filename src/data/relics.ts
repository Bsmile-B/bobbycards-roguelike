// === Bobbycard — Run relics data (extrait de App.tsx, Phase 1 V5.1) ===

import type { Stage } from "./stages";

export type RunRelic = {
  id: string;
  name: string;
  detail: string;
  source: "boss" | "shop" | "reward" | "consumable";
  nextFightShield?: number;
  nextFightCooldownMod?: number;
  nextFightBossDamageBonus?: number;
  stageStatBoost?: {
    stat: "physical" | "magic";
    percent: number;
    expiresAtStage: Stage;
  };
  reviveOnFirstKO?: { percent: number; used: boolean };
  // Boss relic effects (run-wide)
  permanentMaxHpPercent?: number;
  startingShieldBonus?: number;
  combatGoldPercent?: number;
  firstSkillFreeEachCombat?: boolean;
  regenPerEnemyTurn?: number;
  shieldOnLifeLost?: number;
  permanentMagicPercent?: number;
  permanentPhysicalPercent?: number;
  bonusFreeSwapsNextHub?: number;
  // Runic-tier (final boss)
  // V5.1 P5 — `permanentAllStatsPercent` deprecated : split en HP / phys / magie.
  // Conservé pour compat save (lecture only) ; nouvelles reliques n'utilisent plus ce champ.
  permanentAllStatsPercent?: number;
  // V5.1 P5 — `reviveAllOnDefeatOnce` deprecated : remplacé par `reviveSingleOnKO`.
  // Conservé pour permettre la migration save (cf. normalizeSave).
  reviveAllOnDefeatOnce?: { used: boolean };
  reviveSingleOnKO?: { hpPercent: number; used: boolean };
};

export type BossRelicChoice = {
  options: RunRelic[];
  tier: "boss" | "runic";
};

// === Boss reliques (proposees apres victoire de boss stage 1 / 2) ===
export const BOSS_RELIC_POOL: Omit<RunRelic, "id">[] = [
  {
    name: "Coeur de geant",
    detail: "+5% PV max permanents pour toute l'equipe.",
    source: "boss",
    permanentMaxHpPercent: 5,
  },
  {
    name: "Egide cendreuse",
    detail: "+10 bouclier au debut de chaque combat.",
    source: "boss",
    startingShieldBonus: 10,
  },
  {
    name: "Bourse runique",
    detail: "+10% or gagne sur tous les combats.",
    source: "boss",
    combatGoldPercent: 10,
  },
  {
    name: "Souffle premier",
    detail: "1ere skill de chaque combat sans cooldown.",
    source: "boss",
    firstSkillFreeEachCombat: true,
  },
  {
    name: "Sceau de regeneration",
    detail: "+3 PV regeneres a chaque tour ennemi.",
    source: "boss",
    regenPerEnemyTurn: 3,
  },
  {
    name: "Pacte de ronces",
    detail: "+5 bouclier a l'equipe quand une vie globale est perdue.",
    source: "boss",
    shieldOnLifeLost: 5,
  },
  {
    name: "Marque arcanique",
    detail: "+8% magie permanent pour l'equipe.",
    source: "boss",
    permanentMagicPercent: 8,
  },
  {
    name: "Marque martiale",
    detail: "+8% physique permanent pour l'equipe.",
    source: "boss",
    permanentPhysicalPercent: 8,
  },
  {
    name: "Banniere du voyageur",
    detail: "+1 swap gratuit au prochain hub.",
    source: "boss",
    bonusFreeSwapsNextHub: 1,
  },
];

// === Reliques runiques (boss final, vague 30) ===
export const BOSS_RUNIC_RELIC_POOL: Omit<RunRelic, "id">[] = [
  {
    name: "Couronne du Roi Brise",
    detail: "Augmente definitivement les PV de l'equipe de +10%.",
    source: "boss",
    permanentMaxHpPercent: 10,
  },
  {
    name: "Sceau du Roi Brise",
    detail: "Augmente definitivement les stats physiques et magiques de +10%.",
    source: "boss",
    permanentPhysicalPercent: 10,
    permanentMagicPercent: 10,
  },
  {
    name: "Sceau de l'aube eternelle",
    detail: "Quand un heros tombe, le ressuscite a 50% PV (1x par run).",
    source: "boss",
    reviveSingleOnKO: { hpPercent: 50, used: false },
  },
  {
    name: "Reliquaire des trois rois",
    detail: "+10% PV max et +10% bouclier de depart pour toute l'equipe.",
    source: "boss",
    permanentMaxHpPercent: 10,
    startingShieldBonus: 12,
  },
  {
    name: "Voile du neant",
    detail: "+12% magie et +10% or de combat permanents.",
    source: "boss",
    permanentMagicPercent: 12,
    combatGoldPercent: 10,
  },
];
