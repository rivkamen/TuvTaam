import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { SafeUrl } from '@angular/platform-browser';

export interface Message {
  _id?: string;
  content: string;
  fromUser: boolean;
  createdAt?: string;
  signedUrl?: string;
  safeAudioUrl?: SafeUrl;
}

export interface Session {
  _id?: string;
  userId: string[];
  adminId?: string;
  title?: string;
  messages?: Message[];
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private apiUrl = `${environment.apiUrl}/feedback`; // Update this to your actual API URL
  constructor(private http: HttpClient) {}
getSessions(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}`); // ���� ������������ ���� ������������/��
}

createSession(userId: string, title: string, messages: any[] = []) {
  return this.http.post<any>(`${this.apiUrl}`, { userId, messages,title });
}

  getUserSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/user/mysessions`);
  }

  getSessionById(id: string): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/${id}`);
  }
sendMessageWithAudio(sessionId: string, formData: FormData): Observable<any> {
  return this.http.put(`${this.apiUrl}/${sessionId}/messages`, formData);
}


  sendMessage(sessionId: string, message: { message: Message }): Observable<Session> {
    console.log("sendMessage");
    console.log(message);
    
    return this.http.put<Session>(`${this.apiUrl}/${sessionId}/messages`, message);
  }

  getMessages(sessionId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/${sessionId}/messages`);
  }
uploadAudioWithBackup(formData: FormData) {
  return this.http.post(`${this.apiUrl}/upload-with-backup`, formData);
}
updateMessage(id: string,messageId:string, data: { content: string }) {
  return this.http.put(`${this.apiUrl}/${id}/messages/${messageId}`, data);
}

deleteMessage(id: string,messageId:string) {
  console.log(`Deleting message with ID ${messageId} from session ${id}`);
  
  return this.http.put(`${this.apiUrl}/${id}/messages/${messageId}/delete`,{});
}
markAllMessagesAsRead(sessionId: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/${sessionId}/messages/mark-all-read`, {});
}

}
