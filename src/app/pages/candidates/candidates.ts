import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { CandidateService } from '../../services/candidate.service';
import { Candidate } from '../../services/candidate.model';
import { Election, ElectionService } from '../../services/election.service';
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

  // ================= LOADING =================
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
    private cdr: ChangeDetectorRef
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
        createdAt: c.createdAt || Date.now()
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

    const filtered = this.allCandidates.filter(c =>
      c.fullName.toLowerCase().includes(term) ||
      c.position.toLowerCase().includes(term) ||
      c.organization.toLowerCase().includes(term)
    );

    this.currentCandidates = filtered.slice(0, this.pageSize);
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
    if (this.sortOption === 'dateAsc') {
      this.allCandidates.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
    } else {
      this.allCandidates.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    }
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
    const file = event.target.files[0];
    if (!file) return;

    this.photoFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  // ================= TOR UPLOAD =================
  uploadTOR(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.torFile) return reject('No TOR file');

      const formData = new FormData();
      formData.append('file', this.torFile);
      formData.append('upload_preset', 'unsigned_upload');

      fetch('https://api.cloudinary.com/v1_1/dmjemocb2/upload', {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (!data.secure_url) reject('Upload failed');
          else resolve(data.secure_url);
        })
        .catch(err => reject(err));
    });
  }

  // ================= SAVE (FIXED) =================
  async registerCandidate() {

    if (!this.fullName || !this.position || !this.course) {
      Swal.fire('Missing Fields', 'Please complete all required fields', 'warning');
      return;
    }

    this.isSaving = true;

    try {
      let torUrl = '';

      // ================= UPLOAD =================
      if (this.torFile) {
        this.isUploading = true;
        torUrl = await this.uploadTOR();
      }

      // ================= DATA =================
      const candidate: Candidate = {
        fullName: this.fullName,
        organization: this.course,
        position: this.position,
        partyName: this.partyName,
        platform: this.platform,
        electionId: this.selectedElectionId,
        status: 'pending',
        photoUrl: this.photoPreview as string || '',
        createdAt: Date.now(),
        torUrl: torUrl
      };

      // ================= SAVE =================
      if (this.isEditMode && this.editingId) {
        await this.candidateService.updateCandidate(this.editingId, candidate);
        Swal.fire('Updated', 'Candidate updated successfully', 'success');
      } else {
        await this.candidateService.addCandidate(candidate);
        Swal.fire('Success', 'Candidate added successfully', 'success');
      }

      this.closeModal();
      this.loadCandidates();

    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Something went wrong', 'error');

    } finally {
      // 🔥 ALWAYS STOP LOADING
      this.isSaving = false;
      this.isUploading = false;
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

  async approveCandidate(c: Candidate) {
    if (!c.id) return;

    await this.candidateService.approveCandidate(c.id);

    await this.notificationService.addNotification({
      studentId: c.studentId,
      target: 'student',
      message: `Approved: ${c.position}`,
      date: new Date(),
      type: 'approved',
      seen: false
    });

    this.loadCandidates();
  }

  async rejectCandidate(c: Candidate) {
    if (!c.id) return;

    await this.candidateService.rejectCandidate(c.id);

    await this.notificationService.addNotification({
      studentId: c.studentId,
      target: 'student',
      message: `Rejected: ${c.position}`,
      date: new Date(),
      type: 'general',
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