import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import find from 'lodash/find';
import reduce from 'lodash/reduce';

import { getCurrentDate } from "../tools/utils.js";
import { CENTROID, PROVINCES, DISTRICTS } from "../constants.js";

import LogoAci from './images/logo-aci.png';
import styles from './Header.css';


const MAPBOX_STYLE_ID = 'light-v9';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibmVsZW5zY2h1dXJtYW5zIiwiYSI6ImhkXzhTdXcifQ.3k2-KAxQdyl5bILh_FioCw';

const getMapboxUrl = (lat, lon, zoom = 6) => `
  https://api.mapbox.com/styles/v1/mapbox/${MAPBOX_STYLE_ID}/static/${lon},${lat},${zoom},0,0/200x100?access_token=${MAPBOX_TOKEN}`;


const getCentroidPolygon = (feature) => {
  const lons = feature.geometry.coordinates[0].map((lonLat) => lonLat[0]);
  const lats = feature.geometry.coordinates[0].map((lonLat) => lonLat[1]);

  let lonSum = 0,
      latSum = 0;

  for (let i = 0; i < lons.length; i++) {
    lonSum += lons[i];
    latSum += lats[i];
  }

  return [lonSum / lons.length, latSum / lats.length];
}

const getCentroidMultiPolygon = (feature) => {

  let polygons = feature.geometry.coordinates,
      lonSumTotal = 0,
      latSumTotal = 0,
      coordCount = 0,
      lonSum,
      latSum,
      polygon;

  for (let i = 0; i < polygons.length; i++) {
    polygon = polygons[i];
    polygon.forEach((coordList) => {
      lonSum = 0;
      latSum = 0;
      coordList.forEach((coord) => {
        lonSum += coord[0];
        latSum += coord[1];
        coordCount++;
      })
      lonSumTotal += lonSum;
      latSumTotal += latSum;
    })
  }

  return [lonSumTotal / coordCount, latSumTotal / coordCount];
}

const getCentroid = (regionId) => {

  let feature;

  // First, check whether the regionId if for a province (which are only present
  // for Vietnam, not Bangladesh):
  if (PROVINCES){
    feature = find(PROVINCES.results.features, { id: regionId });
  }

  if (!feature) {
    // If not, we know it has to be a district:
    feature = find(DISTRICTS.results.features, { id: regionId });
  }

  if (!feature) {
    console.error('Feature not found');
  }

  return feature.geometry.type.toLowerCase() === 'polygon'
    ? getCentroidPolygon(feature)
    : getCentroidMultiPolygon(feature)
}

class Header extends Component {
  render () {
    const {
      firstName,
      selectedRegionId,
      onRegionSelected
    } = this.props;


    let imageUrl;
    if (selectedRegionId) {
      const centroid = getCentroid(selectedRegionId);
      imageUrl = getMapboxUrl(centroid[1], centroid[0]);
    } else {
      imageUrl = getMapboxUrl(CENTROID.lat, CENTROID.lon, CENTROID.zoom);
    }

    return (
      <div className={`${styles.Header}`}>
        <div className={`${styles.GroeneBalkLinks}`}>
          <div className={`${styles.GroeneBalkText}`}>
            Crop Growth
          </div>

          {/*}
          <img
            className={`${styles.LogoAci}`}
            src={LogoAci}
            height="80"
          />
          */}

        </div>
        <div className={`${styles.GroeneBalkRechts}`}>
          <img
            src={imageUrl}
            width="196"
            height="96"
            className={styles.SmallMap}
          />
        </div>
        <div className={`${styles.ContentWrapper}`}>
          <div className={`${styles.KeyValuePair} ${styles.FirstRow}`}>
            <div className={`${styles.KeyWrapper}`}>region:</div>
            <select value={selectedRegionId} onChange={onRegionSelected}>
              <option disabled value="">-</option>
              { PROVINCES
                ? PROVINCES.results.features.map((province) => {
                    return (
                      <option key={province.id} value={province.id}>
                        { 'province: ' + (province.properties.name || 'region #' + province.id)}
                      </option>
                    )
                  })
                : null
              }
              {
                DISTRICTS.results.features.map((district) => {
                    return (
                      <option key={district.id} value={district.id}>
                        { 'district: ' + (district.properties.name || 'region #' + district.id)}
                      </option>
                    )
                  })
                }
              }

            </select>
          </div>

          <div className={`${styles.KeyValuePair}`}>
            <span className={`${styles.KeyWrapper}`}>date generated:</span>
            <span className={`${styles.ValueWrapper}`}><b>{getCurrentDate()}</b></span>
          </div>

        </div>
      </div>
    );
  }
}

export { Header }