import { Component, inject } from '@angular/core';
import { PivickLayoutComponent } from './pivick-layout/pivick-layout';
import { Config } from './services/config';

@Component({
    selector: 'app-root',
    templateUrl: './app.html',
    styleUrls: ['./app.scss'],
    standalone: true,
    imports: [PivickLayoutComponent],
})
export class AppComponent {
    private config: Config = inject(Config);
    constructor() {
        this.config.locale$.subscribe((locale) => {
            console.log('Using locale', locale);
        });
    }
}
