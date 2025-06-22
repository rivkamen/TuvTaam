import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile-bar.component.html',
  styleUrls: ['./user-profile-bar.component.css']
})
export class UserProfileBarComponent {
  @Input() userEmail: string = '';
  @Input() userPhotoUrl: string = '';
}