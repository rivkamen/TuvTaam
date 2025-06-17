import { Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component'; // ודאי שהנתיב נכון
import {  LoginComponent } from './components/login/login.component';
import { AdminComponent } from './components/admin/admin.component';
import { UserComponent } from './components/user/user.component';
import { RecordListComponent } from './components/record/record-list.component';
import { TeacherChatComponent } from './components/session/teacherChat/teacher-chat.component';
import { StudentChatComponent } from './components/session/studentChat/student-chat.component';
import { FeedbackChatComponent } from './components/feedbackChat/student/feedback-chat.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
// import { FeedbackChatComponent } from './components/feedbackChat/student/feedback-chat.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'user', component: UserComponent },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'upload', component: UploadComponent },
  { path: 'teacherChat', component: TeacherChatComponent },
  { path: 'studentChat', component: StudentChatComponent },
  { path: 'feedbackChat', component: FeedbackChatComponent },
  { path: 'home', component: RecordListComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // {path:'admin'}

];
