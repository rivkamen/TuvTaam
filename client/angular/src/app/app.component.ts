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



import { Component } from '@angular/core';
import { RouterOutlet, RouterLink,RouterModule  } from '@angular/router'; // 👈 חשוב מאוד!
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink,RouterModule ], // 👈 לוודא שזה נמצא כאן
  templateUrl:'./app.component.html',
})
export class AppComponent {
  }
