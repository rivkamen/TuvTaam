import { Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component';
import { AuthComponent } from './components/auth/auth.component';
import { AdminComponent } from './components/admin/admin.component';
import { UserComponent } from './components/user/user.component';
import { RecordListComponent } from './components/record/record-list.component';
import { TeacherChatComponent } from './components/session/teacherChat/teacher-chat.component';
import { StudentChatComponent } from './components/session/studentChat/student-chat.component';
import { FeedbackChatComponent } from './components/feedbackChat/student/feedback-chat.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: AuthComponent, title: 'TuvTaam: Login' },
  { path: 'register', component: AuthComponent, title: 'TuvTaam: Register' },
  {
    path: 'admin',
    component: AdminComponent,
    title: 'TuvTaam: Personal Area: Admin',
    canActivate: [adminGuard],
  },
  {
    path: 'user',
    component: UserComponent,
    title: 'TuvTaam: Personal Area: User',
    canActivate: [authGuard],
  },
  {
    path: 'upload',
    component: UploadComponent,
    title: 'TuvTaam: Upload Record',
    canActivate: [adminGuard],
  },
  {
    path: 'teacherChat',
    component: TeacherChatComponent,
    title: 'TuvTaam: Chat',
    canActivate: [adminGuard],
  },
  {
    path: 'studentChat',
    component: StudentChatComponent,
    title: 'TuvTaam: Chat',
    canActivate: [authGuard],
  },
  {
    path: 'feedbackChat',
    component: FeedbackChatComponent,
    title: 'TuvTaam: Feedback Chat',
    canActivate: [authGuard],
  },
  {
    path: 'records',
    component: RecordListComponent,
    title: 'TuvTaam: Records',
    canActivate: [authGuard],
  },
  { path: 'home', component: RecordListComponent, title: 'TuvTaam' }, // TODO: Change to HomeComponent when created
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
