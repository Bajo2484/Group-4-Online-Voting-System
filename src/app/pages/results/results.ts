import { ChangeDetectorRef, Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import jsPDF from 'jspdf';
import autotable from 'jspdf-autotable';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';

interface Candidate {
  id: string;
  name: string;
  votes: number;
  isWinner?: boolean;
}

interface Position {
  name: string;
  candidates: Candidate[];
}

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './results.html',
  styleUrls: ['./results.css']
})
export class Result {

  activeOrg: string = 'ATLAS';
  isloading: boolean = false;

  atlasPositions: Position[] = [];
  stcmPositions: Position[] = [];
  aemtPositions: Position[] = [];
  usgPositions: Position[] = [];

  constructor(
    private firestore: Firestore,
    private cdr: ChangeDetectorRef
  ) {
    this.loadAllData();
  }

  ngOnInit() {
    this.loadAllData();
  }

  // ================= LOAD =================
  async loadAllData() {
    this.isloading = true;

    const candidates = await this.getCandidates();
    const votes = await this.getVotes();

    this.processResults(candidates, votes);

    setTimeout(() => {
      this.isloading = false;
      this.cdr.detectChanges();
    }, 0);
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

  // ================= PROCESS =================
  processResults(candidates: any[], votes: any[]) {

    const orgMap: any = {
      ATLAS: {},
      STCM: {},
      AEMT: {},
      USG: {}
    };

    // INIT CANDIDATES
    candidates.forEach((c: any) => {

      const org = String(c.organization || '').toUpperCase().trim();
      const position = String(c.position || '').toUpperCase().trim();

      if (!orgMap[org]) return;

      if (!orgMap[org][position]) {
        orgMap[org][position] = [];
      }

      orgMap[org][position].push({
        id: c.id,
        name: c.fullName,
        votes: 0
      });
    });

    // ADD ABSTAIN SLOT
    Object.keys(orgMap).forEach(org => {
      Object.keys(orgMap[org]).forEach(pos => {

        const exists = orgMap[org][pos]
          .some((c: any) => c.id === 'ABSTAIN');

        if (!exists) {
          orgMap[org][pos].push({
            id: 'ABSTAIN',
            name: 'ABSTAIN',
            votes: 0
          });
        }
      });
    });

    // COUNT VOTES
    votes.forEach((vote: any) => {

      const orgKey = String(vote.org || '').toUpperCase().trim();
      if (!orgKey || !orgMap[orgKey]) return;

      Object.keys(vote.votes || {}).forEach(position => {

        const voteData = vote.votes[position];
        if (!voteData) return;

        const posKey = String(position || '').toUpperCase().trim();

        const candidateList = orgMap[orgKey]?.[posKey];
        if (!candidateList) return;

        // ================= ABSTAIN FIX =================
        const isAbstain =
          voteData?.isAbstain === true ||
          String(voteData?.fullName || '').toUpperCase() === 'ABSTAIN' ||
          String(voteData?.id || '').toUpperCase() === 'ABSTAIN' ||
          voteData?.id == null;

        if (isAbstain) {

          let abstain = candidateList.find((c: any) => c.id === 'ABSTAIN');

          if (!abstain) {
            abstain = {
              id: 'ABSTAIN',
              name: 'ABSTAIN',
              votes: 0,
              isWinner: false
            };
            candidateList.push(abstain);
          }

          abstain.votes++;
          return;
        }

        // ================= NORMAL VOTE FIX =================
        const found = candidateList.find((c: any) =>
          String(c.id).trim() === String(voteData?.id).trim() ||
          String(c.name).trim().toUpperCase() === String(voteData?.fullName || '').trim().toUpperCase()
        );

        if (found) {
          found.votes++;
        }
      });
    });

    // FINAL OUTPUT
    this.atlasPositions = this.convertToPositions(orgMap['ATLAS'], 'ATLAS');
    this.stcmPositions = this.convertToPositions(orgMap['STCM'], 'STCM');
    this.aemtPositions = this.convertToPositions(orgMap['AEMT'], 'AEMT');
    this.usgPositions = this.convertToPositions(orgMap['USG'], 'USG');
  }

  // ================= CONVERT + SORT =================
  convertToPositions(data: any, orgName: string): Position[] {

    const positions: Position[] = [];

    const atlasOrder = [
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

    const otherOrder = [
      'PRESIDENT',
      'VICE PRESIDENT',
      'SECRETARY',
      'TREASURER',
      'AUDITOR',
      'PRO'
    ];

    Object.keys(data || {}).forEach(pos => {

      const candidates = data[pos] || [];

      const abstain = candidates.find((c: any) => c.id === 'ABSTAIN');
      const realCandidates = candidates.filter((c: any) => c.id !== 'ABSTAIN');

      const sorted = [...realCandidates].sort((a, b) => b.votes - a.votes);

      const maxVotes = sorted.length ? sorted[0].votes : 0;

      sorted.forEach((c: Candidate) => {
        c.isWinner = c.votes === maxVotes && maxVotes > 0;
      });

      if (abstain) abstain.isWinner = false;

      positions.push({
        name: pos,
        candidates: [
          ...sorted,
          ...(abstain ? [abstain] : [])
        ]
      });
    });

    const order = orgName === 'ATLAS' ? atlasOrder : otherOrder;

    positions.sort((a, b) => {
      const aIndex = order.indexOf(a.name?.toUpperCase()?.trim());
      const bIndex = order.indexOf(b.name?.toUpperCase()?.trim());

      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    return positions;
  }

  // ================= UI =================
  setActiveOrg(org: string) {
    this.activeOrg = org;
    this.cdr.detectChanges();
  }

  getActivePositions(): Position[] {
    switch (this.activeOrg) {
      case 'ATLAS': return this.atlasPositions;
      case 'STCM': return this.stcmPositions;
      case 'AEMT': return this.aemtPositions;
      case 'USG': return this.usgPositions;
      default: return [];
    }
  }

// ================= EXPORT PDF =================
exportPDF(org: string) {

  let positions: Position[] = [];

  switch (org) {
    case 'ATLAS': positions = this.atlasPositions; break;
    case 'STCM': positions = this.stcmPositions; break;
    case 'AEMT': positions = this.aemtPositions; break;
    case 'USG': positions = this.usgPositions; break;
  }

  const doc = new jsPDF();

  // ===== HEADER LOGO =====
  doc.addImage('ustp.jpg', 'JPG', 10, 5, 25, 25);
  doc.addImage('elecom-logo.jpg', 'JPG', 170, 5, 25, 25);

  doc.setFontSize(12);
  doc.text('University of Science and Technology of Southern Philippines', 105, 10, { align: 'center' });
  doc.text('USTP VILLANUEVA', 105, 15, { align: 'center' });
  doc.text('Poblacion 1, Villanueva 9002 Misamis Oriental, Philippines', 105, 20, { align: 'center' });

  doc.line(10, 30, 200, 30);

  // ===== TITLE =====
  doc.setFontSize(14);
  doc.text('ONLINE ELECTION RESULT', 105, 38, { align: 'center' });

  doc.line(10, 42, 200, 42);

  // ===== INFO =====
  doc.setFontSize(10);
  doc.text(`Election: ${org} ELECTION RESULT`, 14, 50);
  doc.text(`Date: ${new Date().toDateString()}`, 14, 56);

  let startY = 70;
  const winners: any[] = [];

  // ===== CONTENT =====
  positions.forEach(pos => {

    doc.setFontSize(12);
    doc.text(pos.name, 105, startY, { align: 'center' });

    startY += 5;
    doc.line(20, startY, 190, startY);
    startY += 5;

    const tableData = pos.candidates.map(c => {

      if (c.isWinner) {
        winners.push({ position: pos.name, name: c.name });
      }

      return [
        c.name,
        c.votes,
        c.isWinner ? 'WINNER' : ''
      ];
    });

    autotable(doc, {
      head: [['Candidate', 'Votes', 'Status']],
      body: tableData,
      startY: startY,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 102, 204] }
    });

    startY = (doc as any).lastAutoTable.finalY + 8;

    // ===== ABSTAIN =====
    const abstainVotes = pos.candidates
      .filter(c => c.id === 'ABSTAIN')
      .reduce((sum, c) => sum + c.votes, 0);

    doc.setFontSize(10);
    doc.text(`Abstain Votes: ${abstainVotes}`, 14, startY);

    startY += 12;
  });

  // ===== SUMMARY =====
  doc.setFontSize(12);
  doc.text('SUMMARY OF WINNERS', 105, startY, { align: 'center' });

  startY += 8;

  doc.setFontSize(10);
  winners.forEach(w => {
    doc.text(`${w.position}: ${w.name}`, 14, startY);
    startY += 6;
  });

  

  // ===== FOOTER =====
  startY += 15;

  doc.setFont('helvetica', 'normal');

  doc.text('Prepared by:', 14, startY);
  doc.text('_____________________', 14, startY + 5);
  doc.text('Election Committee', 14, startY + 10);

  doc.text('Noted by:', 140, startY);
  doc.text('_____________________', 140, startY + 5);
  doc.text('Administrator', 140, startY + 10);

  doc.save(`${org}_Election_Results.pdf`);
}
}