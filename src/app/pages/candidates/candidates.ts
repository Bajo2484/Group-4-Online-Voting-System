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

  candidates$: Observable<Candidate[]>;
  candidates: Candidate[] = [];

  fullName = '';
  position = '';
  course = '';
  partyName = '';
  platform = '';
  electionId: string = '';

  selectedFile: File | null = null;
  photoPreview: string | ArrayBuffer | null = null;

  editingId: string | null = null;
  isEditMode = false;
  showModal = false;

  courses: string[] = ['ATLAS', 'USG', 'STCM', 'AEMT'];
  positions: string[] = [];

  atlasPositions: string[] = [
    'PRESIDENT','EXTERNAL VICE PRESIDENT','INTERNAL VICE PRESIDENT','GENERAL SECRETARY','ASSOCIATE SECRETARY',
    'AUDITOR','TREASURER','EXTERNAL PRO','INTERNAL PRO','2ND YR GOV','3RD YR GOV','4TH YR GOV'
  ];

  regularPositions: string[] = [
    'PRESIDENT','Vice President','SECRETARY','TREASURER','AUDITOR','PRO'
  ];

  constructor(
    public candidateService: CandidateService,
    private cdr: ChangeDetectorRef
  ) {
    this.candidates$ = new Observable<Candidate[]>();
  }

  ngOnInit() {
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

  async registerCandidate() {

    // ✅ VALIDATION
    if (!this.fullName || !this.position || !this.course) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill all required fields!',
      });
      return;
    }

    // ✅ SAFER electionId generation
    this.electionId = `${this.course.toUpperCase()}2026`;

    console.log('COURSE:', this.course);
    console.log('GENERATED electionId:', this.electionId);

    const candidate: Candidate = {
      fullName: this.fullName,
      organization: this.course,
      position: this.position,
      partyName: this.partyName,
      platform: this.platform,
      electionId: this.electionId,
      status: 'pending',
      photoUrl: (this.photoPreview as string) || ''
    };

    try {
      if (this.isEditMode && this.editingId) {
        await this.candidateService.updateCandidate(this.editingId, candidate);

        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Candidate updated!',
        });

      } else {
        await this.candidateService.addCandidate(candidate);

        Swal.fire({
          icon: 'success',
          title: 'Registered!',
          text: 'Candidate added!',
        });
      }

      this.closeModal();

    } catch (error) {
      console.error('Error saving candidate:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save candidate.'
      });
    }
  }

  editCandidate(c: Candidate) {
    this.fullName = c.fullName;
    this.course = c.organization;

    this.onCourseChange();

    this.position = c.position;
    this.partyName = c.partyName || '';
    this.platform = c.platform || '';

    this.electionId = c.electionId || '';
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
    this.electionId = '';
    this.positions = [];
    this.editingId = null;
    this.isEditMode = false;
    this.selectedFile = null;
    this.photoPreview = null;
  }
}