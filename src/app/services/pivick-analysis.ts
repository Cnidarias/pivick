import { inject, Injectable } from '@angular/core';
import { CubeClient } from '@cubejs-client/ngx';
import { Config } from './config';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Cube,
  Meta,
  Query,
  QueryOrder,
  ResultSet,
  TCubeDimension,
  TCubeMeasure,
  TQueryOrderArray,
  TQueryOrderObject,
} from '@cubejs-client/core';
import { PivickElementType, SelectedPivickElement, TimeGranularity } from '../types/pivick-types';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class PivickAnalysis {
  private cube: CubeClient = inject(CubeClient);
  private translate: TranslateService = inject(TranslateService);
  private config: Config = inject(Config);

  private _cubeSchemaSubject = new BehaviorSubject<Meta | null>(null);
  public cubeSchema$ = this._cubeSchemaSubject.asObservable();

  constructor() {
    this.loadSchema();
  }

  loadSchema() {
    this.cube.meta().subscribe({
      next: (meta: Meta) => {
        this._cubeSchemaSubject.next(meta);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  loadData(
    cubeName: string,
    rows: SelectedPivickElement[],
    cols: SelectedPivickElement[],
    measures: SelectedPivickElement[],
  ): Observable<ResultSet> {
    const dimensions = [
      ...rows
        .filter(
          (r) => r.type === 'dimension' || (r.type === 'timedimension' && r.granularity === 'full'),
        )
        .map((r) => r.name),
      ...cols
        .filter(
          (c) => c.type === 'dimension' || (c.type === 'timedimension' && c.granularity === 'full'),
        )
        .map((c) => c.name),
    ];

    const timeDimensions = [
      ...rows
        .filter((r) => r.type === 'timedimension' && r.granularity !== 'full')
        .map((r) => {
          return { dimension: r.name, granularity: r.granularity };
        }),
    ];

    const order: TQueryOrderArray = [...rows, ...cols, ...measures]
      .filter((e) => e.orderDirection)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
      .map((e: SelectedPivickElement) => {
        const nameKey = e.name;
        const direction: QueryOrder = (
          e.orderDirection ?? 'none'
        ).toLocaleLowerCase() as QueryOrder;
        return [nameKey, direction];
      });

    const query: Query = {
      measures: measures.map((m) => m.name),
      dimensions,
      timeDimensions,
      order: order,
      total: true,
    };

    return this.cube.load(query);
  }

  getCubeByName(name: string): Cube | undefined {
    const schema = this._cubeSchemaSubject.getValue();
    if (!schema) {
      return undefined;
    }
    return schema.cubes.find((cube) => cube.name === name);
  }

  getDimensionByName(cube: Cube, name: string): TCubeDimension | undefined {
    return cube.dimensions.find((dimension) => dimension.name === name);
  }

  getMeasureByName(cube: Cube, name: string): TCubeMeasure | undefined {
    return cube.measures.find((measure) => measure.name === name);
  }

  getCaption(element: TCubeDimension | TCubeMeasure, granularity?: TimeGranularity): string {
    let caption = element.shortTitle;
    if (element.meta?.i18n && element.meta.i18n[this.config.locale]) {
      caption = element.meta.i18n[this.config.locale];
    }
    if (element.type === 'time' && granularity) {
      const timePartLabel = this.translate.instant(`date.${granularity}`);
      caption = `${caption} - ${timePartLabel}`;
    }
    return caption;
  }

  /**
   * Gets the caption of an element using the type of the element, the name of the element and which cube it belongs
   * to
   *
   * @param cubeName
   * @param type
   * @param name
   * @param granularity
   */
  getCaptionByNameAndType(
    cubeName: string,
    type: PivickElementType,
    name: string,
    granularity?: TimeGranularity,
  ): string | undefined {
    const cube = this.getCubeByName(cubeName);

    if (!cube) {
      console.warn(`getCaptionByName(): No cube found with the name '${cubeName}'`);
      return undefined;
    }

    if (type === 'measure') {
      const measure = this.getMeasureByName(cube, name);
      if (!measure) {
        return undefined;
      }
      return this.getCaption(measure);
    } else {
      const dimension = this.getDimensionByName(cube, name);
      if (!dimension) {
        return undefined;
      }
      return this.getCaption(dimension, granularity);
    }
  }

  getCaptionByName(cubeName: string, name: string, granularity?: TimeGranularity): string {
    const measureName = this.getCaptionByNameAndType(cubeName, 'measure', name);
    if (measureName) {
      return measureName;
    }
    const dimensionName = this.getCaptionByNameAndType(cubeName, 'dimension', name, granularity);
    if (dimensionName) {
      return dimensionName;
    }
    return name;
  }
}
