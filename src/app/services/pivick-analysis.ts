import { inject, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { CubeClient } from "@cubejs-client/ngx";
import {
  Cube,
  Meta,
  Query,
  QueryOrder,
  ResultSet,
  TCubeDimension,
  TCubeMeasure,
  TQueryOrderArray,
  TQueryOrderObject,
} from "@cubejs-client/core";
import { Config } from "./config";

@Injectable({
  providedIn: "root",
})
export class PivickAnalysis {
  private cube: CubeClient = inject(CubeClient);
  private config: Config = inject(Config);

  private selectedCubeName: string = "uk_price_paid_view";

  private _cubeSchemaSubject = new BehaviorSubject<Cube | null>(null);
  public cubeSchema$ = this._cubeSchemaSubject.asObservable();

  private _selectedRowsSubject = new BehaviorSubject<string[]>([]);
  public selectedRows$ = this._selectedRowsSubject.asObservable();

  private _selectedColumnsSubject = new BehaviorSubject<string[]>([]);
  public selectedColumns$ = this._selectedColumnsSubject.asObservable();

  private _selectedMeasuresSubject = new BehaviorSubject<string[]>([]);
  public selectedMeasures$ = this._selectedMeasuresSubject.asObservable();

  private _cubeDataSubject = new BehaviorSubject<ResultSet | null>(null);
  public cubeData$ = this._cubeDataSubject.asObservable();

  private _areLoadingDataSubject = new BehaviorSubject<boolean>(false);
  public areLoadingData$ = this._areLoadingDataSubject.asObservable();

  updateData() {
    const selectedMeasures = [...this._selectedMeasuresSubject.getValue()];
    const selectedDims = [
      ...this._selectedRowsSubject.getValue(),
      ...this._selectedColumnsSubject.getValue(),
    ];

    const everything = [...selectedMeasures, ...selectedDims];

    if (everything.length === 0) {
      this._cubeDataSubject.next(null);
      return;
    }

    const orders: TQueryOrderObject = Object.fromEntries(
      everything.map((k) => [k, "desc"]),
    );

    const query: Query = {
      measures: selectedMeasures,
      dimensions: selectedDims,
      order: orders,
      total: true,
    };

    this._areLoadingDataSubject.next(true);

    this.cube.load(query).subscribe((result) => {
      this._cubeDataSubject.next(result);
      this._areLoadingDataSubject.next(false);
    });
  }

  loadSchema() {
    this.cube.meta().subscribe({
      next: (meta: Meta) => {
        const cube = meta.cubes.filter(
          (cube) => cube.name === this.selectedCubeName,
        );
        if (cube.length > 0) {
          this._cubeSchemaSubject.next(cube[0]);
        } else {
          console.error(`Cube with name ${this.selectedCubeName} not found.`);
          this._cubeSchemaSubject.next(null);
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  addRow(row: string) {
    const currentRows = this._selectedRowsSubject.getValue();
    if (!currentRows.includes(row)) {
      this._selectedRowsSubject.next([...currentRows, row]);
      this.updateData();
    }
  }

  removeRow(row: string) {
    const currentRows = this._selectedRowsSubject.getValue();
    this._selectedRowsSubject.next(currentRows.filter((r) => r !== row));
    this.updateData();
  }

  clearRows() {
    this._selectedRowsSubject.next([]);
    this.updateData();
  }

  getRows() {
    return [...this._selectedRowsSubject.getValue()];
  }

  addColumn(column: string) {
    const currentColumns = this._selectedColumnsSubject.getValue();
    if (!currentColumns.includes(column)) {
      this._selectedColumnsSubject.next([...currentColumns, column]);
      this.updateData();
    }
  }

  removeColumn(column: string) {
    const currentColumns = this._selectedColumnsSubject.getValue();
    this._selectedColumnsSubject.next(
      currentColumns.filter((c) => c !== column),
    );
    this.updateData();
  }

  clearColumns() {
    this._selectedColumnsSubject.next([]);
    this.updateData();
  }

  getColumns() {
    return [...this._selectedColumnsSubject.getValue()];
  }

  addMeasure(measure: string) {
    const currentMeasures = this._selectedMeasuresSubject.getValue();
    if (!currentMeasures.includes(measure)) {
      this._selectedMeasuresSubject.next([...currentMeasures, measure]);
      this.updateData();
    }
  }

  removeMeasure(measure: string) {
    const currentMeasures = this._selectedMeasuresSubject.getValue();
    this._selectedMeasuresSubject.next(
      currentMeasures.filter((m) => m !== measure),
    );
    this.updateData();
  }

  clearMeasures() {
    this._selectedMeasuresSubject.next([]);
    this.updateData();
  }

  getMeasures() {
    return [...this._selectedMeasuresSubject.getValue()];
  }

  getDimensionByKey(name: string): TCubeDimension | undefined {
    const schema = this._cubeSchemaSubject.getValue();
    if (!schema) {
      return undefined;
    }
    return schema.dimensions.find((dimension) => {
      return dimension.name === name;
    });
  }

  getMeasureByKey(name: string): TCubeMeasure | undefined {
    const schema = this._cubeSchemaSubject.getValue();
    if (!schema) {
      return undefined;
    }
    return schema.measures.find((measure) => {
      return measure.name === name;
    });
  }

  getDimensionOrMeasureByKey(
    key: string,
  ): TCubeDimension | TCubeMeasure | undefined {
    let dimension = this.getDimensionByKey(key);
    if (dimension) {
      return dimension;
    }
    let measure = this.getMeasureByKey(key);
    if (measure) {
      return measure;
    }
    return undefined;
  }

  getLabel(member: TCubeDimension | TCubeMeasure): string {
    if (member.meta?.i18n && member.meta.i18n[this.config.locale]) {
      return member.meta.i18n[this.config.locale];
    }
    return member.shortTitle;
  }

  getLabelByKey(key: string): string {
    let dimension = this.getDimensionByKey(key);
    if (dimension) {
      return this.getLabel(dimension);
    }
    let measure = this.getMeasureByKey(key);
    if (measure) {
      return this.getLabel(measure);
    }
    return "N/A";
  }
}
