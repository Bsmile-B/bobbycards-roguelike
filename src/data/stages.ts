// === Bobbycard — Stage data (extrait de App.tsx, Phase 1 V5.1) ===
// Types et configs des stages, intents ennemis, modificateurs d'encounters,
// helpers stageFromFight / waveFromFight.

export type Stage = 1 | 2 | 3;

export type StageConfig = {
  id: Stage;
  name: string;
  accent: string;
  enemyPool: Array<{ name: string; trait: string; traitDetail: string }>;
  bossName: string;
  bossTrait: string;
  bossDetail: string;
};

export type EnemyIntentKind = "strike" | "heavy" | "guard" | "hex";

export type EnemyIntent = {
  kind: EnemyIntentKind;
  label: string;
  detail: string;
  multiplier: number;
  intervalMod: number;
};

export type EncounterModifier = {
  kind: "embers" | "fog" | "altar" | "thorns" | "boss";
  label: string;
  detail: string;
  enemyAttackMod: number;
  enemyHpMod: number;
  playerAttackMod: number;
  cooldownTickMod: number;
};

export const INTENTS: EnemyIntent[] = [
  {
    kind: "strike",
    label: "Frappe",
    detail: "Attaque une carte",
    multiplier: 1,
    intervalMod: 1,
  },
  {
    kind: "heavy",
    label: "Brise-garde",
    detail: "Lent mais violent",
    multiplier: 1.65,
    intervalMod: 1.22,
  },
  {
    kind: "guard",
    label: "Carapace",
    detail: "Gagne du bouclier",
    multiplier: 0,
    intervalMod: 0.92,
  },
  {
    kind: "hex",
    label: "Malefice",
    detail: "Touche toute l'equipe",
    multiplier: 0.46,
    intervalMod: 1.12,
  },
];

export const MODIFIERS: EncounterModifier[] = [
  {
    kind: "embers",
    label: "Braisiers",
    detail: "Les ennemis frappent plus fort.",
    enemyAttackMod: 1.14,
    enemyHpMod: 1,
    playerAttackMod: 1,
    cooldownTickMod: 1,
  },
  {
    kind: "fog",
    label: "Brume lourde",
    detail: "Les attaques auto sont plus lentes, les ennemis ont moins de PV.",
    enemyAttackMod: 1,
    enemyHpMod: 0.9,
    playerAttackMod: 1.14,
    cooldownTickMod: 1,
  },
  {
    kind: "altar",
    label: "Autel fissure",
    detail: "Les competences reviennent plus vite, mais les ennemis resistent.",
    enemyAttackMod: 1,
    enemyHpMod: 1.12,
    playerAttackMod: 1,
    cooldownTickMod: 1.24,
  },
  {
    kind: "thorns",
    label: "Ronces d'os",
    detail: "Les ennemis ont du bouclier au depart.",
    enemyAttackMod: 0.96,
    enemyHpMod: 1,
    playerAttackMod: 1,
    cooldownTickMod: 1,
  },
];

export const STAGE_CONFIGS: Record<Stage, StageConfig> = {
  1: {
    id: 1,
    name: "Les Cryptes froides",
    accent: "stage-1",
    enemyPool: [
      { name: "Goule creuse", trait: "Affamee", traitDetail: "Attaques rapides et sales." },
      { name: "Brigand maudit", trait: "Pillard", traitDetail: "Frappe les cartes affaiblies." },
      { name: "Spectre mineur", trait: "Evanescent", traitDetail: "Moins solide, plus instable." },
    ],
    bossName: "Gardien des Cendres",
    bossTrait: "Geant cendreux",
    bossDetail: "Ses coups annoncent une vie perdue.",
  },
  2: {
    id: 2,
    name: "Sanctuaire du Vide",
    accent: "stage-2",
    enemyPool: [
      { name: "Acolyte noir", trait: "Occultiste", traitDetail: "Ralentit les competences." },
      { name: "Ombre rampante", trait: "Sournoise", traitDetail: "Inflige des malefices." },
      { name: "Voilet du Vide", trait: "Voyant", traitDetail: "Frappe au moment fragile." },
    ],
    bossName: "Sorciere du Vide",
    bossTrait: "Voix du neant",
    bossDetail: "Empoisonne l'equipe entiere.",
  },
  3: {
    id: 3,
    name: "Salle du Roi Brise",
    accent: "stage-3",
    enemyPool: [
      { name: "Garde brise", trait: "Lourd", traitDetail: "Resiste aux attaques basiques." },
      { name: "Relique royale", trait: "Maudite", traitDetail: "Invoque des fragments tranchants." },
      { name: "Heraut sanglant", trait: "Royal", traitDetail: "Charge sans interruption." },
    ],
    bossName: "Roi Brise",
    bossTrait: "Souverain dechu",
    bossDetail: "Multiplie ses attaques quand il saigne.",
  },
};

export const STAGE_INTRO_LINES: Record<Stage, string> = {
  1: "Le froid mord les os. Les runes attendent.",
  2: "Le vide chuchote. Ne reponds pas.",
  3: "Le Roi est brise. Sa couronne saigne encore.",
};

export function stageFromFight(fight: number): Stage {
  if (fight <= 10) return 1;
  if (fight <= 20) return 2;
  return 3;
}

export function waveFromFight(fight: number): number {
  return ((fight - 1) % 10) + 1;
}
