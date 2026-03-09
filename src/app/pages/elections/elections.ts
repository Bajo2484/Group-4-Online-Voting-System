import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ElectionService, Election } from '../../services/election.service';

@Component({
  selector: 'app-election',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './elections.html',
  styleUrls: ['./elections.css']
})
export class ElectionComponent implements OnInit {

  elections: Election[] = [];
  showModal = false;
  isEditMode = false;
  editingId: string | null = null;

  newElection: Election = {
    title: '',
    startDate: new Date(),
    endDate: new Date(),
    status: 'upcoming',
    candidates: []
  };

  startDateInput: string = '';
  startTimeInput: string = '';
  endDateInput: string = '';
  endTimeInput: string = '';

  constructor(public electionService: ElectionService) {}

  ngOnInit() {
    this.electionService.getElections().subscribe(data => {
      this.elections = data.map(item => ({
        ...item,
        startDate: this.toDate(item.startDate),
        endDate: this.toDate(item.endDate)
      }));

      this.elections.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    });
  }

  /** Convert Firestore field to JS Date safely */
  private toDate(value: any): Date {
    if (!value) return new Date();
    if (value?.toDate) return value.toDate(); // works with AngularFire Timestamps
    return new Date(value);
  }

  openModal(election?: Election) {
    this.showModal = true;
    this.isEditMode = !!election;

    if (election) {
      this.editingId = election.id || null;
      this.newElection = { ...election };
      this.startDateInput = this.formatDate(election.startDate);
      this.startTimeInput = this.formatTime(election.startDate);
      this.endDateInput = this.formatDate(election.endDate);
      this.endTimeInput = this.formatTime(election.endDate);
    } else {
      this.resetForm();
    }
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  async saveElection() {
    if (!this.newElection.title || !this.startDateInput || !this.startTimeInput || !this.endDateInput || !this.endTimeInput) {
      Swal.fire('Missing Fields', 'Please fill in all fields.', 'warning');
      return;
    }

    // Merge date + time into Date objects
    this.newElection.startDate = new Date(`${this.startDateInput}T${this.startTimeInput}`);
    this.newElection.endDate = new Date(`${this.endDateInput}T${this.endTimeInput}`);

    if (!this.newElection.status) this.newElection.status = 'upcoming';

    try {
      if (this.isEditMode && this.editingId) {
        await this.electionService.updateElection(this.editingId, this.newElection);
        Swal.fire('Updated!', 'Election successfully updated.', 'success');
      } else {
        await this.electionService.addElection(this.newElection);
        Swal.fire('Saved!', 'Election successfully added.', 'success');
      }
      this.closeModal();
    } catch (error: any) {
      console.error('Error saving election:', error);
      Swal.fire('Error', 'Failed to save election. Please try again.', 'error');
    }
  }

  editElection(election: Election) {
    this.openModal(election);
  }

  async deleteElection(id: string) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This election will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      await this.electionService.deleteElection(id);
      Swal.fire('Deleted!', 'Election has been deleted.', 'success');
    }
  }

  private resetForm() {
    this.newElection = {
      title: '',
      startDate: new Date(),
      endDate: new Date(),
      status: 'upcoming',
      candidates: []
    };
    this.startDateInput = '';
    this.startTimeInput = '';
    this.endDateInput = '';
    this.endTimeInput = '';
    this.isEditMode = false;
    this.editingId = null;
  }

  private formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  private formatTime(date: Date): string {
    return new Date(date).toTimeString().split(' ')[0].slice(0, 5);
  }
}