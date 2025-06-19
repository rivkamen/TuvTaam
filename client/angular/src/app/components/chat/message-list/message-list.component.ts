import { Component, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
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
  imports: [CommonModule, ScrollPanelModule, MessageItemComponent],
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent implements OnChanges, AfterViewInit  {
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

  // editMessageId: string | null = null;
  editedMessageContent: string = '';

  // ngOnChanges() {
  //   if (this.messages.length > 0) {
  //     setTimeout(() => this.scrollToBottom(), 300);
  //   }
  // }
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
ngOnChanges(changes: SimpleChanges) {
  if (changes['messages'] && this.messages.length > 0) {
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

  trackByMessageId(index: number, msg: any): string {
    return msg._id;
  }
ngAfterViewInit() {
  this.scrollToUnreadDivider();
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
//   shouldShowUnreadDivider(index: number): boolean {
//   const msg = this.messages[index];
//   if (!msg) return false;
//   const isFirstUnread = !msg.isRead && this.messages.findIndex(m => !m.isRead) === index;
//   return isFirstUnread;
// }

shouldShowUnreadDivider(index: number): boolean {
  const msg = this.messages[index];
  const isUnread = !msg?.isRead;
  const firstUnreadIndex = this.messages.findIndex(m => !m.isRead);
  const isFirstUnread = index === firstUnreadIndex;

  return isUnread && isFirstUnread;
}



}
