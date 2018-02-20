import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import find from 'lodash/find';
import reduce from 'lodash/reduce';

import { getCurrentDate, getFeatureById } from "../tools/utils.js";
import {
  CENTROID,
  PROVINCES,
  DISTRICTS,
  MUNICPALITIES,
  COUNTRY,
  REGION_TYPES,
  countryConfig,
  REGION_DATA_1,
  REGION_DATA_2
} from "../constants.js";

import LogoAci from './images/logo-aci.png';
import styles from './Header.css';

const IMG_WIDTH = 196;
const IMG_HEIGHT = 96;

const MAPBOX_STYLE_ID = 'light-v9';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibmVsZW5zY2h1dXJtYW5zIiwiYSI6ImhkXzhTdXcifQ.3k2-KAxQdyl5bILh_FioCw';

const getMapboxUrl = (lat, lon, zoom = 6) => `
  https://api.mapbox.com/styles/v1/mapbox/${MAPBOX_STYLE_ID}/static/${lon},${lat},${zoom},0,0/${IMG_WIDTH}x${IMG_HEIGHT}?access_token=${MAPBOX_TOKEN}`;


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

  const config = countryConfig[COUNTRY];

  let feature, regionType;

  feature = find(REGION_DATA_1.results.features, { id: regionId });

  if (feature) {
    regionType = config.regionTypes[0];
  } else {
    feature = find(REGION_DATA_2.results.features, { id: regionId });
    regionType = config.regionTypes[1];
  }

  if (!feature) {
    console.error('Feature not found');
  }

  const centroid = feature.geometry.type.toLowerCase() === 'polygon'
    ? getCentroidPolygon(feature)
    : getCentroidMultiPolygon(feature);

  const mapboxZoomLevel = config.regionZoomLevels[regionType];

  console.log("For regiontype '" + regionType + "' we gonna use mapbox zoomlevel:", mapboxZoomLevel);

  return [centroid, mapboxZoomLevel];
}

class Header extends Component {
  // constructor () {
  //   super();
  //   this.state = {
  //     zLevel: null
  //   };
  // }
  render () {
    const {
      firstName,
      selectedRegionId,
      onRegionSelected
    } = this.props;


    let imageUrl;
    if (selectedRegionId) {
      const mapboxInfo = getCentroid(selectedRegionId);
      const centroid = mapboxInfo[0];
      imageUrl = getMapboxUrl(centroid[1], centroid[0], mapboxInfo[1]);
    } else {
      imageUrl = getMapboxUrl(CENTROID.lat, CENTROID.lon, CENTROID.zoom);
    }

    const zLevel1 = REGION_TYPES[0];
    const zLevel2 = REGION_TYPES[1];

    const regionData1 = countryConfig[COUNTRY][zLevel1];
    const regionData2 = countryConfig[COUNTRY][zLevel2];

    // console.log(regionData1, regionData2)

    return (
      <div className={`${styles.Header}`}>
        <div className={`${styles.GroeneBalkLinks}`}>
          <div className={`${styles.GroeneBalkText}`}>
            Crop Growth {COUNTRY.toUpperCase()}
          </div>

          <img
            className={`${COUNTRY === 'BANGLADESH' ? styles.LogoAci : styles.LogoAciHidden}`}
            src={LogoAci}
            height="80"
          />

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
              {
                regionData2.results.features.map((district) => {
                    return (
                      <OptComponent
                        regionType={zLevel2}
                        region={district}
                        key={district.id}
                      />
                    );
                  }
                )
              }
              {
                regionData1.results.features.map((province) => {
                    return (
                      <OptComponent
                        regionType={zLevel1}
                        region={province}
                        key={province.id}
                      />
                    );
                  }
                )
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

class OptComponent extends Component {
  constructor () {
    super();
    this.getRegionSlug = this.getRegionSlug.bind(this);
  }
  getRegionSlug (region, regionType) {
    return regionType.toLowerCase() + ': ' +
      (region.properties && region.properties.name || 'region #' + region.id);
  }
  render () {
    const { region, regionType } = this.props;

    return <option value={region.id}>{ this.getRegionSlug(region, regionType) }</option>
  }
}



export { Header }