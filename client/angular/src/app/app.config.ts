import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { authInterceptor } from '../app/core/interceptors/auth.interceptor';
import { withInterceptors } from '@angular/common/http';  
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  
  // providers: [provideRouter(routes), provideHttpClient(withInterceptors([authInterceptor]))],
 providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])), // פשוט מספק HttpClient בלי interceptor
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
  ]

};
