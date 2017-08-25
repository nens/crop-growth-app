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
