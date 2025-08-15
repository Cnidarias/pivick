import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CubeClient } from '@cubejs-client/ngx';
import { Cube, Meta } from '@cubejs-client/core';

@Injectable({
    providedIn: 'root',
})
export class PivickAnalysis {
    private http: HttpClient = inject(HttpClient);
    private cube: CubeClient = inject(CubeClient);

    private selectedCubeName: string = 'uk_price_paid_view';

    private _cubeSchemaSubject = new BehaviorSubject<Cube | null>(null);
    public cubeSchema$ = this._cubeSchemaSubject.asObservable();

    loadSchema() {
        this.cube.meta().subscribe({
            next: (meta: Meta) => {
                const cube = meta.cubes.filter((cube) => cube.name === this.selectedCubeName);
                if (cube.length > 0) {
                    this._cubeSchemaSubject.next(cube[0]);
                } else {
                    console.error(`Cube with name ${this.selectedCubeName} not found.`);
                    this._cubeSchemaSubject.next(null);
                }
            },
            error: (err) => {
                console.error(err);
            },
        });
    }
}
