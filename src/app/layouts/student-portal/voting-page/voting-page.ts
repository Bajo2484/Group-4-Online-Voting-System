import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Firestore, collection, query, where, onSnapshot } from '@angular/fire/firestore';
import { addDoc, serverTimestamp } from 'firebase/firestore';

@Component({
  selector: 'app-voting-page',
  standalone: true,
  templateUrl: './voting-page.html',
  styleUrls: ['./voting-page.css'],
  imports: [CommonModule, FormsModule]
})
export class VotingPage implements OnInit, OnDestroy {

  electionId: string = '';
  electionName: string = '';
  org: string = '';
  positions: any[] = [];

  selectedVotes: { [position: string]: any } = {};
  expandedCandidate: { [position: string]: any | null } = {};

  private snapshotUnsub!: () => void;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private cdr: ChangeDetectorRef
  ) {}

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

regularPositions: string[] = [
    'President',
    'VICE PRESIDENT',
    'SECRETARY',
    'TREASURER',
    'AUDITOR',
    'PRO'
  ];
      
  ngOnInit() {

    const params = this.route.snapshot.paramMap;

    this.org = (params.get('org') || '').toUpperCase();
    this.electionId = (params.get('electionId') || '').toUpperCase();

    console.log('Org:', this.org);
    console.log('ElectionId:', this.electionId);

    if (!this.org || !this.electionId) {
      console.warn('Missing org or electionId in route');
      return;
    }

    // ✅ Load candidates from Firestore
    this.loadCandidates(this.org, this.electionId);

    // Optional election name
    this.route.queryParamMap.subscribe(params => {
      this.electionName = params.get('name') || 'Election';
    });
  }

  ngOnDestroy() {
    if (this.snapshotUnsub) this.snapshotUnsub();
  }

  // ✅ Fetch candidates from Firestore
  loadCandidates(org: string, electionId: string) {

    const candidatesRef = collection(this.firestore, 'candidates');

    const q = query(
      candidatesRef,
      where('status', '==', 'approved'),
      where('organization', '==', org),
      where('electionId', '==', electionId)
    );

    // Cleanup previous listener
    if (this.snapshotUnsub) {
      this.snapshotUnsub();
    }

    this.snapshotUnsub = onSnapshot(q, (snapshot) => {

      const candidates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log("RAW DATABASE DATA:", candidates);

      const grouped: any = {};

      candidates.forEach((c: any) => {
        if (!c.position) return;

        if (!grouped[c.position]) {
          grouped[c.position] = [];
        }

        grouped[c.position].push(c);
      });

      const order  = this.org == 'ATLAS'
        ? this.atlasOrder
        : this.regularPositions;
        
        this.positions = Object.keys(grouped)
          .sort((a, b) => {
            const indexA = order.indexOf(a);
            const indexB = order.indexOf(b);

            return (indexA == -1 ? 999 : indexA) - (indexB == -1 ? 999 : indexB);
          })

        .map(position => ({
        name: position,
        candidates: grouped[position]
      }));

      console.log("FIREBASE POSITIONS:", this.positions);
      this.cdr.detectChanges();
    });
  }

  // ✅ Select candidate
  selectCandidate(position: string, candidate: any) {
    this.selectedVotes[position] = candidate;
  }

  // ✅ Check selected
  isSelected(position: string, candidate: any): boolean {
    return this.selectedVotes[position] === candidate;
  }

  // ✅ Toggle platform
  togglePlatform(position: string, candidate: any) {
    this.expandedCandidate[position] === candidate
      ? this.expandedCandidate[position] = null
      : this.expandedCandidate[position] = candidate;
  }

  // ✅ Check expanded
  isExpanded(position: string, candidate: any): boolean {
    return this.expandedCandidate[position] === candidate;
  }

  // ✅ Submit votes
  async submitVotes() {
    try {

      if (!this.org || !this.electionId) {
        alert('Missing election information');
        return;
      }

      const votesCollection = collection(this.firestore, 'votes');

      const voteData = {
        org: this.org,
        electionId: this.electionId,
        votes: this.selectedVotes,
        createdAt: serverTimestamp()
      };

      await addDoc(votesCollection, voteData);

      alert('Vote submitted successfully!');

      this.selectedVotes = {};

    } catch (error) {
      console.error(error);
      alert('Error submitting votes');
    }
  }
}