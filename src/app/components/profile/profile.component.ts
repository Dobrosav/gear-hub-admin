import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dataService = inject(DataService);

  userId = '';
  firstName = '';
  lastName = '';
  phone = '';
  email = '';
  currentPassword = '';
  newPassword = '';

  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    const admin = this.authService.getCurrentUser();
    if (!admin) {
      return;
    }
    this.userId = admin.id;
    this.firstName = admin.firstName;
    this.lastName = admin.lastName;
    this.phone = admin.phone;
    this.email = admin.email;
  }

  onSaveProfile(): void {
    // =========================================================================
    // OVDE TI PIŠEŠ KOD ZA IZMENU LIČNIH PODATAKA I LOZINKE:
    // 1. Proveri da li su `firstName`, `lastName`, `phone` i `email` popunjeni.
    //    Ako nisu, postavi `this.errorMessage = '...'` i prekini.
    // 2. Ako je korisnik uneo `this.newPassword`:
    //    - Proveri da li se `this.currentPassword` poklapa sa lozinkom ulogovanog admina.
    //    - Ako se ne poklapa, postavi `this.errorMessage = 'Trenutna lozinka nije ispravna.'`
    //      i prekini izvršavanje.
    // 3. Pozovi `this.dataService.updateAdminProfile(this.userId, { ... })`.
    // 4. Očisti `errorMessage`, postavi `this.successMessage = 'Podaci su uspešno sačuvani.'`
    //    i očisti polja za lozinke (`this.currentPassword = ''`, `this.newPassword = ''`).
    // =========================================================================

    this.errorMessage = '';
    this.successMessage = '';

    if (
      this.firstName.trim() === '' ||
      this.lastName.trim() === '' ||
      this.phone.trim() === '' ||
      this.email.trim() === ''
    ) {
      this.errorMessage = 'Morate uneti sve podatke';
      return;
    }

    if (this.newPassword !== '') {
      const admin = this.authService.getCurrentUser();
      if (!admin || admin.password !== this.currentPassword) {
        this.errorMessage = 'Trenutna lozinka nije ispravna.';
        return;
      }
      if (this.newPassword === admin.password) {
        this.errorMessage = 'Nova lozinka ne sme biti ista kao trenutna lozinka.';
        return;
      }
    }
    this.dataService.updateAdminProfile(this.userId, {
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      email: this.email,
      password: this.newPassword
    })
    

    console.log('Kliknuto SAČUVAJ PROMENE na profilu:', {
      userId: this.userId,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      email: this.email,
      hasNewPassword: this.newPassword.length > 0,
      dataServiceReady: !!this.dataService,
    });
    this.errorMessage="";
    this.currentPassword="";
    this.newPassword="";  
    this.successMessage="Uspesno ste uradili izmenu podataka"
  }

  onLogout(): void {
    this.authService.logout();
  }
}
