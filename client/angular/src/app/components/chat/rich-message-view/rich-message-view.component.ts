import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
@Component({
  selector: 'app-rich-message-view',
  templateUrl: './rich-message-view.component.html',
  styleUrls: ['./rich-message-view.component.css'],
  standalone: true,
  imports: [ButtonModule, RippleModule],
})
export class RichMessageViewComponent {
  @Input() rawHtml: string = '';
  @Output() closed = new EventEmitter<void>();

  content: SafeHtml | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  // ngOnInit(): void {
  //   this.content = this.sanitizer.bypassSecurityTrustHtml(this.rawHtml);
  // }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rawHtml'] && this.rawHtml) {
      this.content = this.sanitizer.bypassSecurityTrustHtml(this.rawHtml);
    }
  }
  downloadAsHtml() {
    const blob = new Blob([this.rawHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'תיקון-לתלמיד.html';
    a.click();
    URL.revokeObjectURL(url);
  }
downloadAsWord() {
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>תיקון לתלמיד</title></head>
      <body>${this.rawHtml}</body>
    </html>`;

  const blob = new Blob([htmlContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'תיקון-לתלמיד.doc';
  a.click();
  URL.revokeObjectURL(url);
}

  printPage() {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(this.rawHtml);
      newWindow.document.close();
      newWindow.print();
    }
  }

  close() {
    this.closed.emit();
  }
}
