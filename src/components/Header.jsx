import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import find from 'lodash/find';

import { getCurrentDate } from "../tools/utils.js";
import { VIETNAM_PROVINCES, VIETNAM_DISTRICTS } from "../constants.js";

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
        <div className={`${styles.GroeneBalkLinks}`}>
          <div className={`${styles.GroeneBalkText}`}>
            Crop Growth
          </div>
          <img
            className={`${styles.LogoAci}`}
            src={LogoAci}
            height="80"
          />
        </div>
        <div className={`${styles.GroeneBalkRechts}`}>
          lil map gaat hierrr
        </div>
        <div className={`${styles.ContentWrapper}`}>
          <div className={`${styles.KeyValuePair} ${styles.FirstRow}`}>
            <div className={`${styles.KeyWrapper}`}>region:</div>
            <select value={selectedRegionId} onChange={onRegionSelected}>
              <option disabled value="">-</option>
              {
                VIETNAM_PROVINCES.results.features.map((province) => {
                  return (
                    <option key={province.id} value={province.id}>
                      { 'province: ' + (province.properties.name || 'region #' + province.id)}
                    </option>
                  )
                })
              }
              {
                VIETNAM_DISTRICTS.results.features.map((district) => {
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
            <span className={`${styles.ValueWrapper}`}>{getCurrentDate()}</span>
          </div>

        </div>
      </div>
    );
  }
}

export { Header }