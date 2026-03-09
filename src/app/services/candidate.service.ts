import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, query } from '@angular/fire/firestore';
import { Candidate } from './candidate.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {

  private firestore = inject(Firestore);

  /** Get all candidates as an Observable (live updates) */
  getCandidates(): Observable<Candidate[]> {
    const candidatesRef = collection(this.firestore, 'candidates'); 
    const candidatesQuery = query(candidatesRef); // wrap in query for AngularFire 12
    return collectionData(candidatesQuery, { idField: 'id' }) as Observable<Candidate[]>;
  }

  /** Add a new candidate */
  async addCandidate(candidate: Candidate) {
    const candidatesRef = collection(this.firestore, 'candidates');
    return await addDoc(candidatesRef, candidate);
  }

  /** Update existing candidate */
  async updateCandidate(id: string, candidate: Candidate) {
    const docRef = doc(this.firestore, `candidates/${id}`);
    const { id: _unused, ...data } = candidate;
    await updateDoc(docRef, data);
  }

  /** Delete candidate */
  async deleteCandidate(id: string) {
    const docRef = doc(this.firestore, `candidates/${id}`);
    await deleteDoc(docRef);
  }

  /** Approve candidate */
  async approveCandidate(id: string) {
    const docRef = doc(this.firestore, `candidates/${id}`);
    await updateDoc(docRef, { status: 'approved' });
  }

  /** Reject candidate */
  async rejectCandidate(id: string) {
    const docRef = doc(this.firestore, `candidates/${id}`);
    await updateDoc(docRef, { status: 'rejected' });
  }
}