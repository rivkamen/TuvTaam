import { Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component'; // ודאי שהנתיב נכון
import { RecordListComponent  } from './components/record/record-list.component';
import { TeacherChatComponent } from './components/session/teacherChat/teacher-chat.component';
import { StudentChatComponent } from './components/session/studentChat/student-chat.component';
import { FeedbackChatComponent } from './components/feedbackChat/feedback-chat.component';

export const routes: Routes = [
  { path: 'upload', component: UploadComponent },
    { path: 'teacherChat', component: TeacherChatComponent },
    { path: 'studentChat', component: StudentChatComponent },
    { path: 'feedbackChat', component: FeedbackChatComponent },


   { path: 'home', component: RecordListComponent  },
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // להפניה אוטומטית ל־/home
];
