import { Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component'; // ודאי שהנתיב נכון

export const routes: Routes = [
  { path: 'upload', component: UploadComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // להפניה אוטומטית ל־/home
];
