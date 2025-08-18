import { Component } from "@angular/core";
import { PivickTable } from "../pivick-table/pivick-table";

@Component({
  selector: "app-pivick-content",
  imports: [PivickTable],
  templateUrl: "./pivick-content.html",
  styleUrl: "./pivick-content.scss",
})
export class PivickContent {}
