import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CandidateService } from '../../services/candidate.service';
import { Candidate } from '../../services/candidate.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidates.html',
  styleUrls: ['./candidates.css']
})
export class CandidatesComponent implements OnInit {

  candidates$: Observable<Candidate[]>; // Firestore Observable
  candidates: Candidate[] = [];

  fullName = '';
  position = '';
  course = '';
  partyName = '';
  platform = '';
  selectedFile: File | null = null;
  photoPreview: string | ArrayBuffer | null = null;

  editingId: string | null = null;
  isEditMode = false;
  showModal = false;

  courses: string[] = ['ATLAS', 'USG', 'STCM', 'AEMT'];
  positions: string[] = [];

  atlasPositions: string[] = [
    'PRESIDENT','EXTERNAL VICE PRESIDENT','INTERNAL VICE PRESIDENT','GENERAL SECRETARY','ASSOCIATE SECRETARY',
    'AUDITOR','TREASURER','EXTERNAL PRO','INTERNAL PRO','2ND GOV','3RD YR GOV','4TH YR GOV'
  ];

  regularPositions: string[] = [
    'President','Vice President','Secretary','Treasurer','Auditor','PRO'
  ];

  constructor(
    public candidateService: CandidateService,
    private cdr: ChangeDetectorRef
  ) {
    this.candidates$ = new Observable<Candidate[]>();
  }

  ngOnInit() {
    // Subscribe to Firestore candidates (real-time updates)
    this.candidates$ = this.candidateService.getCandidates();
    this.candidates$.subscribe(data => {
      this.candidates = data;
      this.cdr.detectChanges();
    });
  }

  openModal() {
    this.showModal = true;
    this.isEditMode = false;
    this.resetForm();
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

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

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.selectedFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => this.photoPreview = reader.result;
    reader.readAsDataURL(this.selectedFile);
  }

  // ✅ Fixed registerCandidate: Firestore-only, no local push
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

    const candidate: Candidate = {
      fullName: this.fullName,
      organization: this.course,
      position: this.position,
      partyName: this.partyName,
      platform: this.platform,
      status: 'pending',
      photoUrl: (this.photoPreview as string) || ''
    };

    try {
      if (this.isEditMode && this.editingId) {
        await this.candidateService.updateCandidate(this.editingId, candidate);
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Candidate updated!', confirmButtonColor: '#28a745' });
      } else {
        await this.candidateService.addCandidate(candidate);
        Swal.fire({ icon: 'success', title: 'Registered!', text: 'Candidate added!', confirmButtonColor: '#28a745' });
      }
      this.closeModal();
    } catch (error) {
      console.error('Error saving candidate:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save candidate.', confirmButtonColor: '#d33' });
    }
  }

  editCandidate(c: Candidate) {
    this.fullName = c.fullName;
    this.course = c.organization;
    this.onCourseChange();
    this.position = c.position;
    this.partyName = c.partyName || '';
    this.platform = c.platform || '';
    this.editingId = c.id || null;
    this.isEditMode = true;
    this.photoPreview = c.photoUrl || null;
    this.showModal = true;
  }

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
    }
  }

  approveCandidate(c: Candidate) {
    if (!c.id) return;
    this.candidateService.approveCandidate(c.id);
  }

  rejectCandidate(c: Candidate) {
    if (!c.id) return;
    this.candidateService.rejectCandidate(c.id);
  }

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