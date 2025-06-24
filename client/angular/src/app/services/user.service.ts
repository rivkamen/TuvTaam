import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  #http = inject(HttpClient);
  apiUrl = environment.apiUrl;

  /** מחזיר את כל המשתמשים */
  getAllUsers(): Observable<User[]> {

    return this.#http.get<User[]>(`${this.apiUrl}/users`);
  }

  /** מחזיר משתמש לפי מזהה */
  getUserById(id: string): Observable<User> {
    return this.#http.get<User>(`${this.apiUrl}/users/${id}`);
  }
}
