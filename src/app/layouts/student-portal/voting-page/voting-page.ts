import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Firestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  getDoc
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { getAuth } from 'firebase/auth';
import { StudentCacheService } from '../../../services/student-cache.service';

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
  isConfirmed: boolean = false;

  private snapshotUnsub!: () => void;

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
    private router: Router,
    private auth: Auth,
    private studentCache: StudentCacheService
  ) {}

  async ngOnInit() {
    const params = this.route.snapshot.paramMap;
    this.org = (params.get('org') || '').toUpperCase();
    this.electionId = params.get('electionId') || '';

    if (!this.org || !this.electionId) {
      console.warn('Missing org or electionId in route');
      return;
    }

    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      alert('You are not logged in.');
      this.router.navigate(['login']);
      return;
    }

    // Check if student already voted
    try {
      const studentRef = doc(this.firestore, `students/${currentUser.uid}`);
      const studentSnap = await getDoc(studentRef);
      const data: any = studentSnap.data();

      const alreadyVoted = data?.['votes']?.some(
        (v: any) => v['electionId'] === this.electionId && v['isVoted']
      );

      
    } catch (err) {
      console.error('Error checking student votes', err);
    }

    // Load candidates
    this.loadCandidates(this.org, this.electionId);

    this.route.queryParamMap.subscribe(params => {
      this.electionName = params.get('name') || 'Election';
    });
  }

  ngOnDestroy() {
    if (this.snapshotUnsub) this.snapshotUnsub();
  }

  loadCandidates(org: string, electionId: string) {
    const candidatesRef = collection(this.firestore, 'candidates');

    const q = query(
      candidatesRef,
      where('status', '==', 'approved'),
      where('organization', '==', org),
      where('electionId', '==', 'lqDNkhaC2BKwVRkJ7dvZ')
    );

    if (this.snapshotUnsub) this.snapshotUnsub();

    this.snapshotUnsub = onSnapshot(q, (snapshot) => {
      console.log('Candidates snapshot docs:', snapshot.docs);

      const candidates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const grouped: any = {};
      candidates.forEach((c: any) => {
        if (!c.position) return;
        const pos = c.position.toUpperCase();
        if (!grouped[pos]) grouped[pos] = [];
        grouped[pos].push(c);
      });

      const order = this.org === 'ATLAS' ? this.atlasOrder : this.regularPositions;

      this.positions = Object.keys(grouped)
        .sort((a, b) => {
          const indexA = order.indexOf(a);
          const indexB = order.indexOf(b);
          return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        })
        .map(position => ({
          name: position,
          candidates: grouped[position]
        }));

      this.cdr.detectChanges();
    });
  }

  selectCandidate(position: string, candidate: any) {
    this.selectedVotes[position] = candidate;
  }

  isSelected(position: string, candidate: any): boolean {
    const selected = this.selectedVotes[position];

    if (candidate === 'ABSTAIN'){
      return selected === 'ABSTAIN';
    }
    return selected?.id === candidate.id;
  }

  togglePlatform(position: string, candidate: any) {
    this.expandedCandidate[position] = this.expandedCandidate[position] === candidate ? null : candidate;
  }

  isExpanded(position: string, candidate: any): boolean {
    return this.expandedCandidate[position] === candidate;
  }

  async submitVotes() {
    try {
      for (let pos of this.positions) {
        if (!this.selectedVotes[pos.name]) {
          alert(`Please select a candidate for ${pos.name}`);
          return;
        }
      }

      if (!this.isConfirmed) {
        alert('Please confirm your votes before submitting.');
        return;
      }

      const currentUser = getAuth().currentUser;
      if (!currentUser) {
        alert('User not logged in');
        return;
      }

      const voteData = {
        studentId: currentUser.uid,
        org: this.org,
        electionId: this.electionId,
        createdAt: serverTimestamp(),
      
        
        
        votes: Object.keys(this.selectedVotes).reduce((acc, position) => {
          const candidate = this.selectedVotes[position];

          if (candidate === 'ABSTAIN') {
            acc[position] = {
              id: null,
              fullName: 'ABSTAIN',
              partyName: null,
              photo: null,
              isAbstain: true
            };
          }else {
          acc[position] = {
            id: candidate.id,
            fullName: candidate.fullName,
            partyName: candidate.partyName,
            photo: candidate.photo || null,
            isAbstain: false
          };
        }
          return acc;
        }, {} as any),
        
      };
    
      const voteRef = doc(this.firestore, `votes/${currentUser.uid}_${this.electionId}`);
      await setDoc(voteRef, voteData);

      const studentRef = doc(this.firestore, `students/${currentUser.uid}`);
      await updateDoc(studentRef, {
        hasVoted: true,
        votes: arrayUnion({ electionId: this.electionId, isVoted: true })
      });

      if (this.studentCache.currentStudent) {
        this.studentCache.currentStudent.votes = this.studentCache.currentStudent.votes || [];
        this.studentCache.currentStudent.votes.push({ electionId: this.electionId, isVoted: true });
      }

      this.selectedVotes = {};
      this.isConfirmed = false;

      this.router.navigate(['/vote-success']);
    } catch (error) {
      console.error(error);
      alert('Error submitting votes. Please try again.');
    }
  }
}