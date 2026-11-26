import { TestBed } from '@angular/core/testing';
import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataService);
  });

  it('seeds localStorage with initial JSON collections on startup', () => {
    expect(service.getEquipmentList().length).toBeGreaterThan(0);
    expect(service.getUsers().length).toBeGreaterThan(0);
    expect(service.getRentals().length).toBeGreaterThan(0);
    expect(service.getIssues().length).toBeGreaterThan(0);
    expect(localStorage.getItem('etf_gear_hub_equipment')).toBeTruthy();
  });

  it('adds new equipment with generated id, inventory code, and persists to localStorage', () => {
    const initialCount = service.getEquipmentList().length;

    const created = service.addEquipment({
      name: 'Zoom H6 Handy Recorder',
      type: 'Audio oprema',
      hourlyRate: 250,
      status: 'AVAILABLE',
      description: 'Višekanalni audio snimač',
      photoUrl: 'zoom_h6.jpg',
    });

    expect(created.id).toMatch(/^eq-\d+$/);
    expect(created.inventoryCode).toMatch(/^AUD-\d+$/);
    expect(service.getEquipmentList().length).toBe(initialCount + 1);
    expect(service.getEquipmentById(created.id)?.name).toBe('Zoom H6 Handy Recorder');
  });

  it('updates equipment fields and status', () => {
    const updated = service.updateEquipment('eq-001', {
      hourlyRate: 500,
      status: 'AVAILABLE',
    });

    expect(updated?.hourlyRate).toBe(500);
    expect(service.getEquipmentById('eq-001')?.status).toBe('AVAILABLE');
  });

  it('confirms rental return, completes rental, and makes equipment available', () => {
    const completed = service.confirmRentalReturn('rnt-001');

    expect(completed?.status).toBe('COMPLETED');
    expect(completed?.totalPrice).toBeGreaterThan(0);
    expect(service.getEquipmentById('eq-001')?.status).toBe('AVAILABLE');
  });

  it('sends equipment to maintenance', () => {
    const updated = service.sendEquipmentToMaintenance('eq-002');
    expect(updated?.status).toBe('MAINTENANCE');
  });

  it('resolves issue and updates linked equipment status', () => {
    const resolved = service.resolveIssue('iss-003', 'TEMPORARILY_DISABLED');

    expect(resolved?.status).toBe('RESOLVED');
    expect(resolved?.adminDecision).toBe('TEMPORARILY_DISABLED');
    expect(service.getEquipmentById('eq-002')?.status).toBe('DISABLED');
  });

  it('updates admin profile without overwriting password when omitted', () => {
    const originalPassword = service.getUserById('usr-001')?.password;

    const updated = service.updateAdminProfile('usr-001', {
      firstName: 'Marija Test',
      phone: '+381 11 999 888',
    });

    expect(updated?.firstName).toBe('Marija Test');
    expect(updated?.password).toBe(originalPassword);
  });
});
