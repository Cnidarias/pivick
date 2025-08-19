import { Component, inject, OnInit } from "@angular/core";
import { PivickAnalysis } from "../../services/pivick-analysis";
import { ResultSet, TableColumn } from "@cubejs-client/core";
import { TableModule } from "primeng/table";
import { Tooltip } from "primeng/tooltip";

@Component({
  selector: "app-pivick-table",
  imports: [TableModule, Tooltip],
  templateUrl: "./pivick-table.html",
  styleUrl: "./pivick-table.scss",
})
export class PivickTable implements OnInit {
  protected pivickAnalysis: PivickAnalysis = inject(PivickAnalysis);

  availableRowCounts = [100, 500, 1000];
  selectedRows = this.availableRowCounts[1];
  isPaginatorEnabled = false;

  isRowSpanningEnabled = false;

  isLoading = false;

  data?: ResultSet;

  tableColumns: TableColumn[] = [];
  tableData: Array<{ [key: string]: string | number | boolean }> = [];

  ngOnInit() {
    this.pivickAnalysis.areLoadingData$.subscribe((loadingData) => {
      this.isLoading = loadingData;
    });
    this.pivickAnalysis.cubeData$.subscribe((data) => {
      if (data) {
        this.data = data;
        const config = {
          x: this.pivickAnalysis.getRows(),
          y: this.pivickAnalysis.getColumns(),
        };
        this.tableData = this.data.tablePivot(config);
        this.tableColumns = this.data.tableColumns(config);

        this.isPaginatorEnabled =
          this.tableData.length > this.availableRowCounts[0];
      } else {
        this.tableData = [];
        this.tableColumns = [];
        this.isPaginatorEnabled = false;
      }
    });
  }

  calculateRowSpan(key: string, idx: number): number {
    if (!this.isRowSpanningEnabled) {
      return 1; // Row spanning is disabled, return 1
    }
    if (this.pivickAnalysis.isMeasureByKey(key)) {
      return 1; // Measures do not span rows
    }
    if (idx > 0 && this.tableData[idx][key] === this.tableData[idx - 1][key]) {
      return -1; // This row is a duplicate, no need to span
    }
    let rowSpan = 1;
    for (let i = idx + 1; i < this.tableData.length; i++) {
      if (this.tableData[i][key] === this.tableData[idx][key]) {
        rowSpan++;
      } else {
        break;
      }
    }
    return rowSpan;
  }
}
