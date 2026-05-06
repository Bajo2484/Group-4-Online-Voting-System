import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  Firestore,
  collection,
  collectionData,
  query,
  getDocs
} from '@angular/fire/firestore';

@Component({
  selector: 'app-elecom-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './elecom-dashboard.html',
  styleUrls: ['./elecom-dashboard.css']
})
export class ElecomDashboardComponent implements OnInit {

  isLoading = true;
  private loadCount = 0;

  totalStudents = 0;
  totalCandidates = 0;
  overallParticipation = 0;

  private markedLoaded() {
    this.loadCount++;
    if (this.loadCount >= 4) {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // Election state
  firebaseStatus: string = '';
  remainingTime: string = '';
  electionStatus: string = 'OPEN';

  startTime: any;
  endTime: any;

  votingData: any[] = [];

  private router = inject(Router);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadDashboardData();
    this.getElectionSettings();
    this.getVotingData();
  }

  // ================= STUDENTS + PARTICIPATION =================
  loadDashboardData(): void {
    const studentsRef = query(collection(this.firestore, 'students'));

    collectionData(studentsRef).subscribe((students: any[]) => {
      this.totalStudents = students.length;

      const votedCount = students.filter(s => s.hasVoted).length;

      this.overallParticipation = this.totalStudents > 0
        ? Math.round((votedCount / this.totalStudents) * 100)
        : 0;

      this.markedLoaded();
      this.cdr.detectChanges();
    });

    collectionData(query(collection(this.firestore, 'candidates')))
      .subscribe((candidates: any[]) => {
        this.totalCandidates = candidates.length;

        this.markedLoaded();
        this.cdr.detectChanges();
      });
  }

  // ================= ELECTION SETTINGS =================
  async getElectionSettings(): Promise<void> {
    const electionsRef = collection(this.firestore, 'elections');
    const q = query(electionsRef);

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();

      this.firebaseStatus = (data['status'] || '').toLowerCase();

      this.startTime = data['startDate']?.toDate();
      this.endTime = data['endDate']?.toDate();

      if (this.startTime && this.endTime) {
        this.startCountdown();
      }

      this.markedLoaded();
      this.cdr.detectChanges();
    } else {
      console.warn('No active election found.');
    }
  }

  // ================= COUNTDOWN =================
  startCountdown(): void {
    setInterval(() => {
      if (!this.startTime || !this.endTime) return;

      const now = Date.now();
      const start = this.startTime.getTime();
      const end = this.endTime.getTime();

      if (now < start) {
        this.electionStatus = 'UPCOMING';
        const diff = start - now;

        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        this.remainingTime = `Starts in ${h}h ${m}m`;

      } else if (now >= start && now < end) {
        this.electionStatus = 'OPEN';
        const diff = end - now;

        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        this.remainingTime = `${h}h ${m}m remaining`;

      } else {
        this.electionStatus = 'CLOSED';
        this.remainingTime = 'Election Ended';
      }

      this.cdr.detectChanges();
    }, 1000);
  }

  // ================= VOTING OVERVIEW =================
  getVotingData(): void {
    const studentsRef = collection(this.firestore, 'students');

    collectionData(studentsRef).subscribe((students: any[]) => {
      const activeStudents = students.filter(s => s.isActive);

      const orgs = [
        { name: 'USG', courseFilter: null },
        { name: 'ATLAS', courseFilter: 'BSIT' },
        { name: 'STCM', courseFilter: 'BSTCM' },
        { name: 'AEMT', courseFilter: 'BSEMT' }
      ];

      this.votingData = orgs.map(org => {
        const filtered = org.courseFilter
          ? activeStudents.filter(s => s.course === org.courseFilter)
          : activeStudents;

        const enrolled = filtered.length;
        const votes = filtered.filter(s => s.hasVoted).length;

        return {
          name: org.name,
          enrolled,
          votes,
          abstain: enrolled - votes,
          turnout: enrolled ? Math.round((votes / enrolled) * 100) : 0,
          status: this.firebaseStatus
        };
      });

      this.cdr.detectChanges();
      this.markedLoaded();
    });
  }

  // ================= LOGOUT =================
  logout(): void {
    localStorage.removeItem('evoting_current_user');
    this.router.navigate(['/']);
  }
}