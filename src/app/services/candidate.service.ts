import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where
} from '@angular/fire/firestore';
import { Candidate } from './candidate.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {

  private firestore = inject(Firestore);

  /** --------------------
   * Get ALL candidates regardless of status
   * Real-time observable
   * -------------------- */
  getAllCandidates(): Observable<Candidate[]> {
    const candidatesRef = collection(this.firestore, 'candidates');
    return collectionData(candidatesRef, { idField: 'id' }) as Observable<Candidate[]>;
  }

  /** --------------------
   * Get pending candidates only
   * -------------------- */
  getPendingCandidates(): Observable<Candidate[]> {
    const candidatesRef = collection(this.firestore, 'candidates');
    const q = query(candidatesRef, where('status', '==', 'pending'));
    return collectionData(q, { idField: 'id' }) as Observable<Candidate[]>;
  }

  /** --------------------
   * Get approved candidates only
   * -------------------- */
  getApprovedCandidates(): Observable<Candidate[]> {
    const candidatesRef = collection(this.firestore, 'candidates');
    const q = query(candidatesRef, where('status', '==', 'approved'));
    return collectionData(q, { idField: 'id' }) as Observable<Candidate[]>;
  }

  /** --------------------
   * Get approved candidates filtered by electionId
   * -------------------- */
  getCandidatesByElection(electionId: string): Observable<Candidate[]> {
    const candidatesRef = collection(this.firestore, 'candidates');
    const q = query(
      candidatesRef,
      where('electionId', '==', electionId),
      where('status', '==', 'approved')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Candidate[]>;
  }

  /** --------------------
   * Add a new candidate
   * -------------------- */
  async addCandidate(candidate: Candidate) {
    const candidatesRef = collection(this.firestore, 'candidates');
    return await addDoc(candidatesRef, candidate);
  }

  /** --------------------
   * Update existing candidate
   * -------------------- */
  async updateCandidate(id: string, candidate: Candidate) {
    const docRef = doc(this.firestore, `candidates/${id}`);
    const { id: _unused, ...data } = candidate; // Remove id before update
    await updateDoc(docRef, data);
  }

  /** --------------------
   * Delete candidate
   * -------------------- */
  async deleteCandidate(id: string) {
    const docRef = doc(this.firestore, `candidates/${id}`);
    await deleteDoc(docRef);
  }

  /** --------------------
   * Approve candidate
   * -------------------- */
  async approveCandidate(id: string) {
    const docRef = doc(this.firestore, `candidates/${id}`);
    await updateDoc(docRef, { status: 'approved' });
  }

  /** --------------------
   * Reject candidate
   * -------------------- */
  async rejectCandidate(id: string) {
    const docRef = doc(this.firestore, `candidates/${id}`);
    await updateDoc(docRef, { status: 'rejected' });
  }
}