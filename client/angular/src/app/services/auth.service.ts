import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Admin } from '../models/admin.model';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { VerseRef } from '../models/parasha.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  #http = inject(HttpClient);

  apiServerAddress = environment.apiUrl;

  user = new BehaviorSubject<User | null>(null);

  constructor() {
    const storagedUser = sessionStorage.getItem('user');
    if (storagedUser && (JSON.parse(storagedUser) as User)) {
      this.user.next(JSON.parse(storagedUser) as User);
    }
  }

  login(email: string, password: string): Observable<User> {
    let url = this.apiServerAddress + '/auth/login';
    let body = {
      email,
      password,
    };
    return this.#http
      .post(url, body)
      .pipe(
        tap((res:any) => {
          this.user.next(res.user as User);
          sessionStorage.setItem('user', JSON.stringify(res.user as User));
        })
      );
  }

  register(
    username: string,
    email: string,
    password: string,
    dueDate: string,
    parashah: VerseRef,
    haftarah?: VerseRef
  ): Observable<User> {
    let url = this.apiServerAddress + '/auth/register';
    let body = {
      username,
      email,
      password,
      dueDate,
      parashah,
      haftarah,
    };
    return this.#http.post<User>(url, body);
  }

  loginWithGoogle(): void {
    window.location.href = this.apiServerAddress + '/auth/google';
  }
}
