export type ElementType = 'dimension' | 'timedimension' | 'measure';

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

export type AvailableElement = {
  caption: string;
  granularity?: TimeGranularity;
  name: string;
  type: ElementType;
};

export type SelectedElement = AvailableElement & {};
