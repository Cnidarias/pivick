import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { CubeClientModule } from "@cubejs-client/ngx";
import { providePrimeNG } from "primeng/config";
import Aura from "@primeuix/themes/aura";
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";
import { provideTranslateService } from "@ngx-translate/core";

const cubeOptions = {
  token: "123123123",
  options: { apiUrl: "/cubejs-api/v1" },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: "/assets/i18n/",
        suffix: ".json",
      }),
      fallbackLang: "en",
      lang: "en",
    }),
    importProvidersFrom(CubeClientModule.forRoot(cubeOptions)),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: ".my-app-dark",
        },
      },
    }),
  ],
};
