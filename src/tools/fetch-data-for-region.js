import { THE_YEAR, AMOUNT_OF_WEEKS } from "../constants";

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

function buildUrlsForMonthData (regionId, year) {
  let urls = [];
  let regionUrl = URL_BASE + "&geom_id=" + regionId;
  let time;
  for (let i = 1; i <= 12; i++) {
    let str = "";
    if (i < 10) {
      str = "0" + i;
    } else {
      str = "" + i;
    }
    time = year + "-" + str + "-01T00:00:00";
    urls.push(regionUrl + "&time=" + time);
  }
  return urls;
}

export function fetchMonthDataForRegion (regionId) {
  const urlsYear1 = buildUrlsForMonthData(regionId, THE_YEAR - 2);
  const urlsYear2 = buildUrlsForMonthData(regionId, THE_YEAR - 1); // TODO: more historical data?
  const urlsTheYear = buildUrlsForMonthData(regionId, THE_YEAR);
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

///////////////////////////////////////////////////////////////////////////////
// Part 2/2: retrieving week-data

export function fetchWeekDataForRegion (regionId, utcTimestamps) {

  const urls = buildUrlsForWeekData(regionId, utcTimestamps);
  const promises = [];

  urls.forEach((url, i) => {
    promises.push(
      new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
          if (this.readyState !== 4) return;

          if (this.status >= 200 && this.status < 300) {
            resolve({
              weekTimestamp: utcTimestamps[i],
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

//////////////////////////////////////////////////////
// NB! This gives us timestamps as wanted by advisors:
//////////////////////////////////////////////////////
// function buildTimestampsForWeekData () {
//   const HALF_AMOUNT_OF_WEEKS = Math.floor(AMOUNT_OF_WEEKS / 2);
//   const YEAR_IN_MS = 31556926000;
//   const WEEK_IN_MS = 604800000;
//   const oneYearAgo = Date.now() - YEAR_IN_MS;

//   let pastTimestamps = [];
//   let futureTimestamps = [];

//   for (let i = HALF_AMOUNT_OF_WEEKS; i > 0; i--) {
//     pastTimestamps.push(oneYearAgo - (i * WEEK_IN_MS));
//   }

//   for (let i = 1; i < HALF_AMOUNT_OF_WEEKS; i++) {
//     futureTimestamps.push(oneYearAgo + (i * WEEK_IN_MS));
//   }

//   return pastTimestamps.concat([oneYearAgo], futureTimestamps);
// }

///////////////////////////////////////////////////////////
// NB! This gives us timestamps that actually lead to data:
//////////////////////////////////////////////////////////
// function buildTimestampsForWeekData () {
//   const WEEK_IN_MS = 604800000;
//   const firstTimestamp = Date.parse('15 Sep 2017 00:00:00 GMT');
//   const allTimestamps = [firstTimestamp];
//   for (let i = 1; i < AMOUNT_OF_WEEKS; i++) {
//     allTimestamps.push(firstTimestamp + i * WEEK_IN_MS);
//   }
//   return allTimestamps;
// }

// function convertTimestampToUTC (msTimestamp) {
//   let d = new Date(msTimestamp);
//   let isoDate = d.toISOString();
//   return isoDate;
// }

function buildUrlsForWeekData (regionId, utcTimestamps) {
  const regionUrl = URL_BASE + "&geom_id=" + regionId + "&time=";
  return utcTimestamps.map((utcTimestamp) => {
    return regionUrl + utcTimestamp;
  });
}