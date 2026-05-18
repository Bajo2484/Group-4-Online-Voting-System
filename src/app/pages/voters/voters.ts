// src/app/pages/voters/voters.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { StudentAccountService } from '../../services/student-account.service';
import { StudentAccount } from '../../models/student-account.model';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-voters',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './voters.html',
  styleUrls: ['./voters.css'],
})
export class Voters implements OnInit, OnDestroy {

  searchText = '';
  filteredStudents: StudentAccount[] = [];
  showModal = false;
  isEditMode = false;
  isLoading = false;

  students: StudentAccount[] = [];

  programs = ['BSIT', 'BSTCM', 'BSEMT'];
  statuses = ['UNDERGRADUATE', 'GRADUATE'];
  yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  courseOrder = ['BSIT', 'BSTCM', 'BSEMT'];
  yearOrder = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  newStudent: StudentAccount = this.getEmptyStudent();

  totalBSIT = 0;
  totalBSTCM = 0;
  totalBSEMT = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private studentService: StudentAccountService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.studentService.getAll$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(students => {
        this.students = this.sortStudents(students);
        this.filterVoters();
        this.countStudentsPerCourse();
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ================= EMPTY MODEL =================
  getEmptyStudent(): StudentAccount {
    return {
      id: '',
      firstName: '',
      middleName: '',
      lastName: '',
      name: '',
      course: '',
      yearLevel: '',
      section: '',
      password: '',
      hasVoted: false,
      email: '',
      status: '',
      mobile: '',
      gender: '',
    };
  }

  // ================= SORT =================
  sortStudents(students: StudentAccount[]): StudentAccount[] {
    return [...students].sort((a, b) => {
      const courseDiff =
        this.courseOrder.indexOf(a.course) -
        this.courseOrder.indexOf(b.course);

      if (courseDiff !== 0) return courseDiff;

      const yearDiff =
        this.yearOrder.indexOf(a.yearLevel) -
        this.yearOrder.indexOf(b.yearLevel);

      if (yearDiff !== 0) return yearDiff;

      return (a.name || '').localeCompare(b.name || '');
    });
  }

  // ================= FILTER =================
  filterVoters() {
    const text = this.searchText.toLowerCase();

    const filtered = this.students.filter(s =>
      (s.id ?? '').toLowerCase().includes(text) ||
      (s.name ?? '').toLowerCase().includes(text) ||
      (s.course ?? '').toLowerCase().includes(text)
    );

    this.filteredStudents = this.sortStudents(filtered);
  }

  // ================= MODAL =================
  openModal(student?: StudentAccount) {
    this.isEditMode = !!student;
    this.newStudent = student ? { ...student } : this.getEmptyStudent();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  editStudent(student: StudentAccount) {
    this.openModal(student);
  }

  // ================= SAVE (STRICT + FULL VALIDATION) =================
  async saveStudent(): Promise<void> {

    const s = this.newStudent;

    // ================= REQUIRED FIELDS =================
    const requiredFields = [
      s.id,
      s.firstName,
      s.lastName,
      s.password,
      s.course,
      s.yearLevel,
      s.section,
      s.gender,
      s.status,
      s.email,
      s.mobile
    ];

    if (requiredFields.some(f => !f || f.toString().trim() === '')) {
      Swal.fire(
        'Transaction Cancelled',
        'All fields are required except Middle Name.',
        'warning'
      );
      return;
    }

    // ================= DUPLICATE CHECK (NEW RULE) =================
    const newKey = `${(s.firstName || '').trim().toLowerCase()}|${(s.lastName || '').trim().toLowerCase()}|${(s.yearLevel || '').trim().toLowerCase()}|${(s.section || '').trim().toLowerCase()}`;

    const duplicate = this.students.find(st => {
      const existingKey = `${(st.firstName || '').trim().toLowerCase()}|${(st.lastName || '').trim().toLowerCase()}|${(st.yearLevel || '').trim().toLowerCase()}|${(st.section || '').trim().toLowerCase()}`;
      return existingKey === newKey;
    });

    if (!this.isEditMode && duplicate) {
      Swal.fire(
        'Duplicate Student Detected',
        'Same Name + Year Level + Section already exists.',
        'error'
      );
      return;
    }

    this.isLoading = true;

    try {

      // ================= ATOMIC FULL NAME =================
      const fullName = [
        s.firstName,
        s.middleName,
        s.lastName
      ].filter(n => n && n.trim() !== '').join(' ');

      const payload: StudentAccount = {
        ...s,
        name: fullName,
        middleName: s.middleName || ''
      };

      // ================= SAVE =================
      if (this.isEditMode) {
        await this.studentService.update(payload);
        Swal.fire('Updated!', 'Voter updated successfully.', 'success');
      } else {
        await this.authService.registerStudent(
          s.id,
          fullName,
          s.password,
          {
            firstName: s.firstName,
            middleName: s.middleName || '',
            lastName: s.lastName,
            course: s.course,
            yearLevel: s.yearLevel,
            section: s.section,
            gender: s.gender,
            status: s.status,
            email: s.email,
            mobile: s.mobile,
          }
        );

        Swal.fire('Created!', 'Voter added successfully.', 'success');
      }

      this.showModal = false;
      this.newStudent = this.getEmptyStudent();
      this.isEditMode = false;

      this.cdr.detectChanges();

    } catch (err: any) {
      Swal.fire('Error', err.message || 'Failed to save student', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // ================= DELETE =================
  deleteStudent(id: string): void {
    Swal.fire({
      title: 'Delete this voter?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await this.studentService.delete(id);
          Swal.fire('Deleted!', 'Voter removed.', 'success');
        } catch (err: any) {
          Swal.fire('Error', err.message || 'Delete failed.', 'error');
        }
      }
    });
  }

  // ================= COUNTERS =================
  countStudentsPerCourse() {
    this.totalBSIT = this.students.filter(s => s.course === 'BSIT').length;
    this.totalBSTCM = this.students.filter(s => s.course === 'BSTCM').length;
    this.totalBSEMT = this.students.filter(s => s.course === 'BSEMT').length;
  }

  // ================= PDF =================
  exportStudentsPDF() {
    const doc = new jsPDF();

    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    let startY = 60;

    const drawHeader = () => {
      doc.setFontSize(10);

      doc.addImage('ustp.jpg', 'JPG', 10, 5, 25, 25);
      doc.addImage('elecom-logo.jpg', 'JPG', 170, 5, 25, 25);

      doc.text('USTP VOTER REPORT', pageWidth / 2, 10, { align: 'center' });
      doc.text('ENROLLED STUDENTS', pageWidth / 2, 20, { align: 'center' });

      doc.line(10, 30, 200, 30);
    };

    drawHeader();

    const courses = ['BSIT', 'BSTCM', 'BSEMT'];

    courses.forEach(course => {

      const filtered = this.students.filter(s => s.course === course);

      if (!filtered.length) return;

      doc.setFontSize(12);
      doc.text(`${course}`, pageWidth / 2, startY, { align: 'center' });

      startY += 10;

      autoTable(doc, {
        head: [['ID', 'Name', 'Year', 'Section', 'Status']],
        body: filtered.map(s => [
          s.id,
          s.name,
          s.yearLevel,
          s.section,
          s.status
        ]),
        startY,
        theme: 'grid',
        styles: { fontSize: 9 }
      });

      startY = (doc as any).lastAutoTable.finalY + 10;
    });

    doc.save('Enrolled_Students_Report.pdf');
  }
}