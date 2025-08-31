import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import {
  PivickElement,
  PivickElementDragDropType,
  PivickElementTypeDimensionDragDropType,
  PivickElementTypeMeasureDragDropType,
  PivickSelector,
} from '../../types/pivick-types';
import { NgClass } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-selection-list-box',
  imports: [NgClass, NgIcon],
  providers: [provideIcons({ heroXMark })],
  templateUrl: './selection-list-box.html',
  styleUrl: './selection-list-box.css',
})
export class SelectionListBox {
  title: InputSignal<string> = input.required<string>();
  type: InputSignal<PivickSelector> = input.required<PivickSelector>();
  elements: InputSignal<PivickElement[]> = input.required<PivickElement[]>();

  onElementAdd: OutputEmitterRef<[PivickElement, idx: number]> =
    output<[PivickElement, idx: number]>();

  onElementRemove: OutputEmitterRef<[PivickElement, idx: number]> =
    output<[PivickElement, idx: number]>();

  onDragOver($event: DragEvent) {
    if (!$event.dataTransfer) {
      return;
    }
    if (this.shouldAcceptDrag($event)) {
      $event.preventDefault();
      $event.dataTransfer.dropEffect = 'copy';
      return;
    }
    $event.dataTransfer.dropEffect = 'none';
  }

  onDrop($event: DragEvent) {
    if (!$event.dataTransfer) {
      return;
    }

    if (this.shouldAcceptDrag($event)) {
      $event.preventDefault();
      const elementJson = $event.dataTransfer.getData(PivickElementDragDropType);
      if (elementJson) {
        const element: PivickElement = JSON.parse(elementJson);
        this.onElementAdd.emit([element, this.elements().length]);
      }
    }
  }

  private shouldAcceptDrag($event: DragEvent): boolean {
    if (!$event.dataTransfer) {
      return false;
    }
    if (this.type() === 'row' || this.type() === 'column') {
      if ($event.dataTransfer.types.includes(PivickElementTypeDimensionDragDropType)) {
        return true;
      }
    }
    if (this.type() === 'measure') {
      if ($event.dataTransfer.types.includes(PivickElementTypeMeasureDragDropType)) {
        return true;
      }
    }
    return false;
  }

  removeElementFromSelection(element: PivickElement) {
    this.onElementRemove.emit([element, this.elements().indexOf(element)]);
  }
}
