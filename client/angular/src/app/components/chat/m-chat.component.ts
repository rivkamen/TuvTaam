import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message, FeedbackService } from '../../services/feedback.service';
import { DomSanitizer } from '@angular/platform-browser';
import { RoleService } from '../../services/role.service';
import { SessionListComponent } from './session-list/session-list.component';
import { NewSessionFormComponent, NewSessionData } from './new-session-form/new-session-form.component';
import { MessageListComponent, MessageEditData } from './message-list/message-list.component';
import { MessageInputComponent, MessageData } from './message-input/message-input.component';
import { UserProfileBarComponent } from './user-profile-bar/user-profile-bar.component';
import { environment } from '../../environments/environment';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-m-chat',
  standalone: true,
  imports: [
    CommonModule,
    SessionListComponent,
    NewSessionFormComponent,
    MessageListComponent,
    MessageInputComponent,
    UserProfileBarComponent
  ],
  templateUrl: './m-chat.component.html',
  styleUrls: ['./m-chat.component.css']
})
export class MChatComponent implements OnInit, OnDestroy {
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
firstUnreadIndex: number | null = null;
apiUrl: string = '';
private sseMap = new Map<string, EventSource>();
users: User[] = [];

  constructor(
    private feedbackService: FeedbackService,
    private userService: UserService,
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
// openSession(sessionId: string) {
//     this.selectedSessionId = sessionId;
//     this.loadMessages();
//     this.loadUserProfile();

//     this.initSSE(sessionId); // התחלת האזנה ל-SSE עבור שיחה זו
//   }
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
openSession(sessionId: string) {
    // סגור SSE של שיחות אחרות
    if (this.selectedSessionId && this.selectedSessionId !== sessionId) {
        this.closeSSE(this.selectedSessionId);
    }
    
    this.selectedSessionId = sessionId;
    this.loadMessages();
    this.loadUserProfile();
    
    this.initSSE(sessionId);
}
// private initSSE(sessionId: string) {
//     console.log(`[SSE] מנסה לפתוח חיבור לשיחה ${sessionId}`);
    
//     // סגור חיבור קיים אם יש
//     if (this.sseMap.has(sessionId)) {
//         this.closeSSE(sessionId);
//     }
    
//     const token = sessionStorage.getItem('token');
//     if (!token) {
//         console.error('[SSE] אין טוקן - לא ניתן להתחבר');
//         return;
//     }
    
//     const eventSource = new EventSource(`${environment.apiUrl}/feedback/sse/${sessionId}?token=${token}`);
//     console.log(`[SSE] EventSource נפתח עבור ${sessionId}`);
//     eventSource.onopen = () => {
//   console.log('[SSE] חיבור נפתח בהצלחה 🎉');
// };
//     eventSource.onmessage = (event) => {
//         try {
//             const data = JSON.parse(event.data);
//             console.log(`[SSE] הודעה חדשה לשיחה ${sessionId}:`, data);
            
//             if (data.sessionId === this.selectedSessionId) {
//                 console.log('[SSE] מדובר בשיחה הפתוחה כעת – טוען הודעות מחדש...');
//                 this.loadMessages();
//             } else {
//                 console.log('[SSE] מדובר בשיחה אחרת – מסמן כהודעה שלא נקראה');
//                 const session = this.sessions.find(s => s._id === data.sessionId);
//                 if (session) {
//                     session.hasUnreadMessages = true;
//                 }
//             }
//         } catch (error) {
//             console.error('[SSE] שגיאה בפענוח נתונים:', error);
//         }
//     };

//     eventSource.onerror = (error) => {
//         console.warn(`[SSE] שגיאה בשיחה ${sessionId}:`, error);
//         eventSource.close();
//         this.sseMap.delete(sessionId);
        
//         // נסה להתחבר שוב אחרי 3 שניות
//         setTimeout(() => {
//             if (this.selectedSessionId === sessionId) { // רק אם עדיין בשיחה הזו
//                 this.initSSE(sessionId);
//             }
//         }, 3000);
//     };

//     this.sseMap.set(sessionId, eventSource);
// }
private initSSE(sessionId: string) {
    console.log(`[SSE] מנסה לפתוח חיבור לשיחה ${sessionId}`);

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
        console.log('[SSE] חיבור נפתח בהצלחה 🎉');
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
        this.loadMessages();

    };

    eventSource.addEventListener('message-updated', (event) => {
        try {
            console.log('[SSE RAW] event.data:', event.data); // << זו השורה הנוספת

            const data = JSON.parse(event.data);
            console.log('[SSE] ✏️ הודעה עודכנה:', data);

            const updated = data.message;
            const index = this.messages.findIndex(m => m._id === updated._id);
            if (index > -1) {
                this.messages[index].content = updated.content;
                this.messages[index].path = updated.path;
                this.messages[index].isEdited = updated.isEdited; 
                this.messages[index].updatedAt = updated.updatedAt
                this.cdr.detectChanges();
            }
        } catch (err) {
            console.error('[SSE] שגיאה ב-message-updated:', err);
        }
    });

    eventSource.addEventListener('message-deleted', (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('[SSE] 🗑️ הודעה נמחקה:', data);

            // this.messages = this.messages.filter(m => m._id !== data.messageId);
            const index = this.messages.findIndex(m => m._id === data.messageId);
if (index > -1) {
  this.messages[index].isDeleted = true;
  this.messages[index].content = '';
  this.messages[index].signedUrl = '';
  this.cdr.detectChanges();
}

            this.cdr.detectChanges();
        } catch (err) {
            console.error('[SSE] שגיאה ב-message-deleted:', err);
        }
    });

