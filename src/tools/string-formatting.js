export function replaceUnderscores(str, char = " ") {
  return str.replace(/\_/g, char);
}

export function rgbaListToRgbaString(ls) {
  return `rgba(${ls[0]}, ${ls[1]}, ${ls[2]}, ${ls[3]})`;
}

export function rgbaListToHexColor(ls) {
  const r = ls[0].toString(16);
  const g = ls[1].toString(16);
  const b = ls[2].toString(16);
  const hexColor = `#${r}${g}${b}`;
  return hexColor;
}

export function hexColorToRGB(str) {
  const str_ = str.slice(1, str.length);
  const r = parseInt(str_.substring(0, 2), 16);
  const g = parseInt(str_.substring(2, 4), 16);
  const b = parseInt(str_.substring(4, 6), 16);
  return [r, g, b];
}

export function getCurrentDate () {
  const d = new Date();
  const year = d.getFullYear();

  let month = d.getMonth() + 1; // Starts at: 0
  let date = d.getDate();       // Starts at: 1

  if (month < 10) { month = '0' + month }
  if ( date < 10) {  date = '0' +  date }

  return date + "/" + month + "/" + year;
}
