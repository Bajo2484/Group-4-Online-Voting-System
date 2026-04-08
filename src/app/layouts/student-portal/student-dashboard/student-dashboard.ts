import { Component, NgZone, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { StudentCacheService } from '../../../services/student-cache.service';

// Optional type safety
interface Vote {
  electionId: string;
  isVoted: boolean;
}

interface Student {
  uid: string;
  fullName: string;
  name?: string;
  course: string;
  votes: Vote[];
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css']
})
export class StudentDashboardComponent implements OnInit {

  student: Student | null = null;
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
    private studentCache: StudentCacheService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const currentUser = this.auth.currentUser;

    if (this.studentCache.currentStudent) {
      // Use cached student
      this.ngZone.run(() => {
        this.student = this.studentCache.currentStudent;
        this.setupElections();
        this.loading = false;
        this.cd.detectChanges();
      });
    } else if (currentUser) {
      this.loadStudentAndSetup(currentUser.uid);
    } else {
      onAuthStateChanged(this.auth, user => {
        if (user) {
          this.loadStudentAndSetup(user.uid);
        } else {
          this.router.navigate(['/login']);
        }
      });
    }
  }

  /** Helper: load student + setup elections */
  private async loadStudentAndSetup(uid: string) {
    try {
      await this.loadStudent(uid);
    } catch (err) {
      console.error('Error loading student:', err);
      this.ngZone.run(() => { this.loading = false; });
    }
  }

  /** Load student from Firestore */
  private async loadStudent(uid: string) {
    const ref = doc(this.firestore, `students/${uid}`);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      this.student = snap.data() as Student;
      this.student.name = this.student.fullName;

      // Normalize data
      this.student.votes = Array.isArray(this.student.votes) ? this.student.votes : [];
      this.student.course = this.student.course?.trim().toUpperCase() || '';
      this.studentCache.currentStudent = this.student;

      console.log('Student data loaded:', this.student);

      // Setup elections
      this.setupElections();

      // Stop spinner after everything is ready
      this.ngZone.run(() => {
        this.loading = false;
        this.cd.detectChanges();
      });

    } else {
      console.warn('Student document not found!');
      this.ngZone.run(() => {
        this.loading = false;
      });
    }
  }

  /** Setup elections dynamically and mark voted ones */
  private setupElections() {
    if (!this.student) return;

    const studentCourse = this.student.course;

    const filtered = Object.keys(this.orgData)
      .filter(key =>
        this.orgData[key].allowedCourses
          .map((c: string) => c.trim().toUpperCase())
          .includes(studentCourse)
      )
      .map(key => {
        const electionId = key.toUpperCase() + '2026';
        const voted = this.student!.votes.some(
          (v: Vote) => v.electionId.toUpperCase() === electionId && v.isVoted === true
        );

        return {
          name: this.orgData[key].title,
          logo: this.orgData[key].logo,
          org: key.toUpperCase(),
          electionId,
          isVoted: voted
        };
      });

    this.ngZone.run(() => {
      this.elections = filtered;
      this.cd.detectChanges();
    });

    console.log('Filtered elections:', filtered.map(e => e.name));
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

  // Progress color indicator
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