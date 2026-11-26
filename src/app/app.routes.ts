import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EquipmentCatalogComponent } from './components/equipment-catalog/equipment-catalog.component';
import { EquipmentCreateComponent } from './components/equipment-create/equipment-create.component';
import { EquipmentEditComponent } from './components/equipment-edit/equipment-edit.component';
import { IssueDetailComponent } from './components/issue-detail/issue-detail.component';
import { IssueListComponent } from './components/issue-list/issue-list.component';
import { AdminLayoutComponent } from './components/layout/admin-layout/admin-layout.component';
import { LoginComponent } from './components/login/login.component';
import { OccupancyCalendarComponent } from './components/occupancy-calendar/occupancy-calendar.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RentalDetailComponent } from './components/rental-detail/rental-detail.component';
import { RentalListComponent } from './components/rental-list/rental-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AdminLayoutComponent,

    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'equipment', component: EquipmentCatalogComponent },
      { path: 'equipment/new', component: EquipmentCreateComponent },
      { path: 'equipment/:id/edit', component: EquipmentEditComponent },
      { path: 'rentals', component: RentalListComponent },
      { path: 'rentals/:id', component: RentalDetailComponent },
      { path: 'calendar', component: OccupancyCalendarComponent },
      { path: 'issues', component: IssueListComponent },
      { path: 'issues/:id', component: IssueDetailComponent },
      { path: 'profile', component: ProfileComponent },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
