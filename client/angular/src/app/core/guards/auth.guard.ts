import { inject } from '@angular/core';
import { CanActivateFn, GuardResult, MaybeAsync, Router } from '@angular/router';
import { RoleService } from '../../services/role.service';

export const authGuard: CanActivateFn = (route, state): MaybeAsync<GuardResult> => {
  const router = inject(Router);
  const roleService = inject(RoleService);
  if (roleService.isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
};
