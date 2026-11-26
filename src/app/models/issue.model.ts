export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export type AdminDecision =
  | 'PENDING'
  | 'SENT_TO_MAINTENANCE'
  | 'TEMPORARILY_DISABLED'
  | 'KEEP_AVAILABLE';

export interface IssueReport {
  id: string;
  equipmentId: string;
  rentalId: string | null;
  reportedByUserId: string;
  reportedAt: string;
  description: string;
  photoUrl: string;
  status: IssueStatus;
  adminDecision: AdminDecision;
  adminNote: string;
  resolvedAt: string | null;
}
