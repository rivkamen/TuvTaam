import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule,HttpClientModule],
  templateUrl: './upload.component.html',
})
export class UploadComponent {
  constructor(private uploadService: UploadService) {}

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.uploadService.uploadFile(file).subscribe(response => {
        console.log('Upload success:', response);
      });
    }
  }
}
