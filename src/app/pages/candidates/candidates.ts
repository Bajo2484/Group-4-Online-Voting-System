import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidateService } from '../../services/candidate.service';
import { Candidate } from '../../services/candidate.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidates.html',
  styleUrls: ['./candidates.css'],
})
export class CandidatesComponent {
studentId: any;
email: any;
registerVoter() {
throw new Error('Method not implemented.');
}

  fullName = '';
  position = '';
  course = ''; // organization
  partyName = '';
  platform = '';
  selectedFile: File | null = null;
  photoPreview: string | ArrayBuffer | null = null;

  editingId: string | null = null;
  isEditMode = false;
  showModal = false;

  // Organizations
  courses: string[] = ['ATLAS', 'USG', 'STCM', 'AEMT'];

  // Dynamic positions
  positions: string[] = [];

  atlasPositions: string[] = [
    'PRESIDENT',
    'EXTERNAL VICE PRESIDENT',
    'INTERNAL VICE PRESIDENT',
    'GENERAL SECRETARY',
    'ASSOCIATE SECRETARY',
    'AUDITOR',
    'TREASURER',
    'EXTERNAL PRO',
    'INTERNAL PRO',
    '2ND GOV',
    '3RD YR GOV',
    '4TH YR GOV'
  ];

  regularPositions: string[] = [
    'President',
    'Vice President',
    'Secretary',
    'Treasurer',
    'Auditor',
    'PRO'
  ];

  constructor(public candidateService: CandidateService) {
    this.candidateService.loadCandidates();
  }

  /** Open modal for new candidate */
  openModal() {
    this.showModal = true;
    this.isEditMode = false;
    this.resetForm();
  }

  /** Close modal */
  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  /** Update positions based on selected course */
  onCourseChange() {
    if (this.course === 'ATLAS') {
      this.positions = [...this.atlasPositions];
    } else if (['USG', 'STCM', 'AEMT'].includes(this.course)) {
      this.positions = [...this.regularPositions];
    } else {
      this.positions = [];
    }
    this.position = '';
  }

  /** Handle photo file selection */
  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.selectedFile = input.files[0];
    const reader = new FileReader();
    reader.onload = () => this.photoPreview = reader.result;
    reader.readAsDataURL(this.selectedFile);
  }

  /** Add or update candidate */
  async registerCandidate() {
    if (!this.fullName || !this.position || !this.course) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill all required fields!',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const id = this.editingId || Date.now().toString();

    const candidate: Candidate = {
      id,
      fullName: this.fullName,
      position: this.position,
      organization: this.course,
      partyName: this.partyName,
      platform: this.platform,
      status: 'pending',
      photoUrl: ''
    };

    try {
      if (this.selectedFile) {
        await this.candidateService.uploadPhoto(
          this.selectedFile,
          this.fullName.replace(/\s+/g, '_')
        );
        candidate.photoUrl = this.selectedFile.name;
      }

      if (this.isEditMode) {
        this.candidateService.updateCandidate(id, candidate);
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Candidate successfully updated!',
          confirmButtonColor: '#28a745'
        });
      } else {
        await this.candidateService.addCandidate(candidate);
        Swal.fire({
          icon: 'success',
          title: 'Registered!',
          text: 'Candidate successfully added!',
          confirmButtonColor: '#28a745'
        });
      }

      this.closeModal();
    } catch (error) {
      console.error('Error saving candidate:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save candidate. Please try again.',
        confirmButtonColor: '#d33'
      });
    }
  }

  /** Edit candidate */
  editCandidate(c: Candidate) {
    this.fullName = c.fullName;
    this.course = c.organization;
    this.onCourseChange();
    this.position = c.position;
    this.partyName = c.partyName || '';
    this.platform = c.platform || '';
    this.editingId = c.id;
    this.isEditMode = true;
    this.photoPreview = c.photoUrl || null;
    this.showModal = true;

    Swal.fire({
      icon: 'info',
      title: 'Edit Mode',
      text: 'You are now editing this candidate.',
      timer: 1500,
      showConfirmButton: false
    });
  }

  /** Delete candidate */
  async deleteCandidate(id: string) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This candidate will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      await this.candidateService.deleteCandidate(id);
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Candidate has been deleted.',
        confirmButtonColor: '#28a745'
      });
    }
  }

  /** Reset form fields */
  resetForm() {
    this.fullName = '';
    this.position = '';
    this.course = '';
    this.partyName = '';
    this.platform = '';
    this.positions = [];
    this.editingId = null;
    this.isEditMode = false;
    this.selectedFile = null;
    this.photoPreview = null;
  }
}