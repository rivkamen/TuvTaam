// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
      console.log('🛡️ Interceptor activated!', req.url);

  const token = sessionStorage.getItem('token');

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });


    return next(cloned);
  }

  return next(req);
};
