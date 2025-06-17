import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `<p>מתחבר דרך גוגל...</p>`
})
export class AuthCallbackComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const role = params['role'] || 'user';
      const username = params['username'] || '';

      if (token) {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('role', role);
        sessionStorage.setItem('username', username);

        if (role === 'admin') {
          this.router.navigate(['/teacherChat']);
        } else {
          this.router.navigate(['/studentChat']);
        }
      } else {
        alert('התחברות עם גוגל נכשלה');
        this.router.navigate(['/login']);
      }
    });
  }
}
