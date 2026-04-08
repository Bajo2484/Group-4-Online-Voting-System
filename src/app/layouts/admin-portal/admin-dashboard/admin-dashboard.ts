import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, collection, collectionData, query } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, TitleCasePipe],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);

  // Dashboard numbers
  totalVoters = 0;
  registeredCandidates = 0;
  activeElections = 0;
  completedElections = 0;

  // Panels
  upcomingElections: { title: string; startDate: Date; status: string }[] = [];
  completedElectionList: { title: string; endDate: Date; status: string }[] = [];
  recentActivities: {
    title: string;
    description: string;
    date: Date;
    type: 'voter' | 'candidate' | 'election';
  }[] = [];

  ngOnInit() {
    this.loadDashboardData();

    // Refresh when auth state changes
    authState(this.auth).subscribe(user => {
      if (user) this.loadDashboardData();
    });
  }

  loadDashboardData() {
    // ----------------- VOTERS -----------------
    const studentsRef = query(collection(this.firestore, 'students'));
    collectionData(studentsRef, { idField: 'id' }).subscribe((voters: any[]) => {
      this.totalVoters = voters.length;

      const voterActivities = voters
        .sort((a, b) => this.timestampToDate(b.createdAt).getTime() - this.timestampToDate(a.createdAt).getTime())
        .slice(0, 50)
        .map(v => ({
          title: 'New Student Registered',
          description: `${v.name} has been registered as a voter.`,
          date: this.timestampToDate(v.createdAt),
          type: 'voter' as const
        }));

      this.recentActivities = voterActivities;
      this.cdr.detectChanges();
    });

    // ----------------- CANDIDATES -----------------
    const candidatesRef = query(collection(this.firestore, 'candidates'));
    collectionData(candidatesRef, { idField: 'id' }).subscribe((candidates: any[]) => {
      this.registeredCandidates = candidates.length;

      const candidateActivities = candidates
        .sort((a, b) => this.timestampToDate(b.createdAt).getTime() - this.timestampToDate(a.createdAt).getTime())
        .slice(0, 50)
        .map(c => ({
          title: 'New Candidate Registered',
          description: `${c.name} has been registered as a candidate.`,
          date: this.timestampToDate(c.createdAt),
          type: 'candidate' as const
        }));

      this.recentActivities = [...candidateActivities, ...this.recentActivities]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 50);

      this.cdr.detectChanges();
    });

    // ----------------- ELECTIONS -----------------
    const electionsRef = query(collection(this.firestore, 'elections'));
    collectionData(electionsRef).subscribe((elections: any[]) => {
      const now = new Date().getTime();

      const normalized = elections.map(e => {
        const start = this.timestampToDate(e['startDate']).getTime();
        const end = this.timestampToDate(e['endDate']).getTime();
        let status: 'upcoming' | 'active' | 'completed' = 'upcoming';

        if (now < start) status = 'upcoming';
        else if (now >= start && now <= end) status = 'active';
        else status = 'completed';

        return {
          ...e,
          startDate: this.timestampToDate(e['startDate']),
          endDate: this.timestampToDate(e['endDate']),
          status
        };
      });

      // Dashboard counts
      this.activeElections = normalized.filter(e => e.status === 'active').length;
      this.completedElections = normalized.filter(e => e.status === 'completed').length;

      this.upcomingElections = normalized
        .filter(e => e.status === 'upcoming')
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
        .slice(0, 50);

      this.completedElectionList = normalized
        .filter(e => e.status === 'completed')
        .sort((a, b) => b.endDate.getTime() - a.endDate.getTime())
        .slice(0, 50);

      const electionActivities = normalized
        .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
        .slice(0, 5)
        .map(e => ({
          title: e.title,
          description:
            e.status === 'completed'
              ? 'Completed election'
              : e.status === 'active'
              ? 'Started election'
              : 'Scheduled election',
          date: e.startDate,
          type: 'election' as const
        }));

      this.recentActivities = [...electionActivities, ...this.recentActivities]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 50);

      this.cdr.detectChanges();
    });
  }

  // Safe timestamp converter
  private timestampToDate(value: any): Date {
    if (!value) return new Date();
    if (value?.toDate && typeof value.toDate === 'function') return value.toDate();
    if (value instanceof Date) return value;
    return new Date(value);
  }
}