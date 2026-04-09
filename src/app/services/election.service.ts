import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, query, orderBy, DocumentReference } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';

export interface Election {
[x: string]: any;
  id?: string;
  title: string;
  


  electionId: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed';
  candidates?: string[];
 
}

@Injectable({
  providedIn: 'root'
})
export class ElectionService {

  private collectionName = 'elections';

  constructor(private firestore: Firestore) {}

  /** Real-time subscription to all elections with safe Date conversion */
  getElections(): Observable<Election[]> {
    const colRef = collection(this.firestore, this.collectionName);
    const q = query(colRef, orderBy('startDate', 'asc'));
    return collectionData(q, { idField: 'id' }).pipe(
  map(elections => elections.map(e => ({
    ...e,
    startDate: this.toDate(e['startDate']), // <- bracket notation
    endDate: this.toDate(e['endDate'])      // <- bracket notation
  })))
) as Observable<Election[]>;
   
  }

  /** Add a new election */
  async addElection(election: Election): Promise<DocumentReference> {
    const colRef = collection(this.firestore, this.collectionName);
    return await addDoc(colRef, election);
  }

  /** Update an existing election */
  async updateElection(id: string, election: Partial<Election>) {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    await updateDoc(docRef, election);
  }

  /** Delete an election */
  async deleteElection(id: string) {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    await deleteDoc(docRef);
  }

  /** Update the status of an election */
  async updateStatus(id: string, status: 'upcoming' | 'active' | 'completed') {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    await updateDoc(docRef, { status });
  }

  /** Convert Firestore Timestamp to JS Date */
  private toDate(value: any): Date {
    if (!value) return new Date();
    if (value?.toDate) return value.toDate(); // AngularFire Timestamp
    return new Date(value);
  }
}