import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private _userRole: string | null = null;
  private _userId: string | null = null;
  #router = inject(Router)

  constructor() {
    this.loadRoleFromToken();
  }

  private loadRoleFromToken() {
    const token = sessionStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this._userRole = payload.role;
    }
  }

  get userRole(): string | null {
    return this._userRole;
  }
  get userId(): string | null {
    return this._userId;
  }

    
    isGuest(): boolean {
        return this._userRole === null;
    }




    private getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload._id || null;
  }

  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  } 
   isUser(): boolean {
    return this.getRole() === 'user';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user')
    this.#router.navigate(['/'])
  }
  }