
// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { RecordService } from '../record.service';
// import { CommonModule } from '@angular/common';
// import { HttpClientModule } from '@angular/common/http';
// import { belongingOptions } from '../../../constants/belonging-options';
// import { CardModule } from 'primeng/card';
// import { ProgressSpinnerModule } from 'primeng/progressspinner';
// import { ButtonModule } from 'primeng/button';
// import { MessageModule } from 'primeng/message';
// import { ToastModule } from 'primeng/toast';
// import { TableModule } from 'primeng/table';
// import { FormsModule } from '@angular/forms';
// import { DropdownModule } from 'primeng/dropdown';
// import { InputTextModule } from 'primeng/inputtext';
// import { TreeSelectModule } from 'primeng/treeselect';
// import { SidebarModule } from 'primeng/sidebar';
// import { TreeModule } from 'primeng/tree';
// @Component({
//   selector: 'app-record-list',
//   standalone: true,
//   imports: [
//     CommonModule,
//     HttpClientModule,
//     MessageModule,
//     ButtonModule,
//     ProgressSpinnerModule,
//     CardModule,
//     ToastModule,
//     TableModule,
//     InputTextModule,
//     DropdownModule,
//     FormsModule,
//     TreeSelectModule,
//     SidebarModule,
//     TreeModule
//   ],
//   templateUrl: './record-list.component.html',
//   styleUrls: ['./record-list.component.css']
// })
// export class RecordListComponent implements OnInit, OnDestroy {
//   records: any[] = [];
//   loading = false;
//   searchName: string = '';
//   selectedParasha: string | null = null;
//   sidebarVisible = false;
//   private preventClose = false;
//   isMobile: boolean = false;

//   constructor(private recordService: RecordService) {}

//   belongingOptions = belongingOptions;

//   treeSelectOptions = this.generateTreeOptions();

//   ngOnInit() {
//     // this.loadRecords();
//     this.checkScreenSize();
//     window.addEventListener('resize', this.resizeListener);
//   }

//   ngOnDestroy() {
//     window.removeEventListener('resize', this.resizeListener);
//   }

//   private resizeListener = this.checkScreenSize.bind(this);

//   checkScreenSize() {
//     this.isMobile = window.innerWidth < 768;
//   }

//   loadRecords() {
//     this.loading = true;
//     this.recordService.getAllRecords().subscribe({
//       next: (data) => {
//         this.records = data;
//         this.loading = false;
//       },
//       error: (err) => {
//         console.error('Failed to load records:', err);
//         this.loading = false;
//       }
//     });
//   }

//   deleteRecord(id: string) {
//     if (confirm('את בטוחה שתרצי למחוק את ההקלטה?')) {
//       this.recordService.deleteRecord(id).subscribe({
//         next: () => {
//           this.records = this.records.filter(r => r._id !== id);
//         },
//         error: (err) => {
//           console.error('Failed to delete record:', err);
//         }
//       });
//     }
//   }

// showInitialMessage = true;
// applyFilters() {
//   const selected = (this.selectedParasha as any)?.key || null;
//   const hasFilter = this.searchName.trim() !== '' || selected;

//   this.showInitialMessage = false; // מסתיר את ההודעה

//   if (!hasFilter) {
//     this.loadRecords();
//     return;
//   }

//   this.loading = true;

//   this.recordService.getAllRecords().subscribe({
//     next: (data) => {
//       this.records = data.filter(rec => {
//         const matchName = !this.searchName ||
//           rec.recordName?.toLowerCase().includes(this.searchName.toLowerCase());

//         const matchParasha = selected ? rec.belonging?.includes(selected) : true;

//         return matchName && matchParasha;
//       });

//       this.loading = false;
//     },
//     error: (err) => {
//       console.error('Failed to filter records:', err);
//       this.loading = false;
//     }
//   });
// }

//   getBelongingLabels(values: string[] | string): string {
//     if (Array.isArray(values)) {
//       return values.map(v => {
//         const b = this.belongingOptions.find(opt => opt.value === v);
//         return b ? b.label : v;
//       }).join(', ');
//     } else {
//       const b = this.belongingOptions.find(opt => opt.value === values);
//       return b ? b.label : values;
//     }
//   }

//   getTypeLabel(value: string): string {
//     const types = [
//       { value: 't', label: 'תורה' },
//       { value: 'n', label: 'נביאים' },
//       { value: 'c', label: 'כתובים' }
//     ];
//     const type = types.find(t => t.value === value);
//     return type ? type.label : value;
//   }

//   generateTreeOptions() {
//     const grouped: { [key: string]: { label: string; value: string }[] } = {};
//     this.belongingOptions.forEach(opt => {
//       const [chumashId] = opt.value.split('.');
//       if (!grouped[chumashId]) grouped[chumashId] = [];
//       grouped[chumashId].push({ label: opt.label, value: opt.value });
//     });

//     const chumashNames: { [key: string]: string } = {
//       '1': 'בראשית',
//       '2': 'שמות',
//       '3': 'ויקרא',
//       '4': 'במדבר',
//       '5': 'דברים',
//       '7': 'חגים'
//     };

//     return Object.entries(grouped)
//       .filter(([chumashId]) => chumashNames[chumashId])
//       .map(([chumashId, parshiot]) => ({
//         label: chumashNames[chumashId],
//         key: chumashId,
//         children: parshiot.map(p => ({
//           label: p.label,
//           key: p.value
//         }))
//       }));
//   }


// hideSidebar() { this.sidebarVisible = false; }

