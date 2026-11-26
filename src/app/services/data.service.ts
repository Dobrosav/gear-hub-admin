import { Injectable } from '@angular/core';
import equipmentJson from '../data/equipment.json';
import issuesJson from '../data/issues.json';
import rentalsJson from '../data/rentals.json';
import usersJson from '../data/users.json';
import { Equipment, EquipmentStatus } from '../models/equipment.model';
import { AdminDecision, IssueReport } from '../models/issue.model';
import { Rental } from '../models/rental.model';
import { User } from '../models/user.model';

export interface NewEquipmentInput {
  name: string;
  type: string;
  hourlyRate: number;
  status: EquipmentStatus;
  description?: string;
  photoUrl?: string;
  inventoryCode?: string;
  currency?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly STORAGE_KEYS = {
    equipment: 'etf_gear_hub_equipment',
    users: 'etf_gear_hub_users',
    rentals: 'etf_gear_hub_rentals',
    issues: 'etf_gear_hub_issues',
  };

  private readonly CURRENT_ADMIN_KEY = 'etf_gear_hub_current_admin';

  private equipmentList: Equipment[] = this.clone(equipmentJson as Equipment[]);
  private usersList: User[] = this.clone(usersJson as User[]);
  private rentalsList: Rental[] = this.clone(rentalsJson as Rental[]);
  private issuesList: IssueReport[] = this.clone(issuesJson as IssueReport[]);

  constructor() {
    this.initStorage();
  }

  /**
   * Inicijalizacija lokalnog skladišta (localStorage) pri pokretanju aplikacije.
   */
  initStorage(): void {
    if (!this.isBrowserStorageAvailable()) {
      return;
    }

    this.equipmentList = this.seedOrReadCollection<Equipment[]>(
      this.STORAGE_KEYS.equipment,
      equipmentJson as Equipment[],
    );
    this.usersList = this.seedOrReadCollection<User[]>(
      this.STORAGE_KEYS.users,
      usersJson as User[],
    );
    this.rentalsList = this.seedOrReadCollection<Rental[]>(
      this.STORAGE_KEYS.rentals,
      rentalsJson as Rental[],
    );
    this.issuesList = this.seedOrReadCollection<IssueReport[]>(
      this.STORAGE_KEYS.issues,
      issuesJson as IssueReport[],
    );
  }

  /**
   * Briše lokalno sačuvane izmene i vraća sve podatke na početno stanje iz JSON fajlova.
   */
  resetToDefaults(): void {
    if (this.isBrowserStorageAvailable()) {
      localStorage.removeItem(this.STORAGE_KEYS.equipment);
      localStorage.removeItem(this.STORAGE_KEYS.users);
      localStorage.removeItem(this.STORAGE_KEYS.rentals);
      localStorage.removeItem(this.STORAGE_KEYS.issues);
    }

    this.equipmentList = this.clone(equipmentJson as Equipment[]);
    this.usersList = this.clone(usersJson as User[]);
    this.rentalsList = this.clone(rentalsJson as Rental[]);
    this.issuesList = this.clone(issuesJson as IssueReport[]);
    this.initStorage();
  }

  // ---------- Metode za čitanje podataka ----------

  getEquipmentList(): Equipment[] {
    this.equipmentList = this.readFromStorage<Equipment[]>(
      this.STORAGE_KEYS.equipment,
      this.equipmentList,
    );
    return this.equipmentList;
  }

  getEquipmentById(id: string): Equipment | undefined {
    return this.getEquipmentList().find((item) => item.id === id);
  }

  getUsers(): User[] {
    this.usersList = this.readFromStorage<User[]>(this.STORAGE_KEYS.users, this.usersList);
    return this.usersList;
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find((user) => user.id === id);
  }

  getRentals(): Rental[] {
    this.rentalsList = this.readFromStorage<Rental[]>(
      this.STORAGE_KEYS.rentals,
      this.rentalsList,
    );
    return this.rentalsList;
  }

  getRentalById(id: string): Rental | undefined {
    return this.getRentals().find((rental) => rental.id === id);
  }

