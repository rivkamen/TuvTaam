// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../environments/environment';

// @Injectable({ providedIn: 'root' })
// export class UploadService {
//   constructor(private http: HttpClient) {}
//   private apiUrl = `${environment.apiUrl}/record`; // שנה לפי הצורך

//   uploadFile(file: File) {
//     const formData = new FormData();
//     formData.append('file', file);
//     return this.http.post(`${this.apiUrl}/upload/direct`, formData);
//   }
// }
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';

// @Injectable({ providedIn: 'root' })
// export class UploadService {
//   constructor(private http: HttpClient) {}

//   uploadFile(file: File) {
//     const formData = new FormData();
//     formData.append('file', file);
//     return this.http.post('http://localhost:9745/api/files/upload/direct', formData);
//   }

//   saveRecord(recordData: any) {
//     return this.http.post('http://localhost:9745/api/records/create', recordData);
//   }
// }
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(private http: HttpClient) {}

  // 1. העלאה רגילה של קובץ בלבד
  uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post('http://localhost:9745/api/files/upload/direct', formData);
  }

  // 2. שליחה של מטה־דאטה בלבד (בלי קובץ)
  saveRecord(recordData: any) {
    return this.http.post('http://localhost:9745/api/records/create', recordData);
  }

  // 3. העלאה של קובץ + מטה־דאטה בטופס אחד (זה מה שחסר לך)
  uploadFileWithMetadata(formData: FormData) {
    return this.http.post('http://localhost:9745/api/records/create', formData);
  }
}
