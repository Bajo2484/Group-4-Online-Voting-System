import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { StudentCacheService } from '../../../services/student-cache.service'; // Import the cache service

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
    private studentCache: StudentCacheService // Inject service
  ) { }

  ngOnInit(): void {
    // First check if student data is cached
    if (this.studentCache.currentStudent) {
      this.student = this.studentCache.currentStudent;
      this.setupElections(); // Use cached data to setup elections
    } else {
      // Listen to auth state to ensure currentUser is ready
      onAuthStateChanged(this.auth, user => {
        if (user) {
          this.loadStudent(user.uid);
        } else {
          console.log('No user logged in!');
          this.router.navigate(['/login']); // optional redirect
        }
      });
    }
  }

  // Fetch student data
  async loadStudent(uid: string) {
    try {
      const ref = doc(this.firestore, `students/${uid}`);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        this.student = snap.data();

        // Ensure votes array exists
        this.student.votes = this.student.votes || [];

        // Trim and uppercase course for safe matching
        this.student.course = this.student.course?.trim().toUpperCase();

        // Cache the student data
        this.studentCache.currentStudent = this.student;

        console.log('Student data:', this.student);

        // Setup elections based on course
        this.setupElections();
      } else {
        console.log('Student document not found!');
      }
    } catch (error) {
      console.error('Error fetching student:', error);
    }
  }

  // Setup elections dynamically
  setupElections() {
    const studentCourse = this.student.course;

    this.elections = Object.keys(this.orgData)
      .filter(key =>
        this.orgData[key].allowedCourses
          .map((c: string) => c.trim().toUpperCase())
          .includes(studentCourse)
      )
      .map(key => ({
        name: this.orgData[key].title || 'Election Logo',
        logo: this.orgData[key].logo || '/default-logo.jpg',
        org: key.toUpperCase(),
        electionId: key.toUpperCase() + '2026',
        voted: this.student.votes.includes(this.orgData[key].title)
      }));

    console.log('Filtered elections:', this.elections.map(e => e.name));
  }

  // Count completed votes
  get completedCount() {
    return this.elections.filter(e => e.voted).length;
  }

  // Progress percentage
  get progressPercentage() {
    return this.elections.length > 0
      ? (this.completedCount / this.elections.length) * 100
      : 0;
  }

  
   goToVote(election: any) {
    this.router.navigate(['/voting', election.org,election.electionId], {
      queryParams:{
        name: election.name
      }
    });
  }

  handleElectionClick(election: any) {
  if (election.voted) {
    // Navigate to view-details page if already voted
    this.router.navigate(['/view-details', election.org, election.electionId], {
      queryParams: { name: election.name }
    });
  } else {
    // Otherwise go to vote page
    this.goToVote(election);
  }
}
}
