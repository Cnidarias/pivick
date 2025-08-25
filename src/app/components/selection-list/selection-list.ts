import { Component } from '@angular/core';
import { SelectionListBox } from './selection-list-box/selection-list-box';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroTrash } from '@ng-icons/heroicons/outline';
import { PivickElement, PivickSelector } from '../../types/pivick-types';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-selection-list',
  imports: [SelectionListBox, NgIcon, TranslatePipe],
  providers: [provideIcons({ heroTrash })],
  templateUrl: './selection-list.html',
  styleUrl: './selection-list.css',
})
export class SelectionList {
  rows: PivickElement[] = [];
  columns: PivickElement[] = [];
  measures: PivickElement[] = [];

  onElementAdd($event: [PivickElement, idx: number], target: PivickSelector) {
    const [element, idx] = $event;
    if (this.checkIfAlreadyInReport(element)) {
      return;
    }
    const list = target === 'row' ? this.rows : target === 'column' ? this.columns : this.measures;
    list.splice(idx, 0, element);
    if (target === 'row') {
      this.rows = [...this.rows];
    } else if (target === 'column') {
      this.columns = [...this.columns];
    } else {
      this.measures = [...this.measures];
    }
  }

  checkIfAlreadyInReport(element: PivickElement): boolean {
    return !!(
      this.rows.find((e) => e?.name === element?.name) ||
      this.columns.find((e) => e?.name === element?.name) ||
      this.measures.find((e) => e?.name === element?.name)
    );
  }
}
