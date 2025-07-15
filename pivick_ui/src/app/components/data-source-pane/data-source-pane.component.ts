import { Component, OnInit, ViewChild, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, LogicalModel, Dimension, Measure } from '../../services/api.service';
import { ChipModule } from 'primeng/chip';
import { DragDropModule, CdkDropList } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-data-source-pane',
    templateUrl: './data-source-pane.component.html',
    styleUrls: ['./data-source-pane.component.css'],
    standalone: true,
    imports: [CommonModule, ChipModule, DragDropModule],
})
export class DataSourcePaneComponent implements OnInit, AfterViewInit {
    @ViewChild('dimensionsList') dimensionsList!: CdkDropList;
    @ViewChild('measuresList') measuresList!: CdkDropList;

    @Output() dimensionsListReady = new EventEmitter<CdkDropList>();
    @Output() measuresListReady = new EventEmitter<CdkDropList>();

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

    ngAfterViewInit(): void {
        this.dimensionsListReady.emit(this.dimensionsList);
        this.measuresListReady.emit(this.measuresList);
    }
}
