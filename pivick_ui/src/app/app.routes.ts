import { Routes } from '@angular/router';
import { AnalysisViewComponent } from './pages/analysis-view/analysis-view.component';
import { Pivick } from './pages/pivick/pivick';

export const routes: Routes = [
    { path: '**', component: AnalysisViewComponent },
    { path: 'pivick', component: Pivick },
];
