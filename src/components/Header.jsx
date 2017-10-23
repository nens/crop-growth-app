import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import { getCurrentDate } from "../tools/utils.js";
import { REGION_DATA } from "../constants.js";

import LogoAci from './images/logo-aci.png';
import styles from './Header.css';

class Header extends Component {
  render () {
    const {
      firstName,
      selectedRegionId,
      onRegionSelected
    } = this.props;

    return (
      <div className={`${styles.Header}`}>

        <div className={`${styles.GroeneBalk}`}>
          <div className={`${styles.GroeneBalkText}`}>
            Crop Growth Report
          </div>
          <img
            className={`${styles.LogoAci}`}
            src={LogoAci}
            height="80"/>
        </div>

        <div className={`${styles.ContentWrapper}`}>
          <div className={`${styles.KeyValuePair} ${styles.FirstRow}`}>
            <div className={`${styles.KeyWrapper}`}>Area:</div>
            <select value={selectedRegionId} onChange={onRegionSelected}>
              <option disabled value="">-</option>
              {
                REGION_DATA.results.features.map((region) => {
                  return (
                    <option key={region.id} value={region.id}>
                      {region.properties.name}
                    </option>
                  )
                })
              }
            </select>
          </div>

          <div className={`${styles.KeyValuePair}`}>
            <span className={`${styles.KeyWrapper}`}>Date generated:</span>
            <span className={`${styles.ValueWrapper}`}>{getCurrentDate()}</span>
          </div>

        </div>
      </div>
    );
  }
}

export { Header }