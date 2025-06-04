import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Message, FeedbackService } from '../../../services/feedback.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RoleService } from '../../../services/role.service';
import {RecordingComponent} from '../../recording/recording.component';
import { ViewChild } from '@angular/core';
import { ScrollPanel } from 'primeng/scrollpanel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
@Component({
  selector: 'app-teacher-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RecordingComponent,ScrollPanelModule],
  templateUrl: './feedback-chat.component.html',
  styleUrls: ['./feedback-chat.component.css']
})
export class FeedbackChatComponent implements OnInit {
  @ViewChild('scrollPanel') scrollPanel!: ScrollPanel;

  sessions: any[] = [];
  selectedSessionId: string = '';
  messages: any[] = [];
  newMessage = '';
  loading = false;
  newSessionMode = false;
  newSessionTitle = '';
  newSessionMessage = '';
  isTeacher: boolean = false;
userEmail: string = '';
editMessageId: string | null = null;
editedMessageContent: string = '';

  // הקלטה
  isRecording = false;
  mediaRecorder!: MediaRecorder;
  recordedChunks: Blob[] = [];
  recordedBlob: Blob | null = null;
userPhotoUrl: string = '';
adminPhotoUrl: string = '';
userRole: string | null = null;
openedMenuId: string | null = null;
  constructor(
    private feedbackService: FeedbackService,
    private sanitizer: DomSanitizer,
    public roleService: RoleService
  ) {}
isDialogOpen = false;

  openDialog() {
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
  }
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
    this.loadUserProfile();
  }

  // loadMessages() {
  //   if (!this.selectedSessionId) return;
  //   this.loading = true;
  //   this.feedbackService.getMessages(this.selectedSessionId).subscribe((msgs) => {
  //     this.messages = msgs;
  //     console.log('messages:', this.messages); // כאן הודפסה כל רשימת ההודעות
  //   msgs.forEach(msg => {
  //     console.log('msg:', msg); // כאן הודפס כל msg בנפרד
  //   });
  //     this.loading = false;
  //   });
  // }
loadMessages() {
  if (!this.selectedSessionId) return;
  this.loading = true;

  this.feedbackService.getMessages(this.selectedSessionId).subscribe((msgs) => {
    this.messages = msgs.map((msg) => ({
      ...msg,
      safeAudioUrl: msg.signedUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(msg.signedUrl) : null
    }));
    this.loading = false;
  });
}

// loadMessages() {
//   if (!this.selectedSessionId) return;
//   this.loading = true;
//   this.feedbackService.getMessages(this.selectedSessionId).subscribe((msgs) => {
//     this.messages = msgs.map(msg => ({
//       ...msg,
      
//       safeAudioUrl: msg.audioUrl ? this.sanitizer.bypassSecurityTrustUrl(msg.audioUrl) : null
//     }));

//     console.log('messages:', this.messages);
//     this.messages.forEach(msg => {
//       console.log('msg:', msg);
//     });

//     this.loading = false;
//   });
// }


//   sendMessage() {
//   if (!this.newMessage.trim() && !this.recordedBlob) return;
//   if (!this.selectedSessionId) return;

//   this.loading = true;

//   const formData = new FormData();
//   formData.append('content', this.newMessage.trim());
//   if (this.recordedBlob) {
//     const fileName = `recording-${Date.now()}.webm`;
//     formData.append('file', this.recordedBlob, fileName); // שימי לב: "file"
//   }

//   this.feedbackService.sendMessageWithAudio(this.selectedSessionId, formData).subscribe({
//     next: () => {
//       this.newMessage = '';
//       this.recordedBlob = null;
//       this.loadMessages();
//     },
//     error: (err) => {
//       console.error('Send message error:', err);
//       alert('שגיאה בשליחת ההודעה');
//       this.loading = false;
//     }
//   });
// }

sendMessage() {
  if (!this.newMessage.trim() && !this.recordedBlob) return;
  if (!this.selectedSessionId) return;

  this.loading = true;

  const formData = new FormData();
  formData.append('content', this.newMessage.trim());
  if (this.recordedBlob) {
    const fileName = `recording-${Date.now()}.webm`;
    formData.append('file', this.recordedBlob, fileName);
  }

  this.feedbackService.sendMessageWithAudio(this.selectedSessionId, formData).subscribe({
    next: (newMessage) => {
      this.newMessage = '';
      this.recordedBlob = null;
      this.loading = false;

      if (newMessage) {
        const processedMessage = {
          ...newMessage,
          isAudio: !!newMessage.signedUrl,
          isText: !!newMessage.content,
          safeAudioUrl: newMessage.signedUrl
            ? this.sanitizer.bypassSecurityTrustResourceUrl(newMessage.signedUrl)
            : null
        };

        // this.messages.push(processedMessage);
        console.log('new message', newMessage);

this.messages = [...this.messages, newMessage.data];

    setTimeout(() => this.scrollToBottom(), 100);
      }
    },
    error: (err) => {
      console.error('Send message error:', err);
      alert('שגיאה בשליחת ההודעה');
      this.loading = false;
    }
  });
}



