export type PivickElementType = 'dimension' | 'timedimension' | 'measure';
export type PivickSelector = 'row' | 'column' | 'measure';

export enum OrderType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum TimeGranularity {
  FULL = 'full',
  YEAR = 'year',
  QUARTER = 'quarter',
  MONTH = 'month',
  WEEK = 'week',
  DAY = 'day',
  HOUR = 'hour',
  MINUTE = 'minute',
  SECOND = 'second',
}

export type PivickElement =
  | {
      caption: string;
      granularity?: TimeGranularity;
      name: string;
      type: PivickElementType;
    }
  | undefined;

export type SelectedPivickElement = PivickElement & {
  orderIndex?: number;
  orderDirection?: OrderType;
};

export const PivickElementDragDropType = 'pivick/element';
export const PivickElementTypeDimensionDragDropType = 'pivick/element-type-dimension';
export const PivickElementTypeMeasureDragDropType = 'pivick/element-type-measure';
