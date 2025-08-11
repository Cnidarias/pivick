import { Component } from '@angular/core';
import { PivickLayoutComponent } from './pivick-layout/pivick-layout';

@Component({
    selector: 'app-root',
    templateUrl: './app.html',
    styleUrls: ['./app.scss'],
    standalone: true,
    imports: [PivickLayoutComponent],
})
export class AppComponent {
    title = 'pivick-ui';
}
