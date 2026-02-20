import { Injectable, signal } from '@angular/core';

export interface Election {
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ElectionService {

  private _elections = signal<Election[]>([]);

  elections = this._elections.asReadonly();

  addElection(election: Election) {
    this._elections.update(list => [...list, election]);
  }
}
