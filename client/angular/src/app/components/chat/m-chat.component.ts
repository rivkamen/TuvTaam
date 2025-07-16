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
selectSession(sessionId: string) {
  this.openSession(sessionId); // זה כולל loadMessages + initSSE
}
loadMessages() {
  if (!this.selectedSessionId) return;

  this.loading = true;
  this.firstUnreadIndex = null;

  this.feedbackService.getMessages(this.selectedSessionId).subscribe({

    next: (msgs) => {
      console.log('🔄 loadMessages - עדכון הודעות:', msgs.length);

      this.messages = msgs.map((msg, index) => {
        const isUnread = !msg.isRead;
        if (this.firstUnreadIndex === null && isUnread) {
          this.firstUnreadIndex = index;
        }
        return {
          ...msg,
          isUnread,
          isDeleted: msg.isDeleted || false,
          isEdited: msg.isEdited || false,
          updatedAt: msg.updatedAt ? new Date(msg.updatedAt) : null,
          isFirstUnread: this.firstUnreadIndex === index,
          signedUrl: msg.signedUrl || null,
          safeAudioUrl: msg.signedUrl 
            ? this.sanitizer.bypassSecurityTrustResourceUrl(msg.signedUrl)
            : null
        };
      });

      this.loading = false;
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
  const unreadExists = this.messages.some(m => !m.isRead && m.fromUser);
  if (!unreadExists) return;

  this.feedbackService.markAllMessagesAsRead(this.selectedSessionId).subscribe({
    next: () => {
      this.sessions = this.sessions.map(session =>
        session._id === this.selectedSessionId
          ? { ...session, hasUnreadMessages: false, unreadCount: 0 }
          : session
      );
      this.cdr.detectChanges();
    },
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

// createNewSession(sessionData: NewSessionData) {
//   const title = sessionData.title || 'ללא שם';
//   const userId = this.roleService.getUserId() || 'undefined';

//   this.feedbackService.createSession(title, sessionData.targetUserId).subscribe(newSession => {
//     this.sessions = [...this.sessions, {
//       ...newSession,
//       messages: [],
//       hasUnreadMessages: false,
//       unreadCount: 0
//     }];
//     this.selectedSessionId = newSession._id;
//     this.newSessionMode = false;
//     this.initSSE(newSession._id);
//     this.loadMessages();
//     this.cdr.detectChanges();
//   });
// }
createNewSession(sessionData: NewSessionData) {
  const title = sessionData.title || 'ללא נושא';

  this.feedbackService.createSession(title, sessionData.targetUserId).subscribe(newSession => {
    this.selectedSessionId = newSession._id;
    this.newSessionMode = false;

    // 💡 ריענון רשימת השיחות מהשרת (במקום לדחוף ידנית)
    this.loadSessions();

    // ממשיכים כרגיל עם ההודעות ו-SSE
    this.initSSE(newSession._id);
    this.loadMessages();

    this.cdr.detectChanges();
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
  // deleteMessage(messageId: string) {
  //   this.feedbackService.deleteMessage(this.selectedSessionId, messageId).subscribe(() => {
  //     this.messages = this.messages.filter(m => m._id !== messageId);
  //   });
  // }
  deleteMessage(messageId: string) {
  this.feedbackService.deleteMessage(this.selectedSessionId, messageId).subscribe(() => {
    const index = this.messages.findIndex(m => m._id === messageId);
    if (index !== -1) {
      this.messages[index].isDeleted = true;
      this.cdr.detectChanges(); // עדכון מיידי של ה־UI
    }
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
  this.sseMap.set(sessionId, eventSource);

  eventSource.onopen = () => {
    console.log('[SSE] חיבור נפתח בהצלחה 🎉');
  };

  
eventSource.onmessage = (event) => {
  console.log('[📨 SSE] התקבל אירוע:', event.data);

  try {
    const data = JSON.parse(event.data);
    const incomingMessage = data.message;

    if (!incomingMessage) {
      console.log('[ℹ️ SSE] אין הודעה – מתעלם');
      return;
    }

    const isActiveSession = data.sessionId === this.selectedSessionId;
    const isFromCurrentUser = incomingMessage.fromUser === false; // או בדיקה לפי userId אם יש

    if (isActiveSession) {
      if (!isFromCurrentUser) {
        console.log('[🔄 SSE] הודעה משולח אחר בשיחה פתוחה – טוען מחדש');
        this.loadMessages();
      } else {
        console.log('[🟢 SSE] הודעה שלנו – כבר הוספנו מקומית');
      }
    } else {
      console.log('[🕓 SSE] הודעה משיחה אחרת – מעדכן סטטוס');
      this.updateSessionWithNewMessage(data);
    }

    this.updateSessionsUnreadStatus();

  } catch (error) {
    console.error('[💥 SSE] שגיאה בפענוח:', error);
  }
};

eventSource.addEventListener('message-updated', (event) => {
  try {
    const data = JSON.parse(event.data);
    console.log('[SSE] ✏️ הודעה עודכנה:', data);

    const updated = data.message;
    const index = this.messages.findIndex(m => m._id === updated._id);
    if (index > -1) {
      this.messages[index].content = updated.content;
      this.messages[index].path = updated.path;
      this.messages[index].isEdited = updated.isEdited;
      this.messages[index].updatedAt = updated.updatedAt;
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

    const index = this.messages.findIndex(m => m._id === data.messageId);
    if (index !== -1) {
      this.messages[index].isDeleted = true;
      this.cdr.detectChanges();
    }
  } catch (err) {
    console.error('[SSE] שגיאה ב-message-deleted:', err);
  }
});
eventSource.onerror = (err) => {
  console.error('[SSE] שגיאה בחיבור:', err);
};

}

private calculateUnreadCount(session: any): number {
  console.log('caculate');
  
  if (!session.messages) {
    console.log('[📉 calculateUnreadCount] אין הודעות בשיחה:', session._id);
    return 0;
  }
  const count = session.messages.filter((msg: any) => !msg.isRead && msg.fromUser).length;
  console.log(`[📊 calculateUnreadCount] לשיחה ${session._id} יש ${count} הודעות לא נקראו`);
  return count;
}
// עדכון פונקציית loadSessions
loadSessions() {
    this.feedbackService.getSessions().subscribe((sessions) => {
          console.log('🟢 loadSessions - sessions from server:', sessions);

        this.sessions = sessions.map(session => {
            const unreadCount = this.calculateUnreadCount(session);
            const hasUnreadMessages = unreadCount > 0;
            
            return {
                ...session,
                hasUnreadMessages,
                unreadCount
            };
        });
        
        this.cdr.detectChanges();
    });
}
// פונקציה לעדכון סטטוס הודעות שלא נקראו
private updateSessionsUnreadStatus() {
    this.sessions = this.sessions.map(session => {
        const unreadCount = this.calculateUnreadCount(session);
        return {
            ...session,
            hasUnreadMessages: unreadCount > 0,
            unreadCount
        };
    });
    
    this.cdr.detectChanges();
}
// עדכון פונקציית openSession
openSession(sessionId: string) {
    if (this.selectedSessionId && this.selectedSessionId !== sessionId) {
        this.closeSSE(this.selectedSessionId);
    }

    // סימון כל ההודעות כנקראו לפני פתיחת השיחה
    const session = this.sessions.find(s => s._id === sessionId);
    if (session) {
        session.hasUnreadMessages = false;
        session.unreadCount = 0;
        
        if (session.messages) {
            session.messages.forEach((msg: any) => {
                if (!msg.isRead && msg.fromUser) {
                    msg.isRead = true;
                }
            });
        }
    }

    this.selectedSessionId = sessionId;
    this.loadMessages();
    this.loadUserProfile();
    this.initSSE(sessionId);
    
    // עדכון הדיספליי
    this.cdr.detectChanges();
}
private updateSessionWithNewMessage(data: any) {
  console.log('[🔔 updateSessionWithNewMessage] התחלה עם data:', data);

  if (!data || !data.message) {
    console.warn('[⚠️ updateSessionWithNewMessage] אין הודעה בנתונים שהתקבלו:', data);
    return;
  }

  const session = this.sessions.find(s => s._id === data.sessionId);
  if (!session) {
    console.warn('[⚠️ updateSessionWithNewMessage] שיחה לא נמצאה:', data.sessionId);
    return;
  }

  console.log('[🧩 updateSessionWithNewMessage] נמצא session:', session);

  if (!session.messages) {
    console.log('[📭 updateSessionWithNewMessage] יוצר מערך הודעות חדש בשיחה');
    session.messages = [];
  }

  const newMessage = {
    ...data.message,
    isRead: false,
    fromUser: data.message.fromUser ?? true,
  };

  session.messages.push(newMessage);
  session.hasUnreadMessages = true;
  session.unreadCount = this.calculateUnreadCount(session);

  console.log('[✅ updateSessionWithNewMessage] הודעה הוספה. unreadCount:', session.unreadCount);

  this.cdr.detectChanges();
}
deleteSession(sessionId: string) {
  this.feedbackService.deleteSession(sessionId).subscribe(() => {
    this.sessions = this.sessions.filter(s => s._id !== sessionId);

    // אם השיחה שנבחרה נמחקה – ננקה אותה
    if (this.selectedSessionId === sessionId) {
      this.selectedSessionId = '';
      this.messages = [];
    }
  });
}
noteEditorOpen = false;
noteMessageId: string = '';
noteMessageContent: string = '';

handleRichNoteEdit(event: { messageId: string; content: string }) {
  this.noteEditorOpen = true;
  this.noteMessageId = event.messageId;
  this.noteMessageContent = event.content;
}

onRichNoteSubmitted(event: { id: string; html: string }) {
  this.feedbackService.updateMessage(this.selectedSessionId, event.id, { content: event.html }).subscribe(() => {
    this.loadMessages(); // רענון ההודעות
    this.noteEditorOpen = false;
  });
}

}