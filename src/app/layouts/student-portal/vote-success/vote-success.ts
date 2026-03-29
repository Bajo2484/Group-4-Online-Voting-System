import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-vote-success',
  imports: [],
  templateUrl: './vote-success.html',
  styleUrl: './vote-success.css',
})
export class VoteSuccess {

  constructor(private router: Router) {}

  goDashboard() {
  this.router.navigate(['/student-dashboard']);
}
}
