import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EquipmentStatus } from '../../models/equipment.model';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-equipment-create',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './equipment-create.component.html',
  styleUrl: './equipment-create.component.css',
})
export class EquipmentCreateComponent {
  private readonly dataService = inject(DataService);
  private readonly router = inject(Router);

  // Polja forme vezana preko [(ngModel)]
  name = '';
  type = 'Mikrofon';
  hourlyRate: number | null = 250;
  status: EquipmentStatus = 'AVAILABLE';
  description = '';
  selectedFileName = '';
  photoDataUrl = '';

  // Stanje za prikaz greške (Mock strana 6)
  hasError = false;
  errorMessage =
    'Nije moguće sačuvati stavku: Popunite sva obavezna polja (Naziv opreme i ispravna Cena po satu).';

  readonly equipmentTypes = [
    'Kamera',
    'Mikrofon',
    'Audio oprema',
    'Laptop',
    'Projektor',
    'Dodatna oprema',
  ];

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
        this.photoDataUrl = reader.result;
      }
    };
    reader.readAsDataURL(file);
  }

  onSaveEquipment(): void {
    if (!this.validateInput()) {
      return;
    }
    this.dataService.addEquipment({
      name: this.name,
      type: this.type,
      hourlyRate: this.hourlyRate!,
      status: this.status,
      description: this.description,
      photoUrl: this.photoDataUrl,
    });

    console.log('Kliknuto SAČUVAJ OPREMU:', {
      name: this.name,
      type: this.type,
      hourlyRate: this.hourlyRate,
      status: this.status,
      description: this.description,
      selectedFileName: this.selectedFileName,
      dataServiceReady: !!this.dataService,
      routerReady: !!this.router,
    });
    this.router.navigate(['/equipment']);
  }

  onCancel(): void {
    this.router.navigate(['/equipment']);
  }

  validateInput(): boolean {
    if (
      this.name.trim().length < 1 ||
      this.hourlyRate === null ||
      this.hourlyRate <= 0 ||
      this.selectedFileName.length < 1
    ) {
      this.hasError = true;
      this.errorMessage =
        'Nije moguće sačuvati stavku: Popunite sva obavezna polja (Naziv opreme, ispravna Cena po satu i Fotografija).';
      return false;
    } else {
      this.hasError = false;
      this.errorMessage = '';
      return true;
    }
  }

}
