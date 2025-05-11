import { Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component';

export const routes: Routes = [
  { path: 'upload', component: UploadComponent },
  { path: 'home', component: UploadComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
