import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleService } from '../../services/role.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const roleService = inject(RoleService);
  if (!roleService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }
  if (!roleService.isAdmin()) {
    router.navigate(['/']);
    return false;
  }
  return true;
};
