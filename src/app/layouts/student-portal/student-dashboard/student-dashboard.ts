import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { StudentCacheService } from '../../../services/student-cache.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css']
})
export class StudentDashboardComponent implements OnInit {

  student: any = null;
  elections: any[] = [];
  loading: boolean = true; // show loader while fetching data

  // Hardcoded organization data
  orgData: any = {
    USG: { logo: '/usg.jpg', title: 'USG Election', allowedCourses: ['BSIT','BSEMT','BSTCM'] },
    ATLAS: { logo: '/atlas.jpg', title: 'ATLAS Election', allowedCourses: ['BSIT'] },
    AEMT: { logo: '/aemt.jpg', title: 'AEMT Election', allowedCourses: ['BSEMT'] },
    STCM: { logo: '/stcm.jpg', title: 'STCM Election', allowedCourses: ['BSTCM'] }
  };

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private studentCache: StudentCacheService
  ) {}

  ngOnInit(): void {
    const currentUser = this.auth.currentUser;

    if (this.studentCache.currentStudent) {
      // Cached student -> display immediately
      this.student = this.studentCache.currentStudent;
      this.setupElections();
      this.loading = false;
    } else if (currentUser) {
      // Load student if logged in
      this.loadStudentAndSetup(currentUser.uid);
    } else {
      // Listen for auth state changes
      onAuthStateChanged(this.auth, user => {
        if (user) {
          this.loadStudentAndSetup(user.uid);
        } else {
          this.router.navigate(['/login']);
        }
      });
    }
  }

  /** Helper: load student + setup elections + manage spinner */
  private async loadStudentAndSetup(uid: string) {
    this.loading = true;
    try {
      await this.loadStudent(uid);
    } catch (err) {
      console.error('Error loading student:', err);
    } finally {
      this.loading = false;
    }
  }

  /** Load student from Firestore */
  private async loadStudent(uid: string) {
    const ref = doc(this.firestore, `students/${uid}`);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      this.student = snap.data();
      // Ensure votes array exists
      this.student.votes = Array.isArray(this.student.votes) ? this.student.votes : [];
      // Normalize course
      this.student.course = this.student.course?.trim().toUpperCase();
      // Cache the student
      this.studentCache.currentStudent = this.student;

      console.log('Student data loaded:', this.student);

      // Setup elections dynamically
      this.setupElections();
    } else {
      console.warn('Student document not found!');
    }
  }

  /** Setup elections dynamically and mark voted ones */
  private setupElections() {
    const studentCourse = this.student.course;

    this.elections = Object.keys(this.orgData)
      .filter(key =>
        this.orgData[key].allowedCourses
          .map((c: string) => c.trim().toUpperCase())
          .includes(studentCourse)
      )
      .map(key => {
        const electionId = key.toUpperCase() + '2026';
        const voted = this.student.votes.some(
          (v: any) => v.electionId.toUpperCase() === electionId && v.isVoted === true
        );

        return {
          name: this.orgData[key].title,
          logo: this.orgData[key].logo,
          org: key.toUpperCase(),
          electionId: electionId,
          isVoted: voted
        };
      });

    console.log('Filtered elections:', this.elections.map(e => e.name));
  }

  // Count completed votes
  get completedCount() {
    return this.elections.filter(e => e.isVoted).length;
  }

  // Progress percentage
  get progressPercentage() {
    return this.elections.length > 0
      ? (this.completedCount / this.elections.length) * 100
      : 0;
  }

  get progressColor(): string {
    const percent = this.progressPercentage;
    if (percent === 100) return 'green';
    if (percent >= 50) return 'orange';
    return 'red';
  }

  // Navigate to vote page
  goToVote(election: any) {
    this.router.navigate(['/voting', election.org, election.electionId], {
      queryParams: { name: election.name }
    });
  }

  // Handle election card click
  handleElectionClick(election: any) {
    if (election.isVoted) {
      this.router.navigate(['/view-details', election.org, election.electionId], {
        queryParams: { name: election.name }
      });
    } else {
      this.goToVote(election);
    }
  }
}