// }
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RecordService } from '../../services/record.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { belongingOptions } from '../../constants/belonging-options';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TreeSelectModule } from 'primeng/treeselect';
import { SidebarModule } from 'primeng/sidebar';
import { TreeModule } from 'primeng/tree';
import { DrawerModule } from 'primeng/drawer';
import { FancyAudioPlayerComponent } from '../audioComponent/fancy-audio-player.component';
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
    ToastModule,
    TableModule,
    InputTextModule,
    DropdownModule,
    FormsModule,
    TreeSelectModule,
    SidebarModule,
    TreeModule,
    DrawerModule,
    FancyAudioPlayerComponent
  ],
  templateUrl: './record-list.component.html',
  styleUrls: ['./record-list.component.css']
})
export class RecordListComponent implements OnInit, OnDestroy {
  records: any[] = [];
  allRecords: any[] = []; // ⬅️ שינוי חדש: שמירת כל ההקלטות בזיכרון
  loading = false;
  searchName: string = '';
  selectedParasha: string | null = null;
  sidebarVisible = false;
  private preventClose = false;
  isMobile: boolean = false;

  constructor(private recordService: RecordService) {}

  belongingOptions = belongingOptions;

  treeSelectOptions = this.generateTreeOptions();
visible: boolean = false;

  ngOnInit() {
    this.loadRecords(); // ⬅️ שוחרר מתגובה – נטען בתחילה
    this.checkScreenSize();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeListener);
  }

  private resizeListener = this.checkScreenSize.bind(this);

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  loadRecords() {
    this.loading = true;
    this.recordService.getAllRecords().subscribe({
      next: (data) => {
        this.allRecords = data; // ⬅️ שומר בזיכרון
        this.records = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load records:', err);
        this.loading = false;
      }
    });
  }
onSidebarHide(event: any) {
  // תנאי לפי הצורך למנוע סגירה, למשל לפי מצב מסוים
  if (this.preventClose) {
    this.sidebarVisible = true; // מחזיר את הסיידבר לפתוח
  }
}

  deleteRecord(id: string) {
    if (confirm('את בטוחה שתרצי למחוק את ההקלטה?')) {
      this.recordService.deleteRecord(id).subscribe({
        next: () => {
          this.allRecords = this.allRecords.filter(r => r._id !== id); // ⬅️ עדכון כללי
          this.records = this.records.filter(r => r._id !== id);
        },
        error: (err) => {
          console.error('Failed to delete record:', err);
        }
      });
    }
  }

  showInitialMessage = true;

  // applyFilters() {
  //   const selected = (this.selectedParasha as any)?.key || null;
  //   const hasFilter = this.searchName.trim() !== '' || selected;

  //   this.showInitialMessage = false;

  //   if (!hasFilter) {
  //     this.records = [...this.allRecords]; // ⬅️ אין פילטר – מחזיר את הכל
  //     return;
  //   }

  //   this.records = this.allRecords.filter(rec => {
  //     const matchName = !this.searchName ||
  //       rec.recordName?.toLowerCase().includes(this.searchName.toLowerCase());

  //     const matchParasha = selected ? rec.belonging?.includes(selected) : true;

  //     return matchName && matchParasha;
  //   });
  // }
applyFilters() {
  const name = this.searchName.trim().toLowerCase();
  const selected = (this.selectedParasha as any)?.key || null;

  const hasNameFilter = name.length >= 2;
  const hasParashaFilter = !!selected;
  const hasAnyFilter = hasNameFilter || hasParashaFilter;

  this.showInitialMessage = false;

if (!hasAnyFilter) {
  this.records = []; // מציג רשימה ריקה במקום את הכל
  this.showInitialMessage = true; // למשל להחזיר את ההודעה הראשונית
  return;
}


  this.records = this.allRecords.filter(rec => {
    const matchName = hasNameFilter
      ? rec.recordName?.toLowerCase().includes(name)
      : true;

    const matchParasha = hasParashaFilter
      ? rec.belonging?.includes(selected)
      : true;

    return matchName && matchParasha;
  });
}

  getBelongingLabels(values: string[] | string): string {
    if (Array.isArray(values)) {
      return values.map(v => {
        const b = this.belongingOptions.find(opt => opt.value === v);
        return b ? b.label : v;
      }).join(', ');
    } else {
      const b = this.belongingOptions.find(opt => opt.value === values);
      return b ? b.label : values;
    }
  }

  getTypeLabel(value: string): string {
    const types = [
      { value: 't', label: 'קריאות התורה' },
      { value: 'n', label: 'הפטרות' },
      { value: 'c', label: 'מגילות' },
      { value: 'm', label: 'מפטיר' }

    ];
    const type = types.find(t => t.value === value);
    return type ? type.label : value;
  }

  generateTreeOptions() {
    const grouped: { [key: string]: { label: string; value: string }[] } = {};
    this.belongingOptions.forEach(opt => {
      const [chumashId] = opt.value.split('.');
      if (!grouped[chumashId]) grouped[chumashId] = [];
      grouped[chumashId].push({ label: opt.label, value: opt.value });
    });

    const chumashNames: { [key: string]: string } = {
      '1': 'בראשית',
      '2': 'שמות',
      '3': 'ויקרא',
      '4': 'במדבר',
      '5': 'דברים',
      '7': 'חגים'
    };

    return Object.entries(grouped)
      .filter(([chumashId]) => chumashNames[chumashId])
      .map(([chumashId, parshiot]) => ({
        label: chumashNames[chumashId],
        key: chumashId,
        children: parshiot.map(p => ({
          label: p.label,
          key: p.value
        }))
      }));
  }

  hideSidebar() {
    this.sidebarVisible = false;
  }
}
