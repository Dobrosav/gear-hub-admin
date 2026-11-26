export type EquipmentStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'DISABLED';

export interface Equipment {
  id: string;
  inventoryCode: string;
  name: string;
  type: string;
  description: string;
  hourlyRate: number;
  currency: string;
  status: EquipmentStatus;
  photoUrl: string;
  addedAt: string;
}
