export const AMOUNT_OF_YEARS = 3;
export const AMOUNT_OF_WEEKS = 6;

export function dateToSlug (d) {
  const pad = (n) => n > 9 ? '' + n : '0' + n;
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

export function getCurrentYear () {
  return (new Date()).getFullYear();
}

export function getMonths (currentYear) {
  // Return js Date objects for 36 months; 12 in the current year, and 12 for
  // each of the last two years.
  const dateObjects = [];
  for (let year = currentYear; year > currentYear - AMOUNT_OF_YEARS; year--) {
    for (let month = 12; month > 0; month--) {
      dateObjects.push(new Date(month + '-01-' + year));
    }
  }
  return dateObjects;
}


export function getWeeks (nowUnixTime) {
  // Return js date objects for 6 weeks; the current date, plus 5 weeks earlier.
  const WEEK_IN_MS = 604800000;

  //  Update 08/02/18: we need 6 day intervals
  // const WEEK_MINUS_DAY = 604800000 - 604800000 / 7;

  // console.log('week minus day:', WEEK_MINUS_DAY);
  const dateObjects = [];
  for (let i = 0; i < AMOUNT_OF_WEEKS; i++) {
    dateObjects.push(new Date(nowUnixTime - i * WEEK_IN_MS));
  }
  return dateObjects;
}