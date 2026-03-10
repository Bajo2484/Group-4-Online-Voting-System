<<<<<<< HEAD
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData, query } from '@angular/fire/firestore';
=======
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7

@Component({
  selector: 'app-elecom-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './elecom-dashboard.html',
  styleUrls: ['./elecom-dashboard.css']
})
<<<<<<< HEAD
export class ElecomDashboardComponent implements OnInit {
=======
export class ElecomDashboardComponent {
>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7
  totalStudents = 0;
  totalCandidates = 0;
  overallParticipation = 0;

<<<<<<< HEAD
  private router = inject(Router);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    const studentsRef = query(collection(this.firestore, 'students'));
    collectionData(studentsRef).subscribe((students: any[]) => {
      this.totalStudents = students.length;
      const voted = students.filter((s: any) => s.hasVoted === true).length;
      this.overallParticipation = students.length > 0 ? Math.round((voted / students.length) * 100) : 0;
      this.cdr.detectChanges();
    });

    collectionData(query(collection(this.firestore, 'candidates'))).subscribe((candidates: any[]) => {
      this.totalCandidates = candidates.length;
      this.cdr.detectChanges();
    });
  }
=======
  constructor(private router: Router) {}
>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7

  logout() {
    localStorage.removeItem('evoting_current_user');
    this.router.navigate(['/']);
  }
}