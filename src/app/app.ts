import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('e-ballot');
  protected isLoginRoute = false;

  constructor(
    private readonly router: Router,
    public readonly auth: AuthService
  ) {
    this.updateRouteState(this.router.url);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateRouteState(event.urlAfterRedirects);
      }
    });
  }

  private updateRouteState(url: string): void {
    const cleaned = url.split('?')[0];
    this.isLoginRoute = cleaned === '' || cleaned === '/' || cleaned.startsWith('/login');
  }

  logout(): void {
    this.auth.clear();
    this.router.navigateByUrl('/');
  }
}
