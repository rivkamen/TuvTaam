import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from '../../services/upload.service';


import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { belongingOptions } from '../../constants/belonging-options';
@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    DropdownModule,
    MultiSelectModule,
    CheckboxModule,
    ButtonModule,
    CommonModule
  ],
    templateUrl: './upload.component.html',
})
export class UploadComponent {
  recordName = '';
  recordSource='';
  type: 't' | 'n' | 'c' = 't';
belonging: string[] = [];
  isSpecial = false;
  selectedFile: File | null = null;

  types = [
  { value: 't', label: 'קריאות התורה' },
      { value: 'n', label: 'הפטרות' },
      { value: 'c', label: 'מגילות' },
      { value: 'm', label: 'מפטיר' }
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
    if (!this.selectedFile || !this.recordName ||!this.recordSource|| !this.type || !this.belonging) {
      alert('נא למלא את כל השדות ולהעלות קובץ');
      return;
    }
console.log("formData");

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('recordName', this.recordName);
    formData.append('recordSource', this.recordSource);
    formData.append('type', this.type);
    // formData.append('belonging', this.belonging);
  this.belonging.forEach(val => formData.append('belonging', val));


    formData.append('IsSpecial', this.isSpecial.toString());

    this.uploadService.uploadFileWithMetadata(formData).subscribe(
      res => alert('ההקלטה נשמרה בהצלחה'),
      err => alert(`${formData}אירkklkעה שגיאה בהעלאה`)
    );
  }
}
