export type CandidateStatus = 'pending' | 'approved' | 'rejected';

export interface Candidate {

  id?: string;
  fullName: string;
  organization: string;
  position: string;
  partyName?: string;
  platform?: string;
  photo?: File | null;
  photoUrl?: string;
  status: CandidateStatus;
  electionId?: string;
  createdAt?: number;
}