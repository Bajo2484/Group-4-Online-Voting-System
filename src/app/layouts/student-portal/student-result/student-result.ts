import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Candidate {
  name: string;
  photo?: string;
  votes: number;
  percentage: number;
  winner: boolean;
}

interface Position {
  id: string;
  title: string;
  candidates: Candidate[];
}

@Component({
  selector: 'app-student-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-result.html',
  styleUrls: ['./student-result.css']
})
export class StudentResult {

  // Active tab
  activeTab: string = 'usg';

  // Active accordion for BSIT/ATLAS
  activeAccordion: string | null = null;

  // Switch tabs
  setTab(tab: string): void {
    this.activeTab = tab;
  }

  // Toggle accordion
  toggleAccordion(positionId: string): void {
    this.activeAccordion =
      this.activeAccordion === positionId ? null : positionId;
  }

  // ================= USG Positions =================
  usgPositions: Position[] = [
    {
      id: 'president',
      title: 'President',
      candidates: [
        { name: 'John Lee', photo: 'assets/photos/john.jpg', votes: 1200, percentage: 55, winner: true },
        { name: 'Jane Cruz', photo: 'assets/photos/jane.jpg', votes: 980, percentage: 45, winner: false }
      ]
    },
    {
      id: 'vp',
      title: 'Vice President',
      candidates: [
        { name: 'Mark Reyes', photo: 'assets/photos/mark.jpg', votes: 1100, percentage: 60, winner: true },
        { name: 'Anna Santos', photo: 'assets/photos/anna.jpg', votes: 730, percentage: 40, winner: false }
      ]
    },
    {
      id: 'secretary',
      title: 'Secretary',
      candidates: [
        { name: 'Pauline Tan', photo: 'assets/photos/pauline.jpg', votes: 1000, percentage: 50, winner: true },
        { name: 'Luis Gomez', photo: 'assets/photos/luis.jpg', votes: 1000, percentage: 50, winner: false }
      ]
    },
    {
      id: 'treasurer',
      title: 'Treasurer',
      candidates: [
        { name: 'Cathy Lim', photo: 'assets/photos/cathy.jpg', votes: 1150, percentage: 57, winner: true },
        { name: 'Eric Tan', photo: 'assets/photos/eric.jpg', votes: 870, percentage: 43, winner: false }
      ]
    },
    {
      id: 'auditor',
      title: 'Auditor',
      candidates: [
        { name: 'Miguel Cruz', photo: 'assets/photos/miguel.jpg', votes: 1300, percentage: 65, winner: true },
        { name: 'Rosa Lee', photo: 'assets/photos/rosa.jpg', votes: 700, percentage: 35, winner: false }
      ]
    },
    {
      id: 'pro',
      title: 'PRO',
      candidates: [
        { name: 'David Santos', photo: 'assets/photos/david.jpg', votes: 1400, percentage: 70, winner: true },
        { name: 'Liza Tan', photo: 'assets/photos/liza.jpg', votes: 600, percentage: 30, winner: false }
      ]
    }
  ];

  // ================= BSIT / ATLAS Positions (12) =================
  atlasPositions: Position[] = [
    { id: 'president', title: 'President', candidates: [
      { name: 'Mark Santos', photo: 'assets/photos/mark.jpg', votes: 150, percentage: 60, winner: true },
      { name: 'Paul Reyes', photo: 'assets/photos/paul.jpg', votes: 100, percentage: 40, winner: false }
    ]},
    { id: 'ivp', title: 'Internal Vice President', candidates: [
      { name: 'Anna Cruz', photo: 'assets/photos/anna.jpg', votes: 120, percentage: 70, winner: true },
      { name: 'John Tan', photo: 'assets/photos/john2.jpg', votes: 50, percentage: 30, winner: false }
    ]},
    { id: 'evp', title: 'External Vice President', candidates: [
      { name: 'Pauline Reyes', photo: 'assets/photos/pauline2.jpg', votes: 80, percentage: 55, winner: true },
      { name: 'Mark Lim', photo: 'assets/photos/mark2.jpg', votes: 65, percentage: 45, winner: false }
    ]},
    { id: 'secretary', title: 'General Secretary', candidates: [
      { name: 'Luis Gomez', photo: 'assets/photos/luis2.jpg', votes: 90, percentage: 60, winner: true },
      { name: 'Rosa Tan', photo: 'assets/photos/rosa2.jpg', votes: 60, percentage: 40, winner: false }
    ]},
    { id: 'assocSec', title: 'Associate Secretary', candidates: [
      { name: 'David Lee', photo: 'assets/photos/david2.jpg', votes: 100, percentage: 65, winner: true },
      { name: 'Cathy Tan', photo: 'assets/photos/cathy2.jpg', votes: 55, percentage: 35, winner: false }
    ]},
    { id: 'treasurer', title: 'Treasurer', candidates: [
      { name: 'Eric Santos', photo: 'assets/photos/eric2.jpg', votes: 110, percentage: 70, winner: true },
      { name: 'Liza Cruz', photo: 'assets/photos/liza2.jpg', votes: 45, percentage: 30, winner: false }
    ]},
    { id: 'auditor', title: 'Auditor', candidates: [
      { name: 'Miguel Tan', photo: 'assets/photos/miguel2.jpg', votes: 95, percentage: 60, winner: true },
      { name: 'Rosa Gomez', photo: 'assets/photos/rosa3.jpg', votes: 65, percentage: 40, winner: false }
    ]},
    { id: 'proInternal', title: 'PRO Internal', candidates: [
      { name: 'David Cruz', photo: 'assets/photos/david3.jpg', votes: 80, percentage: 50, winner: true },
      { name: 'Anna Lim', photo: 'assets/photos/anna2.jpg', votes: 80, percentage: 50, winner: false }
    ]},
    { id: 'proExternal', title: 'PRO External', candidates: [
      { name: 'Liza Santos', photo: 'assets/photos/liza3.jpg', votes: 75, percentage: 55, winner: true },
      { name: 'Paul Tan', photo: 'assets/photos/paul2.jpg', votes: 60, percentage: 45, winner: false }
    ]},
    { id: 'gov2', title: '2nd Year Governor', candidates: [
      { name: 'Mark Tan', photo: 'assets/photos/mark3.jpg', votes: 85, percentage: 60, winner: true },
      { name: 'Anna Gomez', photo: 'assets/photos/anna3.jpg', votes: 55, percentage: 40, winner: false }
    ]},
    { id: 'gov3', title: '3rd Year Governor', candidates: [
      { name: 'John Cruz', photo: 'assets/photos/john3.jpg', votes: 90, percentage: 65, winner: true },
      { name: 'Paul Lee', photo: 'assets/photos/paul3.jpg', votes: 50, percentage: 35, winner: false }
    ]},
    { id: 'gov4', title: '4th Year Governor', candidates: [
      { name: 'Anna Santos', photo: 'assets/photos/anna4.jpg', votes: 100, percentage: 70, winner: true },
      { name: 'Mark Reyes', photo: 'assets/photos/mark4.jpg', votes: 45, percentage: 30, winner: false }
    ]}
  ];

}