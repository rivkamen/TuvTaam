import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-s-session-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './s-session-list.component.html',
  styleUrls: ['./s-session-list.component.css']
})
export class SSessionListComponent {
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
  if (!dateStr) {
    return 'תאריך לא זמין';
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return 'תאריך שגוי';
  }

  const formatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return formatter.format(date);
}


}