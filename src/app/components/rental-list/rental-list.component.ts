import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';

export interface RentalRowView {
  id: string;
  userName: string;
  equipmentName: string;
  startText: string;
  endText: string;
  priceText: string;
  statusLabel: string;
  statusClass: string;
  actionLabel: string;
  actionRoute: string[] | null;
}

@Component({
  selector: 'app-rental-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './rental-list.component.html',
  styleUrl: './rental-list.component.css',
})
export class RentalListComponent implements OnInit {
  private readonly dataService = inject(DataService);

  rows: RentalRowView[] = [];

  ngOnInit(): void {
    const rentals = this.dataService.getRentals();
    const issues = this.dataService.getIssues();

    this.rows = rentals.map((rental) => {
      const user = this.dataService.getUserById(rental.userId);
      const eq = this.dataService.getEquipmentById(rental.equipmentId);
      const linkedIssue = issues.find((i) => i.rentalId === rental.id);

      const startIso = rental.actualStart ?? rental.reservedStart;
      const startText = this.formatShortDateTime(startIso);
      const endText = rental.actualEnd
        ? this.formatShortDateTime(rental.actualEnd)
        : rental.status === 'ACTIVE'
          ? 'U toku'
          : this.formatShortDateTime(rental.reservedEnd);

      const priceText =
        rental.totalPrice !== null
          ? `${rental.totalPrice} RSD`
          : rental.status === 'ACTIVE'
            ? 'U obračunu'
            : '—';

      let statusLabel = 'Završeno';
      let statusClass = 'status-available';
      let actionLabel = 'Pregledaj sliku';
      let actionRoute: string[] | null = ['/rentals', rental.id];

      if (linkedIssue) {
        statusLabel = 'Sa prijavom';
        statusClass = 'status-maintenance';
        actionLabel = 'Pregledaj kvar';
        actionRoute = ['/issues', linkedIssue.id];
      } else if (rental.status === 'ACTIVE') {
        statusLabel = 'Aktivno';
        statusClass = 'status-rented';
        actionLabel = 'Čeka vraćanje';
        actionRoute = null;
      } else if (rental.status === 'RESERVED') {
        statusLabel = 'Rezervisano';
        statusClass = 'status-rented';
        actionLabel = 'Čeka preuzimanje';
        actionRoute = null;
      }

      return {
        id: rental.id,
        userName: user ? `${user.firstName} ${user.lastName}` : rental.userId,
        equipmentName: eq ? eq.name : rental.equipmentId,
        startText,
        endText,
        priceText,
        statusLabel,
        statusClass,
        actionLabel,
        actionRoute,
      };
    });
  }

  private formatShortDateTime(iso: string): string {
    // Pretvara '2026-11-26T09:45:00' u '26.11. 09:45'
    const datePart = iso.slice(0, 10).split('-');
    const timePart = iso.slice(11, 16);
    if (datePart.length === 3) {
      return `${datePart[2]}.${datePart[1]}. ${timePart}`;
    }
    return iso;
  }
}
