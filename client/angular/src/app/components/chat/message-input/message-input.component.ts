import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecordingComponent } from '../../recording/recording.component';

export interface MessageData {
  content: string;
  audioBlob?: Blob;
}

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule, RecordingComponent],
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.css']
})
export class MessageInputComponent {
  @Input() loading: boolean = false;
  
  @Output() messageSent = new EventEmitter<MessageData>();
  @Output() recordingRequested = new EventEmitter<void>();

  messageContent = '';
  recordedBlob: Blob | null = null;
  isRecording = false;
  isRecordingDialogOpen = false;

  onSendMessage() {
    if (!this.messageContent.trim() && !this.recordedBlob) return;

    this.messageSent.emit({
      content: this.messageContent.trim(),
      audioBlob: this.recordedBlob || undefined
    });

    this.resetInput();
  }

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
}