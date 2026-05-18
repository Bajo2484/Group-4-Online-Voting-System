import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '@app/services/auth.service';

import { CandidateService } from '../../services/candidate.service';
import { Candidate } from '../../models/candidate.model';
import { ElectionService } from '../../services/election.service';
import { Election } from '../../models/election.model';
import { Timestamp } from '@angular/fire/firestore';
import { NotificationService } from '@app/services/notification.service';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidates.html',
  styleUrls: ['./candidates.css']
})
export class CandidatesComponent implements OnInit {

  isSaving = false;
  isUploading = false;

  // ================= DATA =================
  allCandidates: Candidate[] = [];
  currentCandidates: Candidate[] = [];
  elections: Election[] = [];
  selectedElectionId = '';

  // ================= FILES =================
  torFile: File | null = null;
  photoFile: File | null = null;
  photoPreview: string | ArrayBuffer | null = null;

  // ================= FORM =================
  fullName = '';
  position = '';
  course = '';
  partyName = '';
  platform = '';

  // ================= MODAL =================
  showModal = false;
  isEditMode = false;
  editingId: string | null = null;

  // ================= FILTER =================
  searchTerm = '';
  pageSize = 10;
  currentPage = 1;
  sortOption = 'dateAsc';

  // ================= OPTIONS =================
  courses: string[] = ['ATLAS', 'USG', 'STCM', 'AEMT'];

  positions: string[] = [];

  atlasPositions = [
    'PRESIDENT','EXTERNAL VICE PRESIDENT','INTERNAL VICE PRESIDENT','GENERAL SECRETARY',
    'ASSOCIATE SECRETARY','AUDITOR','TREASURER','EXTERNAL PRO','INTERNAL PRO',
    '2ND YR GOV','3RD YR GOV','4TH YR GOV'
  ];

  regularPositions = [
    'PRESIDENT','VICE PRESIDENT','SECRETARY','TREASURER','AUDITOR','PRO'
  ];

  constructor(
    private candidateService: CandidateService,
    private electionService: ElectionService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCandidates();
    this.loadElections();
  }

  // ================= LOAD =================
  loadCandidates() {
    this.candidateService.getAllCandidates().subscribe(data => {
      this.allCandidates = data.map(c => ({
        ...c,
        createdAt: c.createdAt ?? Date.now()
      }));

      this.applySort();
      this.updateCurrentCandidates();
      this.cdr.detectChanges();
    });
  }

  loadElections() {
    this.electionService.getElections().subscribe(data => {
      this.elections = data.map(e => ({
        ...e,
        startDate: e.startDate instanceof Timestamp ? e.startDate.toDate() : new Date(e.startDate),
        endDate: e.endDate instanceof Timestamp ? e.endDate.toDate() : new Date(e.endDate),
      }));
    });
  }

  // ================= FILTER =================
  filterCandidates() {
    const term = this.searchTerm.toLowerCase();

    this.currentCandidates = this.allCandidates.filter(c =>
      c.fullName.toLowerCase().includes(term) ||
      c.position.toLowerCase().includes(term) ||
      c.organization.toLowerCase().includes(term)
    ).slice(0, this.pageSize);
  }

