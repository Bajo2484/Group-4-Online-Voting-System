import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css']
})
export class StudentDashboardComponent {

  studentName = 'Juan';
  department = 'BSIT';

  elections = [
    {
      id: 1,
      name: 'USG Election',
      logo: 'usg.jpg',
      voted: false
    },
    {
      id: 2,
      name: 'Atlas Election',
      logo: 'atlas.jpg',
      voted: true
    }
  ];

  get completedCount() {
    return this.elections.filter(e => e.voted).length;
  }

  get progressPercentage() {
    return (this.completedCount / this.elections.length) * 100;
  }

}