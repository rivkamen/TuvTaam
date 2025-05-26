import { Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component'; // ודאי שהנתיב נכון
import { AuthComponent } from './components/auth/auth.component';
import { AdminComponent } from './components/admin/admin.component';
import { UserComponent } from './components/user/user.component';

export const routes: Routes = [
  { path: 'upload', component: UploadComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },// להפניה אוטומטית ל־/home
  { path: 'login', component: AuthComponent },
  { path: 'register', component: AuthComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'user', component: UserComponent }
  // {path:'admin'}
];
