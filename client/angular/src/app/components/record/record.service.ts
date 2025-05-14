// // import { HttpClient } from '@angular/common/http';
// // import { Injectable } from '@angular/core';
// // import { Observable } from 'rxjs';

// // export interface Record {
// //   _id: string;
// //   recordName: string;
// //   type: 't' | 'n' | 'c';
// //   belonging: string;
// //   IsSpecial: boolean;
// //   path: string;
// //   createdAt: string;
// //   updatedAt: string;
// // }

// // @Injectable({
// //   providedIn: 'root'
// // })
// // export class RecordService {
// //   private apiUrl = '/api/records';

// //   constructor(private http: HttpClient) {}

// //   // שליפת כל ההקלטות
// //   getAllRecords(): Observable<Record[]> {
// //     return this.http.get<Record[]>(this.apiUrl);
// //   }

// //   // יצירת הקלטה חדשה (לא כולל העלאה ישירה - רק meta data)
// //   createRecord(recordData: Partial<Record>): Observable<Record> {
// //     return this.http.post<Record>(`${this.apiUrl}/create`, recordData);
// //   }

// //   // מחיקת הקלטה לפי ID
// //   deleteRecord(id: string): Observable<void> {
// //     return this.http.delete<void>(`${this.apiUrl}/${id}`);
// //   }
// // }
// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { environment } from '../../environments/environment';

// @Injectable({ providedIn: 'root' })
// export class RecordService {
//   private apiUrl = `${environment.apiUrl}/records`; // שנה לפי הצורך

//   constructor(private http: HttpClient) {}

//   getAllRecords() {
//     return this.http.get<any[]>(this.apiUrl);
//   }

//   deleteRecord(id: string) {
//     return this.http.delete(`${this.apiUrl}/${id}`);
//   }
// }
import { HttpClient } from '@angular/common/http'; 
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecordService {
  private apiUrl = `${environment.apiUrl}/records`;

  constructor(private http: HttpClient) {}

  getAllRecords() {
    return this.http.get<any[]>(this.apiUrl);
  }

  deleteRecord(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  uploadFileWithMetadata(formData: FormData) {
    return this.http.post(`${this.apiUrl}`, formData);
  }
}
