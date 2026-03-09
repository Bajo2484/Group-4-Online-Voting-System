export type CandidateStatus = 'pending' | 'approved' | 'rejected';

export interface Candidate {

  // Firestore document ID (added automatically when fetching)
  id?: string;

  fullName: string;

  // Organization (ATLAS, USG, STCM, AEMT)
  organization: string;

  // Position depends on organization
  position: string;

  partyName?: string;

  platform?: string;

  // Used only when uploading a photo
  photo?: File | null;

  // URL or base64 preview of the photo
  photoUrl?: string;

  status: CandidateStatus;

}