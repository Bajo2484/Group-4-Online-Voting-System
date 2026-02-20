import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-elecom-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './elecom-dashboard.html',
  styleUrls: ['./elecom-dashboard.css']
})
export class ElecomDashboardComponent {
  totalStudents = 0;
  totalCandidates = 0;
  overallParticipation = 0;

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('evoting_current_user');
    this.router.navigate(['/']);
  }
}