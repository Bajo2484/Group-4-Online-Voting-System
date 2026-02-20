import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidateService } from '../../services/candidate.service';
import { Candidate } from '../../services/candidate.model';

@Component({
  selector: 'app-student-apply-candidate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-apply-candidate.html',
  styleUrls: ['./student-apply-candidate.css']
})
export class StudentApplyCandidateComponent {

  candidate: Candidate = {
    id: crypto.randomUUID(),
    fullName: '',
    organization: '',
    position: '',
    partyName: '',
    platform: '',
    photoUrl: '',
    status: 'pending'
  };

  // Temporary File for preview/upload
  photo: File | null = null;
  photoPreview: string | ArrayBuffer | null = null;

 
  organizations: string[] = ['USG', 'ATLAS', 'STCM', 'AEMT'];
  positions: string[] = [];

  atlasPositions: string[] = [
    'PRESIDENT', 'INTERNAL VICE', 'EXTERNAL VICE', 'GENERAL SEC.',
    'ASSOCIATE SEC.', 'TRESURER', 'AUDITOR', 'EXTERNAL PRO',
    'INTERNAL PRO', '2ND GOV.', '3RD GOV.', '4TH YR. GOV'
  ];

  otherPositions: string[] = [
    'PRESIDENT', 'VICE PRESIDENT', 'SECRETARY', 'TRESURER', 'AUDITOR', 'PRO'
  ];

 
  submitted: boolean = false;

  constructor(private candidateService: CandidateService) {}

  updatePositions() {
    if (this.candidate.organization === 'ATLAS') {
      this.positions = [...this.atlasPositions];
    } else if (['USG', 'STCM', 'AEMT'].includes(this.candidate.organization)) {
      this.positions = [...this.otherPositions];
    } else {
      this.positions = [];
    }
    this.candidate.position = '';
  }

  // Handle photo selection
  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.photo = input.files[0];

  
    const reader = new FileReader();
    reader.onload = () => this.photoPreview = reader.result;
    reader.readAsDataURL(this.photo);
  }

  
  async submitApplication() {
    
    if (!this.candidate.fullName || !this.candidate.organization || !this.candidate.position || !this.candidate.platform) {
      alert('Please fill all required fields!');
      return;
    }

    try {
      
      if (this.photo) {
        const photoUrl = await this.candidateService.uploadPhoto(
          this.photo,
          this.candidate.fullName.replace(/\s+/g, '_')
        );
        this.candidate.photoUrl = photoUrl;
      }

      this.submitted = true;

   
      setTimeout(() => {
        this.submitted = false;
        this.candidate = {
          id: crypto.randomUUID(), 
          fullName: '',
          organization: '',
          position: '',
          partyName: '',
          platform: '',
          photoUrl: '',
          status: 'pending'
        };
        this.photo = null;
        this.photoPreview = null;
        this.positions = [];
      }, 5000);

    } catch (error) {
      console.error('Error submitting candidate:', error);
      alert('Failed to submit application. Please try again.');
    }
  }
}
