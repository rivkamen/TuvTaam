import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HDate } from '@hebcal/core';

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
  @Output() deleteSession = new EventEmitter<string>();


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


onDeleteSession(sessionId: string) {
  const confirmed = confirm('האם את בטוחה שברצונך למחוק את השיחה?');
  if (confirmed) {
    this.deleteSession.emit(sessionId);
  }
}

getHebrewYearLetters(year: number): string {
  const letters: Record<number, string> = {
    1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה', 6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט',
    10: 'י', 20: 'כ', 30: 'ל', 40: 'מ', 50: 'נ', 60: 'ס', 70: 'ע', 80: 'פ', 90: 'צ',
    100: 'ק', 200: 'ר', 300: 'ש', 400: 'ת'
  };

  const specials: Record<number, string> = {
    15: 'טו', 16: 'טז'
  };

  let gYear = year % 1000; // משמיטים את האלף
  let result = '';

  const parts: string[] = [];

  const addPart = (val: number) => {
    while (gYear >= val) {
      const letter = letters[val];
      if (letter) {
        parts.push(letter);
        gYear -= val;
      } else {
        break;
      }
    }
  };

  [400, 300, 200, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10].forEach(addPart);

  // סיום – אחדות + טיפול ב-15/16
  if (specials[gYear]) {
    parts.push(specials[gYear]);
  } else {
    addPart(9);
    addPart(8);
    addPart(7);
    addPart(6);
    addPart(5);
    addPart(4);
    addPart(3);
    addPart(2);
    addPart(1);
  }

  // עיבוד גרשיים: בין לפני האחרונה לאחרונה
  if (parts.length >= 2) {
    const last = parts.pop();
    result = parts.join('') + '"' + last;
  } else if (parts.length === 1) {
    result = parts[0] + "'";
  }

  return result;
}

toHebrewDate(date: Date) {
    const hdate = new HDate(new Date(date));   return {
    day: hdate.getDate(),
    month: hdate.getMonth(), // שימי לב שזה 1-based
    year: hdate.getFullYear()
  };
}
getHebrewLetters(num: number): string {
  const letters :Record<string, string> = {
    1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה', 6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט',
    10: 'י', 20: 'כ', 30: 'ל', 40: 'מ', 50: 'נ', 60: 'ס', 70: 'ע', 80: 'פ', 90: 'צ',
    100: 'ק', 200: 'ר', 300: 'ש', 400: 'ת'
  };

  let result = '';
  const specials: { [key: number]: string } = {15: 'טו', 16: 'טז'}; // תיקון לח"י

  if (specials[num]) return specials[num];

const parts: string[] = [];
  let n = num;

  const addPart = (value: number) => {
    while (n >= value) {
      parts.push(letters[String(value)]);
      n -= value;
    }
  };

  [400, 300, 200, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].forEach(addPart);

  // אם רוצים גרשיים (לדוגמה י"ט), אפשר להוסיף פה עיבוד:
  if (parts.length > 1) {
    const last = parts.pop();
    return parts.join('') + '"' + last;
  } else {
    return parts[0] + "'";
  }
}

getHebrewDate(date: Date): string {
  const months = [
    'תשרי', 'חשוון', 'כסלו', 'טבת', 'שבט', 'אדר', 'אדר ב׳',
    'ניסן', 'אייר', 'סיוון', 'תמוז', 'אב', 'אלול'
  ];

  const hebrew = this.toHebrewDate(date); // מחזיר { day, month, year }
  const dayInLetters = this.getHebrewLetters(hebrew.day);
  const monthName = months[hebrew.month - 1];
  const yearInLetters =this.getHebrewYearLetters(hebrew.year); 

  return `${dayInLetters} ב${monthName} ${yearInLetters}`;
}

  getUnreadCount(session: any): number {
  return session.messages?.filter((msg: any) => !msg.isRead && msg.fromUser)?.length || 0;
}
trackBySessionId(index: number, session: any): string {
  return session._id;
}

}


