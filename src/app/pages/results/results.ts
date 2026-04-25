import { ChangeDetectorRef, Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudentAccountService } from '@app/services/student-account.service';


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

  students: any[] = [];
  votes: any[] =[];
  atlasPositions: Position[] = [];
  stcmPositions: Position[] = [];
  aemtPositions: Position[] = [];
  usgPositions: Position[] = [];

  constructor(
    private firestore: Firestore,
    private cdr: ChangeDetectorRef,
    private studentService: StudentAccountService
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

    this.studentService.getAll$().subscribe((students) => {
      this.students = students;
    });

    this.getVotes().then(votes => {
      this.votes = votes;
    });

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

  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  let startY = 60;
  const marginBottom = 20;

  

  const electionMap: any = {
    ATLAS: 'ATLAS2026',
    STCM: 'STCM2026',
    AEMT: 'AEMT2026',
    USG: 'USG2026'
  };

  const electionId = electionMap[org];
  

  const winners: any[] = [];

  // ================= HEADER =================
  const drawHeader = () => {

    doc.setFontSize(10);

    doc.addImage('ustp.jpg', 'JPG', 10, 5, 25, 25);
    doc.addImage('elecom-logo.jpg', 'JPG', 170, 5, 25, 25);

    doc.text(
      'University of Science and Technology of Southern Philippines',
      pageWidth / 2,
      10,
      { align: 'center' }
    );

    doc.text('USTP VILLANUEVA', pageWidth / 2, 16, { align: 'center' });
    doc.text('Poblacion 1, Misamis Oriental, Philippines', pageWidth / 2, 22, { align: 'center' });

    doc.line(10, 30, 200, 30);

    doc.setFontSize(14);
    doc.text('ONLINE ELECTION RESULT', pageWidth / 2, 38, { align: 'center' });

    doc.line(10, 42, 200, 42);

    doc.setFontSize(10);
    doc.text(`Election: ${org} ELECTION RESULT`, 14, 50);
    doc.text(`Date: ${new Date().toDateString()}`, 14, 56);

    
  };

  // ================= PAGE BREAK =================
  const checkPageBreak = (y: number) => {
    if (y >= pageHeight - marginBottom) {
      doc.addPage();
      drawHeader();
      return 60;
    }
    return y;
  };

  // FIRST PAGE HEADER
  drawHeader();

  // ================= CONTENT =================
  positions.forEach(pos => {

    startY = checkPageBreak(startY);

    doc.setFontSize(12);
    doc.text(pos.name, pageWidth / 2, startY, { align: 'center' });

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

    autoTable(doc, {
      head: [['Candidate', 'Votes', 'Status']],
      body: tableData,
      startY: startY,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 102, 204] }
    });

    startY = (doc as any).lastAutoTable.finalY + 8;
    startY = checkPageBreak(startY);

    const abstain = pos.candidates.find(c => c.id === 'ABSTAIN');
    const abstainVotes = abstain ? abstain.votes : 0;

    doc.setFontSize(10);
    doc.text(`Abstain Votes: ${abstainVotes}`, 14, startY);

    startY += 12;
  });

  // ================= SUMMARY =================
  startY = checkPageBreak(startY + 10);

  doc.setFontSize(12);
  doc.text('SUMMARY OF WINNERS', pageWidth / 2, startY, { align: 'center' });

  startY += 10;

  doc.setFontSize(10);
  winners.forEach(w => {

    startY = checkPageBreak(startY);

    doc.text(`${w.position}: ${w.name}`, 14, startY);
    startY += 6;
  });

  // ================= FOOTER =================
  startY = checkPageBreak(startY + 20);

  doc.text('Prepared by:', 14, startY);
  doc.text('_____________________', 14, startY + 5);
  doc.text('Election Committee', 14, startY + 10);

  doc.text('Noted by:', 140, startY);
  doc.text('_____________________', 140, startY + 5);
  doc.text('Administrator', 140, startY + 10);

  doc.save(`${org}_Election_Results.pdf`);
}
}