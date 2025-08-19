import { AfterViewInit, Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PivickAnalysis } from "../../services/pivick-analysis";
import { Tree, TreeNodeDoubleClickEvent } from "primeng/tree";
import { PrimeTemplate, TreeNode, TreeDragDropService } from "primeng/api";
import {
  Cube,
  TCubeDimension,
  TCubeFolder,
  TCubeMeasure,
} from "@cubejs-client/core";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { Config } from "../../services/config";

@Component({
  selector: "app-dimension-list",
  imports: [FormsModule, Tree, TranslatePipe, PrimeTemplate],
  providers: [TreeDragDropService],
  templateUrl: "./dimension-list.html",
  styleUrl: "./dimension-list.scss",
})
export class DimensionList implements AfterViewInit {
  private translate: TranslateService = inject(TranslateService);
  private config: Config = inject(Config);
  private pivickAnalysis: PivickAnalysis = inject(PivickAnalysis);
  private treeDragDropService: TreeDragDropService =
    inject(TreeDragDropService);

  currentlyDraggedNode?: TreeNode<TCubeFolder | TCubeDimension | TCubeMeasure>;

  private schema?: Cube;

  dimensionTree?: TreeNode<TCubeFolder | TCubeDimension | TCubeMeasure>[] = [];

  ngAfterViewInit(): void {
    this.pivickAnalysis.cubeSchema$.subscribe((schema) => {
      if (!schema) {
        this.dimensionTree = [];
        return;
      }

      this.schema = schema;
      this.resetDimensionTree();
    });

    this.config.locale$.subscribe((locale) => {
      this.resetDimensionTree();
    });
  }

  resetDimensionTree() {
    this.dimensionTree = [];
    if (!this.schema) {
      return;
    }
    this.dimensionTree = this.schema.folders
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((folder) => {
        return {
          label: folder.name,
          data: folder,
          key: folder.name,
          expanded: true,
          children: folder.members
            .map((memberName: string) =>
              this.pivickAnalysis.getDimensionByKey(memberName),
            )
            .filter((member) => member !== undefined)
            .sort((a, b) => a.shortTitle.localeCompare(b.shortTitle))
            .map((member: TCubeDimension) => {
              if (member.type === "time") {
                return this.makeTimeDimensionEntries(member);
              }
              return {
                label: this.pivickAnalysis.getLabel(member),
                data: member,
                key: member.name,
                icon: "pi pi-database",
              };
            })
            .flat(),
        };
      });
    this.dimensionTree?.push({
      key: "measures",
      label: "Measures",
      expanded: true,
      children: this.schema.measures
        .sort((a, b) => a.shortTitle.localeCompare(b.shortTitle))
        .map((measure: TCubeMeasure) => {
          return {
            label: this.pivickAnalysis.getLabel(measure),
            data: measure,
            key: measure.name,
            icon: "pi pi-wave-pulse",
          };
        }),
    });

    this.treeDragDropService.dragStart$.subscribe((drag) => {
      this.currentlyDraggedNode = drag.node;
    });

    this.treeDragDropService.dragStop$.subscribe((drag) => {
      this.currentlyDraggedNode = undefined;
    });
  }

  makeTimeDimensionEntries(
    dimension: TCubeDimension,
  ): TreeNode<TCubeDimension>[] {
    return [
      "date.full",
      "date.year",
      "date.quarter",
      "date.month",
      "date.week",
      "date.day",
      "date.hour",
      "date.minute",
      "date.second",
    ].map((timePart: string) => {
      const timePartLabel = this.translate.instant(timePart);
      return {
        label: `${this.pivickAnalysis.getLabel(dimension)} (${timePartLabel})`,
        data: {
          ...dimension,
          timeDimension: {
            dateGranularity: timePart.split(".").pop(),
          },
        },
        key: `${dimension.name}_${timePart}`,
        icon: "pi pi-calendar",
      };
    });
  }

  onNodeDoubleClickEvent($e: TreeNodeDoubleClickEvent) {
    if ($e.node.data) {
      // We assume it's a measure which means it has an aggType
      const dimensionOrMeasure = $e.node.data as TCubeMeasure;
      if (dimensionOrMeasure.aggType) {
        this.pivickAnalysis.addMeasure(dimensionOrMeasure.name);
      }
      // Otherwise, we know it's a dimension
      else {
        this.pivickAnalysis.addRow(dimensionOrMeasure.name);
      }
    }
  }

  onDragStart($event: DragEvent) {
    if (this.currentlyDraggedNode?.parent?.key === "measures") {
      $event.dataTransfer?.setData(
        "pivick/measure-node",
        this.currentlyDraggedNode?.key || "N/A",
      );
    } else {
      $event.dataTransfer?.setData(
        "pivick/dimension-node",
        this.currentlyDraggedNode?.key || "N/A",
      );
    }
  }
}