    eventSource.onerror = (error) => {
        console.warn(`[SSE] שגיאה בשיחה ${sessionId}:`, error);
        eventSource.close();
        this.sseMap.delete(sessionId);

        setTimeout(() => {
            if (this.selectedSessionId === sessionId) {
                this.initSSE(sessionId);
            }
        }, 3000);
    };

    this.sseMap.set(sessionId, eventSource);
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
  this.feedbackService.getSessions().subscribe((sessions) => {
    this.sessions = sessions.map(session => {
      const hasUnreadMessages = session.messages?.some((msg: any) =>
        !msg.isRead && msg.fromUser === true
      );
      return {
        ...session,
        hasUnreadMessages
      };
    });
  });
}

selectSession(sessionId: string) {
  this.openSession(sessionId); // זה כולל loadMessages + initSSE
}

// loadMessages() {
//   if (!this.selectedSessionId) return;
  
//   this.loading = true;
//   this.firstUnreadIndex = null;
  
//   this.feedbackService.getMessages(this.selectedSessionId).subscribe({
//     next: (msgs) => {
//       console.log('🔄 loadMessages - עדכון הודעות:', msgs.length);
      
//       this.messages = msgs.map((msg, index) => {
//         const isUnread = !msg.isRead;
        
//         if (this.firstUnreadIndex === null && isUnread) {
//           this.firstUnreadIndex = index;
//         }
        
//         return {
//           ...msg,
//           isUnread,
//           isFirstUnread: this.firstUnreadIndex === index,
//           signedUrl: msg.signedUrl || null,
//           safeAudioUrl: msg.signedUrl 
//             ? this.sanitizer.bypassSecurityTrustResourceUrl(msg.signedUrl)
//             : null
//         };
//       });
      
//       this.loading = false;
//       console.log('🔄 messages עודכן:', this.messages.length);
      
//       // סימון כנקראו אחרי עדכון המסרים
//       this.markMessagesAsRead();
      
//       // זיהוי שינויים אם נדרש
//       this.cdr.detectChanges();
//     },
//     error: (err) => {
//       console.error('שגיאה בטעינת הודעות:', err);
//       this.loading = false;
//     }
//   });
  
// }
loadMessages() {
  if (!this.selectedSessionId) return;
  
  this.loading = true;
  this.firstUnreadIndex = null;
  
  this.feedbackService.getMessages(this.selectedSessionId).subscribe({
    next: (msgs) => {
      console.log('🔄 loadMessages - עדכון הודעות:', msgs.length);
      
      this.messages = msgs.map((msg, index) => {
        const isUnread = !msg.isRead;
        const isDeleted = msg.isDeleted || false;
        const isEdited = msg.isEdited || false;
        const updatedAt = msg.updatedAt ? new Date(msg.updatedAt) : null;
        // איתור ההודעה הראשונה שלא נקראה
        if (this.firstUnreadIndex === null && isUnread) {
          this.firstUnreadIndex = index;
        }

        return {
          ...msg,
          isUnread,
          isDeleted,
          isEdited,
          updatedAt,
          isFirstUnread: this.firstUnreadIndex === index,
          signedUrl: msg.signedUrl || null,
          safeAudioUrl: msg.signedUrl 
            ? this.sanitizer.bypassSecurityTrustResourceUrl(msg.signedUrl)
            : null
        };
      });

      this.loading = false;
      console.log('✅ messages עודכן:', this.messages.length);

      this.markMessagesAsRead();
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('❌ שגיאה בטעינת הודעות:', err);
      this.loading = false;
    }
  });
}

private markMessagesAsRead() {
  this.feedbackService.markAllMessagesAsRead(this.selectedSessionId).subscribe({
    next: () => console.log("עודכן כנקראו"),
    error: (err) => console.error("שגיאה בעדכון isRead", err)
  });
}

  sendMessage(messageData: MessageData) {
    if (!this.selectedSessionId) return;
    this.loading = true;

    const formData = new FormData();
    console.log("messageData.content");
    console.log(messageData);
    
    formData.append('content', messageData.content);
       formData.append('fromUser','false');
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
              : null,
               fromUser: false
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
  cancelNewSession() {
    this.newSessionMode = false;
  }
startNewSession() {
  console.log('[MChat/SChatComponent] startNewSession triggered');

  this.userService.getAllUsers().subscribe(users => {
    console.log('[startNewSession] users from service:', users);

    this.users = users;
    this.newSessionMode = true;
  });
  console.log("users");
  console.log(this.users);
  
}
createNewSession(sessionData: NewSessionData) {
  const userId = this.roleService.getUserId() || 'undefined';
  console.log("userId", userId);
    const title = sessionData.title || 'ללא שם';
  this.feedbackService.createSession(title, sessionData.targetUserId).subscribe(newSession => {
    // רענון כל השיחות כדי לקבל את השיחה החדשה עם userId ונתונים מלאים
    this.loadSessions();
    // סימון השיחה החדשה כנבחרת
    this.selectedSessionId = newSession._id;
    // יציאה ממצב יצירת שיחה
    this.newSessionMode = false;
    // התחלת האזנת SSE לשיחה החדשה
    this.initSSE(newSession._id);
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
log(){
  alert("editMessageId");
  console.log("editMessageId");
  console.log(this.editMessageId);
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