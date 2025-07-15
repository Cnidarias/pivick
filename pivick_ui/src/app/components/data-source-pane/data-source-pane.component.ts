import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, LogicalModel, Dimension, Measure } from '../../services/api.service';
import { ChipModule } from 'primeng/chip';

@Component({
    selector: 'app-data-source-pane',
    templateUrl: './data-source-pane.component.html',
    styleUrls: ['./data-source-pane.component.css'],
    standalone: true,
    imports: [CommonModule, ChipModule],
})
export class DataSourcePaneComponent implements OnInit {
    dimensions: Dimension[] = [];
    measures: Measure[] = [];

    constructor(private apiService: ApiService) {}

    ngOnInit(): void {
        this.apiService.getModels().subscribe((models) => {
            if (models.length > 0) {
                const firstModel = models[0]; // Assuming we work with the first model for now
                this.dimensions = firstModel.dimensions;
                this.measures = firstModel.measures;
            }
        });
    }
}
