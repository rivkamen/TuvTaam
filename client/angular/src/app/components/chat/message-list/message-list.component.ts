import { Component, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollPanel, ScrollPanelModule } from 'primeng/scrollpanel';
import { MessageItemComponent } from '../message-item/message-item.component';
import { ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';

export interface MessageEditData {
  messageId: string;
  content: string;
}

@Component({
  selector: 'app-message-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ScrollPanelModule, MessageItemComponent],
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent implements OnChanges, AfterViewInit  {
  constructor(private cdr: ChangeDetectorRef) {} // הוסף זה

  @Input() messages: any[] = [];
  @Input() loading: boolean = false;
  @Input() userPhotoUrl: string = '';
  @Input() adminPhotoUrl: string = '';
  
  @Output() editStarted = new EventEmitter<any>();
  @Output() editSaved = new EventEmitter<MessageEditData>();
  @Output() editCancelled = new EventEmitter<void>();
  @Output() messageDeleted = new EventEmitter<string>();
  @Output() menuToggled = new EventEmitter<string>();
@Input() editMessageId: string | null = null;
@Input() editedContent: string = '';
@ViewChild('scrollPanel') scrollPanelRef!: ScrollPanel;
@ViewChildren('unreadDivider') unreadDividers!: QueryList<ElementRef>;
@Input() firstUnreadIndex: number | null = null;
showScrollToBottom = false;

  editedMessageContent: string = '';


ngOnChanges(changes: SimpleChanges) {

 if (changes['messages'] && this.messages.length > 0) {
      this.cdr.detectChanges(); // הוסף זה
      setTimeout(() => {
        if (this.firstUnreadIndex != null && this.firstUnreadIndex >= 0) {
          this.scrollToUnread();
        } else {
          this.scrollToBottom();
        }
      }, 300);
    }

  if (changes['editMessageId']) {
    const newId = this.editMessageId;
    if (newId) {
      const msg = this.messages.find(m => m._id === newId);
      if (msg) {
        this.editedMessageContent = msg.content;
      }
    }
  }
}
scrollToUnread() {
  setTimeout(() => {
    const el = this.unreadDividers?.first?.nativeElement;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      this.scrollToBottom();
    }
  }, 100);
}
onScroll(event: any) {
  const scrollContainer = this.scrollPanelRef?.el?.nativeElement?.querySelector('.p-scrollpanel-content');
  if (!scrollContainer) return;

  const scrollTop = scrollContainer.scrollTop;
  const scrollHeight = scrollContainer.scrollHeight;
  const clientHeight = scrollContainer.clientHeight;

  // הצג כפתור רק אם המשתמש לא בתחתית (תוך מרווח ביטחון)
  this.showScrollToBottom = (scrollTop + clientHeight + 100) < scrollHeight;
}

  trackByMessageId(index: number, msg: any): string {
    return msg._id;
  }
// ngAfterViewInit() {
//   this.scrollToUnreadDivider();
// }

ngAfterViewInit() {
  this.scrollToUnreadDivider();

  const scrollContentEl = this.scrollPanelRef?.el?.nativeElement?.querySelector('.p-scrollpanel-content');
  if (scrollContentEl) {
    scrollContentEl.addEventListener('scroll', () => this.checkScrollPosition(scrollContentEl));
  }
}
checkScrollPosition(scrollContentEl: HTMLElement) {
  const scrollTop = scrollContentEl.scrollTop;
  const scrollHeight = scrollContentEl.scrollHeight;
  const clientHeight = scrollContentEl.clientHeight;

  // מופעל אם המשתמש לא בתחתית
  this.showScrollToBottom = (scrollTop + clientHeight + 80) < scrollHeight;
}

scrollToUnreadDivider() {
  setTimeout(() => {
    const element = this.unreadDividers?.first?.nativeElement;
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 200);
}

  onEditStarted(message: any) {
    this.editMessageId = message._id;
    this.editedMessageContent = message.content;
    this.editStarted.emit(message);
  }

  onEditSaved(data: MessageEditData) {
    this.editSaved.emit(data);
    this.editMessageId = null;
    this.editedMessageContent = '';
  }

  onEditCancelled() {
    this.editMessageId = null;
    this.editedMessageContent = '';
    this.editCancelled.emit();
  }

  onMessageDeleted(messageId: string) {
    this.messageDeleted.emit(messageId);
  }

  onMenuToggled(messageId: string) {
    this.menuToggled.emit(messageId);
  }

  scrollToBottom() {
    setTimeout(() => {
      const scrollContentEl = this.scrollPanelRef?.el?.nativeElement?.querySelector('.p-scrollpanel-content');
      if (scrollContentEl) {
        scrollContentEl.scrollTop = scrollContentEl.scrollHeight;
      }
    }, 100);
  }


shouldShowUnreadDivider(index: number): boolean {
  
  const msg = this.messages[index];
  const isUnread = !msg?.isRead;
  const isFromOtherSide = msg?.fromUser; // רק אם ההודעה מהצד השני
  const firstUnreadIndex = this.messages.findIndex(m => !m.isRead && m.fromUser);
  const isFirstUnread = index === firstUnreadIndex;

  return isUnread && isFromOtherSide && isFirstUnread;
}


}
