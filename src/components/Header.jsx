import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import { getCurrentDate } from "../tools/string-formatting.js";

import LogoAci from './images/logo-aci.png';
import styles from './Header.css';

class Header extends Component {
  constructor () {
    super();
    this.state = {
      selectedRegionValue: ""
    }
  }
  componentWillMount () {
    this.handleSelect = this.handleSelect.bind(this);
    this.dbg = this.dbg.bind(this);
  }
  handleSelect (event) {
    const regionId = parseInt(event.target.value);
    console.log("[F] handleSelect; new regionId =", regionId);
    function cb () {
      var promise = this.props.fetchDataForRegion(regionId);
      promise.then(
        (response) => {
          console.log("[+] PROMISE RESOLVED:", response);
        },
        (error) => {
          console.log("[E] PROMISE RESOLVED W/ERROR:", error);
        }
      );
    }

    this.setState({ selectedRegionValue: regionId }, cb );
  }
  dbg () {
    console.log("[F] Header.dbg");
    console.log("*** STATE LOOKS LIKE:", this.state);
  }
  render () {
    const { firstName, regions } = this.props;

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
            <select onChange={this.handleSelect}>
              {
                regions.map((region) => {
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