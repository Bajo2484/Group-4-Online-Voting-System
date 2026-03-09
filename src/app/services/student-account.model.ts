export interface StudentAccount {
  id: string;         // for Student ID
  password: string;   // for password
  firstName: string;
  middleName: string;
  lastName: string;
  name: string;       // full name
  gender: string;
  course: string;     // program
  yearLevel: string;
  status: string;
  section: string;
  email: string;
  mobile: string;
  hasVoted: boolean;  // optional for voting status
}