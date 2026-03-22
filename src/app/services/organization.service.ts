import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  constructor(private firestore: Firestore) {}

  getOrganizations(): Observable<any[]> {

    const orgRef = collection(this.firestore, 'organizations');
    return collectionData(orgRef, { idField: 'id' }) as Observable<any[]>;

  }

}