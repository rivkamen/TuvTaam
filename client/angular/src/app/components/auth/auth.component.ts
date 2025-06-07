import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router';
//import { AdminService } from '../../services/admin.service';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  #authService = inject(AuthService);
  //#adminService = inject(AdminService)
  #router = inject(Router);
  passwordFormControl = new FormControl('');
  emailFormControl = new FormControl('');

  password: string = ""
  email: string = ""
  username: string = ""
  role: string = ""
  // this.#authService.login({
  //   email: this.email,
  //   password: this.password,
  //   isAdmin: this.isAdminChecked
  // }).subscribe({
  //   next: (res) => {
  //     if (res.role === 'admin') {
  //       this.router.navigate(['/admin']);
  //     } else {
  //       this.router.navigate(['/home']);
  //     }
  //   },
  //   error: () => alert('שגיאה בהתחברות')
  // });
  // login() {
  //   if (this.passwordFormControl.valid) {
  //     this.password = this.passwordFormControl.value as string;
  //     this.email = this.emailFormControl.value as string;
  //     let isUser: boolean = false;
  //     this.#adminService.GetAdminInfo().subscribe((response: any) => {
  //       console.log("response", response);
  //       if (response.email == this.email && response.password == this.password) {
  //         this.isAdmin = true
  //         if (this.isAdmin) {
  //           // this.#router.navigate(['/admin']);
  //           alert("admin")
  //         }
  //       }
  //       else {
  //         this.#authService.login(this.email, this.password).subscribe((res: any) => {
  //           console.log("resssssssss", res);
  //           if (res.message.result.password == this.password && res.message.result.email == this.email) {
  //             this.isAdmin = false
  //             isUser = true
  //           } 
  //         })
  //           if (isUser) {
  //             this.#router.navigate(['/home']);
  //           }
  //           else {
  //             alert("שגיאה בהתחברות")
  //           }

  //       }
  //     })
  //   }
  // }

login(): void {
  console.log("📥 התחלת תהליך התחברות");

  if (this.emailFormControl.invalid || this.passwordFormControl.invalid) {
    console.warn("⚠️ שדות לא תקינים", {
      emailValid: this.emailFormControl.valid,
      passwordValid: this.passwordFormControl.valid
    });
    alert("יש למלא את כל השדות כראוי");
    return;
  }

  const email = this.emailFormControl.value ?? '';
  const password = this.passwordFormControl.value ?? '';
  console.log("📨 נשלח אימייל וסיסמה לשרת", { email });

  this.#authService.login(email, password).subscribe({
    next: (res: any) => {
      console.log("✅ קיבלנו תגובה מהשרת", res);

      if (res?.token) {
        console.log("🔑 שמירת טוקן", res.token);
        sessionStorage.setItem('token', res.token);
        // sessionStorage.setItem('role', res.role);

        this.role = res.role;
        console.log("🧭 סוג משתמש שזוהה:", this.role);

        if (this.role === 'admin') {
          this.#router.navigateByUrl('/admin');
        }

        if (this.role === 'user') {
          const username = res.username || email;
          console.log("👤 שם משתמש:", username);
          setTimeout(() => {
            this.#router.navigate(['/user']);
          }, 100);
        }

      } else {
        console.error("❌ אין טוקן בתגובה");
        alert("שגיאה: אין טוקן בתגובה");
      }
    },

    error: (err) => {
      console.error("🚫 שגיאה מהשרת", err);
      alert("שגיאה מהשרת: " + (err?.message || JSON.stringify(err)));
    }
  });
}

}
//   login(): void {
//     if (this.emailFormControl.invalid || this.passwordFormControl.invalid) {
//       alert("יש למלא את כל השדות כראוי");
//       return;
//     }

//     const email = this.emailFormControl.value ?? '';
//     const password = this.passwordFormControl.value ?? '';

//     this.#authService.login(email, password).subscribe({
      
//       next: (res: any) => {
//         if (res?.token) {
//           console.log("email", email);

//           localStorage.setItem('token', res.token);
//           localStorage.setItem('role', res.role);
// console.log(this);

//           this.role = res.role;

//           if (this.role === 'admin') {
//             alert("מנהל נכנס בהצלחה");
//             this.#router.navigateByUrl('/admin');
//           } if (this.role === 'user') {
//             alert("התחברות משתמש הצליחה");
//             const username = res.username || email;
//             setTimeout(() => {
//               this.#router.navigate(['/user']);
//             }, 100);
//           }
//         } else {
//           alert("שגיאה בהתחברות");
//         }
//       },
//       error: (err) => {
//         console.error("שגיאה בהתחברות", err);
//         alert("שגיאה בהתחברות");
//       }
//     });
//   }


// }

