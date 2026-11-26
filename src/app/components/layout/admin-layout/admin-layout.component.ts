import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly dataService = inject(DataService);

  get currentAdminUsername(): string {
    return this.authService.getCurrentUser()?.username ?? '';
  }

  get openIssuesCount(): number {
    // Broji nerešene prijave problema za bedž u navigaciji (OPEN ili IN_PROGRESS)
    return this.dataService
      .getIssues()
      .filter((issue) => issue.status !== 'RESOLVED').length;
  }

  onLogout(): void {
    this.authService.logout();
  }
}
