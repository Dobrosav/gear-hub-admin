import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';

interface CalendarDayColumn {
  label: string;
  dateStr: string; // YYYY-MM-DD
}

interface CalendarSlotLink {
  rentalId: string;
  label: string;
}

interface CalendarCell {
  kind: 'free' | 'booked' | 'maintenance';
  slots: CalendarSlotLink[];
  statusText?: string;
}

interface CalendarRow {
  equipmentId: string;
  equipmentName: string;
  cells: CalendarCell[];
}

@Component({
  selector: 'app-occupancy-calendar',
  standalone: true,
  imports: [],
  templateUrl: './occupancy-calendar.component.html',
  styleUrl: './occupancy-calendar.component.css',
})
export class OccupancyCalendarComponent implements OnInit {
  private readonly dataService = inject(DataService);
  private readonly router = inject(Router);

  // Početna radna nedelja usklađena sa testnim podacima iz rentals.json
  weekDays: CalendarDayColumn[] = [
    { label: 'Ponedeljak 23.11.', dateStr: '2026-11-23' },
    { label: 'Utorak 24.11.', dateStr: '2026-11-24' },
    { label: 'Sreda 25.11.', dateStr: '2026-11-25' },
    { label: 'Četvrtak 26.11.', dateStr: '2026-11-26' },
    { label: 'Petak 27.11.', dateStr: '2026-11-27' },
  ];

  calendarRows: CalendarRow[] = [];

  ngOnInit(): void {
    this.buildCalendarMatrix();
  }

  onReservationClick(rentalId: string): void {
    // =========================================================================
    // OVDE MOŽEŠ DA DORADIŠ ŠTA SE DEŠAVA NA KLIK REZERVACIJE U KALENDARU:
    // Trenutno otvara stranicu sa detaljima tog iznajmljivanja (/rentals/:id).
    // =========================================================================
    this.router.navigate(['/rentals', rentalId]);
  }

  onPreviousWeek(): void {
    // =========================================================================
    // OVDE TI PIŠEŠ KOD ZA PRETHODNU RADNU NEDELJU:
    // Pomeri datume u `this.weekDays` za -7 dana i ponovo pozovi `this.buildCalendarMatrix()`.
    // =========================================================================
    this.shiftWeek(-7);
  }

  onNextWeek(): void {
    // =========================================================================
    // OVDE TI PIŠEŠ KOD ZA SLEDEĆU RADNU NEDELJU:
    // Pomeri datume u `this.weekDays` za +7 dana i ponovo pozovi `this.buildCalendarMatrix()`.
    // =========================================================================
    this.shiftWeek(7);
  }

  private shiftWeek(days: number): void {
    const dayNames = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak'];

    this.weekDays = this.weekDays.map((day, index) => {
      // Podne po lokalnom vremenu da promena letnjeg/zimskog računanja ne pomeri datum
      const date = new Date(`${day.dateStr}T12:00:00`);
      date.setDate(date.getDate() + days);

      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');

      return {
        label: `${dayNames[index]} ${dd}.${mm}.`,
        dateStr: `${yyyy}-${mm}-${dd}`,
      };
    });

    this.buildCalendarMatrix();
  }

  private buildCalendarMatrix(): void {
    const equipmentList = this.dataService.getEquipmentList();
    const rentals = this.dataService.getRentals();

    this.calendarRows = equipmentList.map((eq) => {
      const cells: CalendarCell[] = this.weekDays.map((day) => {
        const dayRentals = rentals.filter(
          (r) => r.equipmentId === eq.id && r.reservedStart.slice(0, 10) === day.dateStr,
        );

        if (dayRentals.length > 0) {
          const slots: CalendarSlotLink[] = dayRentals.map((r) => {
            const user = this.dataService.getUserById(r.userId);
            const startHour = r.reservedStart.slice(11, 13);
            const endHour = r.reservedEnd.slice(11, 13);
            const shortUser = user
              ? `${user.firstName.charAt(0)}. ${user.lastName}`
              : r.userId;
            return {
              rentalId: r.id,
              label: `${startHour}–${endHour}h ${shortUser}`,
            };
          });
          return { kind: 'booked', slots };
        }

        if (eq.status === 'MAINTENANCE' || eq.status === 'DISABLED') {
          return {
            kind: 'maintenance',
            slots: [],
            statusText: eq.status === 'MAINTENANCE' ? 'Na održavanju' : 'Isključeno',
          };
        }

        return { kind: 'free', slots: [] };
      });

      return {
        equipmentId: eq.id,
        equipmentName: eq.name,
        cells,
      };
    });
  }
}
