import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VotingCacheService {

  private positionsSource = new BehaviorSubject<any[]>([]);

  
  positions$ = this.positionsSource.asObservable();

  
  setPositions(data: any[]) {
    this.positionsSource.next(data);
  }

  getPositions() {
    return this.positionsSource.getValue();
  }


  clearPositions() {
    this.positionsSource.next([]);
  }

}