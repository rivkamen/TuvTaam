import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Admin } from '../models/admin.model';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  #http = inject(HttpClient);
  #router = inject(Router);

  apiServerAddress = environment.apiUrl;

  user = new BehaviorSubject<User|null>(null);

  constructor() {
    const storagedUser = sessionStorage.getItem('user')
    if(storagedUser && JSON.parse(storagedUser) as User){
      this.user.next(JSON.parse(storagedUser) as User)
    }
    
  }
 register(username:string,email:string,password: string): Observable<User> {
    let url = this.apiServerAddress + '/auth/register';
    let  body = {
      username,
      email,
      password
      };
    return this.#http.post< User>(url, body);
  }
 register(username:string,email:string,password: string): Observable<User> {
    let url = this.apiServerAddress + '/auth/register';
    let  body = {
      username,
      email,
      password
      };
    return this.#http.post< User>(url, body);
  }
  loginWithGoogle(): void {
  window.location.href = this.apiServerAddress + '/auth/google';
}

}

