import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Auth, getAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-voting-details',
  standalone: true,
  templateUrl: './voting-details.html',
  styleUrls: ['./voting-details.css'],
  imports: [CommonModule]
})
export class VotingDetails implements OnInit {
  studentId: string = '';
  electionId: string = '';
  votes: any = {};
  loading: boolean = true;
  error: string = '';

  atlasOrder: string[] = [
    'PRESIDENT',
    'INTERNAL VICE PRESIDENT',
    'EXTERNAL VICE PRESIDENT',
    'GENERAL SECRETARY',
    'ASSOCIATE SECRETARY',
    'TREASURER',
    'AUDITOR',
    'INTERNAL PRO',
    'EXTERNAL PRO',
    '2ND YR GOV',
    '3RD YR GOV',
    '4TH YR GOV'
  ];

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private cdr: ChangeDetectorRef,
    private auth: Auth
  ) {}

  ngOnInit() {
    const params = this.route.snapshot.paramMap;
    this.studentId = params.get('studentId') || getAuth().currentUser?.uid || '';
    this.electionId = params.get('electionId') || '';

    if (!this.studentId || !this.electionId) {
      this.error = 'Missing student ID or election ID';
      this.loading = false;
      return;
    }

    this.loadVotes();
  }

  async loadVotes() {
    try {
      const voteRef = doc(this.firestore, `votes/${this.studentId}_${this.electionId}`);
      const voteSnap = await getDoc(voteRef);

      if (!voteSnap.exists()) {
        this.error = 'No votes found for this election.';
        this.loading = false;
        return;
      }

      const data = voteSnap.data();
      this.votes = data['votes'] || {};
      this.loading = false;
      this.cdr.detectChanges();
    } catch (err) {
      console.error(err);
      this.error = 'Error loading votes';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  getPositions(): string[] {
    const positions = Object.keys(this.votes);
    return positions.sort((a, b) => {
      const indexA = this.atlasOrder.indexOf(a.toUpperCase());
      const indexB = this.atlasOrder.indexOf(b.toUpperCase());
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
  }

  getCandidate(position: string) {
    return this.votes[position];
  }

 
}