import { Component, inject } from '@angular/core';
import { PivickElement, PivickSelector, SelectedPivickElement } from '../../types/pivick-types';
import { ElementList } from '../element-list/element-list';
import { PivickTable } from '../pivick-table/pivick-table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { SelectionListBox } from '../selection-list-box/selection-list-box';
import { TranslatePipe } from '@ngx-translate/core';
import { heroTrash } from '@ng-icons/heroicons/outline';
import { PivickAnalysis } from '../../services/pivick-analysis';
import { ResultSet } from '@cubejs-client/core';

@Component({
  selector: 'app-pivick-content',
  imports: [ElementList, PivickTable, NgIcon, SelectionListBox, TranslatePipe],
  providers: [provideIcons({ heroTrash })],
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
    if (this.checkIfAlreadyInReport(element)) {
      return;
    }
    const list = target === 'row' ? this.rows : target === 'column' ? this.columns : this.measures;
    list.splice(idx, 0, element as SelectedPivickElement);

    this.updateData();
  }

  onElementRemove($event: [PivickElement, idx: number], target: PivickSelector) {
    const [element, idx] = $event;

    let list = target === 'row' ? this.rows : target === 'column' ? this.columns : this.measures;
    list.splice(idx, 1);

    this.updateData();
  }

  onElementDoubleClick($event: PivickElement) {
    if (this.checkIfAlreadyInReport($event)) {
      return;
    }
    if ($event!.type === 'measure') {
      this.measures = [...this.measures, $event as SelectedPivickElement];
    } else {
      this.rows = [...this.rows, $event as SelectedPivickElement];
    }
    this.updateData();
  }

  private checkIfAlreadyInReport(element: PivickElement): boolean {
    return !!(
      this.rows.find((e) => e?.name === element?.name && e?.granularity == element?.granularity) ||
      this.columns.find(
        (e) => e?.name === element?.name && e?.granularity == element?.granularity,
      ) ||
      this.measures.find((e) => e?.name === element?.name)
    );
  }

  protected updateData() {
    this.isLoading = true;
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
}
