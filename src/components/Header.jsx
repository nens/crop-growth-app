import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import LogoAci from './images/logo-aci.png';
import styles from './Header.css';

class Header extends Component {
  constructor () {
    super();
    this.state = {
      currentDate: this.getDate()
    }
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
  render () {
    const { firstName } = this.props;

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
            <div className={`${styles.ValueWrapper}`}>Charlie Chui</div>
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