import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Admin } from '../models/admin.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) { }
  #http = inject(HttpClient);
  apiServerAddress = environment.apiUrl;
  
  private user!: User;

  login(email:string,password: string): Observable<User> {
    let url = this.apiServerAddress + '/api/auth/login';
    let  body = {
      email,
      password
      };
    return this.#http.post< User>(url, body);
  }

  setUserData(user: User) {
    this.user = user;
  }
}

