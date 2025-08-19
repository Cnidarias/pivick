import { Component, inject, Input, input, OnInit } from "@angular/core";
import { Button } from "primeng/button";
import { Listbox, ListboxChangeEvent } from "primeng/listbox";
import { TranslatePipe } from "@ngx-translate/core";
import { PivickAnalysis } from "../../../services/pivick-analysis";
import { TCubeDimension, TCubeMeasure } from "@cubejs-client/core";
import { Observable } from "rxjs";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { Tooltip } from "primeng/tooltip";

@Component({
  selector: "app-selection-list-box",
  imports: [Button, Listbox, TranslatePipe, Tooltip],
  templateUrl: "./selection-list-box.html",
  styleUrl: "./selection-list-box.scss",
})
export class SelectionListBox implements OnInit {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) emptyMessage!: string;
  @Input({ required: true }) type!: "dimension" | "measure";
  @Input({ required: true }) target!: "rows" | "columns" | "measures";
  @Input({ required: true }) itemObservable!: Observable<string[]>;

  protected pivickAnalysis = inject(PivickAnalysis);

  items: (TCubeDimension | TCubeMeasure)[] = [];

  ngOnInit() {
    this.itemObservable.subscribe((elementKeys) => {
      this.items = elementKeys.map((key) => {
        const item = this.pivickAnalysis.getDimensionOrMeasureByKey(key);
        return item
          ? item
          : ({ name: key, shortTitle: key } as TCubeDimension | TCubeMeasure);
      });
    });
  }

  onDragOver($event: DragEvent) {
    if (!$event.dataTransfer) {
      return;
    }
    const searchKey =
      this.type === "dimension"
        ? "pivick/dimension-node"
        : "pivick/measure-node";
    if ($event.dataTransfer.types.includes(searchKey)) {
      $event.preventDefault();
      $event.dataTransfer.dropEffect = "copy";
    } else {
      $event.dataTransfer.dropEffect = "none";
    }
  }

  onTargetDrop($event: DragEvent) {
    if (!$event.dataTransfer) {
      return;
    }
    const searchKey =
      this.type === "dimension"
        ? "pivick/dimension-node"
        : "pivick/measure-node";
    const key = $event.dataTransfer.getData(searchKey);

    if (!key) {
      $event.dataTransfer.dropEffect = "none"; // Show no drop cursor
      return;
    }

    $event.preventDefault();

    if (this.type === "dimension") {
      if (this.target === "rows") {
        this.pivickAnalysis.addRow(key);
      } else if (this.target === "columns") {
        this.pivickAnalysis.addColumn(key);
      }
    } else {
      this.pivickAnalysis.addMeasure(key);
    }
  }

  onRemoveFromSelection(item: TCubeDimension | TCubeMeasure) {
    switch (this.target) {
      case "rows":
        this.pivickAnalysis.removeRow(item.name);
        break;
      case "columns":
        this.pivickAnalysis.removeColumn(item.name);
        break;
      case "measures":
        this.pivickAnalysis.removeMeasure(item.name);
        break;
    }
  }

  onItemsChange($event: CdkDragDrop<string[], string[]>) {
    const newItems = [...this.items];
    const movedItem = newItems.splice($event.previousIndex, 1)[0];
    newItems.splice($event.currentIndex, 0, movedItem);

    switch (this.target) {
      case "rows":
        this.pivickAnalysis.setRows(newItems.map((item) => item.name));
        break;
      case "columns":
        this.pivickAnalysis.setColumns(newItems.map((item) => item.name));
        break;
      case "measures":
        this.pivickAnalysis.setMeasures(newItems.map((item) => item.name));
        break;
    }
  }
}
