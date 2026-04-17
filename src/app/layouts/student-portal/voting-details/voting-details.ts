import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Auth, getAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


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
  otherOrder: string[] = [
  'PRESIDENT',
  'VICE PRESIDENT',
  'SECRETARY',
  'TREASURER',
  'AUDITOR',
  'PRO'
];

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private cdr: ChangeDetectorRef,
    private auth: Auth,
    private router:Router
  ) {}

  private getOrderList(): string[]{
    const id = (this.electionId || '').toUpperCase();

    if (id) return this.otherOrder;
      
    return id.includes('ATLAS')
    ? this.atlasOrder
    : this.otherOrder;
  }

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
    const orderList = this.getOrderList();

    return positions.sort((a, b) => {
      const indexA = orderList.indexOf(a.toUpperCase());
      const indexB = orderList.indexOf(b.toUpperCase());

      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
  }



  getCandidate(position: string) {
    return this.votes[position];
  }

  gotoDashboard() {
    this.router.navigate(['/student-dashboard']);
  }

  viewResults() {
    Swal.fire({
      title: 'View Results?',
    text: 'Do you want to proceed?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes'
  }).then((result) => {
    if (result.isConfirmed) {
      this.router.navigate(['/student-result']);
    }
    });
  }
 
}