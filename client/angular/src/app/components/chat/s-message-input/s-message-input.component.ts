import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecordingComponent } from '../../recording/recording.component';

export interface MessageData {
  content: string;
  audioBlob?: Blob;
}

@Component({
  selector: 'app-s-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule, RecordingComponent],
  templateUrl: './s-message-input.component.html',
  styleUrls: ['./s-message-input.component.css']
})
export class SMessageInputComponent {
  @Input() loading: boolean = false;
  
  @Output() messageSent = new EventEmitter<MessageData>();
  @Output() recordingRequested = new EventEmitter<void>();
@ViewChild('textArea') textArea!: ElementRef<HTMLTextAreaElement>;

  messageContent = '';
  recordedBlob: Blob | null = null;
  isRecording = false;
  isRecordingDialogOpen = false;


  onSendMessage(textarea?: HTMLTextAreaElement) {
    if (!this.messageContent.trim() && !this.recordedBlob) return;

    this.messageSent.emit({
      content: this.messageContent.trim(),
      audioBlob: this.recordedBlob || undefined
    });

  this.resetInput();

  // איפוס גובה התיבה
  if (textarea) {
    textarea.style.height = 'auto';
  }  }
  onOpenRecording() {
    this.isRecordingDialogOpen = true;
  }

  onRecordingClosed() {
    this.isRecordingDialogOpen = false;
  }

  onAudioRecorded(blob: Blob) {
    this.recordedBlob = blob;
    this.isRecordingDialogOpen = false;
    this.onSendMessage();
  }

  private resetInput() {
    this.messageContent = '';
    this.recordedBlob = null;
  }
  autoGrow() {
  const textAreaEl = this.textArea?.nativeElement;
  if (textAreaEl) {
    textAreaEl.style.height = 'auto';
    textAreaEl.style.height = textAreaEl.scrollHeight + 'px';
  }
}

handleEnter(event: Event) {
  const keyboardEvent = event as KeyboardEvent;

  if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
    keyboardEvent.preventDefault();
    const textarea = this.textArea?.nativeElement;
    this.onSendMessage(textarea);
  }
}
}