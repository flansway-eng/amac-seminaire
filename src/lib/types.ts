export type ParticipantRole = 'delegue' | 'observateur' | 'scribe' | 'ben' | 'admin';
export type TexteCode = 'STATUTS' | 'RI';
export type EnjeuType = 'contradiction' | 'renvoi_errone' | 'lacune' | 'risque_gouvernance' | 'incoherence_numerotation' | 'modernisation';
export type EnjeuGravite = 'critique' | 'majeur' | 'mineur';
export type QuestionType = 'choix_ab' | 'choix_multiple' | 'echelle' | 'texte_libre';
export type PropositionStatut = 'brouillon' | 'soumise' | 'pre_arbitree' | 'adoptee' | 'rejetee' | 'fusionnee';
export type DecisionVote = 'adopte' | 'rejete' | 'reporte';

export interface Section {
  id: number;
  nom: string;
  ville: string;
  slug: string;
  responsable: string | null;
  actif: boolean;
  a_jour_cotisation: boolean;
}

export interface ParticipantRecord {
  id: string;
  nom: string;
  role: ParticipantRole;
  section_id: number | null;
  seance: string | null;
  cree_le: string;
  vu_le: string;
}

export interface Texte {
  id: number;
  code: TexteCode;
  titre: string;
  date_adoption: string;
}

export interface Article {
  id: number;
  texte_id: number;
  numero: number;
  numero_affiche: string;
  titre: string | null;
  contenu_actuel: string;
  titre_parent: string | null;
  chapitre: string | null;
  ordre: number;
  texte?: Texte; // joined
  enjeux?: Enjeu[]; // joined
  questions?: Question[]; // joined
}

export interface Enjeu {
  id: number;
  article_id: number;
  type: EnjeuType;
  gravite: EnjeuGravite;
  description: string;
  base_legale: string | null;
  articles_lies: number[] | null;
}

export interface Question {
  id: number;
  article_id: number;
  ordre: number;
  intitule: string;
  type: QuestionType;
  options: {
    option_a?: string;
    option_b?: string;
    choices?: string[];
  };
  obligatoire: boolean;
}

export interface Reponse {
  id: string;
  question_id: number;
  participant_id: string;
  section_id: number;
  valeur: {
    reponse?: string; // e.g. "A" or "B"
    note?: number; // 1-5 scale
    texte?: string; // free text
  };
  commentaire: string | null;
  created_at: string;
  participant?: ParticipantRecord; // joined
}

export interface Proposition {
  id: string;
  article_id: number;
  participant_id: string | null;
  texte_propose: string;
  expose_motifs: string;
  statut: PropositionStatut;
  version: string;
  created_at: string;
  participant?: ParticipantRecord; // joined
  article?: Article; // joined
}

export interface Decision {
  id: string;
  article_id: number;
  proposition_id: string | null;
  participant_id: string | null;
  decision: DecisionVote;
  quorum_atteint: boolean;
  votes_pour: number;
  votes_contre: number;
  abstentions: number;
  seance: string;
  decided_at: string;
  proposition?: Proposition; // joined
  article?: Article; // joined
}
