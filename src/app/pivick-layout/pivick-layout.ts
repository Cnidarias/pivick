import { Component, inject, OnInit } from "@angular/core";
import { ResizableModule, ResizeEvent } from "angular-resizable-element";
import { DimensionList } from "../components/dimension-list/dimension-list";
import { SelectionList } from "../components/selection-list/selection-list";
import { PivickContent } from "../components/pivick-content/pivick-content";
import { PivickAnalysis } from "../services/pivick-analysis";
import { Button } from "primeng/button";
import { Menubar } from "primeng/menubar";

@Component({
  selector: "app-pivick-layout",
  templateUrl: "./pivick-layout.html",
  styleUrls: ["./pivick-layout.scss"],
  standalone: true,
  imports: [
    ResizableModule,
    DimensionList,
    SelectionList,
    PivickContent,
    Button,
    Menubar,
  ],
})
export class PivickLayoutComponent implements OnInit {
  pivickAnalysis: PivickAnalysis = inject(PivickAnalysis);

  dimContainerWidth = "250px";
  selContainerWidth = "250px";

  ngOnInit(): void {
    this.pivickAnalysis.loadSchema();
  }

  onResizeEnd(type: string, e: ResizeEvent) {
    if (type === "dim") {
      this.dimContainerWidth = `${e.rectangle.width}px`;
    } else if (type === "sel") {
      this.selContainerWidth = `${e.rectangle.width}px`;
    } else {
      console.warn(`onResizeEnd Event not implemented for this type: ${type}`);
    }
  }

  toggleDarkMode() {
    const element = document.querySelector("html")!;
    element.classList.toggle("my-app-dark");
  }
}