  // ================= PAGINATION =================
  paginatedCandidates() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.allCandidates.slice(start, start + this.pageSize);
  }

  totalPages() {
    return Math.ceil(this.allCandidates.length / this.pageSize);
  }

  updateCurrentCandidates() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.currentCandidates = this.allCandidates.slice(start, start + this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  // ================= SORT =================
  applySort() {
    this.allCandidates.sort((a, b) =>
      this.sortOption === 'dateAsc'
        ? (a.createdAt ?? 0) - (b.createdAt ?? 0)
        : (b.createdAt ?? 0) - (a.createdAt ?? 0)
    );
  }

  // ================= MODAL =================
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
    this.positions =
      this.course === 'ATLAS' ? this.atlasPositions : this.regularPositions;
  }

  onPhotoSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.photoFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  // ================= SAVE (STRICT + NO DUPLICATE) =================
 async registerCandidate() {

  const user = this.authService.getCurrentUser();
  const studentId = user?.uid;

  if (!studentId) {
    Swal.fire('Error', 'User not logged in', 'error');
    return;
  }

  const fullName = this.fullName?.trim();
  const position = this.position?.trim();
  const course = this.course?.trim();
  const electionId = this.selectedElectionId?.trim();

  const partyName = this.partyName?.trim();
  const platform = this.platform?.trim();

  // ================= REQUIRED FIELD CHECK =================
  if (!fullName || !position || !course || !electionId) {
    Swal.fire(
      'Missing Fields',
      'Full Name, Position, Course, and Election are required.',
      'warning'
    );
    return;
  }

  // 🔴 NEW: REQUIRED PARTY + PLATFORM
  if (!partyName || !platform) {
    Swal.fire(
      'Missing Information',
      'Party List and Platform are required before submitting.',
      'warning'
    );
    return;
  }

  // ================= DUPLICATE CHECK =================
  const duplicate = this.allCandidates.some(c =>
    c.fullName?.trim().toLowerCase() === fullName.toLowerCase() &&
    c.organization?.trim().toLowerCase() === course.toLowerCase() &&
    c.position?.trim().toLowerCase() === position.toLowerCase() &&
    c.electionId === electionId &&
    (!this.isEditMode || c.id !== this.editingId)
  );

  if (duplicate) {
    Swal.fire(
      'Duplicate Entry',
      'Candidate with same name, organization, and position already exists.',
      'error'
    );
    return;
  }

  this.isSaving = true;

  try {

    const candidate: Candidate = {
      studentId,
      fullName,
      organization: course,
      position,
      partyName,
      platform,
      electionId,
      status: 'pending',
      photoUrl: this.photoPreview ? String(this.photoPreview) : '',
      createdAt: Date.now()
    };

    if (this.isEditMode && this.editingId) {
      await this.candidateService.updateCandidate(this.editingId, candidate);
      Swal.fire('Updated', 'Candidate updated successfully', 'success');
    } else {
      await this.candidateService.addCandidate(candidate);
      Swal.fire('Success', 'Candidate added successfully', 'success');
    }

    this.closeModal();
    this.loadCandidates();

  } catch (err: any) {
    Swal.fire('Error', err?.message || 'Something went wrong', 'error');
  } finally {
    this.isSaving = false;
  }
}

  // ================= ACTIONS =================
  editCandidate(c: Candidate) {
    this.fullName = c.fullName;
    this.course = c.organization;
    this.onCourseChange();
    this.position = c.position;
    this.partyName = c.partyName || '';
    this.platform = c.platform || '';
    this.selectedElectionId = c.electionId || '';

    this.editingId = c.id || null;
    this.isEditMode = true;

    this.photoPreview = c.photoUrl || null;

    this.showModal = true;
  }

  async deleteCandidate(id: string) {
    const res = await Swal.fire({
      title: 'Delete candidate?',
      icon: 'warning',
      showCancelButton: true
    });

    if (res.isConfirmed) {
      await this.candidateService.deleteCandidate(id);
      this.loadCandidates();
    }
  }

  // ================= APPROVE =================
  async approveCandidate(c: Candidate) {
    if (!c.id || !c.studentId) {
      Swal.fire('Error', 'Invalid candidate data', 'error');
      return;
    }

    await this.candidateService.approveCandidate(c.id);

    await this.notificationService.addNotification({
      studentId: c.studentId,
      target: 'student',
      message: `Approved: ${c.position}`,
      createdAt: Date.now(),
      type: 'approved',
      seen: false
    });

    await this.notificationService.addNotification({
      target: 'elecom',
      message: `Approved ${c.fullName}`,
      type: 'approved',
      seen: false
    });

    this.loadCandidates();
  }

  // ================= REJECT =================
  async rejectCandidate(c: Candidate) {
    if (!c.id || !c.studentId) {
      Swal.fire('Error', 'Invalid candidate data', 'error');
      return;
    }

    await this.candidateService.rejectCandidate(c.id);

    await this.notificationService.addNotification({
      studentId: c.studentId,
      target: 'student',
      message: `Rejected: ${c.position}`,
      createdAt: Date.now(),
      type: 'rejected',
      seen: false
    });

    await this.notificationService.addNotification({
      target: 'elecom',
      message: `Rejected ${c.fullName}`,
      type: 'rejected',
      seen: false
    });

    this.loadCandidates();
  }

  // ================= RESET =================
  resetForm() {
    this.fullName = '';
    this.position = '';
    this.course = '';
    this.partyName = '';
    this.platform = '';
    this.selectedElectionId = '';

    this.photoPreview = null;
    this.torFile = null;

    this.isEditMode = false;
    this.editingId = null;
  }

  // ================= STATUS =================
  getStatusClass(status: string) {
    return {
      approved: 'status-approved',
      pending: 'status-pending',
      rejected: 'status-rejected'
    }[status] || '';
  }
}