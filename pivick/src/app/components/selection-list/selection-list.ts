import { Component, inject, OnInit } from '@angular/core';
import { Listbox } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';
import { PivickAnalysis } from '../../services/pivick-analysis';
import { TCubeDimension, TCubeMeasure } from '@cubejs-client/core';
import { DragDropModule } from 'primeng/dragdrop';

@Component({
    selector: 'app-selection-list',
    imports: [Listbox, FormsModule, DragDropModule],
    templateUrl: './selection-list.html',
    styleUrl: './selection-list.scss',
})
export class SelectionList implements OnInit {
    private pivickAnalysis = inject(PivickAnalysis);

    selectedRows: TCubeDimension[] = [];
    selectedColumns: TCubeDimension[] = [];
    selectedMeasures: TCubeMeasure[] = [];

    ngOnInit() {
        this.pivickAnalysis.selectedRows$.subscribe((rows) => {
            this.selectedRows = rows.map((row) => {
                const dimension = this.pivickAnalysis.getDimensionByName(row);
                return dimension ? dimension : ({ name: row, shortTitle: row } as TCubeDimension);
            });
        });

        this.pivickAnalysis.selectedColumns$.subscribe((columns) => {
            this.selectedColumns = columns.map((column) => {
                const dimension = this.pivickAnalysis.getDimensionByName(column);
                return dimension ? dimension : ({ name: column, shortTitle: column } as TCubeDimension);
            });
        });

        this.pivickAnalysis.selectedMeasures$.subscribe((measures) => {
            this.selectedMeasures = measures.map((measure) => {
                const dimension = this.pivickAnalysis.getMeasureByName(measure) as TCubeMeasure | undefined;
                return dimension ? dimension : ({ name: measure, shortTitle: measure } as TCubeMeasure);
            });
        });
    }

    getLabel(dimensionOrMeasure: TCubeDimension | TCubeMeasure): string {
        return this.pivickAnalysis.getLabel(dimensionOrMeasure);
    }

    onDropRow() {
        if (this.pivickAnalysis.draggedItem) {
            this.pivickAnalysis.addRow(this.pivickAnalysis.draggedItem.name);
            this.pivickAnalysis.draggedItem = undefined;
        }
    }

    onDropColumn() {
        if (this.pivickAnalysis.draggedItem) {
            this.pivickAnalysis.addColumn(this.pivickAnalysis.draggedItem.name);
            this.pivickAnalysis.draggedItem = undefined;
        }
    }

    onDropMeasure() {
        if (this.pivickAnalysis.draggedItem) {
            this.pivickAnalysis.addMeasure(this.pivickAnalysis.draggedItem.name);
            this.pivickAnalysis.draggedItem = undefined;
        }
    }
}
