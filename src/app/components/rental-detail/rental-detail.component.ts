import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Rental } from '../../models/rental.model';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-rental-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './rental-detail.component.html',
  styleUrl: './rental-detail.component.css',
})
export class RentalDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);

  rental: Rental | undefined;
  equipmentName = '';
  equipmentId = '';
  userFullName = '';
  userPhone = '';
  userEmail = '';
  periodText = '';
  durationText = '';
  finalPriceText = '';
  photoFileName = '';
  returnPhotoSrc = '';
  uploadedAtText = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    const found = this.dataService.getRentalById(id);
    if (!found) {
      return;
    }

    this.rental = found;
    const eq = this.dataService.getEquipmentById(found.equipmentId);
    const user = this.dataService.getUserById(found.userId);

    this.equipmentId = found.equipmentId;
    this.equipmentName = eq ? eq.name : found.equipmentId;
    this.userFullName = user ? `${user.firstName} ${user.lastName}` : found.userId;
    this.userPhone = user ? user.phone : '—';
    this.userEmail = user ? user.email : '—';

    const startIso = found.actualStart ?? found.reservedStart;
    const endIso = found.actualEnd ?? found.reservedEnd;
    this.periodText = `${this.formatFullDate(startIso)} ${startIso.slice(11, 16)} — ${endIso.slice(11, 16)}`;
    this.durationText = this.computeDurationLabel(startIso, endIso);
    this.finalPriceText = found.totalPrice !== null ? `${found.totalPrice} RSD` : 'U obračunu';

    if (found.returnPhotoUrl) {
      const parts = found.returnPhotoUrl.split('/');
      this.photoFileName = parts[parts.length - 1] ?? found.returnPhotoUrl;
      this.returnPhotoSrc = this.dataService.resolvePhotoUrl(found.returnPhotoUrl);
    } else {
      this.photoFileName = 'Nije priložena (iznajmljivanje još traje)';
      this.returnPhotoSrc = '';
    }

    this.uploadedAtText = found.actualEnd
      ? `${this.formatFullDate(found.actualEnd)} u ${found.actualEnd.slice(11, 16)}`
      : '—';
  }

  onConfirmProperCondition(): void {
    // =========================================================================
    // OVDE TI PIŠEŠ KOD ZA POTVRDU UREDNOG STANJA OPREME:
    // 1. Pozovi `this.dataService.confirmRentalReturn(this.rental!.id);`
    // 2. Ako je potrebno, prikaži poruku potvrde i vrati administratora na listu:
    //    this.router.navigate(['/rentals']);
    // =========================================================================
    if (!this.rental) {
      return;
    }
    this.dataService.confirmRentalReturn(this.rental.id);
    this.router.navigate(['/rentals']);
  }

  onSendToMaintenance(): void {
    // =========================================================================
    // OVDE TI PIŠEŠ KOD ZA SLANJE OPREME NA ODRŽAVANJE:
    // 1. Pozovi `this.dataService.sendEquipmentToMaintenance(this.equipmentId);`
    //    da se status opreme promeni u 'MAINTENANCE'.
    // 2. Preusmeri na katalog opreme ili na listu iznajmljivanja:
    //    this.router.navigate(['/equipment']);
    // =========================================================================
    if (!this.equipmentId) {
      return;
    }
    this.dataService.sendEquipmentToMaintenance(this.equipmentId);
    this.router.navigate(['/equipment']);
  }

  private formatFullDate(iso: string): string {
    const d = iso.slice(0, 10).split('-');
    return d.length === 3 ? `${d[2]}.${d[1]}.${d[0]}.` : iso;
  }

  private computeDurationLabel(startIso: string, endIso: string): string {
    const startMs = Date.parse(startIso);
    const endMs = Date.parse(endIso);
    if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) {
      return '—';
    }
    const totalMinutes = Math.round((endMs - startMs) / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }
}
