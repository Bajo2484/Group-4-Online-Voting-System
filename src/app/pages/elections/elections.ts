import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElectionService, Election } from '../../services/election.service';

@Component({
  selector: 'app-election',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './elections.html',
  styleUrls: ['./elections.css']
})
export class ElectionComponent {

  showModal = false;

  newElection: Election = {
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    status: 'Upcoming'
  };

  constructor(public electionService: ElectionService) {}

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveElection() {

    if (!this.newElection.name ||
        !this.newElection.startDate ||
        !this.newElection.startTime ||
        !this.newElection.endDate ||
        !this.newElection.endTime) {

      alert("Please fill in all fields.");
      return;
    }

    this.electionService.addElection({ ...this.newElection });

    this.newElection = {
      name: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      status: 'Upcoming'
    };

    this.closeModal();
  }
}
