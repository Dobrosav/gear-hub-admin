import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EquipmentStatus } from '../../models/equipment.model';
import { AdminDecision, IssueReport } from '../../models/issue.model';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './issue-detail.component.html',
  styleUrl: './issue-detail.component.css',
})
export class IssueDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);

  issue: IssueReport | undefined;
  equipmentName = '';
  inventoryCode = '';
  reporterFullName = '';
  reporterEmail = '';
  reportedAtText = '';
  photoFileName = '';
  issuePhotoSrc = '';

  // Izabrana odluka administratora vezana za radio dugmad preko [(ngModel)]
  selectedDecision: AdminDecision = 'SENT_TO_MAINTENANCE';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    const found = this.dataService.getIssueById(id);
    if (!found) {
      return;
    }

    this.issue = found;
    if (found.adminDecision !== 'PENDING') {
      this.selectedDecision = found.adminDecision;
    }

    const eq = this.dataService.getEquipmentById(found.equipmentId);
    const reporter = this.dataService.getUserById(found.reportedByUserId);

    this.equipmentName = eq ? eq.name : found.equipmentId;
    this.inventoryCode = eq ? eq.inventoryCode : '—';
    this.reporterFullName = reporter
      ? `${reporter.firstName} ${reporter.lastName}`
      : found.reportedByUserId;
    this.reporterEmail = reporter ? reporter.email : '—';
    this.reportedAtText = this.formatDateTime(found.reportedAt);

    const parts = found.photoUrl.split('/');
    this.photoFileName = parts[parts.length - 1] ?? found.photoUrl;
    this.issuePhotoSrc = this.dataService.resolvePhotoUrl(found.photoUrl);
  }

  onConfirmDecision(): void {
    // =========================================================================
    // OVDE TI PIŠEŠ KOD ZA OBRADU PRIJAVE I AŽURIRANJE STATUSA OPREME:
    // 1. Na osnovu `this.selectedDecision` odredi novi status opreme:
    //    - 'SENT_TO_MAINTENANCE'  -> 'MAINTENANCE'
    //    - 'TEMPORARILY_DISABLED' -> 'DISABLED'
    //    - 'KEEP_AVAILABLE'       -> 'AVAILABLE'
    // 2. Pozovi:
    //    this.dataService.resolveIssue(this.issue!.id, this.selectedDecision, newEquipmentStatus);
    // 3. Preusmeri nazad na listu prijava (ili katalog opreme):
    //    this.router.navigate(['/issues']);
    // =========================================================================
    if (!this.issue) {
      return;
    }

    let newEquipmentStatus: EquipmentStatus = 'AVAILABLE';
    switch (this.selectedDecision) {
      case 'SENT_TO_MAINTENANCE':
        newEquipmentStatus = 'MAINTENANCE';
        break;
      case 'TEMPORARILY_DISABLED':
        newEquipmentStatus = 'DISABLED';
        break;
      case 'KEEP_AVAILABLE':
        newEquipmentStatus = 'AVAILABLE';
        break;
    }

    this.dataService.resolveIssue(this.issue.id, this.selectedDecision, newEquipmentStatus);
    this.router.navigate(['/issues']);
  }

  onCancel(): void {
    // =========================================================================
    // OVDE TI PIŠEŠ KOD ZA OTKAZIVANJE I POVRATAK NA PRIJAVE:
    // =========================================================================
    this.router.navigate(['/issues']);
  }

  private formatDateTime(iso: string): string {
    const d = iso.slice(0, 10).split('-');
    const t = iso.slice(11, 16);
    return d.length === 3 ? `${d[2]}.${d[1]}.${d[0]}. u ${t}` : iso;
  }
}
