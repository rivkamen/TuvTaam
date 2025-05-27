import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Message, SessionService } from '../../../services/session.service';
import { RoleService } from '../../../services/role.service'; // נתיב נכון לפי הפרויקט שלך

@Component({
  selector: 'app-teacher-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-chat.component.html',
  styleUrls: ['./student-chat.component.css']
})
export class StudentChatComponent implements OnInit {
  sessions: any[] = [];
  selectedSessionId: string = '';
  messages: any[] = [];
  newMessage = '';
  loading = false;
editMessageId: string | null = null;
editedMessageContent: string = '';

  constructor(private sessionService: SessionService, public roleService: RoleService) {}

newSessionMode = false;
newSessionTitle = '';
isTeacher: boolean = false;
userEmail: string = '';
userPhotoUrl: string = '';
adminPhotoUrl: string = '';
userRole: string | null = null;
openedMenuId: string | null = null;
newSessionMessage = '';
toggleMenu(id: string) {
  this.openedMenuId = this.openedMenuId === id ? null : id;
}
loadUserRole() {
    const token = sessionStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userRole = payload.role;
    }
  }
  ngOnInit() {
    this.loadSessions();
    this.loadUserRole();
  }
isOwnMessage(msg: Message): boolean {
  return this.isTeacher ? !msg.fromUser : msg.fromUser;
}
  loadSessions() {
    this.sessionService.getUserSessions().subscribe((sessions) => {
      this.sessions = sessions;
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
    this.sessionService.getMessages(this.selectedSessionId).subscribe((msgs) => {
      this.messages = msgs;
      this.loading = false;
    });
  }
  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedSessionId) return;
    this.loading = true;
 const messageData  = {message:{content: this.newMessage, fromUser: true} }; 
    this.sessionService.sendMessage(this.selectedSessionId, messageData).subscribe(() => {
      this.newMessage = '';
      this.loadMessages();
    });
  }
startNewSession() {
  this.newSessionMode = true;
  this.newSessionTitle = '';
  this.newSessionMessage = '';
}
cancelNewSession() {
  this.newSessionMode = false;
}
logSession(s: any) {
  console.log('session:', s);
}
createNewSession() {
    const userId = this.roleService.getUserId() || 'undefined'; // Default user ID if not found
  const title = this.newSessionTitle || 'ללא שם';
  const initialMessage = this.newSessionMessage.trim();

  this.sessionService.createSession(userId, initialMessage ? [{ content: initialMessage, fromUser: true }] : []).subscribe(session => {
    this.sessions.push(session);
    this.selectedSessionId = session._id;
    this.messages = session.messages || [];
    this.newSessionMode = false;
    this.newMessage = '';
  });
}
startEdit(msg: any) {
  this.editMessageId = msg._id;
  this.editedMessageContent = msg.content;
}
cancelEdit() {
  this.editMessageId = null;
  this.editedMessageContent = '';
}
saveEdit(messageId:string) {
  // כאן תקראי לפונקציה בשרת לעדכון ההודעה
  this.sessionService.updateMessage(this.selectedSessionId
,messageId, { content: this.editedMessageContent }).subscribe(() => {
    const msg = this.messages.find(m => m._id === messageId);
    if (msg) msg.content = this.editedMessageContent;
    this.cancelEdit();
  });
}
deleteMessage(messageId: string) {
  if (!confirm('האם למחוק את ההודעה?')) return;
  this.sessionService.deleteMessage(this.selectedSessionId,messageId).subscribe(() => {
    this.messages = this.messages.filter(m => m._id !== messageId);
  });
}
loadUserProfile() {
  // אם יש אימייל מהתחברות גוגל
  const googleEmail = sessionStorage.getItem('userEmail');
  const googlePhoto = sessionStorage.getItem('userPhoto');

  if (googleEmail) {
    this.userEmail = googleEmail ;
    this.userPhotoUrl = googlePhoto || '';
  } else {
    // קבלת אימייל מהשרת דרך סשן נוכחי
    const userSession = this.sessions.find(s => s._id === this.selectedSessionId);
    console.log('userSession:', userSession.userId);
    
    if (userSession && userSession.userId[0]?.email) {
      console.log("hi");
      
      this.userEmail = userSession.userId[0].email;
      this.userPhotoUrl = 'assets/vivid-blurred-colorful-wallpaper-background.jpg'; 
      this.adminPhotoUrl = 'assets/DSCN0107.JPG';
    }}
  }
}


