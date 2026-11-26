import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';

export interface DashboardActivityRow {
  equipmentLabel: string;
  userName: string;
  timeText: string;
  priceText: string;
  statusLabel: string;
  statusClass: 'status-available' | 'status-rented' | 'status-danger';
  actionLabel: string;
  actionRoute: string[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly dataService = inject(DataService);

  totalEquipmentCount = 0;
  activeRentalsCount = 0;
  maintenanceCount = 0;
  reportedIssuesCount = 0;

  recentRows: DashboardActivityRow[] = [];

  ngOnInit(): void {
    this.loadDashboardPreviewData();
  }

  private loadDashboardPreviewData(): void {
    // =========================================================================
    // OVDE KASNIJE MOŽEŠ DA DORADIŠ LOGIKU ZA STATISTIKU I FILTRIRANJE:
    // Trenutno samo čita početne JSON podatke iz DataService-a kako bi tabela
    // i KPI kartice izgledale kao na mocku (strana 3).
    // =========================================================================
    const equipment = this.dataService.getEquipmentList();
    const rentals = this.dataService.getRentals();
    const issues = this.dataService.getIssues();

    this.totalEquipmentCount = equipment.length;
    this.activeRentalsCount = rentals.filter((r) => r.status === 'ACTIVE').length;
    this.maintenanceCount = equipment.filter((e) => e.status === 'MAINTENANCE').length;
    this.reportedIssuesCount = issues.filter((i) => i.status !== 'RESOLVED').length;

    const rentalRows: DashboardActivityRow[] = rentals.slice(0, 2).map((rental) => {
      const eq = this.dataService.getEquipmentById(rental.equipmentId);
      const user = this.dataService.getUserById(rental.userId);
      const isCompleted = rental.status === 'COMPLETED';
      const startTime = (rental.actualStart ?? rental.reservedStart).slice(11, 16);
      const endTime = rental.actualEnd ? rental.actualEnd.slice(11, 16) : 'u toku';

      return {
        equipmentLabel: eq ? `${eq.name} (${eq.inventoryCode})` : rental.equipmentId,
        userName: user ? `${user.firstName} ${user.lastName}` : rental.userId,
        timeText: `${startTime} – ${endTime}`,
        priceText: rental.totalPrice !== null ? `${rental.totalPrice} RSD` : 'U obračunu',
        statusLabel: isCompleted ? 'VRAĆENO' : 'IZNAJMLJENO',
        statusClass: isCompleted ? 'status-available' : 'status-rented',
        actionLabel: isCompleted ? 'Foto / Detalji' : 'Pregled',
        actionRoute: ['/rentals', rental.id],
      };
    });

    const completedSample = rentals.find((r) => r.status === 'COMPLETED');
    const completedRow: DashboardActivityRow[] = completedSample
      ? [
          (() => {
            const eq = this.dataService.getEquipmentById(completedSample.equipmentId);
            const user = this.dataService.getUserById(completedSample.userId);
            const startTime = (completedSample.actualStart ?? completedSample.reservedStart).slice(11, 16);
            const endTime = completedSample.actualEnd ? completedSample.actualEnd.slice(11, 16) : '—';
            return {
              equipmentLabel: eq ? `${eq.name} (${eq.inventoryCode})` : completedSample.equipmentId,
              userName: user ? `${user.firstName} ${user.lastName}` : completedSample.userId,
              timeText: `${startTime} – ${endTime}`,
              priceText: `${completedSample.totalPrice ?? 0} RSD`,
              statusLabel: 'VRAĆENO',
              statusClass: 'status-available',
              actionLabel: 'Foto / Detalji',
              actionRoute: ['/rentals', completedSample.id],
            };
          })(),
        ]
      : [];

    const issueRows: DashboardActivityRow[] = issues
      .filter((i) => i.status !== 'RESOLVED')
      .slice(0, 1)
      .map((issue) => {
        const eq = this.dataService.getEquipmentById(issue.equipmentId);
        const user = this.dataService.getUserById(issue.reportedByUserId);
        return {
          equipmentLabel: eq ? `${eq.name} (${eq.inventoryCode})` : issue.equipmentId,
          userName: user ? `${user.firstName} ${user.lastName}` : issue.reportedByUserId,
          timeText: 'Prijavljen kvar',
          priceText: '—',
          statusLabel: 'PRIJAVA KVARA',
          statusClass: 'status-danger',
          actionLabel: 'Obradi kvar',
          actionRoute: ['/issues', issue.id],
        };
      });

    this.recentRows = [...completedRow, ...rentalRows, ...issueRows];
  }
}
