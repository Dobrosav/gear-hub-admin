export type RentalStatus = 'RESERVED' | 'ACTIVE' | 'COMPLETED';

export interface Rental {
  id: string;
  equipmentId: string;
  userId: string;
  reservedStart: string;
  reservedEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  hourlyRate: number;
  totalPrice: number | null;
  status: RentalStatus;
  returnPhotoUrl: string | null;
}
