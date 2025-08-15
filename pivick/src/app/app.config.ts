import {
    ApplicationConfig,
    importProvidersFrom,
    provideBrowserGlobalErrorListeners,
    provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CubeClientModule } from '@cubejs-client/ngx';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

const cubeOptions = {
    token: '123123123',
    options: { apiUrl: '/cubejs-api/v1' },
};

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(),
        provideAnimationsAsync(),
        importProvidersFrom(CubeClientModule.forRoot(cubeOptions)),
        providePrimeNG({
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: '.my-app-dark',
                },
            },
        }),
    ],
};
