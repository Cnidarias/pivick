import { Component } from '@angular/core';
import { Listbox } from 'primeng/listbox';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-selection-list',
    imports: [Listbox, FormsModule],
    templateUrl: './selection-list.html',
    styleUrl: './selection-list.scss',
})
export class SelectionList {
    selectedRows = ['Row 1', 'Row 2'];
    selectedColumns = ['Column 1', 'Column 2'];
    selectedMeasures = ['Measure 1', 'Measure 2'];
}
