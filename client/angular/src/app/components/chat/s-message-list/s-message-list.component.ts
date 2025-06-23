import { Component, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollPanel, ScrollPanelModule } from 'primeng/scrollpanel';
import { MessageItemComponent } from '../message-item/message-item.component';
import { SMessageItemComponent } from '../s-message-item/s-message-item.component';
export interface MessageEditData {
  messageId: string;
  content: string;
}

@Component({
  selector: 'app-s-message-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ScrollPanelModule, SMessageItemComponent],
  templateUrl: './s-message-list.component.html',
  styleUrls: ['./s-message-list.component.css']
})
export class SMessageListComponent implements OnChanges {
    constructor(private cdr: ChangeDetectorRef) {} // הוסף זה
  @Input() firstUnreadIndex: number | null = null;
showScrollToBottom = false;

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

  // editMessageId: string | null = null;
  editedMessageContent: string = '';

  // ngOnChanges() {
  //   if (this.messages.length > 0) {
  //     setTimeout(() => this.scrollToBottom(), 300);
  //   }
  // }
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
// ngOnChanges(changes: SimpleChanges) {
//   if (changes['messages'] && this.messages.length > 0) {
//     setTimeout(() => this.scrollToBottom(), 300);
//   }

//   if (changes['editMessageId']) {
//     const newId = this.editMessageId;
//     if (newId) {
//       const msg = this.messages.find(m => m._id === newId);
//       if (msg) {
//         this.editedMessageContent = msg.content;
//       }
//     }
//   }
// }
  trackByMessageId(index: number, msg: any): string {
    return msg._id;
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
  if (!msg) return false;
  const isFirstUnread = !msg.isRead && this.messages.findIndex(m => !m.isRead) === index;
  return isFirstUnread;
}

}
