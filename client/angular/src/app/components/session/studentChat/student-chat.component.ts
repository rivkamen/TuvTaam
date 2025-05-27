import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Message, SessionService } from '../../../services/session.service';

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

  constructor(private sessionService: SessionService) {}
newSessionMode = false;
newSessionTitle = '';
isTeacher: boolean = false;

  ngOnInit() {
    this.loadSessions();
  }

isOwnMessage(msg: Message): boolean {
  return this.isTeacher ? !msg.fromUser : msg.fromUser;
}

  loadSessions() {
    this.sessionService.getSessions().subscribe((sessions) => {
      this.sessions = sessions;
    });
  }

  selectSession(sessionId: string) {
    this.selectedSessionId = sessionId;
    this.loadMessages();
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




newSessionMessage = '';

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
  const userId = sessionStorage.getItem('userId') || '68167ca59d97489bab54878a';
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


}
