import { Component } from '@angular/core';
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
  loading: boolean = false;

  atlasPositions: Position[] = [];
  stcmPositions: Position[] = [];
  aemtPositions: Position[] = [];
  usgPositions: Position[] = [];

  constructor(private firestore: Firestore) {
    this.loadAllData();
  }

  // ================= LOAD ALL =================
  async loadAllData() {
    this.loading = true;

    const candidates = await this.getCandidates();
    const votes = await this.getVotes();

    this.processResults(candidates, votes);

    this.loading = false;
  }

  // ================= GET CANDIDATES =================
  async getCandidates(): Promise<any[]> {
    const ref = collection(this.firestore, 'candidates');
    const q = query(ref, where('status', '==', 'approved'));

    const snap = await getDocs(q);

    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // ================= GET VOTES =================
  async getVotes(): Promise<any[]> {
    const ref = collection(this.firestore, 'votes');
    const snap = await getDocs(ref);

    return snap.docs.map(doc => doc.data());
  }

  // ================= PROCESS RESULTS =================
  processResults(candidates: any[], votes: any[]) {

    const orgMap: any = {
      ATLAS: {},
      STCM: {},
      AEMT: {},
      USG: {}
    };

    // STEP 1: Initialize candidates
    candidates.forEach((c: any) => {
      const org = c.organization?.toUpperCase();
      const position = c.position?.toUpperCase();

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

    // STEP 2: Count votes
    votes.forEach((vote: any) => {
      const org = vote.org?.toUpperCase();

      Object.keys(vote.votes || {}).forEach(position => {
        const candidateId = vote.votes[position]?.id;
        const pos = position.toUpperCase();

        const candidateList = orgMap[org]?.[pos];
        if (!candidateList) return;

        const found = candidateList.find((c: any) => c.id === candidateId);
        if (found) {
          found.votes++;
        }
      });
    });

    // STEP 3: Convert to UI format
    this.atlasPositions = this.convertToPositions(orgMap['ATLAS']);
    this.stcmPositions = this.convertToPositions(orgMap['STCM']);
    this.aemtPositions = this.convertToPositions(orgMap['AEMT']);
    this.usgPositions = this.convertToPositions(orgMap['USG']);

    console.log(this.atlasPositions);
  }

    

  // ================= CONVERT =================
  convertToPositions(data: any): Position[] {
    const positions: Position[] = [];

    Object.keys(data).forEach(pos => {
      const candidates = data[pos];

      // SORT (highest votes first)
      candidates.sort((a: any, b: any) => b.votes - a.votes);

      // Determine winner
      const maxVotes = Math.max(...candidates.map((c: any) => c.votes), 0);

      candidates.forEach((c: any) => {
        c.isWinner = c.votes === maxVotes && maxVotes > 0;
      });

      positions.push({
        name: pos,
        candidates: candidates
      });
    });

    return positions;
  }

  // ================= GET ACTIVE POSITIONS =================
  getActivePositions(): Position[] {
    switch (this.activeOrg) {
      case 'ATLAS': return this.atlasPositions;
      case 'STCM': return this.stcmPositions;
      case 'AEMT': return this.aemtPositions;
      case 'USG': return this.usgPositions;
      default: return [];
    }
  }

  // ================= TAB =================
  setActiveOrg(org: string) {
    this.activeOrg = org;
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

    // ===== LOGOS =====
  doc.addImage('ustp.jpg', 'JPG', 10, 5, 25, 25);
  doc.addImage('elecom-logo.jpg', 'JPG', 170, 5, 25, 25);

  // ===== HEADER TEXT =====
  doc.setFontSize(10);
  doc.text('University of Science and Technology of Southern Philippines - Villanueva', 105, 10, { align: 'center' });
  doc.text('ALLIANCE OF TECH-LEAD AND ASPIRING STUDENTS', 105, 15, { align: 'center' });
  doc.text('USTP VILLANUEVA', 105, 20, { align: 'center' });
  doc.text('Poblacion 1, Villanueva 9002 Misamis Oriental, Philippines', 105, 25, { align: 'center' });

  // LINE
  doc.line(10, 30, 200, 30);

  // ===== TITLE =====
  doc.setFontSize(14);
  doc.text('ONLINE ELECTION RESULT', 105, 38, { align: 'center' });

  doc.line(10, 42, 200, 42);

  // ===== INFO =====
  doc.setFontSize(10);
  doc.text(`Election : ${org} ELECTION RESULT`, 14, 50);
  doc.text(`Date : ${new Date().toDateString()}`, 14, 56);
  doc.text(`Generated : ${new Date().toDateString()}`, 14, 62);

  let startY = 70;

  const winners: any[] = [];

  // ===== POSITIONS =====
  positions.forEach(pos => {

    // POSITION TITLE
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
        c.isWinner ? 'Winner' : ''
      ];
    });

    // TABLE
    autotable(doc, {
      head: [['Candidate', 'Votes', 'Status']],
      body: tableData,
      startY: startY,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 102, 204] }
    });

    startY = (doc as any).lastAutoTable.finalY + 10;
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

  startY += 10;

  // ===== FOOTER =====
  doc.text('Prepared by:', 14, startY);
  doc.text('_____________________', 14, startY + 5);
  doc.text('(Administrator)', 14, startY + 10);

  doc.text('Noted by:', 140, startY);
  doc.text('_____________________', 140, startY + 5);
  doc.text('(Election Committee)', 140, startY + 10);

  // ===== SAVE =====
  doc.save(`${org}_Election_Results.pdf`);
}
}