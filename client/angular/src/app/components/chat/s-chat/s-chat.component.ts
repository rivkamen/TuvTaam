import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message, FeedbackService } from '../../../services/feedback.service';
import { DomSanitizer } from '@angular/platform-browser';
import { RoleService } from '../../../services/role.service';

// Import תת-קומפוננטות
import { SessionListComponent } from '../session-list/session-list.component';
import { NewSessionFormComponent, NewSessionData } from '../new-session-form/new-session-form.component';
import { MessageListComponent, MessageEditData } from '../message-list/message-list.component';
import { MessageInputComponent, MessageData } from '../message-input/message-input.component';
import { AdminProfileBarComponent } from '../admin-profile-bar/admin-profile-bar.component';
import { SSessionListComponent } from '../s-session-list/s-session-list.component';
import { SMessageListComponent } from '../s-message-list/s-message-list.component';

@Component({
  selector: 'app-s-chat',
  standalone: true,
  imports: [
    CommonModule,
    SSessionListComponent,
    NewSessionFormComponent,
    SMessageListComponent,
    MessageInputComponent,
    AdminProfileBarComponent
  ],
  templateUrl: './s-chat.component.html',
  styleUrls: ['./s-chat.component.css']
})
export class SChatComponent implements OnInit {
  sessions: any[] = [];
  selectedSessionId: string = '';
  messages: any[] = [];
  loading = false;
  newSessionMode = false;
  
  userEmail: string = '';
  userPhotoUrl: string = '';
  adminPhotoUrl: string = '';
  userRole: string | null = null;
  openedMenuId: string | null = null;
editMessageId: string | null = null;
editedContent: string = '';

  constructor(
    private feedbackService: FeedbackService,
    private sanitizer: DomSanitizer,
    public roleService: RoleService
  ) {}

  ngOnInit() {
    this.loadSessions();
  }

  // loadSessions() {
  //   this.feedbackService.getSessions().subscribe((sessions) => {
  //     this.sessions = sessions;
  //     console.log("sessions");
  //     console.log(sessions);
      
  //   });
  // }
loadSessions() {
  this.feedbackService.getSessions().subscribe((sessions) => {
    this.sessions = sessions.map(session => {
      const hasUnreadMessages = session.messages?.some((msg: any) =>
        !msg.isRead && msg.fromUser === false
      );
      return {
        ...session,
        hasUnreadMessages
      };
    });
  });
}

  selectSession(sessionId: string) {
    this.selectedSessionId = sessionId;
    this.loadMessages();
    this.loadUserProfile();
  }

