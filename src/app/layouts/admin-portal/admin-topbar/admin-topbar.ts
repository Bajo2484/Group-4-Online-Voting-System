import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './admin-topbar.html',
  styleUrls: ['./admin-topbar.css']
})
export class AdminTopbarComponent {

  // ---------- Inputs ----------
  @Input() title: string = 'Admin Panel';
  @Input() subtitle: string = 'Manage elections, voters, and results.';
  @Input() avatarUrl: string = '/admin.jpg';
  @Input() userName: string = 'Admin';
  @Input() unseenCount: number = 0;

  // ---------- Outputs ----------
  @Output() toggleSidebar = new EventEmitter<void>();

  // Profile dropdown state
  isProfileMenuOpen: boolean = false;

  // ---------- Methods ----------
  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout() {
    // Emit event or call auth service directly
    console.log('Logout clicked');
  }

  goToSettings() {
    console.log('Go to Settings');
  }

  notifySidebarToggle() {
    this.toggleSidebar.emit();
  }
}