import { Component, inject, OnInit } from "@angular/core";
import { PivickAnalysis } from "../../services/pivick-analysis";
import { ResultSet, TableColumn } from "@cubejs-client/core";
import { TableModule } from "primeng/table";

@Component({
  selector: "app-pivick-table",
  imports: [TableModule],
  templateUrl: "./pivick-table.html",
  styleUrl: "./pivick-table.scss",
})
export class PivickTable implements OnInit {
  protected pivickAnalysis: PivickAnalysis = inject(PivickAnalysis);

  availableRowCounts = [100, 500, 1000];
  selectedRows = this.availableRowCounts[1];
  isPaginatorEnabled = false;

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
}
