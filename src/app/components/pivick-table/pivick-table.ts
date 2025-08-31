import { Component, inject, input, InputSignal } from '@angular/core';
import { PivickElement, TimeGranularity } from '../../types/pivick-types';
import { ResultSet, TableColumn } from '@cubejs-client/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { PivickAnalysis } from '../../services/pivick-analysis';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLongDown, heroArrowLongUp } from '@ng-icons/heroicons/outline';
import { transformDateToGranularString } from '../../../utils';

@Component({
  selector: 'app-pivick-table',
  imports: [NgIcon],
  providers: [provideIcons({ heroArrowLongUp, heroArrowLongDown })],
  templateUrl: './pivick-table.html',
  styleUrl: './pivick-table.css',
})
export class PivickTable {
  cubeName: InputSignal<string> = input.required<string>();

  rows: InputSignal<PivickElement[]> = input.required<PivickElement[]>();
  columns: InputSignal<PivickElement[]> = input.required<PivickElement[]>();
  measures: InputSignal<PivickElement[]> = input.required<PivickElement[]>();

  data: InputSignal<ResultSet | undefined> = input.required<ResultSet | undefined>();

  protected pivickAnalysis: PivickAnalysis = inject(PivickAnalysis);

  tableColumns: TableColumn[] = [];
  tableData: Array<{ [key: string]: string | number | boolean }> = [];

  constructor() {
    toObservable(this.data).subscribe((data) => {
      this.handleDataChange(data);
    });
  }

  handleDataChange(data?: ResultSet) {
    if (!data) {
      this.tableData = [];
      this.tableColumns = [];
      return;
    }
    const config = {
      x: this.rows().map((r) => this.getKey(r)),
      y: this.columns().map((c) => this.getKey(c)),
    };
    this.tableData = data.tablePivot(config);
    this.tableColumns = data.tableColumns(config);

    this.adjustDataForTimeDimensions();
  }

  adjustDataForTimeDimensions() {
    this.rows()
      .filter((r) => r !== undefined)
      .filter((r) => r.type === 'timedimension')
      .forEach((r) => {
        const key = this.getKey(r);
        this.tableData.forEach((dataRow) => {
          dataRow[key] = transformDateToGranularString(
            dataRow[key] as string,
            r.granularity as TimeGranularity,
          );
        });
      });
  }

  getKey(e: PivickElement): string {
    if (!e) return 'N/A';
    return e.type === 'timedimension' ? `${e.name}.${e.granularity}` : e.name;
  }

  isMeasureColumn(column: TableColumn): boolean {
    return this.measures()
      .filter((m) => m !== undefined)
      .some((m) => m.name === column.key);
  }

  getCaption(column: TableColumn) {
    const parts = column.key.split('.');
    if (parts.length === 3) {
      // It's a timedimension where the last part is the granularity
      return this.pivickAnalysis.getCaptionByName(
        this.cubeName(),
        `${parts[0]}.${parts[1]}`,
        parts[2] as TimeGranularity,
      );
    }
    return this.pivickAnalysis.getCaptionByName(this.cubeName(), column.key);
  }
}
