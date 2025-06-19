import { Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component'; // ודאי שהנתיב נכון
import { AuthComponent } from './components/auth/auth.component';
import { AdminComponent } from './components/admin/admin.component';
import { UserComponent } from './components/user/user.component';
import { RecordListComponent } from './components/record/record-list.component';
import { TeacherChatComponent } from './components/session/teacherChat/teacher-chat.component';
import { StudentChatComponent } from './components/session/studentChat/student-chat.component';
import { FeedbackChatComponent } from './components/feedbackChat/student/feedback-chat.component';
import { MFeedbackChatComponent } from './components/feedbackChat/teacher/m-feedback-chat.component';
import { MChatComponent } from './components/chat/m-chat.component';
import { SChatComponent } from './components/chat/s-chat/s-chat.component';

export const routes: Routes = [
  { path: 'login', component: AuthComponent },
  { path: 'register', component: AuthComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'user', component: UserComponent },
  { path: 'upload', component: UploadComponent },
  { path: 'teacherChat', component: TeacherChatComponent },
  { path: 'studentChat', component: StudentChatComponent },
  { path: 'feedbackChat', component: FeedbackChatComponent },
  { path: 'mfeedbackChat', component: MFeedbackChatComponent },
  { path: 'mChat', component: MChatComponent },
  { path: 'sChat', component: SChatComponent },
  { path: 'home', component: RecordListComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // {path:'admin'}

];