  loadMessages() {
    if (!this.selectedSessionId) return;
    this.loading = true;

    this.feedbackService.getMessages(this.selectedSessionId).subscribe((msgs) => {
      this.messages = msgs.map((msg) => ({
        ...msg,
        signedUrl: msg.signedUrl || null,
        safeAudioUrl: msg.signedUrl ? 
          this.sanitizer.bypassSecurityTrustResourceUrl(msg.signedUrl) : null
      }));
      this.loading = false;
      
      this.feedbackService.markAllMessagesAsRead(this.selectedSessionId).subscribe({
        next: () => console.log("עודכן כנקראו"),
        error: (err) => console.error("שגיאה בעדכון isRead", err)
      });
    });
  }

//   sendMessage(messageData: MessageData) {
//     if (!this.selectedSessionId) return;
//     this.loading = true;

//     const formData = new FormData();
//     formData.append('content', messageData.content);
//     if (messageData.audioBlob) {
//       const fileName = `recording-${Date.now()}.webm`;
//       formData.append('file', messageData.audioBlob, fileName);
//     }

//     this.feedbackService.sendMessageWithAudio(this.selectedSessionId, formData).subscribe({
//       next: (newMessage) => {
//         this.loading = false;
//         if (newMessage?.data) {
//           const processedMessage = {
//             ...newMessage.data,
//             isAudio: !!newMessage.data.signedUrl,
//             isText: !!newMessage.data.content,
//             signedUrl: newMessage.data.signedUrl || null,
//             safeAudioUrl: newMessage.data.signedUrl
//               ? this.sanitizer.bypassSecurityTrustResourceUrl(newMessage.data.signedUrl)
//               : null
//           };
//           this.messages = [...this.messages, processedMessage];
//         }
//       },
//       error: (err) => {
//         console.error('Send message error:', err);
//         alert('שגיאה בשליחת ההודעה');
//         this.loading = false;
//       }
//     });
//   }
  sendMessage(messageData: MessageData) {
    if (!this.selectedSessionId) return;
    this.loading = true;

    const formData = new FormData();
    console.log("messageData.content");
    console.log(messageData);
    
    formData.append('content', messageData.content);
    formData.append('fromUser','true');

    if (messageData.audioBlob) {
      const fileName = `recording-${Date.now()}.webm`;
      formData.append('file', messageData.audioBlob, fileName);
    }

    this.feedbackService.sendMessageWithAudio(this.selectedSessionId, formData).subscribe({
      next: (newMessage) => {
        this.loading = false;
        if (newMessage?.data) {
          const processedMessage = {
            ...newMessage.data,
            isAudio: !!newMessage.data.signedUrl,
            isText: !!newMessage.data.content,
            signedUrl: newMessage.data.signedUrl || null,
            safeAudioUrl: newMessage.data.signedUrl
              ? this.sanitizer.bypassSecurityTrustResourceUrl(newMessage.data.signedUrl)
              : null
          };
          this.messages = [...this.messages, processedMessage];
        }
      },
      error: (err) => {
        console.error('Send message error:', err);
        alert('שגיאה בשליחת ההודעה');
        this.loading = false;
      }
    });
  }

  startNewSession() {
    this.newSessionMode = true;
  }

  cancelNewSession() {
    this.newSessionMode = false;
  }

  createNewSession(sessionData: NewSessionData) {
    const userId = this.roleService.getUserId() || 'undefined';
    const title = sessionData.title || 'ללא שם';

    this.feedbackService.createSession(userId, title, sessionData.message ? [
      { content: sessionData.message, fromUser: true}
    ] : []).subscribe(session => {
      this.sessions.push(session);
      this.selectedSessionId = session._id;
      this.messages = session.messages || [];
      this.newSessionMode = false;
    });
  }

startEdit(message: any) {
  this.editMessageId = null; // מאפס כדי להבטיח זיהוי שינוי
  setTimeout(() => {
    this.editMessageId = message._id;
    this.editedContent = message.content;
  });
}

  saveEdit(editData: MessageEditData) {
  this.feedbackService.updateMessage(
    this.selectedSessionId, 
    editData.messageId, 
    { content: editData.content }
  ).subscribe(() => {
    const msg = this.messages.find(m => m._id === editData.messageId);
    if (msg) msg.content = editData.content;

    this.editMessageId = null;
    this.editedContent = '';
  });
}

cancelEdit() {
  this.editMessageId = null;
  this.editedContent = '';
}

  deleteMessage(messageId: string) {
    this.feedbackService.deleteMessage(this.selectedSessionId, messageId).subscribe(() => {
      this.messages = this.messages.filter(m => m._id !== messageId);
    });
  }

  toggleMenu(messageId: string) {
    this.openedMenuId = this.openedMenuId === messageId ? null : messageId;
  }

  loadUserProfile() {
    const googleEmail = sessionStorage.getItem('userEmail');
    const googlePhoto = sessionStorage.getItem('userPhoto');

    if (googleEmail) {
      this.userEmail = googleEmail;
      this.userPhotoUrl = googlePhoto || '';
    } else {
      const userSession = this.sessions.find(s => s._id === this.selectedSessionId);
      if (userSession && userSession.userId[0]?.email) {
        this.userEmail = userSession.userId[0].email;
        this.userPhotoUrl = 'assets/student.gif';
        this.adminPhotoUrl = 'assets/teacher.gif';
      }
    }
  }
}