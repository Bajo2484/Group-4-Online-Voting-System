import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData, query, where, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-elecom-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './elecom-dashboard.html',
  styleUrls: ['./elecom-dashboard.css']
})
export class ElecomDashboardComponent implements OnInit {

  // EXISTING
  totalStudents = 0;
  totalCandidates = 0;
  overallParticipation = 0;

  // COUNTDOWN + OVERVIEW
  remainingTime: string = '';
  electionStatus: string = 'OPEN';
  startTime: any;
  endTime: any;

  votingData: any[] = [];

  private router = inject(Router);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadDashboardData();
    this.getElectionSettings();
    this.getVotingData();
  }

  // STUDENTS + PARTICIPATION
  loadDashboardData() {
    const studentsRef = query(collection(this.firestore, 'students'));
    collectionData(studentsRef).subscribe((students: any[]) => {
      this.totalStudents = students.length;
      const voted = students.filter((s: any) => s.hasVoted).length;
      this.overallParticipation = students.length > 0
        ? Math.round((voted / students.length) * 100)
        : 0;
      this.cdr.detectChanges();
    });

    collectionData(query(collection(this.firestore, 'candidates')))
      .subscribe((candidates: any[]) => {
        this.totalCandidates = candidates.length;
        this.cdr.detectChanges();
      });
  }

  // GET ACTIVE ELECTION SETTINGS
  async getElectionSettings() {
    const electionsRef = collection(this.firestore, 'elections');
    const q = query(electionsRef, where('status', '==', 'active'));

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0]; // first active election
      const data = docSnap.data();
      console.log('Election data:', data);

      this.startTime = data['startDate'].toDate();
      this.endTime = data['endDate'].toDate();
      this.startCountdown();
    } else {
      console.warn('No active election found.');
    }
  }

  // COUNTDOWN TIMER
  startCountdown() {
    setInterval(() => {
      if (!this.startTime || !this.endTime) return;

      const now = new Date().getTime();
      const start = this.startTime.getTime();
      const end = this.endTime.getTime();

      if (now < start) {
        this.electionStatus = 'UPCOMING';
        const distance = start - now;
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        this.remainingTime = `Starts in ${hours}h ${minutes}m`;
      } else if (now >= start && now < end) {
        this.electionStatus = 'OPEN';
        const distance = end - now;
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        this.remainingTime = `${hours}h ${minutes}m remaining`;
      } else {
        this.electionStatus = 'CLOSED';
        this.remainingTime = 'Election Ended';
      }

      // Update votingData status dynamically
      this.votingData = this.votingData.map(org => ({
        ...org,
        status: this.electionStatus
      }));

      this.cdr.detectChanges();
    }, 1000);
  }

  // VOTING OVERVIEW DATA
  getVotingData() {
    const studentsRef = collection(this.firestore, 'students');
    collectionData(studentsRef).subscribe((students: any[]) => {
      const activeStudents = students.filter(s => s.isActive);

      const orgs = [
        { name: 'USG', courseFilter: null },   // all active students
        { name: 'ATLAS', courseFilter: 'BSIT' },
        { name: 'STCM', courseFilter: 'BSTCM' },
        { name: 'AEMT', courseFilter: 'BSEMT' }
      ];

      this.votingData = orgs.map((org: any) => {
        const filtered = org.courseFilter
          ? activeStudents.filter(s => s.course === org.courseFilter)
          : activeStudents;

        const enrolled = filtered.length;
        const votes = filtered.filter(s => s.hasVoted).length;
        const turnout = enrolled > 0 ? Math.round((votes / enrolled) * 100) : 0;

        return {
          name: org.name,
          enrolled,
          votes,
          abstain: enrolled - votes,
          turnout,
          status: this.electionStatus
        };
      });

      this.cdr.detectChanges();
    });
  }

  // LOGOUT
  logout() {
    localStorage.removeItem('evoting_current_user');
    this.router.navigate(['/']);
  }
}