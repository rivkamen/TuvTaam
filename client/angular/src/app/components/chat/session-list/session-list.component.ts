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
    this.sessionSelected.emit(sessionId);
  }

  onNewSession() {
    this.newSessionRequested.emit();
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
}