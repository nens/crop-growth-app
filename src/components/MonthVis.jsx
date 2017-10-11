import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import MDSpinner from "react-md-spinner";

import { fetchMonthDataForRegion } from "../tools/fetch-data-for-region.js";

import { PIXEL_SIZE } from "../constants.js";

import styles from './MonthVis.css';

class MonthVis extends Component {
  constructor () {
    super();
    this.state = { isFetching: false, data: "" };
  }
  getTotalRicePerMonth (response) {
    console.log("[F] getTotalRicePerMonth; response =", response);
    const result = [];
    let totalRiceSingleMonth;
    response.forEach((monthData, i) => {
      totalRiceSingleMonth = 0;
      monthData.data.forEach((regionData) => {
        if (regionData.class > 2) {
          totalRiceSingleMonth += regionData.data;
        }
      });
      result.push(Math.round(totalRiceSingleMonth * PIXEL_SIZE));
    });
    if (result.length !== 12) {
      console.error("[E] Received API data is for an incorrect amount of months");
    }
    return result;
  }
  componentWillReceiveProps (props) {
    this.setState({ selectedRegionId: props.selectedRegionId });
    if (props.selectedRegionId) {
      this.setState({ isFetching: true });
      fetchMonthDataForRegion(props.selectedRegionId, 2017).then(
        (response) => {
          this.setState({
            isFetching: false,
            data: {
              raw: response,
              totalRicePerMonth: this.getTotalRicePerMonth(response)
            }
          });
          this.render();
        },
        (error) => {
          console.log("[E] 12 PROMISES RESOLVED? ERROR:", error);
          this.setState({ isFetching: false });
        }
      );
    }
  }
  render () {
    return (
      <div>
        <div className={styles.GroeneBalk}>
          <div className={styles.GroeneBalkText}>Monthly</div>
        </div>
        { this.state.isFetching
          ? <Spinner></Spinner>
          : this.state.data === ""
            ? <div style={{
                position: "relative",
                top: "220px",
                left: "330px"
              }}>
                Please select an area
              </div>
            : <div>&nbsp;Total rice (Ha/month): {JSON.stringify(this.state.data.totalRicePerMonth)}</div>
        }

      </div>
    );
  }
}

class Spinner extends Component {
  render() {
    return (
      <div>
        <MDSpinner
          singleColor="#00A55D"
          style={{
            position: "relative",
            top: "200px",
            left: "400px"
          }}
        />
      </div>
    );
  }
}

export { MonthVis };

