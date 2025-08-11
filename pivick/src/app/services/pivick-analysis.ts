import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface Pivick {
    name: string;
    fact_source: string;
    joins: any[];
    dimensionGroups: DimensionGroup[];
    dimensions: Dimension[];
    measures: Measure[];
}

export interface DimensionGroup {
    id: string;
    name: string;
    description: string;
}

export interface Dimension {
    name: string;
    table: string;
    group: string;
    column?: string;
    sql?: string;
    type?: string;
    description?: string;
}

export interface Measure {
    name: string;
    agg: string;
    column?: string;
    description?: string;
    format: string;
}

@Injectable({
    providedIn: 'root',
})
export class PivickAnalysis {
    private http: HttpClient = inject(HttpClient);

    private baseApiUrl = '/pivick-api';
    private apiVersion = 'v1';

    public selectedPivickModel = 'UKHousePrices';
    public selectedLocale = 'en';

    private pivickSchemaSubject: BehaviorSubject<Pivick | null> = new BehaviorSubject<Pivick | null>(null);
    public $pivickSchema = this.pivickSchemaSubject.asObservable();

    loadPivickSchema() {
        const params = new HttpParams().set('locale', this.selectedLocale);
        this.http
            .get<Pivick>(`${this.baseApiUrl}/${this.apiVersion}/schema/${this.selectedPivickModel}`, { params })
            .subscribe({
                next: (data: Pivick) => {
                    this.pivickSchemaSubject.next(data);
                },
                error: (err) => {
                    // @TODO User facing error messages need to be shown here
                    console.error(err);
                },
            });
    }
}
