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
import { Candidate } from '../models/candidate.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {

  private firestore = inject(Firestore);


  getAllCandidates(): Observable<Candidate[]> {
    const candidatesRef = collection(this.firestore, 'candidates');
    return collectionData(candidatesRef, { idField: 'id' }) as Observable<Candidate[]>;
  }


  getPendingCandidates(): Observable<Candidate[]> {
    const candidatesRef = collection(this.firestore, 'candidates');
    const q = query(candidatesRef, where('status', '==', 'pending'));
    return collectionData(q, { idField: 'id' }) as Observable<Candidate[]>;
  }


  getApprovedCandidates(): Observable<Candidate[]> {
    const candidatesRef = collection(this.firestore, 'candidates');
    const q = query(candidatesRef, where('status', '==', 'approved'));
    return collectionData(q, { idField: 'id' }) as Observable<Candidate[]>;
  }

  getCandidatesByElection(electionId: string): Observable<Candidate[]> {
    const candidatesRef = collection(this.firestore, 'candidates');
    const q = query(
      candidatesRef,
      where('electionId', '==', electionId),
      where('status', '==', 'approved')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Candidate[]>;
  }


  async addCandidate(candidate: Candidate) {
    const candidatesRef = collection(this.firestore, 'candidates');
    return await addDoc(candidatesRef, candidate);
  }


  async updateCandidate(id: string, candidate: Candidate) {
    const docRef = doc(this.firestore, `candidates/${id}`);
    const { id: _unused, ...data } = candidate; 
    await updateDoc(docRef, data);
  }

  async deleteCandidate(id: string) {
    const docRef = doc(this.firestore, `candidates/${id}`);
    await deleteDoc(docRef);
  }


  async approveCandidate(id: string) {
    const docRef = doc(this.firestore, `candidates/${id}`);
    await updateDoc(docRef, { status: 'approved' });
  }

  async rejectCandidate(id: string) {
    const docRef = doc(this.firestore, `candidates/${id}`);
    await updateDoc(docRef, { status: 'rejected' });
  }
}