// Le mode hors-ligne ne sert que la commodité de développement local
// (profil fictif, contournement des selects de rôle) : il ne doit jamais
// pouvoir s'activer en production, même si la variable d'environnement
// est laissée à "true" par erreur dans un déploiement.
export const OFFLINE_MODE =
  process.env.NEXT_PUBLIC_OFFLINE_SEED === 'true' &&
  process.env.NODE_ENV !== 'production';
