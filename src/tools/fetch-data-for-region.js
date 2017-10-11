// const URL_BASE = "https://sat4rice.lizard.net/api/v3/raster-aggregates/?agg=counts&boundary_type=MUNICIPALITY&rasters=fc8065b&srs=EPSG:4326&styles=GrowthStage_Rice_D";

const URL_BASE = "http://localhost:9000/api/v3/raster-aggregates/?agg=counts&boundary_type=MUNICIPALITY&rasters=fc8065b&srs=EPSG:4326&styles=GrowthStage_Rice_D";

function buildUrl (regionId) {
  const DEFAULT_TIME = "2017-01-01T00:00:00"; // dbg-only
  let finalUrl = URL_BASE;

  finalUrl += "&geom_id=" + regionId;
  finalUrl += "&time=" + DEFAULT_TIME;
  return finalUrl;
}

function fetchDataForRegion (regionId) {
  console.log("[F] fetchDataForRegion");
  const url = buildUrl(regionId);

  return new Promise(function (resolve, reject) {
    let request = new XMLHttpRequest();

    request.onreadystatechange = function () {
      if (this.readyState !== 4) return;

      if (this.status >= 200 && this.status < 300) {
        resolve(JSON.parse(this.response));
      } else {
        reject(`Status ${this.status}, '${this.statusText}' for URL ${url}.`);
      }
    };

    request.withCredentials = true; // Send cookie.
    request.open('GET', url);
    request.send();
  });
}

export { fetchDataForRegion };

// ----------------------------------------------------------------------------
// Grab all month data for a given year:
//
// >>> HIER WAS IK! <<<<<<<<<<<<<

function buildUrls (regionId, year) {
  let urls = [];
  let regionUrl = URL_BASE + "&geom_id=" + regionId;
  let start, end;

  for (let i = 1; i <= 12; i++) {
    start = year + "-" + i + "-01T00:00:00";
    if (i === 12) {
      end = (year + 1) + "-01-01-T00:00:00";
    } else {
      end = year + "-" + (i + 1) + "-01-T00:00:00";
    }
    urls.push(regionUrl + "&start=" + start + "&end=" + end);
  }
  return urls;
}

function fetchMonthDataForRegion (regionId, year) {
  console.log("[F] fetchMonthDataForRegion");
  console.log("*** regionId....:", regionId);
  console.log("*** year........:", year);

  const urls = buildUrls(regionId, year);
  const promises = [];

  urls.forEach((url) => {
    promises.push(
      new Promise(function (resolve, reject) {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
          if (this.readyState !== 4) return;

          if (this.status >= 200 && this.status < 300) {
            resolve(JSON.parse(this.response));
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
    return promises;
};

// ----------------------------------------------------------------------------

// Valid URL (demo.lizard.net):
////////////////////////////////////////////
// https://sat4rice.lizard.net/api/v3/raster-aggregates/
//    ?agg=counts
//    &boundary_type=MUNICIPALITY
//    &geom_id=47630    !!!!!!!!!!!!!!
//    &rasters=fc8065b
//    &srs=EPSG:4326
//    &styles=GrowthStage_Rice_D
//    &time=2017-10-05T11:00:00 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//    &window=3600000