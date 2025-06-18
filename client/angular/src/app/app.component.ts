// import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [RouterOutlet],
//   templateUrl: './app.component.html',
//   styleUrl: './app.component.css'
// })
// export class AppComponent {
//   title = 'angular';
// }

import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AppbarComponent } from './components/appbar/appbar.component'; 
import { RoleService } from './services/role.service';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, AppbarComponent, ButtonModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  router = inject(Router);
  roleService = inject(RoleService);
}
