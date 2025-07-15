import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, LogicalModel } from '../../services/api.service';

@Component({
    selector: 'app-data-source-pane',
    templateUrl: './data-source-pane.component.html',
    styleUrls: ['./data-source-pane.component.css'],
    standalone: true,
    imports: [CommonModule],
})
export class DataSourcePaneComponent implements OnInit {
    models: LogicalModel[] = [];

    constructor(private apiService: ApiService) {}

    ngOnInit(): void {
        this.apiService.getModels().subscribe((models) => {
            this.models = models;
        });
    }
}
