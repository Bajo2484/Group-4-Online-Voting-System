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

  // Upcoming elections + recent activity
  upcomingElections: {
    title: string;
    startDate: Date;
    status: string;
  }[] = [];

  recentActivities: {
    title: string;
    description: string;
    date: Date;
  }[] = [];

  ngOnInit() {
    this.loadDashboardData();

    // Also refresh when auth state is ready (in case of delay)
    authState(this.auth).subscribe(user => {
      if (user) {
        this.loadDashboardData();
      }
    });
  }

  loadDashboardData() {
    // ----------------- VOTERS (from students collection) -----------------
    const studentsRef = query(collection(this.firestore, 'students'));
    collectionData(studentsRef).subscribe((voters: any[]) => {
      this.totalVoters = voters.length;
      this.cdr.detectChanges();
    });

    // ----------------- CANDIDATES -----------------
    const candidatesRef = query(collection(this.firestore, 'candidates'));
    collectionData(candidatesRef).subscribe((candidates: any[]) => {
      this.registeredCandidates = candidates.length;
      this.cdr.detectChanges();
    });

    // ----------------- ELECTIONS -----------------
    const electionsRef = query(collection(this.firestore, 'elections'));
    collectionData(electionsRef).subscribe((elections: any[]) => {
      const normalized = elections.map(e => ({
        ...e,
        startDate: this.toDate(e['startDate']),
        endDate: this.toDate(e['endDate'])
      }));

      this.activeElections =
        normalized.filter((e: any) => e.status === 'active').length;
      this.completedElections =
        normalized.filter((e: any) => e.status === 'completed').length;

      const now = new Date();

      this.upcomingElections = normalized
        .filter((e: any) => e.status === 'upcoming' && e.startDate > now)
        .sort((a: any, b: any) => a.startDate.getTime() - b.startDate.getTime())
        .slice(0, 5);

      this.recentActivities = normalized
        .sort((a: any, b: any) => b.startDate.getTime() - a.startDate.getTime())
        .slice(0, 5)
        .map((e: any) => ({
          title: e.title,
          description:
            e.status === 'completed'
              ? 'Completed election'
              : e.status === 'active'
              ? 'Started election'
              : 'Scheduled election',
          date: e.startDate
        }));

      this.cdr.detectChanges();
    });
  }

  private toDate(value: any): Date {
    if (!value) return new Date();
    if (value?.toDate) return value.toDate();
    return new Date(value);
  }

}