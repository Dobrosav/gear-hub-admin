import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Equipment, EquipmentStatus } from '../../models/equipment.model';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-equipment-catalog',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './equipment-catalog.component.html',
  styleUrl: './equipment-catalog.component.css',
})
export class EquipmentCatalogComponent implements OnInit {
  private readonly dataService = inject(DataService);

  equipmentList: Equipment[] = [];

  ngOnInit(): void {
    this.equipmentList = this.dataService.getEquipmentList();
  }

  getStatusLabel(status: EquipmentStatus): string {
    switch (status) {
      case 'AVAILABLE':
        return 'Dostupno';
      case 'RENTED':
        return 'Iznajmljeno';
      case 'MAINTENANCE':
        return 'Na održavanju';
      case 'DISABLED':
        return 'Isključeno';
    }
  }

  getStatusClass(status: EquipmentStatus): string {
    switch (status) {
      case 'AVAILABLE':
        return 'status-available';
      case 'RENTED':
        return 'status-rented';
      case 'MAINTENANCE':
        return 'status-maintenance';
      case 'DISABLED':
        return 'status-danger';
    }
  }
}
