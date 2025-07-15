import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the interfaces for the data structures
// These should match the Pydantic models in the backend
export interface Measure {
    name: string;
    column: string;
    agg: 'SUM' | 'COUNT' | 'AVG' | 'MIN' | 'MAX';
}

export interface DimensionAttribute {
    name: string;
    column: string;
}

export interface Dimension {
    name: string;
    table: string;
    attributes: DimensionAttribute[];
}

export interface Join {
    type: 'left' | 'inner' | 'right';
    left_table: string;
    right_table: string;
    on: string;
}

export interface LogicalModel {
    name: string;
    fact_source: string;
    joins: Join[];
    dimensions: Dimension[];
    measures: Measure[];
}

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private apiUrl = '/pivick-api/v1'; // Using a relative URL for the proxy

    constructor(private http: HttpClient) {}

    getModels(): Observable<LogicalModel[]> {
        return this.http.get<LogicalModel[]>(`${this.apiUrl}/schema/all`);
    }

    getModel(modelName: string): Observable<LogicalModel> {
        return this.http.get<LogicalModel>(`${this.apiUrl}/schema/${modelName}`);
    }
}
