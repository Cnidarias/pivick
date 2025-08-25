import { inject, Injectable } from '@angular/core';
import { CubeClient } from '@cubejs-client/ngx';
import { Config } from './config';
import { BehaviorSubject } from 'rxjs';
import { Cube, Meta, TCubeDimension, TCubeMeasure } from '@cubejs-client/core';
import { PivickElementType, SelectedPivickElement } from '../types/pivick-types';
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
  ) {}

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

  getCaption(element: TCubeDimension | TCubeMeasure): string {
    if (element.meta?.i18n && element.meta.i18n[this.config.locale]) {
      return element.meta.i18n[this.config.locale];
    }
    return element.shortTitle;
  }

  /**
   * Gets the caption of an element using the type of the element, the name of the element and which cube it belongs
   * to
   *
   * @param cubeName
   * @param type
   * @param name
   */
  getCaptionByName(cubeName: string, type: PivickElementType, name: string): string {
    const notAvailableCaption = this.translate.instant('notavailable');
    const cube = this.getCubeByName(cubeName);

    if (!cube) {
      console.warn(`getCaptionByName(): No cube found with the name '${cubeName}'`);
      return notAvailableCaption;
    }

    if (type === 'measure') {
      const measure = this.getMeasureByName(cube, name);
      if (!measure) {
        console.warn(`getCaptionByName(): No measure with name '${name}'`);
        return notAvailableCaption;
      }
      return this.getCaption(measure);
    } else {
      const dimension = this.getDimensionByName(cube, name);
      if (!dimension) {
        console.warn(`getCaptionByName(): No dimension with name '${name}'`);
        return notAvailableCaption;
      }
      return this.getCaption(dimension);
    }
  }
}
