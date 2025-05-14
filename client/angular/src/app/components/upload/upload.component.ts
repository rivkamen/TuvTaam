import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadService } from '../../services/upload.service';
import { belongingOptions } from '../../constants/belonging-options';


import { HttpClientModule } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-upload',
  standalone: true,
 imports: [
    CommonModule,
    HttpClientModule,
    MessageModule,
    ButtonModule,
    ProgressSpinnerModule,
    CardModule,
    CommonModule,
    HttpClientModule,
  ],
    templateUrl: './upload.component.html',
})
export class UploadComponent {
  recordName = '';
  type: 't' | 'n' | 'c' = 't';
  belonging = '';
  isSpecial = false;
  selectedFile: File | null = null;

  types = [
    { value: 't', label: 'תורה' },
    { value: 'n', label: 'נביאים' },
    { value: 'c', label: 'כתובים' }
  ];

  belongingOptions = belongingOptions;

  constructor(private uploadService: UploadService) {}

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (!this.selectedFile || !this.recordName || !this.type || !this.belonging) {
      alert('נא למלא את כל השדות ולהעלות קובץ');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('recordName', this.recordName);
    formData.append('type', this.type);
    formData.append('belonging', this.belonging);
    formData.append('IsSpecial', this.isSpecial.toString());

    this.uploadService.uploadFileWithMetadata(formData).subscribe(
      res => alert('ההקלטה נשמרה בהצלחה'),
      err => alert('אירעה שגיאה בהעלאה')
    );
  }
}