// sendMessage() {
//   console.log("lllllllll");
//   alert("sendMessage");
//   if (!this.newMessage.trim() && !this.recordedBlob) return;
//   if (!this.selectedSessionId) return;

//   this.loading = true;

//   const formData = new FormData();
//   formData.append('content', this.newMessage.trim());
//   if (this.recordedBlob) {
//     const fileName = `recording-${Date.now()}.webm`;
//     formData.append('file', this.recordedBlob, fileName);
//   }

//   this.feedbackService.sendMessageWithAudio(this.selectedSessionId, formData).subscribe({
//     next: (newMessage) => {
//       this.newMessage = '';
//       this.recordedBlob = null;
//       this.loading = false;

//       // הוספה ישירה לרשימת ההודעות
//       if (newMessage) {
//         this.messages.push(newMessage);
//         // setTimeout(() => this.scrollToBottom(), 100);
//       }
//     },
//     error: (err) => {
//       console.error('Send message error:', err);
//       alert('שגיאה בשליחת ההודעה');
//       this.loading = false;
//     }
//   });
// }

toggleRecording() {
  if (!this.isRecording) {
    this.startRecording();
  } else {
    this.stopRecording();
  }
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
    const userId = this.roleService.getUserId() || 'undefined'; // Default user ID if not found
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
onAudioError(msg: any) {
  console.warn('בעיה בטעינת ההקלטה:', msg);
  // אפשר גם לשלוח את זה לשרת לצורכי ניטור
}

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  getSafeUrlFromBlob(blob: Blob): SafeResourceUrl {
  const url = URL.createObjectURL(blob);
  return this.sanitizer.bypassSecurityTrustResourceUrl(url);
}

// sendRecordingWithOptionalText() {
//   if (!this.recordedBlob || !this.selectedSessionId) return;

//   const formData = new FormData();
//   const fileName = `recording-${Date.now()}.webm`;
//   formData.append('audio', this.recordedBlob, fileName);
//   formData.append('sessionId', this.selectedSessionId);

//   if (this.newMessage.trim()) {
//     formData.append('content', this.newMessage.trim());
//   }

//   this.feedbackService.uploadAudioWithBackup(formData).subscribe({
//     next: () => {
//       this.recordedBlob = null;
//       this.newMessage = '';
//       this.loadMessages();
//     },
//     error: (err) => {
//       console.error('Upload error:', err);
//       alert('שגיאה בהעלאה');
//     }
//   });
// }


chunks: BlobPart[] = [];
recordingStartTime: number = 0;
recordingTime: Date = new Date(0);
recordingInterval: any;

startRecording() {
  this.isRecording = true;
  this.recordedBlob = null;
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    this.mediaRecorder = new MediaRecorder(stream);
    this.chunks = [];
    this.mediaRecorder.ondataavailable = e => {
      this.chunks.push(e.data);
    };

    this.mediaRecorder.onstop = () => {
      this.recordedBlob = new Blob(this.chunks, { type: 'audio/webm' });
      this.isRecording = false;
      clearInterval(this.recordingInterval);
    };

    this.mediaRecorder.start();
    this.startTimer();
  });
}

stopRecording() {
  this.mediaRecorder?.stop();
}

removeRecording() {
  this.recordedBlob = null;
  this.recordingTime = new Date(0);
}

startTimer() {
  this.recordingStartTime = Date.now();
  this.recordingTime = new Date(0);
  this.recordingInterval = setInterval(() => {
    const elapsed = Date.now() - this.recordingStartTime;
    this.recordingTime = new Date(elapsed);
  }, 500);
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
  this.feedbackService.updateMessage(this.selectedSessionId
,messageId, { content: this.editedMessageContent }).subscribe(() => {
    const msg = this.messages.find(m => m._id === messageId);
    if (msg) msg.content = this.editedMessageContent;
    this.cancelEdit();
  });
}
deleteMessage(messageId: string) {
  if (!confirm('האם למחוק את ההודעה?')) return;
  this.feedbackService.deleteMessage(this.selectedSessionId,messageId).subscribe(() => {
    this.messages = this.messages.filter(m => m._id !== messageId);
  });
}
toggleMenu(id: string) {
  this.openedMenuId = this.openedMenuId === id ? null : id;
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

trackByMessageId(index: number, msg: any): string {
  return msg._id;
}
openRecordingDialog() {
  this.isDialogOpen = true;
  console.log('Recording dialog opened');
}

closeRecordingDialog() {
  this.isDialogOpen = false;
}
@ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  scrollToBottom() {
    this.scrollPanel.moveBarToBottom();
  }

}
