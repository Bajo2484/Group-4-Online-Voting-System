import { Component } from '@angular/core';
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

  constructor(private firestore: Firestore) {
    this.loadAllData();
  }

  async loadAllData() {
    this.isloading = true;

    const candidates = await this.getCandidates();
    const votes = await this.getVotes();
    this.processResults(candidates, votes);

    this.isloading = false;
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

  processResults(candidates: any[], votes: any[]) {

    const orgMap: any = { USG: {}, ATLAS: {}, STCM: {}, AEMT: {} };

    // INIT
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
    votes.forEach(v => {
      const org = v.org?.toUpperCase();

      Object.keys(v.votes || {}).forEach(pos => {
        const candidateId = v.votes[pos]?.id;

        const list = orgMap[org]?.[pos.toUpperCase()];
        if (!list) return;

        const found = list.find((c: Candidate) => c.id === candidateId);
        if (found) found.votes++;
      });
    });

    this.usgPositions = this.convert(orgMap['USG']);
    this.atlasPositions = this.convert(orgMap['ATLAS']);
    this.stcmPositions = this.convert(orgMap['STCM']);
    this.aemtPositions = this.convert(orgMap['AEMT']);
  }

  convert(data: any): Position[] {
    const positions: Position[] = [];

    Object.keys(data).forEach(pos => {
      const candidates = data[pos];

      const maxVotes = Math.max(...candidates.map((c: Candidate) => c.votes), 0);

      candidates.forEach((c: Candidate) => {
        c.isWinner = c.votes === maxVotes && maxVotes > 0;
      });

      positions.push({
        name: pos,
        candidates
      });
    });

    return positions;
  }

  setActiveOrg(org: string) {
    this.activeOrg = org;
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
    return position.candidates.reduce((sum: number, c: Candidate) => sum + c.votes, 0);
  }

  getPercentage(candidate: Candidate, position: Position): number {
    const total = this.getTotalVotes(position);
    return total ? Math.round((candidate.votes / total) * 100) : 0;
  }

  getRankedCandidates(position: Position): Candidate[] {
    return [...position.candidates]
      .sort((a: Candidate, b: Candidate) => b.votes - a.votes)
      .map((c: Candidate, index: number) => ({
        ...c,
        rank: index + 1
      }));
  }
}