import { Component } from '@angular/core';
import { PivickElement, PivickSelector, SelectedPivickElement } from '../../types/pivick-types';
import { ElementList } from '../element-list/element-list';
import { PivickTable } from '../pivick-table/pivick-table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { SelectionListBox } from '../selection-list-box/selection-list-box';
import { TranslatePipe } from '@ngx-translate/core';
import { heroTrash } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-pivick-content',
  imports: [ElementList, PivickTable, NgIcon, SelectionListBox, TranslatePipe],
  providers: [provideIcons({ heroTrash })],
  templateUrl: './pivick-content.html',
  styleUrl: './pivick-content.css',
})
export class PivickContent {
  protected selectedCubeName: string = 'uk_price_paid_view';

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
