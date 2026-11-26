import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from './auth.service';
import { DataService } from './data.service';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    TestBed.inject(DataService);
    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('logs in a valid ADMIN user and stores session in localStorage', () => {
    const user = service.login('  admin  ', 'Admin123!');

    expect(user).not.toBeNull();
    expect(user?.username).toBe('admin');
    expect(user?.role).toBe('ADMIN');
    expect(service.isLoggedIn()).toBe(true);
    expect(service.getCurrentUser()?.username).toBe('admin');
  });

  it('rejects login with wrong password', () => {
    const user = service.login('admin', 'PogresnaLozinka');

    expect(user).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getCurrentUser()).toBeNull();
  });

  it('rejects login for non-admin USER accounts', () => {
    const user = service.login('marko.m', 'User123!');

    expect(user).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getCurrentUser()).toBeNull();
  });

  it('returns null from getCurrentUser when no admin is logged in', () => {
    expect(service.getCurrentUser()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('clears session and navigates to /login on logout', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    service.login('admin', 'Admin123!');

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(service.getCurrentUser()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
