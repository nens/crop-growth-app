import { THE_YEAR, AMOUNT_OF_WEEKS } from "../constants";

import { getCurrentYear } from "./utils-time.js";

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

const URL_BASE = "http://localhost:9000/api/v3/raster-aggregates/?agg=counts&rasters=fc8065b&srs=EPSG:4326&styles=GrowthStage_Rice_D";

///////////////////////////////////////////////////////////////////////////////
// Part 1/2: retrieving month-data

function buildMonthUrls (regionId, months) {
  console.log('months:', months);
  let urls = [],
      regionUrl = URL_BASE + "&geom_id=" + regionId,
      tsRep,
      tsDay,
      tsMonth,
      tsYear;

  const pad = (n) => n > 9 ? '' + n : '0' + n;

  months.forEach((month) => {
    tsMonth = month.getMonth() + 1;
    tsYear = month.getFullYear();
    tsRep = tsYear + '-' + pad(tsMonth) + '-' + "-01T00:00:00";
    urls.push(regionUrl + "&time=" + tsRep);
  });
  return urls;
}

export function fetchMonthDataForRegion (regionId, months) {
  const urls = buildMonthUrls(regionId, months);
  const promises = [];
  const currentYear = months[0].getFullYear();

  urls.reverse().forEach((url, idx) => {
    const year = currentYear - Math.floor(idx / 12);
    promises.push(
      new Promise(function (resolve, reject) {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
          if (this.readyState !== 4) return;

          if (this.status >= 200 && this.status < 300) {
            const monthData = JSON.parse(this.response);
            resolve({ year: year, monthData });
          } else {
            reject(`Status ${this.status}, '${this.statusText}' for URL ${url}.`);
          }
        };
        request.withCredentials = true; // Send cookie.
        request.open('GET', url);
        request.send();
      })
    )
  });
  return Promise.all(promises);
}

///////////////////////////////////////////////////////////////////////////////
// Part 2/2: retrieving week-data

function buildWeekUrls (regionId, weeks) {
  console.log('weeks:', weeks);
  let urls = [],
      regionUrl = URL_BASE + "&geom_id=" + regionId,
      tsRep,
      tsDay,
      tsMonth,
      tsYear;

  const pad = (n) => n > 9 ? '' + n : '0' + n;

  weeks.forEach((week) => {
    tsMonth = week.getMonth() + 1;
    tsYear = week.getFullYear();
    tsDay = week.getDate();
    tsRep = tsYear + '-' + pad(tsMonth) + '-' + pad(tsDay) + "T00:00:00";
    urls.push(regionUrl + "&time=" + tsRep);
  });
  return urls;
}

export function fetchWeekDataForRegion (regionId, weeks) {

  const utcTimestamps = weeks.map((week) => week.getTime());
  const urls = buildWeekUrls(regionId, weeks);
  const promises = [];

  urls.forEach((url, i) => {
    promises.push(
      new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
          if (this.readyState !== 4) return;

          if (this.status >= 200 && this.status < 300) {
            resolve({
              weekTimestamp: "@@@@@@",
              weekData: JSON.parse(this.response)
            });
          } else {
            reject(`Status ${this.status}, '${this.statusText}' for URL ${url}.`);
          }
        };
        request.withCredentials = true; // Send cookie.
        request.open('GET', url);
        request.send();
      })
    );
  });

  return Promise.all(promises);
}

function buildUrlsForWeekData (regionId, utcTimestamps) {
  const regionUrl = URL_BASE + "&geom_id=" + regionId + "&time=";
  return utcTimestamps.map((utcTimestamp) => {
    return regionUrl + utcTimestamp;
  });
}