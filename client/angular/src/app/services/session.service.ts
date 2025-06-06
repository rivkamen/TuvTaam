import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Message {
  _id?: string;
  content: string;
  fromUser: boolean;
  createdAt?: string;


}

export interface Session {
  _id?: string;
  userId: string[];
  // title?: string;
  messages?: Message[];
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private apiUrl = `${environment.apiUrl}/session`; // Update this to your actual API URL
  constructor(private http: HttpClient) {}
getSessions(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}`); 
}

createSession(userId: string, /*title: string,*/ messages: any[] = []) {
  return this.http.post<any>(`${this.apiUrl}`, { userId, messages/*,title*/ });
}

  getUserSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/user/mysessions`);
  }

  getSessionById(id: string): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/${id}`);
  }

  sendMessage(sessionId: string, message: { message: Message }): Observable<Session> {
    console.log("sendMessage");
    console.log(sessionId); 
    
    return this.http.put<Session>(`${this.apiUrl}/${sessionId}/messages`, message);
  }

  getMessages(sessionId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/${sessionId}/messages`);
  }
updateMessage(id: string,messageId:string, data: { content: string }) {
  return this.http.put(`${this.apiUrl}/${id}/messages/${messageId}`, data);
}

deleteMessage(id: string,messageId:string) {
  console.log(`Deleting message with ID ${messageId} from session ${id}`);
  
  return this.http.put(`${this.apiUrl}/${id}/messages/${messageId}/delete`,{});
}
}