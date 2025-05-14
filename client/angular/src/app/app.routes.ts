import { Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component'; // ודאי שהנתיב נכון
import { RecordListComponent  } from './components/record/record-list/record-list.component';

export const routes: Routes = [
  { path: 'upload', component: UploadComponent },
   { path: 'home', component: RecordListComponent  },
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // להפניה אוטומטית ל־/home
];
