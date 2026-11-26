import { inject, Injectable } from '@angular/core';
import usersJson from '../data/users.json';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Ključ za čuvanje ulogovanog korisnika u localStorage-u
  private readonly CURRENT_USER_KEY = 'etf_gear_hub_current_admin';
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);


  /**
   * Pokušaj prijave administratora.
  */
  login(username: string, password: string): User | null {

 
    console.log("User with username:"+username+" tried to login")
    let users: User[] = this.dataService.getUsers();
    const foundUser = users.find(u => u.username === username.trim() && u.password === password && u.role==="ADMIN");
    if (foundUser) {
      console.log("User with username:"+foundUser.username+" logged in successfully")
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(foundUser));
      return foundUser;
    }
    console.log("User with username:"+username+" not found");
    return null;
  }

  /**
   * Odjava administratora sa sistema.
   */
  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.router.navigate(['/login']);
  }

  /**
   * Vraća trenutno prijavljenog administratora.
   * Trenutno vraća podrazumevanog administratora iz users.json da bi zaglavlje
   * i stranica "Moj profil" odmah prikazivali podatke.
   */
  getCurrentUser(): User | null {
    let currentUser=localStorage.getItem(this.CURRENT_USER_KEY);
    if(currentUser){
      return JSON.parse(currentUser);
    }
    return null;
  }

  /**
   * Proverava da li je administrator trenutno prijavljen (korisno za AuthGuard).
   */
  isLoggedIn(): boolean {
    return localStorage.getItem(this.CURRENT_USER_KEY) !== null;
  }
}
