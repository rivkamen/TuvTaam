import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Message, SessionService } from '../../../services/session.service';

@Component({
  selector: 'app-teacher-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-chat.component.html',
  styleUrls: ['./teacher-chat.component.css']
})
export class TeacherChatComponent implements OnInit {
  sessions: any[] = [];
  selectedSessionId: string = '';
  messages: any[] = [];
  newMessage = '';
  loading = false;

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
 const messageData  = {message:{content: this.newMessage, fromUser: false} }; 
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

  this.sessionService.createSession(userId, initialMessage ? [{ content: initialMessage, fromUser: false }] : []).subscribe(session => {
    this.sessions.push(session);
    this.selectedSessionId = session._id;
    this.messages = session.messages || [];
    this.newSessionMode = false;
    this.newMessage = '';
  });
}



}
