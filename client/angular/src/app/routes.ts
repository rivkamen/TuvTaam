import { Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component';
import { RecordListComponent  } from './components/record/record-list/record-list.component';

export const routes: Routes = [
  { path: 'upload', component: UploadComponent },
   { path: 'home', component: RecordListComponent  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
