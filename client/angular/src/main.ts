// // // import { bootstrapApplication } from '@angular/platform-browser';
// // // import { appConfig } from './app/app.config';
// // // import { AppComponent } from './app/app.component';

// // // bootstrapApplication(AppComponent, appConfig)
// // //   .catch((err) => console.error(err));
// // import { bootstrapApplication } from '@angular/platform-browser';
// // import { appConfig } from './app/app.config';
// // import { provideAnimations } from '@angular/platform-browser/animations';

// // bootstrapApplication(AppComponent, {
// //   ...appConfig,
// //   providers: [
// //     ...appConfig.providers!,
// //     provideAnimations() // זה מחליף את הצורך ב-BrowserAnimationsModule
// //   ]
// // });
// // import { AppComponent } from './app/app.component';

// // import { bootstrapApplication } from '@angular/platform-browser';
// // import { ApplicationConfig } from '@angular/core';
// // import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// // import { providePrimeNG } from 'primeng/config';
// // import Aura from '@primeng/themes/aura';

// // export const appConfig: ApplicationConfig = {
// //   providers: [
// //     provideAnimationsAsync(),
// //     providePrimeNG({
// //       theme: {
// //         preset: Aura
// //       }
// //     })
// //   ]
// // };

// // bootstrapApplication(AppComponent, appConfig)
// //   .catch(err => console.error(err));
// import { AppComponent } from './app/app.component';

// import { bootstrapApplication } from '@angular/platform-browser';
// import { ApplicationConfig } from '@angular/core';
// import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// import { providePrimeNG } from 'primeng/config';
// import Aura from '@primeng/themes/aura';

// // ⬇️ ייבוא חדש
// import { provideRouter } from '@angular/router';
// import { routes } from './app/app.routes'; // ודא שהקובץ הזה קיים

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideAnimationsAsync(),
//     providePrimeNG({
//       theme: {
//         preset: Aura
//       }
//     }),
//     provideRouter(routes) // ⬅️ השורה הקריטית!
//   ]
// };

// bootstrapApplication(AppComponent, appConfig)
//   .catch(err => console.error(err));
// import { bootstrapApplication } from '@angular/platform-browser';
// import { provideHttpClient, withInterceptors } from '@angular/common/http';
// import { provideRouter } from '@angular/router';
// import { routes } from './app/app.routes'; // נתיב לרשימת הנתיבים שלך
// import { AppComponent } from './app/app.component';
// import { ApplicationConfig } from '@angular/core';
// import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// import { providePrimeNG } from 'primeng/config';
// import Aura from '@primeng/themes/aura';

// // אם את משתמשת ב־interceptor (לא חובה)
// import { authInterceptor } from './app/core/interceptors/auth.interceptor'; // דוגמה למיקום

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideRouter(routes),
//     provideHttpClient(
//       withInterceptors([
//         authInterceptor // אפשר להוריד אם אין לך אינטרספטור
//       ])
//     ),
//     provideAnimationsAsync(),
//     providePrimeNG({
//       theme: {
//         preset: Aura
//       }
//     }),
//   ]
// };

// bootstrapApplication(AppComponent, appConfig)
//   .catch(err => console.error(err));
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; // נתיב לרשימת הנתיבים שלך
import { AppComponent } from './app/app.component';
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(), // פשוט מספק HttpClient בלי interceptor
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
  ]
};

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
