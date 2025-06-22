import {
  Component, Input, Output, EventEmitter,
  HostListener, ElementRef, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FancyAudioPlayerComponent } from '../../audioComponent/fancy-audio-player.component';

export interface MessageEditData {
  messageId: string;
  content: string;
}

@Component({
  selector: 'app-s-message-item',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, FancyAudioPlayerComponent],
  templateUrl: './s-message-item.component.html',
  styleUrls: ['./s-message-item.component.css']
})
export class SMessageItemComponent implements OnChanges {
  @Input() message: any;
  @Input() isEditing: boolean = false;
  @Input() editedContent: string = '';

  @Output() editStarted = new EventEmitter<any>();
  @Output() editSaved = new EventEmitter<MessageEditData>();
  @Output() editCancelled = new EventEmitter<void>();
  @Output() messageDeleted = new EventEmitter<string>();
  @Output() menuToggled = new EventEmitter<string>();
  @Input() editMessageId: string | null = null;

  localEditedContent: string = '';
  openedMenuId: string | null = null;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.localEditedContent = this.message?.content || '';
  }

  // הוספת OnChanges כדי לעדכן את התוכן כשמתחילים עריכה
  ngOnChanges(changes: SimpleChanges) {
    if (changes['isEditing'] && this.isEditing) {
      this.localEditedContent = this.message?.content || '';
    }
  }

  startEdit() {
    this.localEditedContent = this.message?.content || '';
    this.editStarted.emit(this.message);
    this.openedMenuId = null;
  }

  saveEdit() {
    this.editSaved.emit({
      messageId: this.message._id,
      content: this.localEditedContent
    });
  }

  cancelEdit() {
    this.localEditedContent = this.message?.content || '';
    this.editCancelled.emit();
  }

  log(...args: any[]) {
    console.log(...args);
    return true;
  }

  deleteMessage() {
    if (confirm('האם למחוק את ההודעה?')) {
      this.messageDeleted.emit(this.message._id);
    }
    this.openedMenuId = null;
  }

  toggleMenu() {
    this.openedMenuId = this.openedMenuId === this.message._id ? null : this.message._id;
    this.menuToggled.emit(this.message._id);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.openedMenuId = null;
    }
  }
}