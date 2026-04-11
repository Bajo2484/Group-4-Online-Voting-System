import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Observable } from 'rxjs';

// Interface for Elecom account
export interface ElecomAccount {
  uid?: string;        // Firestore document ID
  username: string;    
  name: string;
  email: string;
  position: string;
  isActive: boolean;
  createdAt?: any;     // Timestamp
}

@Injectable({
  providedIn: 'root',
})
export class ElecomAccountService {
  private readonly collectionName = 'users';

  constructor(private firestore: Firestore, private auth: Auth) {}

  // ✅ Get all Elecom accounts as AngularFire Observable
  getAll(): Observable<ElecomAccount[]> {
    const colRef = collection(this.firestore, this.collectionName);
    const q = query(colRef, where('role', '==', 'elecom')); 
    return collectionData(q, { idField: 'uid' }) as Observable<ElecomAccount[]>;
  }

  // ✅ Add new Elecom account (Firebase Auth + Firestore)
  async add(elecom: ElecomAccount, password: string): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, elecom.email, password);
    const uid = userCredential.user.uid;

    await setDoc(doc(this.firestore, this.collectionName, uid), {
      username: elecom.username,
      name: elecom.name,
      email: elecom.email,
      role: 'elecom',
      position: elecom.position,
      isActive: elecom.isActive,
      createdAt: new Date()
    });
  }

  // Delete Elecom account
  async delete(uid: string): Promise<void> {
    await deleteDoc(doc(this.firestore, this.collectionName, uid));
  }

  //  Update isActive status
  async setActive(uid: string, isActive: boolean): Promise<void> {
    await setDoc(doc(this.firestore, this.collectionName, uid), { isActive }, { merge: true });
  }
}