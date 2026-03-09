import { Component, OnInit, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, collection, collectionData, query } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {

  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Dashboard numbers
  totalVoters = 0;
  registeredCandidates = 0;
  activeElections = 0;
  completedElections = 0;

  ngOnInit() {

    // Wait for logged-in admin
    authState(this.auth).subscribe(user => {

      if (user) {
        this.loadDashboardData();
      }

    });

  }

  loadDashboardData() {

    // ----------------- VOTERS -----------------
    const votersRef = query(collection(this.firestore, 'voters'));

    collectionData(votersRef).subscribe((voters: any[]) => {
      this.totalVoters = voters.length;
    });

    // ----------------- CANDIDATES -----------------
    const candidatesRef = query(collection(this.firestore, 'candidates'));

    collectionData(candidatesRef).subscribe((candidates: any[]) => {
      this.registeredCandidates = candidates.length;
    });

    // ----------------- ELECTIONS -----------------
    const electionsRef = query(collection(this.firestore, 'elections'));

    collectionData(electionsRef).subscribe((elections: any[]) => {
      this.activeElections =
        elections.filter(e => e.status === 'active').length;

      this.completedElections =
        elections.filter(e => e.status === 'completed').length;
    });

  }

}