import { inject } from '@angular/core';
import {
  CanActivateFn,
  GuardResult,
  MaybeAsync,
  Router,
} from '@angular/router';
import { RoleService } from '../../services/role.service';
import { User } from '../../models/user.model';

export const authGuard: CanActivateFn = (
  route,
  state
): MaybeAsync<GuardResult> => {
  const router = inject(Router);
  const roleService = inject(RoleService);
  if (roleService.isLoggedIn()) return true;
  const token = route.queryParams['token'];
  if (token) {
    sessionStorage.setItem('token', token);
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    sessionStorage.setItem('user', JSON.stringify(payload as User));
    router.navigate([state.url.split('?')[0]]);
    return false
  }
  router.navigate(['/login']);
  return false;
};
