import { Component } from '@angular/core';
import { CandidateService } from '../../../services/candidate.service';
import { Candidate } from '../../../services/candidate.model';
import { NotificationService } from '../../../services/notification.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-student-apply-candidate',
  standalone: true,
  templateUrl: './student-apply-candidate.html',
  styleUrls: ['./student-apply-candidate.css'],
  imports: [FormsModule, CommonModule]
})
export class ApplyCandidateComponent {

  isSubmitting = false;

  // FORM FIELDS
  fullName = '';
  organization = '';
  position = '';
  party = '';
  platform = '';
  maxCharacters = 500;

  // PHOTO
  selectedFile: File | null = null;
  photoPreview: string | ArrayBuffer | null = null;

  // CHECKBOXES
  agreeInstructions = false;
  agreeRequirements = false;
  confirm = false;

  // ORGANIZATION & POSITIONS
  organizations: string[] = ['ATLAS','USG','STCM','AEMT'];
  positionsByOrg: {[key: string]: string[]} = {
    'ATLAS': [
      'PRESIDENT','EXTERNAL VICE PRESIDENT','INTERNAL VICE PRESIDENT','GENERAL SECRETARY',
      'ASSOCIATE SECRETARY','AUDITOR','EXTERNAL PRO','INTERNAL PRO',
      '2ND YR GOV','3RD YR GOV','4TH YR GOV'
    ],
    'USG': ['PRESIDENT','VICE PRESIDENT','SECRETARY','TREASURER','AUDITOR','PRO'],
    'STCM': ['PRESIDENT','VICE PRESIDENT','SECRETARY','TREASURER','AUDITOR','PRO'],
    'AEMT': ['PRESIDENT','VICE PRESIDENT','SECRETARY','TREASURER','AUDITOR','PRO']
  };
  filteredPositions: string[] = [];

  constructor(
    private candidateService: CandidateService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  onOrganizationChange() {
    if(this.organization && this.positionsByOrg[this.organization]) {
      this.filteredPositions = this.positionsByOrg[this.organization];
    } else {
      this.filteredPositions = [];
    }
    this.position = '';
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => this.photoPreview = reader.result;
    reader.readAsDataURL(this.selectedFile);
  }

  async submitApplication() {

    const user = this.authService.getCurrentUser();

    if (
      !this.fullName ||
      !this.organization ||
      !this.position ||
      !this.party ||
      !this.platform ||
      !this.photoPreview) {
        
      Swal.fire('Notice','Please acknowledge the guidelines before submitting your application.','warning');
      this.isSubmitting = false;
      return;
    }

    if (!this.fullName || !this.organization || !this.position || !this.party || !this.platform) {
      Swal.fire('Incomplete','Please fill all required fields and upload a photo.','warning');
      this.isSubmitting = false;
      return;
    }

    this.isSubmitting = true;

    const candidate: Candidate = {
      studentId: user?.uid,
      fullName: this.fullName,
      organization: this.organization,
      position: this.position,
      partyName: this.party,
      platform: this.platform,
      photoUrl: this.photoPreview as string,
      status: 'pending',
      createdAt: Date.now()
    };

    try {
      //  Add candidate to Firestore
      await this.candidateService.addCandidate(candidate);

      // Send notification to admin
      await this.notificationService.addNotification({ 
        target: 'admin',
        message: `NEW CANDIDATE APPLICATION: ${this.fullName} applied for ${this.position} under ${this.organization}. Peding ELECOM approval`,
        createdAt: new Date(),
        type: 'request',
        seen: false
      });

      // Show success to student
      Swal.fire('Success','Your application has been submitted for admin approval!','success');
      this.resetForm();
    } catch (err) {
      console.error(err);
      Swal.fire('Error','Something went wrong while submitting.','error');
    }
  }

  resetForm() {
    this.isSubmitting = false;
    this.fullName = '';
    this.organization = '';
    this.position = '';
    this.party = '';
    this.platform = '';
    this.selectedFile = null;
    this.photoPreview = null;
    this.agreeInstructions = false;
    this.confirm = false;
    this.filteredPositions = [];
  }
}