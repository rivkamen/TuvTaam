import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private _userRole: string | null = null;

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


    isAdmin(): boolean {
        return this._userRole === 'admin';
    }
    
    isUser(): boolean {
        return this._userRole === 'user';
    }
    
    isGuest(): boolean {
        return this._userRole === null;
    }
  }