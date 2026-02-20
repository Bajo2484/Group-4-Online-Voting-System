import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Candidate } from './candidate.model';

@Injectable({
  providedIn: 'root',
})
export class CandidateService {
approveCandidate(arg0: string) {
throw new Error('Method not implemented.');
}

 
  async uploadPhoto(file: File, _fileName: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Unexpected result from FileReader'));
        }
      };
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
    });
  }


  private readonly STORAGE_KEY = 'evoting_candidates';

  private candidatesSubject = new BehaviorSubject<Candidate[]>(this.loadFromStorage());
  candidates$ = this.candidatesSubject.asObservable();

  constructor() {}

  // Load data from localStorage
  private loadFromStorage(): Candidate[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Candidate[];
    } catch {
      return [];
    }
  }

  // Save & notify UI
  private saveAll(candidates: Candidate[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(candidates));
    this.candidatesSubject.next(candidates);
  }

  getAllCandidates(): Candidate[] {
    return this.candidatesSubject.value;
  }


  loadCandidates(): void {
    const all = this.loadFromStorage();
    this.candidatesSubject.next(all);
  }


 
  addCandidate(candidate: Candidate) {
    const all = this.getAllCandidates();
    all.push(candidate);
    this.saveAll(all);
  }


 
  updateCandidate(id: string, updated: Candidate) {
    const all = this.getAllCandidates().map(c =>
      c.id === updated.id ? updated : c
    );
    this.saveAll(all);
  }


  deleteCandidate(id: string) {
    const all = this.getAllCandidates().filter(c => c.id !== id);
    this.saveAll(all);
  }

 
  approveCandidae(id: string) {
    const all = this.getAllCandidates();
    const c = all.find(c => c.id === id);
    if (c) {
      c.status = 'approved';
      this.saveAll(all);
    }
  }



  rejectCandidate(id: string) {
    const all = this.getAllCandidates();
    const c = all.find(c => c.id === id);
    if (c) {
      c.status = 'rejected';
      this.saveAll(all);
    }
  }
}