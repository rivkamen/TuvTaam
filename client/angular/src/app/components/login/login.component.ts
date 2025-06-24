import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router';
//import { AdminService } from '../../services/admin.service';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,ButtonModule,CardModule,InputTextModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  #authService = inject(AuthService);
  //#adminService = inject(AdminService)
  #router = inject(Router);
  passwordFormControl = new FormControl('');
  emailFormControl = new FormControl('');
  usernameFormControl = new FormControl('');

  password: string = ""
  email: string = ""
  username: string = ""
  role: string = ""
  login(): void {
    if (this.emailFormControl.invalid || this.passwordFormControl.invalid) {
      alert("יש למלא את כל השדות כראוי");
      return;
    }

    const email = this.emailFormControl.value ?? '';
    const password = this.passwordFormControl.value ?? '';

    this.#authService.login(email, password).subscribe({
      next: (res: any) => {
        if (res?.token) {
          sessionStorage.setItem('token', res.token);
          sessionStorage.setItem('role', res.role);
          this.role = res.role;
          if (this.role === 'admin') {
            alert("מנהל נכנס בהצלחה");
            this.#router.navigateByUrl('/');
          } if (this.role === 'user') {
            alert("התחברות משתמש הצליחה");
            const username = res.username || email;
            setTimeout(() => {
              this.#router.navigate(['/']);
            }, 100);
          }
        } else {
          alert("שגיאה בהתחברות");
        }
      },
      error: (err) => {
        console.error("שגיאה בהתחברות", err);
        alert("שגיאה בהתחברות");
      }
    });
  }
 loginWithGoogle(): void {
  this.#authService.loginWithGoogle();
}


}


