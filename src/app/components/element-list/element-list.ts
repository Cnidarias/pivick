import { Component, inject, input, OnInit } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { PivickAnalysis } from '../../services/pivick-analysis';
import { AvailableElement, TimeGranularity } from '../../types/pivick-types';
import { TCubeDimension, TCubeFolder } from '@cubejs-client/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroCalendar,
  heroChevronDown,
  heroChevronRight,
  heroCircleStack,
  heroPresentationChartLine,
} from '@ng-icons/heroicons/outline';

interface Node<T> {
  caption: string;
  data: T;
  key: string;
  visible: boolean;
  children?: Node<T>[];
  expanded: boolean;
  icon: string;
}

@Component({
  selector: 'app-element-list',
  imports: [TranslatePipe, FormsModule, NgIcon],
  providers: [
    provideIcons({
      heroChevronDown,
      heroChevronRight,
      heroCircleStack,
      heroCalendar,
      heroPresentationChartLine,
    }),
  ],
  templateUrl: './element-list.html',
  styleUrl: './element-list.css',
})
export class ElementList implements OnInit {
  protected pivickAnalysis: PivickAnalysis = inject(PivickAnalysis);
  protected translate: TranslateService = inject(TranslateService);

  cube = input.required<string>();

  tree: Node<AvailableElement | undefined>[] = [];

  searchValue = '';

  ngOnInit() {
    this.pivickAnalysis.cubeSchema$.subscribe((meta) => {
      if (meta) {
        this.initializeElements();
      }
    });
  }

  initializeElements() {
    const cube = this.pivickAnalysis.getCubeByName(this.cube());
    if (!cube) {
      console.warn('ElementList::initializeElements: There is no cube');
      return;
    }

    this.tree = cube.folders
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((cubeFolder: TCubeFolder) => {
        return {
          caption: cubeFolder.name,
          data: undefined,
          key: cubeFolder.name,
          expanded: true,
          visible: true,
          icon: '',
          children: cubeFolder.members
            .map((memberName: string) => this.pivickAnalysis.getDimensionByName(cube, memberName))
            .filter((member: TCubeDimension | undefined) => member !== undefined)
            .sort((a: TCubeDimension, b: TCubeDimension) =>
              this.pivickAnalysis.getCaption(a).localeCompare(this.pivickAnalysis.getCaption(b)),
            )
            .map((member: TCubeDimension) => {
              const caption = this.pivickAnalysis.getCaption(member);
              if (member.type === 'time') {
                return this.makeTimeDimensionEntries(member, caption);
              }

              return {
                caption: this.pivickAnalysis.getCaption(member),
                icon: 'heroCircleStack',
                data: {
                  caption,
                  name: member.name,
                  type: 'dimension',
                },
                key: member.name,
                visible: true,
                expanded: true,
              } as Node<AvailableElement>;
            })
            .flat(),
        };
      });
  }

  makeTimeDimensionEntries(dimension: TCubeDimension, caption: string): Node<AvailableElement>[] {
    return Object.keys(TimeGranularity).map((timePart: string) => {
      const granularity = TimeGranularity[timePart as keyof typeof TimeGranularity] as string;
      const timePartLabel = this.translate.instant(`date.${granularity}`);
      const timeCaption = `${caption} - ${timePartLabel}`;
      return {
        caption: timeCaption,
        icon: 'heroCalendar',
        data: {
          caption: timeCaption,
          granularity: granularity as TimeGranularity,
          name: dimension.name,
          type: 'timedimension',
        },
        key: `dimension.name___${timePart}`,
        visible: true,
        expanded: true,
      };
    });
  }

  onSearchChange($event: Event) {
    this.tree.forEach((parent) => {
      let parentVisible = false;
      parent.children?.forEach((child) => {
        if (child.caption.toLowerCase().includes(this.searchValue.toLowerCase())) {
          child.visible = true;
          parentVisible = true;
        } else {
          child.visible = false;
        }
      });
      parent.expanded = true;
      parent.visible = parentVisible;
    });
  }

  collapseChildren(folder: Node<AvailableElement | undefined>) {
    folder.expanded = !folder.expanded;
    folder?.children?.forEach((child) => {
      child.visible = folder.expanded;
    });
  }
}
