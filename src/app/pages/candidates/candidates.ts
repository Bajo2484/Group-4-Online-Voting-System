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

  allCandidates: Candidate[] = [];  // Full list from Firestore
  currentCandidates: Candidate[] = []; // Candidates shown in current page

  // FORM FIELDS
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

  // ORGANIZATIONS & POSITIONS
  courses: string[] = ['ATLAS', 'USG', 'STCM', 'AEMT'];
  positions: string[] = [];
  atlasPositions: string[] = [
    'PRESIDENT','EXTERNAL VICE PRESIDENT','INTERNAL VICE PRESIDENT','GENERAL SECRETARY','ASSOCIATE SECRETARY',
    'AUDITOR','TREASURER','EXTERNAL PRO','INTERNAL PRO','2ND YR GOV','3RD YR GOV','4TH YR GOV'
  ];
  regularPositions: string[] = ['PRESIDENT','VICE PRESIDENT','SECRETARY','TREASURER','AUDITOR','PRO'];

  // SEARCH & PAGINATION
  searchTerm: string = '';
  pageSize: number = 10;
  currentPage: number = 1;

  // SORT OPTIONS: 'dateAsc', 'dateDesc', 'positionAsc', 'positionDesc'
  sortOption: string = 'dateAsc';

  constructor(
    private candidateService: CandidateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.candidateService.getAllCandidates().subscribe(data => {
      // Ensure every candidate has createdAt
      this.allCandidates = data.map(c => ({
        ...c,
        createdAt: c.createdAt || Date.now()
      }));
      this.applySort();
      this.updateCurrentCandidates();
      this.cdr.detectChanges();
    });
  }

  // SEARCH
  filterCandidates() {
    const term = this.searchTerm.toLowerCase().trim();
    this.allCandidates = this.allCandidates.filter(c =>
      c.fullName.toLowerCase().includes(term) ||
      c.position.toLowerCase().includes(term) ||
      c.organization.toLowerCase().includes(term)
    );
    this.currentPage = 1;
    this.updateCurrentCandidates();
  }

  // PAGINATION LOGIC
  totalPages(): number {
    return Math.ceil(this.allCandidates.length / this.pageSize);
  }

  paginatedCandidates(): Candidate[] {
    return this.currentCandidates;
  }

  updateCurrentCandidates() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.currentCandidates = this.allCandidates.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      this.updateCurrentCandidates();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateCurrentCandidates();
    }
  }

  // SORT
  applySort() {
    switch (this.sortOption) {
      case 'dateAsc':
        this.allCandidates.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
        break;
      case 'dateDesc':
        this.allCandidates.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
        break;
      case 'positionAsc':
        this.allCandidates.sort((a, b) => a.position.localeCompare(b.position));
        break;
      case 'positionDesc':
        this.allCandidates.sort((a, b) => b.position.localeCompare(a.position));
        break;
    }
    this.updateCurrentCandidates();
  }

  // MODAL
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
    if (this.course === 'ATLAS') this.positions = [...this.atlasPositions];
    else if (['USG','STCM','AEMT'].includes(this.course)) this.positions = [...this.regularPositions];
    else this.positions = [];
    this.position = '';
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile = input.files[0];
    const reader = new FileReader();
    reader.onload = () => this.photoPreview = reader.result;
    reader.readAsDataURL(this.selectedFile);
  }

  // REGISTER OR UPDATE
  async registerCandidate() {
    if (!this.fullName || !this.position || !this.course) {
      Swal.fire({ icon: 'warning', title: 'Missing Fields', text: 'Please fill all required fields!' });
      return;
    }

    this.electionId = `${this.course.toUpperCase()}2026`;
    const candidate: Candidate = {
      fullName: this.fullName,
      organization: this.course,
      position: this.position,
      partyName: this.partyName,
      platform: this.platform,
      electionId: this.electionId,
      status: 'pending',
      photoUrl: (this.photoPreview as string) || '',
      createdAt: Date.now()
    };

    try {
      if (this.isEditMode && this.editingId) {
        await this.candidateService.updateCandidate(this.editingId, candidate);
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Candidate updated!' });
      } else {
        await this.candidateService.addCandidate(candidate);
        Swal.fire({ icon: 'success', title: 'Registered!', text: 'Candidate added!' });
      }
      this.closeModal();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save candidate.' });
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
    if (result.isConfirmed) await this.candidateService.deleteCandidate(id);
  }

  approveCandidate(c: Candidate) { if (c.id) this.candidateService.approveCandidate(c.id); }
  rejectCandidate(c: Candidate) { if (c.id) this.candidateService.rejectCandidate(c.id); }

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

  getStatusClass(status: string): string {
    return {
      approved: 'status-approved',
      pending: 'status-pending',
      rejected: 'status-rejected'
    }[status] || '';
  }
}