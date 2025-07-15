import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideRouter, withDebugTracing } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { provideEchartsCore } from 'ngx-echarts';

import * as echarts from 'echarts/core';
// Import bar charts, all suffixed with Chart
import { BarChart, LineChart } from 'echarts/charts';

// Import the tooltip, title, rectangular coordinate system, dataset and transform components
import { TitleComponent, TooltipComponent, GridComponent, DatasetComponent, TransformComponent } from 'echarts/components';

// Features like Universal Transition and Label Layout
import { LabelLayout, UniversalTransition } from 'echarts/features';

// Import the Canvas renderer
// Note that including the CanvasRenderer or SVGRenderer is a required step
import { CanvasRenderer } from 'echarts/renderers';

// Import the theme
import 'echarts/theme/macarons.js';

// Register the required components
echarts.use([
    BarChart,
    LineChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer,
]);

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimationsAsync(),
        provideBrowserGlobalErrorListeners(),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideHttpClient(withFetch()),
        provideRouter(routes, withDebugTracing()),
        provideEchartsCore({ echarts }),
        providePrimeNG({
            theme: {
                preset: Aura,
            },
        }),
    ],
};
