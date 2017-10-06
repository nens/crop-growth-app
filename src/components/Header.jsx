import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import LogoAci from './images/logo-aci.png';
import styles from './Header.css';

class Header extends Component {
  constructor () {
    super();
    this.state = {
      currentDate: this.getDate(),
      selectedRegionValue: ""
    }
  }
  componentWillMount () {
    // bind-related boilerplate:
    this.handleSelect = this.handleSelect.bind(this);
    this.dbg = this.dbg.bind(this);
  }
  getDate () {
    const d = new Date();
    const year = d.getFullYear();

    let month = d.getMonth() + 1; // Starts at: 0
    let date = d.getDate();       // Starts at: 1

    if (month < 10) { month = '0' + month }
    if ( date < 10) {  date = '0' +  date }

    return date + "/" + month + "/" + year;
  }
  handleSelect (event) {

    const regionId = parseInt(event.target.value);
    console.log("[F] handleSelect; new regionId =", regionId);

    function cb () {
      var promise = this.props.fetchDataForRegion(regionId);

      promise.then(
        (response) => {
          console.log("OK, PROMISE RESOLVED:", response);
        },
        (error) => {
          console.log("Fail! PROMISE RESOLVED W/ERROR:", error);
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
            <span className={`${styles.ValueWrapper}`}>{this.state.currentDate}</span>
          </div>

        </div>
      </div>
    );
  }
}

export { Header }