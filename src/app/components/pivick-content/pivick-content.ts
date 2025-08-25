import { Component } from '@angular/core';
import { SelectedElement } from '../../types/pivick-types';
import { ElementList } from '../element-list/element-list';
import { SelectionList } from '../selection-list/selection-list';
import { PivickTable } from '../pivick-table/pivick-table';

@Component({
  selector: 'app-pivick-content',
  imports: [ElementList, SelectionList, PivickTable],
  templateUrl: './pivick-content.html',
  styleUrl: './pivick-content.css',
})
export class PivickContent {
  protected selectedCubeName: string = 'uk_price_paid_view';

  private rows: SelectedElement[] = [];
  private cols: SelectedElement[] = [];
  private measures: SelectedElement[] = [];
}
