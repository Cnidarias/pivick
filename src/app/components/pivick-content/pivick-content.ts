import { Component, inject } from '@angular/core';
import {
  OrderType,
  PivickElement,
  PivickSelector,
  SelectedPivickElement,
} from '../../types/pivick-types';
import { ElementList } from '../element-list/element-list';
import { PivickTable } from '../pivick-table/pivick-table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { SelectionListBox } from '../selection-list-box/selection-list-box';
import { TranslatePipe } from '@ngx-translate/core';
import { heroCog6Tooth } from '@ng-icons/heroicons/outline';
import { heroTrash } from '@ng-icons/heroicons/outline';
import { PivickAnalysis } from '../../services/pivick-analysis';
import { ResultSet } from '@cubejs-client/core';

@Component({
  selector: 'app-pivick-content',
  imports: [ElementList, PivickTable, NgIcon, SelectionListBox, TranslatePipe],
  providers: [provideIcons({ heroCog6Tooth, heroTrash })],
  templateUrl: './pivick-content.html',
  styleUrl: './pivick-content.css',
})
export class PivickContent {
  protected pivickAnalysis: PivickAnalysis = inject(PivickAnalysis);
  protected selectedCubeName: string = 'uk_price_paid_view';

  rows: SelectedPivickElement[] = [];
  columns: SelectedPivickElement[] = [];
  measures: SelectedPivickElement[] = [];

  isLoading = false;
  data?: ResultSet;

  onElementAdd($event: [PivickElement, idx: number], target: PivickSelector) {
    const [element, idx] = $event;
    this.addElement(element, target, idx);
  }

  onElementDoubleClick($event: PivickElement) {
    const target: PivickSelector = $event.type === 'measure' ? 'measure' : 'row';
    this.addElement($event, target);
  }

  onElementRemove($event: [PivickElement, idx: number], target: PivickSelector) {
    const [element, idx] = $event;
    this.removeElement(idx, target);
  }

  addElement(element: PivickElement, target: PivickSelector, idx?: number) {
    if (this.checkIfAlreadyInReport(element)) {
      return;
    }
    const list = target === 'row' ? this.rows : target === 'column' ? this.columns : this.measures;

    const maxCurrentSort = this._getMaximumCurrentSortOrder();

    const selectedElement: SelectedPivickElement = {
      ...element,
      orderDirection: OrderType.DESC,
      orderIndex: maxCurrentSort + 1,
    };
    idx = idx ?? list.length;
    list.splice(idx, 0, selectedElement);

    this.updateData();
  }

  removeElement(idx: number, target: PivickSelector) {
    let list = target === 'row' ? this.rows : target === 'column' ? this.columns : this.measures;
    list.splice(idx, 1);

    this.updateData();
  }

  changeElementSorting(element: SelectedPivickElement) {
    if (element.orderDirection === OrderType.DESC) {
      element.orderDirection = OrderType.ASC;
    } else if (element.orderDirection === OrderType.ASC) {
      // Since there is now one less element in the sorting we need to change all the others
      this.rows.forEach((e) => {
        if (e.orderIndex && element.orderIndex && e.orderIndex > element.orderIndex) {
          e.orderIndex = e.orderIndex - 1;
        }
      });
      this.columns.forEach((e) => {
        if (e.orderIndex && element.orderIndex && e.orderIndex > element.orderIndex) {
          e.orderIndex = e.orderIndex - 1;
        }
      });
      this.measures.forEach((e) => {
        if (e.orderIndex && element.orderIndex && e.orderIndex > element.orderIndex) {
          e.orderIndex = e.orderIndex - 1;
        }
      });

      element.orderDirection = undefined;
      element.orderIndex = undefined;
    } else {
      element.orderDirection = OrderType.DESC;
      const maxCurrentSort = this._getMaximumCurrentSortOrder();
      element.orderIndex = maxCurrentSort + 1;
    }

    this.updateData();
  }

  private checkIfAlreadyInReport(element: PivickElement): boolean {
    if (!element) {
      return false;
    }
    return !!(
      this.rows.find((e) => e.name === element.name && e.granularity === element.granularity) ||
      this.columns.find((e) => e.name === element.name && e.granularity === element.granularity) ||
      this.measures.find((e) => e.name === element.name)
    );
  }

  protected updateData() {
    this.isLoading = true;
    if (this.rows.length === 0 && this.columns.length === 0 && this.measures.length === 0) {
      this.data = undefined;
      this.isLoading = false;
      return;
    }
    this.pivickAnalysis
      .loadData(this.selectedCubeName, this.rows, this.columns, this.measures)
      .subscribe({
        next: (data) => {
          this.data = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.data = undefined;
          this.isLoading = false;
        },
      });
  }

  private _getMaximumCurrentSortOrder(): number {
    let maxCurrentSort = Math.max(
      ...this.rows.map((m) => m.orderIndex ?? 0),
      ...this.columns.map((m) => m.orderIndex ?? 0),
      ...this.measures.map((m) => m.orderIndex ?? 0),
    );
    if (!Number.isFinite(maxCurrentSort)) {
      maxCurrentSort = 0;
    }
    return maxCurrentSort;
  }

  clearReport() {
    this.rows = [];
    this.columns = [];
    this.measures = [];
    this.updateData();
  }
}
