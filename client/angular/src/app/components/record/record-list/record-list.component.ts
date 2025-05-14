import { Component, OnInit } from '@angular/core';
import { RecordService } from '../record.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { belongingOptions } from '../../../constants/belonging-options';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-record-list',
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
    ToastModule,
    TableModule
  ],
  templateUrl: './record-list.component.html',
  styleUrls: ['./record-list.component.css']
})
export class RecordListComponent implements OnInit {
  records: any[] = [];
  loading = false;
  types = [
    { value: 't', label: 'תורה' },
    { value: 'n', label: 'נביאים' },
    { value: 'c', label: 'כתובים' }
  ];

  belongingOptions = belongingOptions;
  constructor(private recordService: RecordService) {}

  ngOnInit() {
    this.loadRecords();
  }
  getTypeLabel(value: string): string {
  const type = this.types.find(t => t.value === value);
  return type ? type.label : value;
}

getBelongingLabels(values: string[] | string): string {
  if (Array.isArray(values)) {
    return values
      .map(v => {
        const b = this.belongingOptions.find(opt => opt.value === v);
        return b ? b.label : v;
      })
      .join(', ');
  } else {
    const b = this.belongingOptions.find(opt => opt.value === values);
    return b ? b.label : values;
  }
}


  loadRecords() {
    this.loading = true;
    this.recordService.getAllRecords().subscribe({
      next: (data) => {
        this.records = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load records:', err);
        this.loading = false;
      }
    });
  }

  deleteRecord(id: string) {
    if (confirm('את בטוחה שתרצי למחוק את ההקלטה?')) {
      this.recordService.deleteRecord(id).subscribe({
        next: () => {
          this.records = this.records.filter(r => r._id !== id);
        },
        error: (err) => {
          console.error('Failed to delete record:', err);
        }
      });
    }
  }
}
