import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-student-faq',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-faq.html',
  styleUrl: './student-faq.css',
})
export class StudentFaq {

  searchText: string = '';
  activeIndex: number | null = null;
  selectedCategory: string = 'all';

  faqs = [
    {
      category: 'account',
      question: 'How do I log in?',
      answer: 'Enter your student ID and password on the login page.'
    },
    {
      category: 'account',
      question: 'What if I forgot my password?',
      answer: 'Click "Forgot Password" and follow the instructions.'
    },
    {
    category: 'account',
    question: 'Why can’t I log in to my account?',
    answer: 'Make sure your student ID and password are correct. If the issue continues, contact the admin for assistance.'
    },
    {
    category: 'account',
   question: 'How do I change my password?',
    answer: 'Go to your profile or account settings, then click "Change Password". Enter your current password, set a new password, and save the changes.'
    },
    {
    category: 'voting',
    question: 'How do I vote?',
     answer: 'Click the "Vote Now" button on the dashboard, select your candidate, then submit your vote.'
    },
    {
      category: 'voting',
      question: 'Can I change my vote?',
      answer: 'No, votes are final once submitted.'
    },
    {
    category: 'voting',
    question: 'Can I still apply as a candidate if the election has already started?',
    answer: 'No. Once the election has started, candidate applications are closed and will no longer be approved by the admin.'
    },
    {
    category: 'voting',
    question: 'How do I apply as a candidate?',
    answer: 'Go to the sidebar menu and click "Apply as Candidate", then fill out the application form and submit it.'
    },
    {
    category: 'voting',
    question: 'What are the requirements when applying as a candidate?',
    answer: 'After filling out the online Apply as Candidate form, you must submit your TOR, Certificate of Registration (COR), and Good Moral Certificate to the ELECOM. You are also required to complete the face-to-face filing of candidacy for official validation.'
    },
    {
    category: 'voting',
    question: 'Can I vote more than once?',
    answer: 'No. Each student is allowed to vote only once.'
    },
    {
    category: 'voting',
    question: 'Is my vote anonymous?',
    answer: 'Yes. All votes are securely stored and kept confidential.'
    },
    {
    category: 'voting',
    question: 'Is the voting system secure?',
    answer: 'Yes. The system ensures each student can vote only once and all data is securely stored.'
    },
    {
      category: 'results',
      question: 'When will results appear?',
      answer: 'Results will be shown after the election ends.'
    },
    {
      category: 'results',
      question: 'How is the percentage calculated?',
      answer: 'Percentage is based on total votes per candidate.'
    },
    {
    category: 'results',
    question: 'Are the results real-time?',
    answer: 'Yes, results are updated automatically based on submitted votes.'
    }
  ];

  // FILTER LOGIC
  get filteredFaqs() {
    return this.faqs.filter(faq =>
      (this.selectedCategory === 'all' || faq.category === this.selectedCategory) &&
      faq.question.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // ACCORDION TOGGLE
  toggle(index: number) {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

  // CATEGORY FILTER
  filterCategory(category: string) {
    this.selectedCategory = category;
  }

}