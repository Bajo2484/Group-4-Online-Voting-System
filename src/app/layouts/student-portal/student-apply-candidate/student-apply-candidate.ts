import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-apply-candidate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-apply-candidate.html',
  styleUrls: ['./student-apply-candidate.css']
})
export class ApplyCandidateComponent {

  constructor(private firestore: Firestore) {}

  // FORM FIELDS
  fullName: string = '';
  organization: string = '';
  position: string = '';
  party: string = '';
  platform: string = '';

  confirm: boolean = false;
  agreeInstructions: boolean = false;

  // IMAGE
  photoPreview: string | ArrayBuffer | null = null;

  // SETTINGS
  maxCharacters: number = 500;

  // ORGANIZATIONS
  organizations: string[] = ['ATLAS', 'USG', 'STCM', 'AEMT'];

  // POSITIONS
  regularPositions: string[] = [
    'President',
    'Vice President',
    'Secretary',
    'Treasurer',
    'Auditor',
    'PRO'
  ];

  atlasPositions: string[] = [
    'PRESIDENT',
    'INTERNAL VICE PRESIDENT',
    'EXTERNAL VICE PRESIDENT',
    'GENERAL SECRETARY',
    'ASSOCIATE SECRETARY',
    'TREASURER',
    'AUDITOR',
    'INTERNAL PRO',
    'EXTERNAL PRO',
    '2ND YR GOV',
    '3RD YR GOV',
    '4TH YR GOV'
  ];

  // GET POSITIONS BASED ON ORGANIZATION
  get filteredPositions(): string[] {
    if (this.organization === 'ATLAS') {
      return this.atlasPositions;
    }
    return this.regularPositions;
  }

  // RESET POSITION WHEN ORGANIZATION CHANGES
  onOrganizationChange(): void {
    this.position = '';
  }

  // IMAGE UPLOAD
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
      alert('Only JPG or PNG files allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  // SUBMIT APPLICATION
  async submitApplication(): Promise<void> {

    // VALIDATIONS
    if (!this.agreeInstructions) {
      alert('Please agree to the guidelines.');
      return;
    }

    if (
      !this.fullName.trim() ||
      !this.organization ||
      !this.position ||
      !this.party.trim() ||
      !this.platform.trim()
    ) {
      alert('Please complete all fields.');
      return;
    }

    if (!this.confirm) {
      alert('Please confirm your information.');
      return;
    }

    try {
      await addDoc(collection(this.firestore, 'candidates'), {
        fullName: this.fullName.trim(),
        organization: this.organization,
        position: this.position,
        partyName: this.party.trim(),
        platform: this.platform.trim(),
        photoUrl: this.photoPreview || null,

        // IMPORTANT FIELDS
        electionId: `${this.organization}2026`,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      alert('Application Submitted Successfully!');
      this.resetForm();

    } catch (error) {
      console.error(error);
      alert('Error submitting application.');
    }
  }

  // RESET FORM
  resetForm(): void {
    this.fullName = '';
    this.organization = '';
    this.position = '';
    this.party = '';
    this.platform = '';
    this.confirm = false;
    this.agreeInstructions = false;
    this.photoPreview = null;
  }
}