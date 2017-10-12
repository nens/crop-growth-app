export function getCurrentDate () {
  const d = new Date();
  const year = d.getFullYear();

  let month = d.getMonth() + 1; // Starts at: 0
  let date = d.getDate();       // Starts at: 1

  if (month < 10) { month = '0' + month }
  if ( date < 10) {  date = '0' +  date }

  return date + "/" + month + "/" + year;
}