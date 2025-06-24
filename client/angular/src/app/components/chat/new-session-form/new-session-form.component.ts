// import { Component, Input, Output, EventEmitter } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { EditorModule } from 'primeng/editor';
// import { ButtonModule } from 'primeng/button';

// export interface NewSessionData {
//   title: string;
//   targetUserId: string; // המשתמש שאליו השיחה מיועדת
// }

// @Component({
//   selector: 'app-new-session-form',
//   standalone: true,
//   imports: [CommonModule, FormsModule, EditorModule, ButtonModule],
//   templateUrl: './new-session-form.component.html',
//   styleUrls: ['./new-session-form.component.css']
// })
// export class NewSessionFormComponent {
//   @Input() isVisible: boolean = false;
  
//   @Output() sessionCreated = new EventEmitter<NewSessionData>();
//   @Output() cancelled = new EventEmitter<void>();

//   sessionTitle = '';
//   sessionMessage = '';

//   editorModules = {
//     toolbar: [
//       ['bold', 'italic', 'underline'],
//       [{ 'color': [] }, { 'background': [] }],
//       [{ 'font': [] }],
//       [{ 'align': [] }],
//       ['link', 'clean'],
//       [{ 'list': 'ordered'}, { 'list': 'bullet' }],
//     ]
//   };

//   onSubmit() {
//     this.sessionCreated.emit({
//       title: this.sessionTitle,
//       message: this.sessionMessage
//     });
//     this.reset();
//   }

//   onCancel() {
//     this.cancelled.emit();
//     this.reset();
//   }

//   private reset() {
//     this.sessionTitle = '';
//     this.sessionMessage = '';
//   }
// }

import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { User } from '../../../models/user.model'; // או הנתיב המתאים

export interface NewSessionData {
  title: string;
  targetUserId: string;
}

@Component({
  selector: 'app-new-session-form',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, ButtonModule],
  templateUrl: './new-session-form.component.html',
  styleUrls: ['./new-session-form.component.css']
})
export class NewSessionFormComponent implements OnInit {
  
  @Input() isVisible: boolean = false;
  @Input() allUsers: User[] = [];

  @Output() sessionCreated = new EventEmitter<NewSessionData>();
  @Output() cancelled = new EventEmitter<void>();

  sessionTitle = '';
  selectedUserId: string = '';

  filteredUsers: User[] = [];

  ngOnInit() {
    this.filteredUsers = this.allUsers;
      console.log("this.allUsers");
      console.log(this.allUsers);

  }

  onFilterUsers(event: any) {
    const query = event.query.toLowerCase();
    this.filteredUsers = this.allUsers.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }
 ngOnChanges(changes: SimpleChanges) {
    if (changes['allUsers']) {
      this.filteredUsers = this.allUsers;
      console.log('[NewSessionFormComponent] allUsers changed:', this.allUsers);
    }
  }
  onSubmit() {
    if (!this.selectedUserId) return;
    this.sessionCreated.emit({
      title: this.sessionTitle,
      targetUserId: this.selectedUserId
    });
    this.reset();
  }

  onCancel() {
    this.cancelled.emit();
    this.reset();
  }

  private reset() {
    this.sessionTitle = '';
    this.selectedUserId = '';
  }
}
