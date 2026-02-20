import { Injectable } from '@angular/core';

export interface ElecomAccount {
  
  username: string;
  
  name: string;
 
  email: string;
  
  password: string;
 
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ElecomAccountService {
  private readonly STORAGE_KEY = 'evoting_elecoms';

 
  getAll(): ElecomAccount[] {
    if (typeof localStorage === 'undefined') return [];

    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as ElecomAccount[];
      return [];
    } catch {
      return [];
    }
  }

  private saveAll(list: ElecomAccount[]): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }

 
  add(elecom: ElecomAccount): void {
    const current = this.getAll();

    if (current.some((e) => e.username === elecom.username)) {
      throw new Error('An Elecom account with this username already exists.');
    }

    current.push(elecom);
    this.saveAll(current);
  }

  delete(username: string): void {
    const current = this.getAll();
    const filtered = current.filter((e) => e.username !== username);
    this.saveAll(filtered);
  }

  findByCredentials(username: string, password: string): ElecomAccount | undefined {
    return this.getAll().find((e) => e.username === username && e.password === password);
  }


  setActive(username: string, isActive: boolean): void {
    const current = this.getAll();
    const index = current.findIndex((e) => e.username === username);

    if (index === -1) return;

    current[index] = { ...current[index], isActive };
    this.saveAll(current);
  }
}
