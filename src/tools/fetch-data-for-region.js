import { THE_YEAR } from "../constants";

// const URL_BASE = "https://sat4rice.lizard.net/api/v3/raster-aggregates/?agg=counts&boundary_type=MUNICIPALITY&rasters=fc8065b&srs=EPSG:4326&styles=GrowthStage_Rice_D";

const URL_BASE = "http://localhost:9000/api/v3/raster-aggregates/?agg=counts&rasters=fc8065b&srs=EPSG:4326&styles=GrowthStage_Rice_D";


function buildUrls (regionId, year) {
  let urls = [];
  let regionUrl = URL_BASE + "&geom_id=" + regionId;
  let start;
  for (let i = 1; i <= 12; i++) {
    let str = "";
    if (i < 10) {
      str = "0" + i;
    } else {
      str = "" + i;
    }
    start = year + "-" + str + "-01T00:00:00";
    urls.push(regionUrl + "&time=" + start);
  }
  return urls;
}

export function fetchMonthDataForRegion (regionId) {
  const urlsYear1 = buildUrls(regionId, THE_YEAR - 2);
  const urlsYear2 = buildUrls(regionId, THE_YEAR - 1); // TODO: more historical data?
  const urlsTheYear = buildUrls(regionId, THE_YEAR);
  const urlObjects = [];

  urlsYear1.forEach((url) => {
    urlObjects.push({ url, year: THE_YEAR - 2 });
  });

  urlsYear2.forEach((url) => {
    urlObjects.push({ url, year: THE_YEAR - 1 });
  });

  urlsTheYear.forEach((url) => {
    urlObjects.push({ url, year: THE_YEAR });
  });

  const promises = [];

  urlObjects.forEach((urlObj) => {
    promises.push(
      new Promise(function (resolve, reject) {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
          if (this.readyState !== 4) return;

          if (this.status >= 200 && this.status < 300) {
            const monthData = JSON.parse(this.response);
            resolve({ year: urlObj.year, monthData });
          } else {
            reject(`Status ${this.status}, '${this.statusText}' for URL ${urlObj.url}.`);
          }
        };
        request.withCredentials = true; // Send cookie.
        request.open('GET', urlObj.url);
        request.send();
      })
    )
  });
  return Promise.all(promises);
};

// ----------------------------------------------------------------------------

// Valid URL (demo.lizard.net):
////////////////////////////////////////////
// https://sat4rice.lizard.net/api/v3/raster-aggregates/
//    ?agg=counts
//    &boundary_type=MUNICIPALITY !!!!!!!!!!!!!!
//    &geom_id=47630    !!!!!!!!!!!!!!
//    &rasters=fc8065b
//    &srs=EPSG:4326
//    &styles=GrowthStage_Rice_D
//    &time=2017-10-05T11:00:00 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//    &window=3600000