import { Component, NgZone, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc, collection, getDocs } from '@angular/fire/firestore';
import { StudentCacheService } from '../../../services/student-cache.service';

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
  loading: boolean = true;

  private electionsLoaded = false;
  electionsLoading = true;

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
      this.ngZone.run(async () => {
        this.student = this.studentCache.currentStudent;
        await this.setupElections();
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

  private async loadStudentAndSetup(uid: string) {
    try {
      await this.loadStudent(uid);
    } catch (err) {
      console.error('Error loading student:', err);
      this.ngZone.run(() => { this.loading = false; });
    }
  }

  private async loadStudent(uid: string) {
    const ref = doc(this.firestore, `students/${uid}`);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.warn('Student not found');
      this.ngZone.run(() => { this.loading = false; });
      return;
    }

    this.student = snap.data() as Student;
    this.student.name = this.student.fullName;

    this.student.votes = Array.isArray(this.student.votes) ? this.student.votes : [];
    this.student.course = this.student.course?.trim().toUpperCase() || '';

    this.studentCache.currentStudent = this.student;

    console.log('Student loaded:', this.student);

    await this.setupElections();

    this.ngZone.run(() => {
      this.loading = false;
      this.cd.detectChanges();
    });
  }

  private async setupElections() {

    // ✔ FIX: correct guard placement
    if (!this.student) return;
    if (this.electionsLoaded) return;
    this.electionsLoaded = true;

    const studentCourse = this.student.course;

    try {
      const electionsRef = collection(this.firestore, 'elections');
      const snapshot = await getDocs(electionsRef);

      // ✔ FIX: safer & simpler active check
      const hasActive = snapshot.docs.some(d =>
        d.data()['status']?.toLowerCase() === 'active'
      );

      const filtered = Object.keys(this.orgData)
        .filter(key =>
          this.orgData[key].allowedCourses
            .map((c: string) => c.trim().toUpperCase())
            .includes(studentCourse)
        )
        .map(key => {

          const electionId = key.toUpperCase() + '2026';

          const voted = (this.student?.votes || []).some(
            (v: Vote) =>
              v.electionId.toUpperCase() === electionId &&
              v.isVoted === true
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
        this.elections = hasActive ? filtered : [];
        this.electionsLoading = false;
        this.cd.detectChanges();
      });

      console.log('Visible Elections:', this.elections.map(e => e.name));

    } catch (error) {
      console.error('Error checking elections:', error);

      this.ngZone.run(() => {
        this.elections = [];
        this.electionsLoading = false;
        this.cd.detectChanges();
      });
    }
  }

  // ================= UTILITIES =================

  get completedCount() {
    return this.elections.filter(e => e.isVoted).length;
  }

  get progressPercentage() {
    return this.elections.length > 0
      ? (this.completedCount / this.elections.length) * 100
      : 0;
  }

  get progressColor(): string {
    const p = this.progressPercentage;
    if (p === 100) return 'green';
    if (p >= 50) return 'orange';
    return 'red';
  }

  goToVote(election: any) {
    this.router.navigate(['/voting', election.org, election.electionId], {
      queryParams: { name: election.name }
    });
  }

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