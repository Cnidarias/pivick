import { Component } from '@angular/core';
import { SelectionListBox } from './selection-list-box/selection-list-box';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroTrash } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-selection-list',
  imports: [SelectionListBox, NgIcon],
  providers: [provideIcons({ heroTrash })],
  templateUrl: './selection-list.html',
  styleUrl: './selection-list.css',
})
export class SelectionList {}
