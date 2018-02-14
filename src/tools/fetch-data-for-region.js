import { THE_YEAR, AMOUNT_OF_WEEKS, RASTER_URL } from "../constants";

import { getCurrentYear, dateToSlug, pad } from "./utils-time.js";

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

// const URL_BASE = "/api/v3/raster-aggregates/?agg=counts&rasters=fc8065b&srs=EPSG:4326&styles=GrowthStage_Rice_D";

///////////////////////////////////////////////////////////////////////////////
// Part 1/2: retrieving month-data

function buildMonthUrls (regionId, months) {
  let urls = [],
      regionUrl = RASTER_URL + "&geom_id=" + regionId,
      tsRep,
      tsDay,
      tsMonth,
      tsYear;

  const pad = (n) => n > 9 ? '' + n : '0' + n;

  months.forEach((month) => {
    tsMonth = month.getMonth() + 1;
    tsYear = month.getFullYear();
    tsRep = tsYear + '-' + pad(tsMonth) + "-01T00:00:00";
    urls.push(regionUrl + "&time=" + tsRep);
  });
  return urls;
}

export function fetchMonthDataForRegion (regionId, months) {
  const urls = buildMonthUrls(regionId, months);
  const promises = [];
  const currentYear = months[0].getFullYear();

  urls.reverse().forEach((url, idxRight) => {
    const idxLeft = months.length - (idxRight + 1);
    const month = months[idxLeft];
    const year = currentYear - Math.floor(idxLeft / 12);
    promises.push(
      new Promise(function (resolve, reject) {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
          if (this.readyState !== 4) return;
          if (this.status >= 200 && this.status < 300) {
            const monthData = JSON.parse(this.response);
            resolve({
              monthData,
              year: year,
              month: month
            });
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
  let urls = [],
      regionUrl = RASTER_URL + "&geom_id=" + regionId,
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
  // Edit: 9-2-18: they want to show historic data in the HarvestBarChart;
  /////////////////////////////////////////////////////////////////////////////
  // Citation to prevent any miss-communication:
  //
  //

  const promises = [];
  const utcTimestamps = weeks.map((week) => week.getTime());
  const urls = buildWeekUrls(regionId, weeks);
  urls.forEach((url, idx) => {
    const week = weeks[idx];
    promises.push(
      new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
          if (this.readyState !== 4) return;

          if (this.status >= 200 && this.status < 300) {
            // console.log("response", dateToSlug(week), this.response);
            resolve({
              url: url,
              weekTimestamp: dateToSlug(week),
              weekData: JSON.parse(this.response),
              isHistorical: false
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

  const weeksLastYear = weeks.map((week) => {
    var year    = week.getFullYear();
    var month   = week.getMonth() + 1;
    var date    = week.getDate();
    var hour    = week.getHours();
    var min     = week.getMinutes();
    var sec     = week.getSeconds();

    const weekUtcRep = '' + (year - 1) + '-' + pad(month) + '-' + pad(date) + 'T'
      + pad(hour) + ':' +  pad(min) + ':' + pad(sec) + 'Z';

    return new Date(weekUtcRep);
  });

  const urlsLastYear = buildWeekUrls(regionId, weeksLastYear);

  // console.log("urlsLastYear =", urlsLastYear);

  urlsLastYear.forEach((url, idx) => {
    const week = weeksLastYear[idx];
    promises.push(
      new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
          if (this.readyState !== 4) return;

          if (this.status >= 200 && this.status < 300) {
            // console.log("[!] response", dateToSlug(week), this.response);
            resolve({
              url: url,
              weekTimestamp: dateToSlug(week),
              weekData: JSON.parse(this.response),
              isHistorical: true
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
  const regionUrl = RASTER_URL + "&geom_id=" + regionId + "&time=";
  return utcTimestamps.map((utcTimestamp) => {
    return regionUrl + utcTimestamp;
  });
}