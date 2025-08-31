import { TimeGranularity } from './app/types/pivick-types';

/**
 * Gets the week number of a date
 * taken from without any care in the world: https://stackoverflow.com/a/6117889
 *
 * @param date The date to get the week number of
 * @returns The week number of the date left padded by 0 to two digits
 */
export function getWeek(date: Date): string {
  // Copy date so don't modify original
  date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  // Get first day of year
  let yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  let weekNo = Math.ceil(((date.valueOf() - yearStart.valueOf()) / 86400000 + 1) / 7);
  // Return array of year and week number
  return weekNo < 10 ? `0${weekNo}` : `${weekNo}`;
}

/**
 * Turns a date into the respective string representation based on its granularity
 *
 * @param date The date to transform
 * @param granularity The granularity of the desired date transformation
 * @param locale The locale to use for the date transformation
 * @returns The transformed date as a string
 */
export function transformDateToGranularString(
  date: string,
  granularity: TimeGranularity,
  locale: Intl.LocalesArgument = 'en-CA',
): string {
  const dateObj = new Date(date);
  let options: Intl.DateTimeFormatOptions = {};
  switch (granularity) {
    case TimeGranularity.FULL:
      return date;
    case TimeGranularity.YEAR:
      options = { year: 'numeric' };
      return dateObj.toLocaleDateString(locale, options);
    case TimeGranularity.QUARTER:
      options = { month: 'numeric' };
      const month = parseInt(dateObj.toLocaleDateString(locale, options));
      options = { year: 'numeric' };
      const year = dateObj.toLocaleDateString(locale, options);
      if (month <= 3) return `${year} - Q1`;
      else if (month <= 6) return `${year} - Q2`;
      else if (month <= 9) return `${year} - Q3`;
      else return `${year} - Q4`;
    case TimeGranularity.MONTH:
      options = { year: 'numeric', month: '2-digit' };
      return dateObj.toLocaleDateString(locale, options);
    case TimeGranularity.WEEK:
      options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      const dateString = dateObj.toLocaleDateString(locale, options);
      return `${dateString} - ${getWeek(dateObj)}`;
    case TimeGranularity.DAY:
      options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return dateObj.toLocaleDateString(locale, options);
    case TimeGranularity.HOUR:
      options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit' };
      return dateObj.toLocaleDateString(locale, options);
    case TimeGranularity.MINUTE:
      options = { minute: '2-digit' };
      options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
      };
      return dateObj.toLocaleDateString(locale, options);
    case TimeGranularity.SECOND:
      options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      return dateObj.toLocaleDateString(locale, options);
  }
}
