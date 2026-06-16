export type Role = 'SUPER_ADMIN' | 'ADMIN_HOPITAL' | 'MEDECIN' | 'ACCUEIL';

export interface Hopital {
  id: string;
  nom: string;
  ville: string;
  type?: string | null;
  telephone?: string | null;
  actif: boolean;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  role: Role;
  hopitalId: string | null;
  hopital?: Hopital | null;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

/** Admin résumé renvoyé avec un hôpital. */
export interface HopitalAdmin {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  role: Role;
}

/** Hôpital tel que renvoyé par GET /hopitaux (avec admin + compteur). */
export interface HopitalListItem extends Hopital {
  createdAt: string;
  utilisateurs: HopitalAdmin[];
  _count: { utilisateurs: number };
}

export interface CreateHopitalResponse {
  hopital: HopitalListItem;
  adminMotDePasseTemporaire: string;
}

/** Utilisateur renvoyé par le module utilisateurs (jamais le hash). */
export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  role: Role;
  hopitalId: string | null;
  createdAt: string;
}

export type Sexe = 'M' | 'F';

export interface Patient {
  id: string;
  telephone: string; // clé normalisée (identifiant global)
  nom: string;
  prenom: string;
  dateNaissance?: string | null;
  sexe?: Sexe | null;
  groupeSanguin?: string | null;
  adresse?: string | null;
  hopitalCreateurId?: string | null;
  hopitalCreateur?: { id: string; nom: string; ville: string } | null;
  createdAt: string;
}

export interface RecherchePatient {
  trouve: boolean;
  cle: string;
  patient: Patient | null;
}

export type TypeAntecedent = 'MEDICAL' | 'CHIRURGICAL' | 'FAMILIAL' | 'ALLERGIE';

export interface Prescription {
  id: string;
  medicament: string;
  posologie: string;
  duree?: string | null;
}

export interface Antecedent {
  id: string;
  type: TypeAntecedent;
  description: string;
  date?: string | null;
  hopitalCreateurId: string;
  hopitalCreateur?: { id: string; nom: string; ville: string } | null;
  createdAt: string;
  estPropreHopital: boolean;
}

export interface Consultation {
  id: string;
  patientId: string;
  date: string;
  motif: string;
  diagnostic?: string | null;
  notes?: string | null;
  prescriptions: Prescription[];
  hopital?: { id: string; nom: string; ville: string } | null;
  medecin?: { id: string; nom: string; prenom: string } | null;
  createdAt: string;
  estPropreHopital: boolean;
}

export interface Carnet {
  partageAutorise: boolean;
  antecedents: Antecedent[];
  consultations: Consultation[];
}

export type StatutConsentement = 'AUTORISE' | 'REVOQUE';

/** Statut du consentement pour l'hôpital connecté (GET /patients/:id/consentement). */
export interface ConsentementStatut {
  statut: StatutConsentement | null;
  autorise: boolean;
  dateModification: string | null;
}

/** Agrégats du tableau de bord (GET /dashboard). */
export interface DashboardData {
  stats: {
    totalPatients: number;
    consultations: number;
    consultationsAujourdhui: number;
    prescriptions: number;
    consentementsActifs: number;
    consentementsRevoques: number;
  };
  patientsRecents: {
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
    origine: string | null;
    createdAt: string;
  }[];
  consultationsRecentes: {
    id: string;
    date: string;
    motif: string;
    patient: { nom: string; prenom: string; telephone: string };
  }[];
  consentements: {
    id: string;
    statut: StatutConsentement;
    dateModification: string;
    patient: { nom: string; prenom: string; telephone: string };
  }[];
}
