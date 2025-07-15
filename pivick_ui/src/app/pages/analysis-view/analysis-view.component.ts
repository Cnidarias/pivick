import { Component, ViewChild } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { DataSourcePaneComponent } from '../../components/data-source-pane/data-source-pane.component';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropList } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-analysis-view',
    templateUrl: './analysis-view.component.html',
    styleUrls: ['./analysis-view.component.css'],
    standalone: true,
    imports: [NgxEchartsModule, DataSourcePaneComponent, DragDropModule],
})
export class AnalysisViewComponent {
    @ViewChild(DataSourcePaneComponent) dataSourcePane!: DataSourcePaneComponent;

    dimensionsSourceList!: CdkDropList;
    measuresSourceList!: CdkDropList;

    chartOptions = {
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        yAxis: {
            type: 'value',
        },
        series: [
            {
                data: [820, 932, 901, 934, 1290, 1330, 1320],
                type: 'line',
            },
        ],
    };

    rows: any[] = [];
    columns: any[] = [];

    onDimensionsListReady(list: CdkDropList) {
        this.dimensionsSourceList = list;
    }

    onMeasuresListReady(list: CdkDropList) {
        this.measuresSourceList = list;
    }

    drop(event: CdkDragDrop<any[]>) {
        console.log('drop', event);
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            // Check if the item is being dropped into a valid target (rows or columns)
            if ((event.container.id === 'rowsList' || event.container.id === 'columnsList') && event.item.data.type === 'dimension') {
                // If dragging from the source pane, create a copy
                if (event.previousContainer.id === 'dimensionsList' || event.previousContainer.id === 'measuresList') {
                    const newItem = { ...event.item.data };
                    event.container.data.splice(event.currentIndex, 0, newItem);
                } else {
                    // If moving between rows/columns, transfer the item
                    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
                }
            } else {
                // If not a valid drop, the item will snap back automatically
            }
        }
    }
}
