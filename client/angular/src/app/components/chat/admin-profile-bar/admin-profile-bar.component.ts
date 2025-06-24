import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-profile-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-profile-bar.component.html',
  styleUrls: ['./admin-profile-bar.component.css']
})
export class AdminProfileBarComponent {
  @Input() userEmail: string = '';
  @Input() adminPhotoUrl: string = '';
}