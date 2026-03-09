import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-apply-candidate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-apply-candidate.html',
  styleUrls: ['./student-apply-candidate.css']
})
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