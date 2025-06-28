import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.css']
})
export class SessionListComponent {
  @Input() sessions: any[] = [];
  @Input() selectedSessionId: string = '';
  
  @Output() sessionSelected = new EventEmitter<string>();
  @Output() newSessionRequested = new EventEmitter<void>();


  onSessionSelect(sessionId: string) {
    console.log('[SessionListComponent] session selected:', sessionId); // ✅ להוסיף

    this.sessionSelected.emit(sessionId);
  }

  onNewSession() {
    console.log('[SessionListComponent] new session button clicked');

    this.newSessionRequested.emit();
  }
  ngOnChanges() {
  console.log('sessions received:', this.sessions);
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
  getUnreadCount(session: any): number {
  return session.messages?.filter((msg: any) => !msg.isRead && msg.fromUser)?.length || 0;
}
trackBySessionId(index: number, session: any): string {
  return session._id;
}

}


