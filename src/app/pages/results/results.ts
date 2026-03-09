import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Candidate {
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

  // Track which org tab is active
  activeOrg: string = 'ATLAS';

  // Positions for each organization
  atlasPositions: Position[] = [
    { name: 'President', candidates: [] },
    { name: 'Internal Vice President', candidates: [] },
    { name: 'External Vice President', candidates: [] },
    { name: 'General Secretary', candidates: [] },
    { name: 'Associate Secretary', candidates: [] },
    { name: 'Treasurer', candidates: [] },
    { name: 'Auditor', candidates: [] },
    { name: 'External PRO', candidates: [] },
    { name: 'Internal PRO', candidates: [] },
    { name: '2nd Governor', candidates: [] },
    { name: '3rd Governor', candidates: [] },
    { name: '4th Governor', candidates: [] }
  ];

  stcmPositions: Position[] = [
    { name: 'President', candidates: [] },
    { name: 'Vice President', candidates: [] },
    { name: 'Secretary', candidates: [] },
    { name: 'Treasurer', candidates: [] },
    { name: 'Auditor', candidates: [] },
    { name: 'PRO', candidates: [] }
  ];

  aemtPositions: Position[] = [
    { name: 'President', candidates: [] },
    { name: 'Vice President', candidates: [] },
    { name: 'Secretary', candidates: [] },
    { name: 'Treasurer', candidates: [] },
    { name: 'Auditor', candidates: [] },
    { name: 'PRO', candidates: [] }
  ];

  usgPositions: Position[] = [
    { name: 'President', candidates: [] },
    { name: 'Vice President', candidates: [] },
    { name: 'Secretary', candidates: [] },
    { name: 'Treasurer', candidates: [] },
    { name: 'Auditor', candidates: [] },
    { name: 'PRO', candidates: [] }
  ];

  constructor() {
    this.loadSampleData(); // Optional mock data
  }

  /** Switch active organization */
  setActiveOrg(org: string) {
    this.activeOrg = org;
  }

  /** Automatically assign winner for each position */
  determineWinners(positions: Position[]) {
    positions.forEach(pos => {
      if (pos.candidates.length > 0) {
        const maxVotes = Math.max(...pos.candidates.map(c => c.votes));
        pos.candidates.forEach(c => c.isWinner = c.votes === maxVotes);
      }
    });
  }

  /** Mock data for testing */
  loadSampleData() {
    this.atlasPositions[0].candidates = [
      { name: 'John Doe', votes: 45 },
      { name: 'Jane Smith', votes: 55 },
      { name: 'Alice Tan', votes: 30 }
    ];
    this.determineWinners(this.atlasPositions);

    this.stcmPositions[0].candidates = [
      { name: 'Mark Cruz', votes: 70 },
      { name: 'Lucy Lim', votes: 50 }
    ];
    this.determineWinners(this.stcmPositions);
  }

  /** Export results as PDF per organization */
  exportPDF(org: string) {
    let positions: Position[] = [];

    switch (org) {
      case 'ATLAS': positions = this.atlasPositions; break;
      case 'STCM': positions = this.stcmPositions; break;
      case 'AEMT': positions = this.aemtPositions; break;
      case 'USG': positions = this.usgPositions; break;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${org} Election Results`, 14, 22);

    const tableData: any[] = [];

    positions.forEach(pos => {
      pos.candidates.forEach(c => {
        tableData.push([pos.name, c.name, c.votes, c.isWinner ? 'Winner' : '']);
      });
    });

    (doc as any).autoTable({
      head: [['Position', 'Candidate', 'Votes', 'Winner']],
      body: tableData,
      startY: 30,
      theme: 'grid'
    });

    doc.save(`${org}_Election_Results.pdf`);
  }

}