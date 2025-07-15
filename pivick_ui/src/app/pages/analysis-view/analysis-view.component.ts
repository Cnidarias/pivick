import { Component } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { DataSourcePaneComponent } from '../../components/data-source-pane/data-source-pane.component';

@Component({
    selector: 'app-analysis-view',
    templateUrl: './analysis-view.component.html',
    styleUrls: ['./analysis-view.component.css'],
    imports: [NgxEchartsModule, DataSourcePaneComponent],
})
export class AnalysisViewComponent {
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
}
