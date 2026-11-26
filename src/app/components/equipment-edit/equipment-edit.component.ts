import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EquipmentStatus } from '../../models/equipment.model';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-equipment-edit',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './equipment-edit.component.html',
  styleUrl: './equipment-edit.component.css',
})
export class EquipmentEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);

  equipmentId = '';
  inventoryCode = '';

  // Polja vezana za formu preko [(ngModel)]
  name = '';
  type = 'Kamera';
  hourlyRate: number | null = 0;
  status: EquipmentStatus = 'AVAILABLE';
  description = '';
  photoUrl = '';
  selectedFileName = '';

  notFound = false;

  // Stanje za prikaz greške pri čuvanju izmena
  hasError = false;
  errorMessage = '';

  readonly equipmentTypes = [
    'Kamera',
    'Mikrofon',
    'Audio oprema',
    'Laptop',
    'Projektor',
    'Dodatna oprema',
  ];

  get photoPreviewSrc(): string {
    return this.dataService.resolvePhotoUrl(this.photoUrl);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound = true;
      return;
    }

    const equipment = this.dataService.getEquipmentById(id);
    if (!equipment) {
      this.notFound = true;
      return;
    }

    this.equipmentId = equipment.id;
    this.inventoryCode = equipment.inventoryCode;
    this.name = equipment.name;
    this.type = equipment.type;
    this.hourlyRate = equipment.hourlyRate;
    this.status = equipment.status;
    this.description = equipment.description;
    this.photoUrl = equipment.photoUrl;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.selectedFileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.photoUrl = reader.result;
      }
    };
    reader.readAsDataURL(file);
  }

  onSaveChanges(): void {
    // =========================================================================
    // OVDE TI PIŠEŠ KOD ZA ČUVANJE IZMENA POSTOJEĆE OPREME:
    // 1. Proveri da li je `this.name.trim()` neprazno i `this.hourlyRate > 0`.
    // 2. Pozovi:
    //    this.dataService.updateEquipment(this.equipmentId, {
    //      name: this.name.trim(),
    //      type: this.type,
    //      hourlyRate: this.hourlyRate,
    //      status: this.status,
    //      description: this.description.trim(),
    //      photoUrl: this.photoUrl,
    //    });
    // 3. Vrati se na katalog:
    //    this.router.navigate(['/equipment']);
    // =========================================================================
    if (this.name.trim().length < 1 || this.hourlyRate === null || this.hourlyRate <= 0) {
      this.hasError = true;
      this.errorMessage =
        'Nije moguće sačuvati izmene: Naziv opreme je obavezan, a Cena po satu mora biti veća od 0.';
      return;
    }

    this.hasError = false;
    this.errorMessage = '';
    this.dataService.updateEquipment(this.equipmentId, {
      name: this.name.trim(),
      type: this.type,
      hourlyRate: this.hourlyRate,
      status: this.status,
      description: this.description.trim(),
      photoUrl: this.photoUrl,
    });
    this.router.navigate(['/equipment']);
  }

  onCancel(): void {
    // =========================================================================
    // OVDE TI PIŠEŠ KOD ZA OTKAZIVANJE I POVRATAK NA KATALOG:
    // =========================================================================
    this.router.navigate(['/equipment']);
  }
}
