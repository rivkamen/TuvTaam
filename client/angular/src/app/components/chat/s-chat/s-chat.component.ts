import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message, FeedbackService } from '../../../services/feedback.service';
import { DomSanitizer } from '@angular/platform-browser';
import { RoleService } from '../../../services/role.service';
import { SessionListComponent } from '../session-list/session-list.component';
import { NewSessionFormComponent, NewSessionData } from '../new-session-form/new-session-form.component';
import { MessageListComponent, MessageEditData } from '../message-list/message-list.component';
import { MessageInputComponent, MessageData } from '../message-input/message-input.component';
import { AdminProfileBarComponent } from '../admin-profile-bar/admin-profile-bar.component';
import { SSessionListComponent } from '../s-session-list/s-session-list.component';
import { SMessageListComponent } from '../s-message-list/s-message-list.component';
import { SNewSessionFormComponent } from '../s-new-session-form/s-new-session-form.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-s-chat',
  standalone: true,
  imports: [
    CommonModule,
    SSessionListComponent,
    SNewSessionFormComponent,
    SMessageListComponent,
    MessageInputComponent,
    AdminProfileBarComponent
  ],
  templateUrl: './s-chat.component.html',
  styleUrls: ['./s-chat.component.css']
})
export class SChatComponent implements OnInit, OnDestroy {
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
private sseMap = new Map<string, EventSource>();

  constructor(
    private feedbackService: FeedbackService,
    private sanitizer: DomSanitizer,
    public roleService: RoleService,
    private cdr: ChangeDetectorRef
    
  ) {}

  ngOnInit() {
    this.loadSessions();
  }

 ngOnDestroy() {
    this.closeAllSSE(); // ניתוק כל החיבורים
  }
    private closeSSE(sessionId: string) {
    const source = this.sseMap.get(sessionId);
    if (source) {
      source.close();
      this.sseMap.delete(sessionId);
    }
  }

    private closeAllSSE() {
    this.sseMap.forEach((source, id) => {
      source.close();
    });
    this.sseMap.clear();
  }

loadSessions() {
  this.feedbackService.getUserSessions().subscribe((sessions) => {
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

  // selectSession(sessionId: string) {
  //   this.selectedSessionId = sessionId;
  //   this.loadMessages();
  //   this.loadUserProfile();
  // }
selectSession(sessionId: string) {
    this.selectedSessionId = sessionId;
    this.loadMessages();
    this.loadUserProfile();
    
    this.initSSE(sessionId);
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
          // this.cdr.detectChanges()
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
  const title = sessionData.title || 'ללא שם';
  const userId = this.roleService.getUserId() || 'undefined';

  this.feedbackService.createSession(title, userId).subscribe(newSession => {
    this.loadSessions(); // ← זה הפתרון

    this.selectedSessionId = newSession._id;
    this.newSessionMode = false;
    this.initSSE(newSession._id);
  });
}
//   private initSSE(sessionId: string) {
//     console.log(`[SSE] מנסה לפתוח חיבור לשיחה ${sessionId}`);

//     if (this.sseMap.has(sessionId)) return; // לא פותחים פעמיים
// const token = sessionStorage.getItem('token'); // או מאיפה שאת שומרת אותו
// const eventSource = new EventSource(`${environment.apiUrl}/feedback/sse/${sessionId}?token=${token}`);
// console.log(`[SSE] EventSource נפתח עבור ${sessionId}`);

//     eventSource.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log(`[SSE] הודעה חדשה לשיחה ${sessionId}, data`);

//       if (data.sessionId === this.selectedSessionId) {
//             console.log('[SSE] מדובר בשיחה הפתוחה כעת – טוען הודעות מחדש...');

//         this.loadMessages();
//       } else {
//         console.log('[SSE] מדובר בשיחה אחרת – מסמן כהודעה שלא נקראה');

//         const session = this.sessions.find(s => s._id === data.sessionId);
//         if (session) {
//           session.hasUnreadMessages = true;
//         }
//       }
//     };

//     eventSource.onerror = () => {
//       console.warn(`[SSE] שגיאה בשיחה ${sessionId}, מנסה שוב בעוד 3 שניות...`);
//       eventSource.close();
//       this.sseMap.delete(sessionId);
//       setTimeout(() => this.initSSE(sessionId), 3000);
//     };

//     this.sseMap.set(sessionId, eventSource);
//   }

private initSSE(sessionId: string) {
    console.log(`[SSE] מנסה לפתוח חיבור לשיחה ${sessionId}`);
    
    // סגור חיבור קיים אם יש
    if (this.sseMap.has(sessionId)) {
        this.closeSSE(sessionId);
    }
    
    const token = sessionStorage.getItem('token');
    if (!token) {
        console.error('[SSE] אין טוקן - לא ניתן להתחבר');
        return;
    }
    
    const eventSource = new EventSource(`${environment.apiUrl}/feedback/sse/${sessionId}?token=${token}`);
    console.log(`[SSE] EventSource נפתח עבור ${sessionId}`);
    eventSource.onopen = () => {
console.log('[SSE] התחברות חדשה לשיחה:', sessionId);
};
    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log(`[SSE] הודעה חדשה לשיחה ${sessionId}:`, data);
            
            if (data.sessionId === this.selectedSessionId) {
                console.log('[SSE] מדובר בשיחה הפתוחה כעת – טוען הודעות מחדש...');
                this.loadMessages();
            } else {
                console.log('[SSE] מדובר בשיחה אחרת – מסמן כהודעה שלא נקראה');
                const session = this.sessions.find(s => s._id === data.sessionId);
                if (session) {
                    session.hasUnreadMessages = true;
                }
            }
        } catch (error) {
            console.error('[SSE] שגיאה בפענוח נתונים:', error);
        }
    };

    eventSource.onerror = (error) => {
        console.warn(`[SSE] שגיאה בשיחה ${sessionId}:`, error);
        eventSource.close();
        this.sseMap.delete(sessionId);
        
        // נסה להתחבר שוב אחרי 3 שניות
        setTimeout(() => {
            if (this.selectedSessionId === sessionId) { // רק אם עדיין בשיחה הזו
                this.initSSE(sessionId);
            }
        }, 3000);
    };

    this.sseMap.set(sessionId, eventSource);
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