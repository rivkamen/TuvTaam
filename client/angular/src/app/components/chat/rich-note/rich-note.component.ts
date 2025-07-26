
import { Component, ViewChild, ElementRef, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../../services/feedback.service';
import { Message } from '../../../services/session.service';

@Component({
  selector: 'app-rich-note',
  templateUrl: './rich-note.component.html',
  styleUrls: ['./rich-note.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class RichNoteComponent {
  @ViewChild('editor') editorRef!: ElementRef<HTMLDivElement>;
  @Input() sessionId!: string;
  @Output() closed = new EventEmitter<void>();
@Input() htmlContent: string = '';
@Output() htmlContentChange = new EventEmitter<string>();
@Input() editingMessage: Message | null | undefined = null;
@Output() saved = new EventEmitter<void>();

  activeTab: 'basic' | 'table' = 'basic';
  tableRows = 2;
  tableCols = 2;
  tableWidth = '100%';
  tableHeight = 'auto';

  constructor(private feedbackService: FeedbackService) {}

  execCommand(command: string) {
    document.execCommand(command, false, '');
  }
ngAfterViewInit() {
  if (this.htmlContent && this.editorRef) {
    this.editorRef.nativeElement.innerHTML = this.htmlContent;
  }
}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingMessage']) {
      console.log('📌 editingMessage השתנה:', changes['editingMessage'].currentValue);
    }
  }
  execCommandWithArg(command: string, arg: string) {
    document.execCommand(command, false, arg);
  }

  onColorChange(event: Event, command: string) {
    const input = event.target as HTMLInputElement;
    if (!input) return;
    const value = input.value;
    this.execCommandWithArg(command, value);
  }

getTableFromCell(cell: HTMLTableCellElement): HTMLTableElement | null {
  return cell.closest('table');
}

addRowBelow() {
  const cell = this.getSelectedTableCell();
  if (!cell) return;

  const row = cell.parentElement as HTMLTableRowElement;
  const table = this.getTableFromCell(cell);
  if (!table) return;

  const newRow = row.cloneNode(true) as HTMLTableRowElement;
  newRow.querySelectorAll('td').forEach(td => td.innerHTML = '<span>&nbsp;</span>');
  table.insertBefore(newRow, row.nextSibling);
}

addColumnRight() {
  const cell = this.getSelectedTableCell();
  if (!cell) return;

  const table = this.getTableFromCell(cell);
  if (!table) return;

  const cellIndex = (cell as HTMLTableCellElement).cellIndex;

  table.querySelectorAll('tr').forEach(row => {
    const td = document.createElement('td');
td.innerHTML = '<span>&nbsp;</span>';
    td.setAttribute('style', cell.getAttribute('style') || '');
    (row as HTMLTableRowElement).insertBefore(td, row.children[cellIndex + 1]);
  });
}
getSelectedTableCell(): HTMLTableCellElement | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  let node = range.startContainer;

  // אם זה טקסט בתוך td - נטפס למעלה עד שנגיע ל-HTMLElement
  while (node && node.nodeType !== Node.ELEMENT_NODE) {
    node = node.parentNode!;
  }

  if (!(node instanceof HTMLElement)) return null;

  return node.closest('td');
}

deleteRow() {
  const cell = this.getSelectedTableCell();
  if (!cell) return;

  const row = cell.parentElement as HTMLTableRowElement;
  row.remove();
}

deleteColumn() {
  const cell = this.getSelectedTableCell();
  if (!cell) return;

  const table = this.getTableFromCell(cell);
  if (!table) return;

  const cellIndex = (cell as HTMLTableCellElement).cellIndex;

  table.querySelectorAll('tr').forEach(row => {
    (row as HTMLTableRowElement).deleteCell(cellIndex);
  });
}

deleteTable() {
  const cell = this.getSelectedTableCell();
  if (!cell) return;

  const table = this.getTableFromCell(cell);
  if (table) table.remove();
}

insertTable() {
  const rows = this.tableRows;
  const cols = this.tableCols;
  const width = this.tableWidth;
  const height = this.tableHeight;

  let table = `<table class="rich-table" border="1" 
      style="border-collapse: collapse; width: ${width}; height: ${height}; 
             table-layout: fixed; direction: rtl;">
  `;

  for (let i = 0; i < rows; i++) {
    table += '<tr>';
    for (let j = 0; j < cols; j++) {
      table += `<td style="
        word-wrap: break-word;
        overflow-wrap: break-word;
        white-space: normal;
        padding: 8px;
        vertical-align: top;
        min-width: 100px;
      ">&nbsp;</td>;`
    }
    table += '</tr>';
  }

  table += '</table><br/>';
  this.execCommandWithArg('insertHTML', table);
}

  // sendRichMessage() {
  //   const rawHtml = this.editorRef.nativeElement.innerHTML.trim();
  //   const textOnly = this.editorRef.nativeElement.innerText.trim();

  //   if (!textOnly) {
  //     alert("לא ניתן לשלוח הודעה ריקה");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append('content', rawHtml);
  //   formData.append('type', 'rich');
  //   formData.append('fromUser', 'false');

  //   this.feedbackService.sendMessageWithAudio(this.sessionId, formData).subscribe({
  //     next: () => {
  //       console.log('%c💬 הודעה עשירה נשלחה!', 'color: purple; font-weight: bold;');
  //       this.editorRef.nativeElement.innerHTML = '';
  //       this.closed.emit();
  //     },
  //     error: err => {
  //       console.error('%cשגיאה בשליחה', 'color: red;', err);
  //     }
  //   });
  // }
submitRichMessage() {
  const rawHtml = this.editorRef.nativeElement.innerHTML.trim();
  const textOnly = this.editorRef.nativeElement.innerText.trim();

  if (!textOnly) {
    alert("לא ניתן לשלוח הודעה ריקה");
    return;
  }

if (this.editingMessage && this.editingMessage._id) {
  console.log("dfdfdf");
  
  console.log("yes, editingMessage is set:", this.editingMessage, this.editingMessage._id);
  
    // עדכון הודעה קיימת
  this.htmlContentChange.emit(this.editorRef.nativeElement.innerHTML);

  // קריאה לפונקציה מההורה (לשמור)
  this.saved.emit();
  } else {
    console.log("elsee");

    // יצירת הודעה חדשה
    const formData = new FormData();
    formData.append('content', rawHtml);
    formData.append('type', 'rich');
    formData.append('fromUser', 'false');

    this.feedbackService.sendMessageWithAudio(this.sessionId, formData).subscribe({
      next: () => {
        console.log('%c💬 הודעה חדשה נשלחה!', 'color: purple; font-weight: bold;');
        this.editorRef.nativeElement.innerHTML = '';
        this.closed.emit();
      },
      error: err => {
        console.error('%cשגיאה בשליחה', 'color: red;', err);
      }
    });
  }
}

  downloadAsHtml() {
    const content = this.editorRef.nativeElement.innerHTML;
    const fullHtml = 
      `<html dir="rtl" lang="he">
        <head><meta charset="UTF-8"></head>
        <body style="direction: rtl; text-align: right;">
          ${content}
        </body>
      </html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'תיקון-לתלמיד.html';
    link.click();
    URL.revokeObjectURL(link.href);
  }
//   submitRichMessage() {
//   // שליחת התוכן למעלה
//   this.htmlContentChange.emit(this.editor.nativeElement.innerHTML);

//   // קריאה לפונקציה מההורה (לשמור)
//   this.saved.emit();
// }
}