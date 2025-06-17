import { Component, inject } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'; // אם תשתמשי ב-ngModel
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';


@Component({
  selector: 'register-auth',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule,InputTextModule,ButtonModule,CardModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
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

  register(): void {
  if (this.emailFormControl.invalid || this.passwordFormControl.invalid) {
    alert("יש למלא את כל השדות כראוי");
    return;
  }

  const email = this.emailFormControl.value ?? '';
  const password = this.passwordFormControl.value ?? '';
  const username = this.usernameFormControl.value ?? '';
  this.#authService.register(username, email, password).subscribe({
    next: (res: any) => {
      if (res?.token) {
        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('role', res.role);
        alert("הרשמה הצליחה");
        // מעבר אוטומטי לדף הלוגין
        this.#router.navigateByUrl('/login');
      } else {
        alert("שגיאה בהרשמה");
      }
    },
    error: (err) => {
      console.error("שגיאה בהרשמה", err);
      alert(`שגיאה בהרשמה: ${err?.message || 'לא ידוע'}`);
    }
  });
}

}

