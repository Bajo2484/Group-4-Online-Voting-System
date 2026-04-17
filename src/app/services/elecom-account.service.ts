import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where
} from '@angular/fire/firestore';

import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Observable } from 'rxjs';

export interface ElecomAccount {
  uid?: string;
  name: string;
  username?: string;
  email: string;
  position: string;
  isActive: boolean;
  createdAt?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ElecomAccountService {

  private readonly collectionName = 'users';

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  // GET ALL ELECOM ACCOUNTS
  getAll(): Observable<ElecomAccount[]> {
    const colRef = collection(this.firestore, this.collectionName);

    const q = query(
      colRef,
      where('role', '==', 'elecom')
    );

    return collectionData(q, { idField: 'uid' }) as Observable<ElecomAccount[]>;
  }

  // CREATE ELECOM ACCOUNT (AUTH + FIRESTORE)
  async add(elecom: ElecomAccount, password: string): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      elecom.email,
      password
    );

    const uid = userCredential.user.uid;

    await setDoc(doc(this.firestore, this.collectionName, uid), {
      name: elecom.name,
      username: elecom.username,
      email: elecom.email,
      position: elecom.position,
      isActive: elecom.isActive,
      role: 'elecom',
      createdAt: new Date()
    });
  }

  // UPDATE ELECOM ACCOUNT
  async update(uid: string, data: Partial<ElecomAccount>): Promise<void> {
    const ref = doc(this.firestore, this.collectionName, uid);
    return updateDoc(ref, data);
  }

  // DELETE ELECOM ACCOUNT
  async delete(uid: string): Promise<void> {
    await deleteDoc(doc(this.firestore, this.collectionName, uid));
  }

  // OPTIONAL: TOGGLE ACTIVE STATUS
  async setActive(uid: string, isActive: boolean): Promise<void> {
    const ref = doc(this.firestore, this.collectionName, uid);
    return updateDoc(ref, { isActive });
  }
}