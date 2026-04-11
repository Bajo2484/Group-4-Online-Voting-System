// src/app/pages/voters/voters.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef, DOCUMENT } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { StudentAccountService } from '../../services/student-account.service';
import { StudentAccount } from '../../services/student-account.model';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import jsPDF  from 'jspdf';
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
  searchText: string = '';
  filteredStudents: StudentAccount[] = [];
  showModal = false;
  isEditMode = false;
  students: StudentAccount[] = [];
  programs: string[] = ['BSIT', 'BSTCM', 'BSEMT'];
  statuses: string[] = ['UNDERGRADUATE', 'GRADUATE'];
  yearLevels: string[] = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
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

  ngOnInit(): void {
    this.studentService
      .getAll$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((students) => {
        this.students = students;
        this.filterVoters();
        this.countStudentsPerCourse();
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Initialize empty student object */
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

  /** Filter students for search bar */
  filterVoters() {
    const text = this.searchText.toLowerCase();
    this.filteredStudents = this.students.filter(
      s =>
        s.id.toLowerCase().includes(text) ||
        s.name.toLowerCase().includes(text) ||
        s.course.toLowerCase().includes(text)
    );
  }

  /** Modal controls */
  openModal(student?: StudentAccount) {
    if (student) {
      this.isEditMode = true;
      this.newStudent = { ...student };
    } else {
      this.isEditMode = false;
      this.newStudent = this.getEmptyStudent();
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  /** Save student */
  async saveStudent(): Promise<void> {
    if (
      !this.newStudent.id ||
      !this.newStudent.password ||
      !this.newStudent.firstName ||
      !this.newStudent.lastName
    ) {
      Swal.fire(
        'Error',
        'Please fill all required fields (ID, Password, First Name, Last Name).',
        'warning'
      );
      return;
    }

    // Combine full name
    this.newStudent.name = [this.newStudent.firstName, this.newStudent.middleName, this.newStudent.lastName]
      .filter(n => n && n.trim() !== '')
      .join(' ');

    try {
      if (this.isEditMode) {
        await this.studentService.update(this.newStudent);
        Swal.fire('Updated!', 'Voter updated successfully.', 'success');
      } else {
        await this.authService.registerStudent(
          this.newStudent.id,
          this.newStudent.name,
          this.newStudent.password,
          {
            firstName: this.newStudent.firstName,
            middleName: this.newStudent.middleName,
            lastName: this.newStudent.lastName,
            course: this.newStudent.course,
            yearLevel: this.newStudent.yearLevel,
            section: this.newStudent.section,
            gender: this.newStudent.gender,
            status: this.newStudent.status,
            email: this.newStudent.email,
            mobile: this.newStudent.mobile,
          }
        );
        Swal.fire('Created!', 'Voter added to Firebase successfully.', 'success');
      }

      this.closeModal();
    } catch (err: any) {
      Swal.fire('Error', err.message || 'An unexpected error occurred', 'error');
    }
  }

  /** Edit student */
  editStudent(student: StudentAccount) {
    this.openModal(student);
  }

  /** Delete voter from Firebase */
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
          Swal.fire('Deleted!', 'Voter has been removed from Firebase.', 'success');
        } catch (err: any) {
          Swal.fire('Error', err.message || 'Failed to delete voter.', 'error');
        }
      }
    });
  }

    countStudentsPerCourse() {
      this.totalBSIT = this.students.filter(s => s.course === 'BSIT').length;
      this.totalBSTCM = this.students.filter(s => s.course === 'BSTCM').length;
      this.totalBSEMT = this.students.filter(s => s.course === 'BSEMT').length;
    }

   exportStudentsPDF() {
  const doc = new jsPDF();

  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  let startY = 60;

  const drawHeader = () => {
    doc.setFontSize(10);

    doc.addImage('ustp.jpg', 'JPG', 10, 5, 25, 25);
    doc.addImage('elecom-logo.jpg', 'JPG', 170, 5, 25, 25);

    doc.text(
      'University of Science and Technology of Southern Philippines - Villanueva',
      pageWidth / 2,
      10,
      { align: 'center' }
    );

    doc.text('STUDENT VOTER MANAGEMENT REPORT', pageWidth / 2, 16, { align: 'center' });
    doc.text('USTP VILLANUEVA CAMPUS', pageWidth / 2, 22, { align: 'center' });

    doc.line(10, 30, 200, 30);

    doc.setFontSize(14);
    doc.text('ENROLLED STUDENTS REPORT', pageWidth / 2, 38, { align: 'center' });

    doc.line(10, 42, 200, 42);

    doc.setFontSize(10);
    doc.text(`Date Generated: ${new Date().toDateString()}`, 14, 50);
  };

  const checkPage = (space: number) => {
    if (startY + space >= pageHeight - 30) {
      doc.addPage();
      drawHeader(); // IMPORTANT: redraw header
      startY = 60;  // RESET POSITION CLEANLY
    }
  };

  // ================= INITIAL PAGE =================
  drawHeader();
  startY = 60;

  const courses = ['BSIT', 'BSTCM', 'BSEMT'];

  courses.forEach(course => {

    const filtered = this.students
      .filter(s => s.course === course)
      .sort((a, b) =>
        (a.yearLevel || '').localeCompare(b.yearLevel || '')
      );

    if (filtered.length === 0) return;

    checkPage(30);

    doc.setFontSize(12);
    doc.text(`${course} STUDENTS`, pageWidth / 2, startY, { align: 'center' });

    startY += 8;

    autoTable(doc, {
      head: [['Student ID', 'Full Name', 'Year Level', 'Section', 'Status']],
      body: filtered.map(s => [
        s.id,
        s.name,
        s.yearLevel,
        s.section,
        s.status
      ]),
      startY: startY,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [0, 102, 204] },

      pageBreak: 'auto',

      didDrawPage: () => {
        // optional: page number later
      }
    });

    startY = (doc as any).lastAutoTable.finalY + 10;
  });

  // ================= SUMMARY =================
  checkPage(60);

  doc.setFontSize(12);
  doc.text('SUMMARY OF STUDENTS', pageWidth / 2, startY, { align: 'center' });

  startY += 10;

  doc.setFontSize(10);
  doc.text(`BSIT: ${this.totalBSIT}`, 14, startY);
  startY += 6;

  doc.text(`BSTCM: ${this.totalBSTCM}`, 14, startY);
  startY += 6;

  doc.text(`BSEMT: ${this.totalBSEMT}`, 14, startY);
  startY += 10;

  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL STUDENTS: ${this.students.length}`, 14, startY);

  // ================= FOOTER =================
  checkPage(50);

  startY += 20;

  doc.setFont('helvetica', 'normal');
  doc.text('Prepared by:', 14, startY);
  doc.text('_____________________', 14, startY + 5);
  doc.text('Administrator / Election Committee', 14, startY + 10);

  doc.text('Noted by:', 140, startY);
  doc.text('_____________________', 140, startY + 5);
  doc.text('Campus Registrar', 140, startY + 10);

  doc.save('Enrolled_Students_Report.pdf');
}
}