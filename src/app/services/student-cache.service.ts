import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StudentCacheService {
  public currentStudent: any = null; // store student data
}