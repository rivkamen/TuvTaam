import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Message, FeedbackService } from '../../services/feedback.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-teacher-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback-chat.component.html',
  styleUrls: ['./feedback-chat.component.css']
})
export class FeedbackChatComponent implements OnInit {
  sessions: any[] = [];
  selectedSessionId: string = '';
  messages: any[] = [];
  newMessage = '';
  loading = false;
  newSessionMode = false;
  newSessionTitle = '';
  newSessionMessage = '';
  isTeacher: boolean = false;

  // הקלטה
  isRecording = false;
  mediaRecorder!: MediaRecorder;
  recordedChunks: Blob[] = [];
  recordedBlob: Blob | null = null;

  constructor(
    private feedbackService: FeedbackService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadSessions();
  }

  isOwnMessage(msg: Message): boolean {
    return this.isTeacher ? !msg.fromUser : msg.fromUser;
  }

  loadSessions() {
    this.feedbackService.getSessions().subscribe((sessions) => {
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
    this.feedbackService.getMessages(this.selectedSessionId).subscribe((msgs) => {
      this.messages = msgs;
      this.loading = false;
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedSessionId) return;
    this.loading = true;
    console.log(this.newMessage);
    console.log("this.newMessage");
    
    const messageData = {
      message: { content: this.newMessage, fromUser: true}
    };
    this.feedbackService.sendMessage(this.selectedSessionId, messageData).subscribe(() => {
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

  createNewSession() {
    const userId = sessionStorage.getItem('userId') || '68167ca59d97489bab54878a';
    const title = this.newSessionTitle || 'ללא שם';
    const initialMessage = this.newSessionMessage.trim();

    this.feedbackService.createSession(userId, title, initialMessage ? [
      { content: initialMessage, fromUser: true}
    ] : []).subscribe(session => {
      this.sessions.push(session);
      this.selectedSessionId = session._id;
      this.messages = session.messages || [];
      this.newSessionMode = false;
      this.newMessage = '';
    });
  }

  startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = e => this.recordedChunks.push(e.data);
      this.mediaRecorder.onstop = () => {
        this.recordedBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
      };
      this.mediaRecorder.start();
      this.isRecording = true;
    }).catch(err => {
      console.error('Microphone access error:', err);
    });
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  uploadRecording() {
    if (!this.recordedBlob || !this.selectedSessionId) return;

    const formData = new FormData();
    const fileName = `recording-${Date.now()}.webm`;
    formData.append('audio', this.recordedBlob, fileName);
    formData.append('sessionId', this.selectedSessionId);

    this.feedbackService.uploadAudioWithBackup(formData).subscribe({
      next: () => {
        alert('הקלטה הועלתה בהצלחה!');
        this.recordedBlob = null;
        this.loadMessages();
      },
      error: (err) => {
        console.error('Upload error:', err);
        alert('שגיאה בהעלאה');
      }
    });
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
