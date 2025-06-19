import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { ButtonModule } from 'primeng/button';

export interface NewSessionData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-new-session-form',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorModule, ButtonModule],
  templateUrl: './new-session-form.component.html',
  styleUrls: ['./new-session-form.component.css']
})
export class NewSessionFormComponent {
  @Input() isVisible: boolean = false;
  
  @Output() sessionCreated = new EventEmitter<NewSessionData>();
  @Output() cancelled = new EventEmitter<void>();

  sessionTitle = '';
  sessionMessage = '';

  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'clean'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ]
  };

  onSubmit() {
    this.sessionCreated.emit({
      title: this.sessionTitle,
      message: this.sessionMessage
    });
    this.reset();
  }

  onCancel() {
    this.cancelled.emit();
    this.reset();
  }

  private reset() {
    this.sessionTitle = '';
    this.sessionMessage = '';
  }
}