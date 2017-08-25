export let WIDTH;

export let HEIGHT;

export const DETAIL_VIEW_PHOTO_MARGIN = 40;

// For dev/demo-purposes only, i.e. IRL people (hopefully) won't change the
// viewport dimensions at runtime...
export function updateDimensions() {
  console.log("[F] updateDimensions");
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
}

updateDimensions();
