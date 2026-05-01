// === Bobbycard — Consumables & rewards data (extrait de App.tsx, Phase 1 V5.1) ===

export type ConsumableKind =
  | "potion-heal"
  | "bomb-runic"
  | "shield-emergency"
  | "vial-antipoison";

export type Consumable = {
  id: string;
  kind: ConsumableKind;
  name: string;
  detail: string;
};

export type ConsumableSlots = (Consumable | null)[];

export type RewardType =
  | "hp"
  | "physical"
  | "magic"
  | "heal"
  | "shield"
  | "cooldown"
  | "refresh"
  | "frenzy";

export type RewardOption = {
  id: string;
  type: RewardType;
  title: string;
  detail: string;
};

export const CONSUMABLE_DEFS: Record<
  ConsumableKind,
  { name: string; detail: string }
> = {
  "potion-heal": {
    name: "Potion de soin",
    detail: "Soigne 30% PV de l'equipe.",
  },
  "bomb-runic": {
    name: "Bombe runique",
    detail: "25 degats directs a l'ennemi.",
  },
  "shield-emergency": {
    name: "Bouclier d'urgence",
    detail: "+15 bouclier a toute l'equipe.",
  },
  "vial-antipoison": {
    name: "Fiole anti-poison",
    detail: "Annule le prochain malefice.",
  },
};

export const REWARD_POOL: Omit<RewardOption, "id">[] = [
  { type: "hp", title: "Sang tenace", detail: "+8 PV max a toute l'equipe" },
  { type: "physical", title: "Lames froides", detail: "+2 attaque physique" },
  { type: "magic", title: "Braise occulte", detail: "+2 attaque magique" },
  { type: "heal", title: "Repos bref", detail: "Rend 35% des PV max" },
  { type: "shield", title: "Cercle d'os", detail: "+8 bouclier au prochain combat" },
  { type: "cooldown", title: "Rituel court", detail: "Competences 8% plus rapides" },
  { type: "refresh", title: "Etincelle vive", detail: "Recharge les competences et +3 bouclier" },
  { type: "frenzy", title: "Pacte vorace", detail: "+3 PH/MG mais l'equipe perd 6 PV" },
];

function makeConsumableId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createConsumable(kind: ConsumableKind): Consumable {
  const def = CONSUMABLE_DEFS[kind];
  return {
    id: makeConsumableId("conso"),
    kind,
    name: def.name,
    detail: def.detail,
  };
}
