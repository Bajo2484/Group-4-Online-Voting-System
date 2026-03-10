import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
<<<<<<< HEAD

@Component({
  selector: 'app-apply-candidate',
=======
import { CandidateService } from '../../../services/candidate.service';
import { Candidate } from '../../../services/candidate.model';

@Component({
  selector: 'app-student-apply-candidate',
>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-apply-candidate.html',
  styleUrls: ['./student-apply-candidate.css']
})
<<<<<<< HEAD
export class ApplyCandidateComponent {

  // -----------------------------
  // FORM FIELDS
  // -----------------------------
  fullName: string = '';
  organization: string = '';
  position: string = '';
  party: string = '';
  platform: string = '';
  confirm: boolean = false;
  agreeInstructions: boolean = false;

  // PHOTO UPLOAD
  photoPreview: string | ArrayBuffer | null = null;

  // PLATFORM TEXTAREA LIMIT
  maxCharacters: number = 500;

  // -----------------------------
  // ORGANIZATIONS & POSITIONS
  // -----------------------------
  organizations: string[] = ['ATLAS', 'USG', 'STCM', 'AEMT'];

  positionsMap: Record<string, string[]> = {
    ATLAS: [
      'President',
      'Internal Vice President',
      'External Vice President',
      'General Secretary',
      'Associate Secretary',
      'Treasurer',
      'Auditor',
      'PRO Internal',
      'PRO External',
      '2nd Year Governor',
      '3rd Year Governor',
      '4th Year Governor'
    ],
    USG: ['President','Vice President','Secretary','Treasurer','Auditor','PRO'],
    STCM: ['President','Vice President','Secretary','Treasurer','Auditor','PRO'],
    AEMT: ['President','Vice President','Secretary','Treasurer','Auditor','PRO']
  };

  // FILTER POSITIONS BASED ON SELECTED ORGANIZATION
  get filteredPositions(): string[] {
    return this.positionsMap[this.organization] || [];
  }

  onOrganizationChange(): void {
    this.position = ''; // reset position when org changes
  }

  // -----------------------------
  // PHOTO UPLOAD HANDLER
  // -----------------------------
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Only allow JPG or PNG
    if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
      alert('Only JPG or PNG files allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.photoPreview = reader.result;
    reader.readAsDataURL(file);
  }

  // -----------------------------
  // SUBMIT APPLICATION
  // -----------------------------
  submitApplication(): void {

    // Must agree to instructions
    if (!this.agreeInstructions) {
      alert('Please read and agree to the guidelines first.');
      return;
    }

    // Check all required fields
    if (!this.fullName.trim() ||
        !this.organization ||
        !this.position ||
        !this.party.trim() ||
        !this.platform.trim()) {
      alert('Please complete all required fields.');
      return;
    }

    // Must confirm information
    if (!this.confirm) {
      alert('Please confirm that the information is true.');
      return;
    }

    // SUCCESS: Application submitted
    alert('Application Submitted Successfully!');

    // Reset form
    this.resetForm();
  }

  // -----------------------------
  // RESET FORM
  // -----------------------------
  resetForm(): void {
    this.fullName = '';
    this.organization = '';
    this.position = '';
    this.party = '';
    this.platform = '';
    this.confirm = false;
    this.photoPreview = null;
    this.agreeInstructions = false;
  }

}
=======
export class StudentApplyCandidateComponent {
  public get candidateService(): CandidateService {
    return this._candidateService;
  }
  public set candidateService(value: CandidateService) {
    this._candidateService = value;
  }

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

  constructor(private _candidateService: CandidateService) {}

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
>>>>>>> d55779593b30664f3eda9f9eec1350274bf88dd7