  getIssues(): IssueReport[] {
    this.issuesList = this.readFromStorage<IssueReport[]>(
      this.STORAGE_KEYS.issues,
      this.issuesList,
    );
    return this.issuesList;
  }

  getIssueById(id: string): IssueReport | undefined {
    return this.getIssues().find((issue) => issue.id === id);
  }

  // ---------- Metode za izmene i perzistenciju ----------

  addEquipment(newItem: NewEquipmentInput): Equipment {
    const currentList = this.getEquipmentList();
    const id = this.generateNextEquipmentId(currentList);
    const inventoryCode =
      newItem.inventoryCode?.trim() || this.generateInventoryCode(newItem.type, currentList);

    const created: Equipment = {
      id,
      inventoryCode,
      name: newItem.name.trim(),
      type: newItem.type,
      description: newItem.description?.trim() ?? '',
      hourlyRate: newItem.hourlyRate,
      currency: newItem.currency ?? 'RSD',
      status: newItem.status,
      photoUrl: newItem.photoUrl?.trim() || 'assets/images/equipment/default.jpg',
      addedAt: new Date().toISOString(),
    };

    this.equipmentList = [...currentList, created];
    this.writeToStorage(this.STORAGE_KEYS.equipment, this.equipmentList);
    return created;
  }

  updateEquipment(id: string, changes: Partial<Equipment>): Equipment | null {
    const currentList = this.getEquipmentList();
    const index = currentList.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }

    const updated: Equipment = {
      ...currentList[index],
      ...changes,
      id: currentList[index].id,
    };

