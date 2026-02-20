export type CandidateStatus = 'pending' | 'approved' | 'rejected';

export interface Candidate {
  id: string;

  fullName: string;

  // Position depends on organization
  position: string;

  organization: string;

  partyName: string;   

  platform: string;

  photo?: File | null;

  photoUrl?: string;

  status: CandidateStatus;
}
