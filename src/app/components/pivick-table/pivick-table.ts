import { Component, inject, input, InputSignal, OnInit } from '@angular/core';
import { PivickElement } from '../../types/pivick-types';
import { ResultSet, TableColumn } from '@cubejs-client/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { PivickAnalysis } from '../../services/pivick-analysis';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLongDown, heroArrowLongUp } from '@ng-icons/heroicons/outline';

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
      x: this.rows().map((r) => r!.name),
      y: this.columns().map((c) => c!.name),
    };
    this.tableData = data.tablePivot(config);
    this.tableColumns = data.tableColumns(config);
  }

  isMeasureColumn(column: TableColumn): boolean {
    return this.measures().some((m) => m!.name === column.key);
  }
}