    this.equipmentList = currentList.map((item, idx) => (idx === index ? updated : item));
    this.writeToStorage(this.STORAGE_KEYS.equipment, this.equipmentList);
    return updated;
  }

  confirmRentalReturn(rentalId: string): Rental | null {
    const rentals = this.getRentals();
    const index = rentals.findIndex((r) => r.id === rentalId);
    if (index === -1) {
      return null;
    }

    const existing = rentals[index];
    const actualEnd = existing.actualEnd ?? new Date().toISOString();
    const startIso = existing.actualStart ?? existing.reservedStart;
    const totalPrice =
      existing.totalPrice !== null
        ? existing.totalPrice
        : this.calculateRentalPrice(startIso, actualEnd, existing.hourlyRate);

    const updatedRental: Rental = {
      ...existing,
      status: 'COMPLETED',
      actualEnd,
      totalPrice,
    };

    this.rentalsList = rentals.map((r, idx) => (idx === index ? updatedRental : r));
    this.writeToStorage(this.STORAGE_KEYS.rentals, this.rentalsList);

    const hasOtherActiveRental = this.rentalsList.some(
      (r) => r.id !== rentalId && r.equipmentId === existing.equipmentId && r.status === 'ACTIVE',
    );
    if (!hasOtherActiveRental) {
      this.updateEquipment(existing.equipmentId, { status: 'AVAILABLE' });
    }

    return updatedRental;
  }

  sendEquipmentToMaintenance(equipmentId: string): Equipment | null {
    return this.updateEquipment(equipmentId, { status: 'MAINTENANCE' });
  }

  resolveIssue(
    issueId: string,
    decision: AdminDecision,
    newEquipmentStatus?: EquipmentStatus,
    adminNote?: string,
  ): IssueReport | null {
    const issues = this.getIssues();
    const index = issues.findIndex((issue) => issue.id === issueId);
    if (index === -1) {
      return null;
    }

    const existing = issues[index];
    const targetEquipmentStatus = newEquipmentStatus ?? this.mapDecisionToEquipmentStatus(decision);
    const nextIssueStatus = decision === 'SENT_TO_MAINTENANCE' ? 'IN_PROGRESS' : 'RESOLVED';

    const updatedIssue: IssueReport = {
      ...existing,
      adminDecision: decision,
      status: nextIssueStatus,
      adminNote: adminNote !== undefined ? adminNote : existing.adminNote,
      resolvedAt: nextIssueStatus === 'RESOLVED' ? new Date().toISOString() : null,
    };

    this.issuesList = issues.map((issue, idx) => (idx === index ? updatedIssue : issue));
    this.writeToStorage(this.STORAGE_KEYS.issues, this.issuesList);

    this.updateEquipment(existing.equipmentId, { status: targetEquipmentStatus });
    return updatedIssue;
  }

  updateAdminProfile(userId: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex((user) => user.id === userId);
    if (index === -1) {
      return null;
    }

    const existing = users[index];
    const nextPassword =
      updates.password && updates.password.trim().length > 0 ? updates.password : existing.password;

    const updatedUser: User = {
      ...existing,
      ...updates,
      id: existing.id,
      password: nextPassword,
    };

    this.usersList = users.map((user, idx) => (idx === index ? updatedUser : user));
    this.writeToStorage(this.STORAGE_KEYS.users, this.usersList);

    this.syncCurrentAdminSessionIfMatching(updatedUser);
    return updatedUser;
  }

  // ---------- Pomoćne metode za localStorage i generisanje ----------

  private isBrowserStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private seedOrReadCollection<T>(key: string, initialData: T): T {
    if (!this.isBrowserStorageAvailable()) {
      return this.clone(initialData);
    }

    const existingRaw = localStorage.getItem(key);
    if (existingRaw === null) {
      const cloned = this.clone(initialData);
      this.writeToStorage(key, cloned);
      return cloned;
    }

    return this.readFromStorage<T>(key, initialData);
  }

  private readFromStorage<T>(key: string, fallback: T): T {
    if (!this.isBrowserStorageAvailable()) {
      return fallback;
    }

    const raw = localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return this.clone(fallback);
    }
  }

  private writeToStorage<T>(key: string, value: T): void {
    if (!this.isBrowserStorageAvailable()) {
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }

  private generateNextEquipmentId(list: Equipment[]): string {
    const maxNum = list.reduce((max, item) => {
      const match = /^eq-(\d+)$/.exec(item.id);
      if (!match) {
        return max;
      }
      const num = Number.parseInt(match[1], 10);
      return Number.isNaN(num) ? max : Math.max(max, num);
    }, 0);

    return `eq-${String(maxNum + 1).padStart(3, '0')}`;
  }

  private generateInventoryCode(type: string, list: Equipment[]): string {
    const prefixMap: Record<string, string> = {
      Kamera: 'CAM',
      Mikrofon: 'MIC',
      'Audio oprema': 'AUD',
      Laptop: 'LAP',
      Projektor: 'PRJ',
      'Dodatna oprema': 'ACC',
    };

    const prefix = prefixMap[type] ?? 'OPR';
    const maxForPrefix = list.reduce((max, item) => {
      const match = new RegExp(`^${prefix}-(\\d+)$`).exec(item.inventoryCode);
      if (!match) {
        return max;
      }
      const num = Number.parseInt(match[1], 10);
      return Number.isNaN(num) ? max : Math.max(max, num);
    }, 0);

    return `${prefix}-${String(maxForPrefix + 1).padStart(3, '0')}`;
  }

  private calculateRentalPrice(startIso: string, endIso: string, hourlyRate: number): number {
    const startMs = Date.parse(startIso);
    const endMs = Date.parse(endIso);
    if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
      return hourlyRate;
    }
    const hours = Math.max(1, Math.ceil((endMs - startMs) / 3600000));
    return hours * hourlyRate;
  }

  private mapDecisionToEquipmentStatus(decision: AdminDecision): EquipmentStatus {
    switch (decision) {
      case 'SENT_TO_MAINTENANCE':
        return 'MAINTENANCE';
      case 'TEMPORARILY_DISABLED':
        return 'DISABLED';
      case 'KEEP_AVAILABLE':
      case 'PENDING':
        return 'AVAILABLE';
    }
  }

  private syncCurrentAdminSessionIfMatching(updatedUser: User): void {
    if (!this.isBrowserStorageAvailable()) {
      return;
    }
    const raw = localStorage.getItem(this.CURRENT_ADMIN_KEY);
    if (!raw) {
      return;
    }
    try {
      const currentAdmin = JSON.parse(raw) as User;
      if (currentAdmin.id === updatedUser.id) {
        localStorage.setItem(this.CURRENT_ADMIN_KEY, JSON.stringify(updatedUser));
      }
    } catch {
      // Zanemari neispravan zapis sesije
    }
  }
}
