import reduce from "lodash/reduce";

export function getCurrentDate () {
  const d = new Date();
  const year = d.getFullYear();

  let month = d.getMonth() + 1; // Starts at: 0
  let date = d.getDate();       // Starts at: 1

  if (month < 10) { month = '0' + month }
  if ( date < 10) {  date = '0' +  date }

  return date + "/" + month + "/" + year;
}

export function calculateAverage (ls, mustRoundResult) {
  const avg = reduce(ls, (a, b) => a + b) / ls.length;
  let result;
  if (mustRoundResult) {
    result = Math.round(avg);
  } else {
    result = avg;
  }
  return result;
}