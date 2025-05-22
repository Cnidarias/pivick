import { inject, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { CubeClient } from "@cubejs-client/ngx";
import { Cube, Meta, TCubeDimension, TCubeMeasure } from "@cubejs-client/core";
import { Config } from "./config";

@Injectable({
  providedIn: "root",
})
export class PivickAnalysis {
  private http: HttpClient = inject(HttpClient);
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
    }
  }
  removeRow(row: string) {
    const currentRows = this._selectedRowsSubject.getValue();
    this._selectedRowsSubject.next(currentRows.filter((r) => r !== row));
  }

  clearRows() {
    this._selectedRowsSubject.next([]);
  }

  addColumn(column: string) {
    const currentColumns = this._selectedColumnsSubject.getValue();
    if (!currentColumns.includes(column)) {
      this._selectedColumnsSubject.next([...currentColumns, column]);
    }
  }
  removeColumn(column: string) {
    const currentColumns = this._selectedColumnsSubject.getValue();
    this._selectedColumnsSubject.next(
      currentColumns.filter((c) => c !== column),
    );
  }
  clearColumns() {
    this._selectedColumnsSubject.next([]);
  }

  addMeasure(measure: string) {
    const currentMeasures = this._selectedMeasuresSubject.getValue();
    if (!currentMeasures.includes(measure)) {
      this._selectedMeasuresSubject.next([...currentMeasures, measure]);
    }
  }
  removeMeasure(measure: string) {
    const currentMeasures = this._selectedMeasuresSubject.getValue();
    this._selectedMeasuresSubject.next(
      currentMeasures.filter((m) => m !== measure),
    );
  }
  clearMeasures() {
    this._selectedMeasuresSubject.next([]);
  }

  getDimensionByName(name: string): TCubeDimension | undefined {
    const schema = this._cubeSchemaSubject.getValue();
    if (!schema) {
      return undefined;
    }
    return schema.dimensions.find((dimension) => {
      return dimension.name === name;
    });
  }

  getMeasureByName(name: string): TCubeMeasure | undefined {
    const schema = this._cubeSchemaSubject.getValue();
    if (!schema) {
      return undefined;
    }
    return schema.measures.find((measure) => {
      return measure.name === name;
    });
  }

  getLabel(member: TCubeDimension | TCubeMeasure): string {
    if (member.meta?.i18n && member.meta.i18n[this.config.locale]) {
      return member.meta.i18n[this.config.locale];
    }
    return member.shortTitle;
  }
}
