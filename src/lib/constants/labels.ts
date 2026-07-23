// AMAC Centralized Labels (French)

export const TEXT_CODES = {
  STATUTS: "Statuts",
  RI: "Règlement Intérieur",
};

export const ROLES = {
  membre: "Membre",
  responsable_section: "Responsable de Section",
  ben: "Bureau Exécutif National",
  comite_controle: "Comité de Contrôle",
  cac: "Commissaire aux Comptes",
  admin: "Administrateur Scribe",
};

export const SEVERITIES = {
  critique: {
    label: "Critique",
    color: "bg-red-100 text-red-800 border-red-200",
    badgeColor: "bg-red-500",
    icon: "🔴",
  },
  majeur: {
    label: "Majeur",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    badgeColor: "bg-amber-500",
    icon: "🟠",
  },
  mineur: {
    label: "Mineur",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    badgeColor: "bg-yellow-400",
    icon: "🟡",
  },
};

export const ENJEU_TYPES = {
  contradiction: "Contradiction juridique",
  renvoi_errone: "Renvoi erroné",
  lacune: "Lacune statutaire",
  risque_gouvernance: "Risque de gouvernance",
  incoherence_numerotation: "Structure / Numérotation",
  modernisation: "Piste de modernisation",
};

export const PROPOSITION_STATUS = {
  brouillon: { label: "Brouillon", color: "bg-gray-100 text-gray-800" },
  soumise: { label: "Soumise", color: "bg-blue-100 text-blue-800" },
  pre_arbitree: { label: "Pré-arbitrée", color: "bg-purple-100 text-purple-800" },
  adoptee: { label: "Adoptée (V1.0)", color: "bg-green-100 text-green-800" },
  rejetee: { label: "Rejetée", color: "bg-red-100 text-red-800" },
  fusionnee: { label: "Fusionnée", color: "bg-teal-100 text-teal-800" },
};

export const SECTIONS = {
  1: "Abidjan Lagunes",
  2: "Bouaké Vallée",
  3: "Yamoussoukro Lacs",
  4: "San-Pédro Nawa",
  5: "Korhogo Poro",
  6: "Daloa Haut-Sassandra",
};
