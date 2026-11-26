import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Polja vezana za inpute preko [(ngModel)]
  username = '';
  password = '';

  // Stanje za prikaz crvenog upozorenja i crvenih okvira na inputima (Mock strana 2)
  hasError = false;
  errorMessage =
    'Greška: Neispravno korisničko ime ili lozinka. Proverite akreditive i pokušajte ponovo.';

  onLogin(): void {
    if(this.password==''|| this.username.trim()==''){
      this.hasError=true;
      this.errorMessage='Greška: Polje za lozinku ili korisničko ime ne sme biti prazno.';
    }
    else{
      const admin=this.authService.login(this.username,this.password);
      if(admin){
        this.hasError=false;
        this.router.navigate(['/dashboard']);
      }
      else{
        this.hasError=true;
        this.errorMessage='Greška: Neispravno korisničko ime ili lozinka. Proverite akreditive i pokušajte ponovo.';
      }
    }

    console.log('Kliknuto PRIJAVI SE sa podacima:', {
      username: this.username,
      password: this.password,
      authServiceReady: !!this.authService,
      routerReady: !!this.router,
    });
  }

}
