import { Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Message, FeedbackService } from '../../../services/feedback.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RoleService } from '../../../services/role.service';
import {RecordingComponent} from '../../recording/recording.component';
import { ViewChild } from '@angular/core';
import { ScrollPanel } from 'primeng/scrollpanel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { MAudioPlayerComponent } from '../../managerAudio/m-audio-player.component';
import { FancyAudioPlayerComponent } from '../../audioComponent/fancy-audio-player.component';
import { AAudioPlayerComponent } from '../../audio/audio.component';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { SpeedDialModule } from 'primeng/speeddial';
import { ViewChildren, QueryList } from '@angular/core';
import { EditorModule } from 'primeng/editor';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-m-feedback-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RecordingComponent, ScrollPanelModule, FancyAudioPlayerComponent, ButtonModule, SpeedDialModule, EditorModule],
  templateUrl: './m-feedback-chat.component.html',
  styleUrls: ['./m-feedback-chat.component.css']
})
export class MFeedbackChatComponent implements OnInit {

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
firstUnreadMessageId: string | null = null;

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
@ViewChild('messagesContainer') private messagesContainer!: ElementRef;
@ViewChildren('menuWrapper') menuWrappers!: QueryList<ElementRef>;
@ViewChild('scrollContainer') scrollContainer!: ElementRef;
@ViewChild('scrollPanel') scrollPanelRef!: ScrollPanel;
editorModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],        // עיצוב טקסט
    [{ 'color': [] }, { 'background': [] }], // צבעים
    [{ 'font': [] }],                        // פונט
    [{ 'align': [] }],                       // יישור
    ['link', 'clean'],                       // קישור וניקוי
    [{ 'list': 'ordered'}, { 'list': 'bullet' }], // רשימות
  ]
};

getMenuItems(msg: Message): MenuItem[] {
  return [
    {
      label: 'עריכה',
      icon: 'pi pi-pencil',
      command: () => this.startEdit(msg)
    },
    {
      label: 'מחיקה',
      icon: 'pi pi-trash',
      command: () => {this.deleteMessage(msg._id)}
    }
  ];
}
log(msg: any) {
  console.log('Message:', msg);
  return '';
}

  openDialog() {
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
  }
  ngOnInit() {
  this.loadSessions();
  const firstUnread = this.messages.find(m => !m.isRead);
  this.firstUnreadMessageId = firstUnread?._id ?? null;
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
    console.log();
    
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

      safeAudioUrl: msg.signedUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(msg.signedUrl) : null
    }));
    this.loading = false;
    this.feedbackService.markAllMessagesAsRead(this.selectedSessionId).subscribe({
      next: () => console.log("עודכן כנקראו"),
      error: (err) => console.error("שגיאה בעדכון isRead", err)
    });
  });
}


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

  if (newMessage?.data) {
    const data = newMessage.data;

    const processedMessage = {
      ...data,
      isAudio: !!data.signedUrl,
      isText: !!data.content,
      signedUrl: data.signedUrl || null, // הוספה
      safeAudioUrl: data.signedUrl
        ? this.sanitizer.bypassSecurityTrustResourceUrl(data.signedUrl)
        : null
    };

    this.messages = [...this.messages, processedMessage];

    setTimeout(() => this.scrollToBottom(), 300);
  } else {
    console.warn('⚠️ newMessage לא הכיל שדה data:', newMessage);
  }


    },
    

    error: (err) => {
      console.error('Send message error:', err);
      alert('שגיאה בשליחת ההודעה');
      this.loading = false;
    }
  });
}

handleRecordedAudio(blob: Blob) {
  this.recordedBlob = blob;
  this.sendMessage();
}
getHebrewDate(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return formatter.format(date);
}



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
      { content: initialMessage, fromUser: false}
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



chunks: BlobPart[] = [];
recordingStartTime: number = 0;
recordingTime: Date = new Date(0);
recordingInterval: any;
isDropdownOpen = false;

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
deleteMessage(messageId: string | undefined) {
  if (!messageId) return;
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
      console.log(userSession.userId[0]);
      
      this.userEmail = userSession.userId[0].email;
       this.userPhotoUrl = 'assets/student.gif'; 
      this.adminPhotoUrl = 'assets/teacher.gif';
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
@HostListener('document:click', ['$event'])
onClickOutside(event: MouseEvent): void {

  if (!this.openedMenuId) return;

const clickedInsideSomeMenu = this.menuWrappers?.toArray().some(wrapper =>
  wrapper.nativeElement.contains(event.target)
);

  if (!clickedInsideSomeMenu) {
    this.openedMenuId = null;
  }
}

scrollToBottom() {
  setTimeout(() => {
    const scrollContentEl = this.scrollPanelRef?.el?.nativeElement?.querySelector('.p-scrollpanel-content');
    if (scrollContentEl) {
      scrollContentEl.scrollTop = scrollContentEl.scrollHeight;
    }
  }, 100);
}


}
