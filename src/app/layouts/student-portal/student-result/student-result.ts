import { ChangeDetectorRef, Component } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';

interface Candidate {
  id: string;
  name: string;
  photo?: string;
  votes: number;
  isWinner?: boolean;
  rank?: number;
}

interface Position {
  name: string;
  candidates: Candidate[];
  abstain: Candidate;
}

@Component({
  selector: 'app-student-result',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './student-result.html',
  styleUrls: ['./student-result.css']
})
export class StudentResult {
  isloading: boolean = false;

  orgList: string[] = ['USG', 'ATLAS', 'STCM', 'AEMT'];
  activeOrg: string = 'USG';

  usgPositions: Position[] = [];
  atlasPositions: Position[] = [];
  stcmPositions: Position[] = [];
  aemtPositions: Position[] = [];

   private atlasOrder = [
    'PRESIDENT',
    'EXTERNAL VICE PRESIDENT',
    'INTERNAL VICE PRESIDENT',
    'GENERAL SECRETARY',
    'ASSOCIATE SECRETARY',
    'AUDITOR',
    'TREASURER',
    'EXTERNAL PRO',
    'INTERNAL PRO',
    '2ND YR GOV',
    '3RD YR GOV',
    '4TH YR GOV'
  ];
  private otherOrder = [
    'PRESIDENT',
    'VICE PRESIDENT',
    'SECRETARY',
    'TREASURER',
    'AUDITOR',
    'PRO'
  ];

  constructor(
    private firestore: Firestore,
    private cdr: ChangeDetectorRef
  ) {
    this.loadAllData();
  }

  // LOAD DATA
  async loadAllData() {
    this.isloading = true;

    try {
      const [candidates, votes] = await Promise.all([
        this.getCandidates(),
        this.getVotes()
      ]);

      this.processResults(candidates, votes);

    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      this.isloading = false;
      this.cdr.detectChanges();
    }
  }

  async getCandidates(): Promise<any[]> {
    const ref = collection(this.firestore, 'candidates');
    const q = query(ref, where('status', '==', 'approved'));
    const snap = await getDocs(q);

    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async getVotes(): Promise<any[]> {
    const ref = collection(this.firestore, 'votes');
    const snap = await getDocs(ref);

    return snap.docs.map(doc => doc.data());
  }

 
  // PROCESS RESULTS
  processResults(candidates: any[], votes: any[]) {

    const orgMap: any = {
      USG: {},
      ATLAS: {},
      STCM: {},
      AEMT: {}
    };

    // INIT CANDIDATES
    candidates.forEach(c => {
      const org = c.organization?.toUpperCase();
      const position = c.position?.toUpperCase();

      if (!orgMap[org]) return;

      if (!orgMap[org][position]) {
        orgMap[org][position] = [];
      }

      orgMap[org][position].push({
        id: c.id,
        name: c.fullName,
        photo: c.photoUrl || c.photoURL || c.photo || 'https://via.placeholder.com/40',
        votes: 0
      });
    });

    // COUNT VOTES
    votes.forEach(vote => {
      const org = vote.org?.toUpperCase();

      Object.keys(vote.votes || {}).forEach(position => {

        const voteData = vote.votes[position];
        if (!voteData) return;

        const list = orgMap[org]?.[position.toUpperCase()];
        if (!list) return;

       
        // NORMALIZED ABSTAIN CHECK
        const isAbstain =
          voteData?.id?.toUpperCase() === 'ABSTAIN' ||
          voteData?.ID?.toLowerCase() === 'abstain' ||
          voteData?.fullName?.toUpperCase() === 'ABSTAIN';

        if (isAbstain) {
          let abstain = list.find((c: any) => c.id === 'ABSTAIN');

          if (abstain) {
            abstain.votes++;
          } else {
            abstain = {
              id: 'ABSTAIN',
              name: 'ABSTAIN',
              photo: 'https://via.placeholder.com/40',
              votes: 1,
              isWinner: false
            };
            list.push(abstain);
          }

          return;
        }

        // NORMAL VOTE
        const candidateId = voteData?.id;
        const found = list.find((c: Candidate) => c.id === candidateId);

        if (found) {
          found.votes++;
        }
      });
    });

    // BUILD FINAL RESULTS
    this.usgPositions = this.buildPositions(orgMap['USG'] || {}, 'USG');
    this.atlasPositions = this.buildPositions(orgMap['ATLAS'] || {}, 'ATLAS');
    this.stcmPositions = this.buildPositions(orgMap['STCM'] || {}, 'STCM');
    this.aemtPositions = this.buildPositions(orgMap['AEMT'] || {}, 'AEMT');
  }


  // BUILD POSITIONS
  private buildPositions(data: any, orgName: string): Position[] {
    const positions: Position[] = [];

    Object.keys(data).forEach(pos => {

      const candidates = data[pos] || [];

      const realCandidates = candidates.filter((c: any) => c.id !== 'ABSTAIN');

      const abstainRaw = candidates.find((c: any) => c.id === 'ABSTAIN');

      const abstain: Candidate = abstainRaw
        ? { ...abstainRaw }
        : {
            id: 'ABSTAIN',
            name: 'ABSTAIN',
            photo: 'https://via.placeholder.com/40',
            votes: 0,
            isWinner: false
          };

      // SORT REAL CANDIDATES
      const sortedReal = [...realCandidates].sort(
        (a: Candidate, b: Candidate) => b.votes - a.votes
      );

      // WINNER LOGIC
      const maxVotes = sortedReal.length
        ? Math.max(...sortedReal.map(c => c.votes))
        : 0;

      sortedReal.forEach(c => {
        c.isWinner = c.votes === maxVotes && maxVotes > 0;
      });

      abstain.isWinner = false;

      positions.push({
        name: pos,
        candidates: [...sortedReal],
        abstain: abstain
      });
    });

    const order = orgName === 'ATLAS'
  ? this.atlasOrder
  : this.otherOrder;

positions.sort((a, b) => {
  const aIndex = order.indexOf(a.name.toUpperCase());
  const bIndex = order.indexOf(b.name.toUpperCase());

  return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
});

    return positions;
  }

  // =========================
  // UI HELPERS
  // =========================
  setActiveOrg(org: string) {
    this.activeOrg = org;
    this.cdr.detectChanges();
  }

  getPositions(org: string): Position[] {
    switch (org) {
      case 'USG': return this.usgPositions;
      case 'ATLAS': return this.atlasPositions;
      case 'STCM': return this.stcmPositions;
      case 'AEMT': return this.aemtPositions;
      default: return [];
    }
  }

  getTotalVotes(position: Position): number {
    const candidatesVotes = position.candidates.reduce((sum, c) => sum + c.votes, 0);
    const abstainVotes = position.abstain?.votes || 0;
    return candidatesVotes + abstainVotes;
  }

  getPercentage(candidate: Candidate, position: Position): number {
    const total = this.getTotalVotes(position);
    return total ? Math.round((candidate.votes / total) * 100) : 0;
  }

  getRankedCandidates(position: Position): Candidate[] {
    return [...position.candidates]
      .sort((a, b) => b.votes - a.votes)
      .map((c, index) => ({
        ...c,
        rank: index + 1
      }));
  }
}