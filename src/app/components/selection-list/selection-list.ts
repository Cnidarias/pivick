import { Component, inject, OnInit } from "@angular/core";
import { Listbox } from "primeng/listbox";
import { FormsModule } from "@angular/forms";
import { PivickAnalysis } from "../../services/pivick-analysis";
import { TCubeDimension, TCubeMeasure } from "@cubejs-client/core";
import { TranslatePipe } from "@ngx-translate/core";
import { Menubar } from "primeng/menubar";

@Component({
  selector: "app-selection-list",
  imports: [Listbox, FormsModule, TranslatePipe, Menubar],
  templateUrl: "./selection-list.html",
  styleUrl: "./selection-list.scss",
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
        return dimension
          ? dimension
          : ({ name: row, shortTitle: row } as TCubeDimension);
      });
    });

    this.pivickAnalysis.selectedColumns$.subscribe((columns) => {
      this.selectedColumns = columns.map((column) => {
        const dimension = this.pivickAnalysis.getDimensionByName(column);
        return dimension
          ? dimension
          : ({ name: column, shortTitle: column } as TCubeDimension);
      });
    });

    this.pivickAnalysis.selectedMeasures$.subscribe((measures) => {
      this.selectedMeasures = measures.map((measure) => {
        const dimension = this.pivickAnalysis.getMeasureByName(measure) as
          | TCubeMeasure
          | undefined;
        return dimension
          ? dimension
          : ({ name: measure, shortTitle: measure } as TCubeMeasure);
      });
    });
  }

  getLabel(dimensionOrMeasure: TCubeDimension | TCubeMeasure): string {
    return this.pivickAnalysis.getLabel(dimensionOrMeasure);
  }

  onDragOver($event: DragEvent, targetType: "dimension" | "measure") {
    if (!$event.dataTransfer) {
      return;
    }
    const searchKey =
      targetType === "dimension"
        ? "pivick/dimension-node"
        : "pivick/measure-node";
    if ($event.dataTransfer.types.includes(searchKey)) {
      $event.preventDefault();
      $event.dataTransfer.dropEffect = "copy";
    } else {
      $event.dataTransfer.dropEffect = "none";
    }
  }

  onTargetDrop(
    $event: DragEvent,
    targetType: "dimension" | "measure",
    target: "rows" | "columns" | "measure",
  ) {
    if (!$event.dataTransfer) {
      return;
    }
    const searchKey =
      targetType === "dimension"
        ? "pivick/dimension-node"
        : "pivick/measure-node";
    const key = $event.dataTransfer.getData(searchKey);

    if (!key) {
      $event.dataTransfer.dropEffect = "none"; // Show no drop cursor
      return;
    }

    $event.preventDefault();

    if (targetType === "dimension") {
      if (target === "rows") {
        this.pivickAnalysis.addRow(key);
      } else if (target === "columns") {
        this.pivickAnalysis.addColumn(key);
      }
    } else {
      this.pivickAnalysis.addMeasure(key);
    }
  }
}
