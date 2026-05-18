export interface Election {
  id?: string;
  electionId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed';
  candidates?: string[];
}