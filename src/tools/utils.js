import reduce from "lodash/reduce";
import forEach from 'lodash/forEach';
import find from 'lodash/find';


import {
  AMOUNT_OF_WEEKS,
  COUNTRY,
  REGION_TYPE_1,
  REGION_TYPE_2,
  REGION_DATA_1,
  REGION_DATA_2
} from '../constants.js';

export function getCurrentDate () {
  const d = new Date();
  const year = d.getFullYear();

  let month = d.getMonth() + 1; // Starts at: 0
  let date = d.getDate();       // Starts at: 1

  if (month < 10) { month = '0' + month }
  if ( date < 10) {  date = '0' +  date }

  return year + '-' + month + '-' + date;
}

export function calculateAverage (ls, mustRoundResult) {
  const avg = reduce(ls, (a, b) => a + b) / ls.length;
  return mustRoundResult
    ? Math.round(avg)
    : avg;
}

// NB! This doesn't give any guarantees about order of the output.
export function objToTuples (obj) {
  const result = [];
  forEach(obj, (subObj) => {
    result.push([subObj.timestamp, subObj.data]);
  });
  return result;
}

export function getWeekVisUnixTimestamps (dbg = false) {
  const WEEK_IN_MS = 604800000;
  if (dbg) {
    // We're in dev-mode: we select weeks that have actual data
    const firstTimestamp = Date.parse('15 Sep 2017 00:00:00 GMT');
    const allTimestamps = [firstTimestamp];
    for (let i = 1; i < AMOUNT_OF_WEEKS; i++) {
      allTimestamps.push(firstTimestamp + i * WEEK_IN_MS);
    }
    return allTimestamps;
  } else {
    // We're in production-mode, we select weeks the customer specified.
    // NB! Find out via Alexander which weeks are required..
    const HALF_AMOUNT_OF_WEEKS = Math.floor(AMOUNT_OF_WEEKS / 2);
    const YEAR_IN_MS = 31556926000;
    const oneYearAgo = Date.now() - YEAR_IN_MS;

    let pastTimestamps = [];
    let futureTimestamps = [];

    for (let i = HALF_AMOUNT_OF_WEEKS; i > 0; i--) {
      pastTimestamps.push(oneYearAgo - (i * WEEK_IN_MS));
    }

    for (let i = 1; i < HALF_AMOUNT_OF_WEEKS; i++) {
      futureTimestamps.push(oneYearAgo + (i * WEEK_IN_MS));
    }

    return pastTimestamps.concat([oneYearAgo], futureTimestamps);
  }
}

export function convertTimestampToUTC (msTimestamp) {
  let d = new Date(msTimestamp);
  let isoDate = d.toISOString();
  return isoDate;
}

// We do NOT use barren growth-stages;
// we do NOT use no-data;
// We do NOT use category -1 "other";
export function growthStageIsAllowed (gsClass) {
  return gsClass >= 2 && gsClass <= 9;
}

export function getFeatureById (regionId) {

  let feature;

  // First, check whether the regionId if for a province (which are only present
  // for Vietnam, not Bangladesh):
  feature = find(REGION_DATA_1.results.features, { id: regionId });
  if (!feature) {
    // If not, we know it has to be a district:
    feature = find(REGION_DATA_2.results.features, { id: regionId });
  }

  if (!feature) {
    console.error('Feature not found');
  } else {
    return feature;
  }
}


export function pixels2hectares (pixels, totalPixels, totalArea) {
  if (!pixels || !totalPixels) {
    return 0;
  } else {
    return Math.round((pixels / totalPixels) * totalArea);
  }
}
