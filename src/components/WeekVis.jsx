import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import MDSpinner from "react-md-spinner";

import { fetchWeekDataForRegion } from "../tools/fetch-data-for-region.js";
import { WeekVisTable } from "./WeekVisTable.jsx";
import { HarvestBarChart } from "./HarvestBarChart.jsx";

import styles from './WeekVis.css';

import {
  getWeekVisUnixTimestamps,
  convertTimestampToUTC
} from '../tools/utils.js';

class WeekVis extends Component {
  constructor () {
    super();


    const DEV_MODE = true;

    ///////////////////////////////////////////////////////////////////////////
    // Three types of timestamps:

    // 1) ms since 01-01-1970
    const unixTimestamps = getWeekVisUnixTimestamps(DEV_MODE);

    // 2) UTC, used for API calls to raster-aggregates
    const utcTimestamps = unixTimestamps.map(convertTimestampToUTC);

    // 3) UTC, used for 2x yAxis labeling
    const utcTimestampSlugs = utcTimestamps.map((ts) => ts.split('T')[0])

    this.state = {
      utcTimestamps: utcTimestamps,
      utcTimestampSlugs: utcTimestampSlugs,
      selectedRegionId: null,
      isFetching: false,
      data: ""
    };
  }
  componentWillReceiveProps (props) {
    this.setState({
      selectedRegionId: props.selectedRegionId,
      isFetching: props.isFetching
    });

    if (props.selectedRegionId) {
      this.setState({ isFetching: true });
      fetchWeekDataForRegion(props.selectedRegionId, this.state.utcTimestamps)
      .then(
        (response) => {
          this.setState({ isFetching: false, data: response });
        },
        (error) => {
          this.setState({ isFetching: false, data: "" });
          console.error("[E] promise error:", error);
        }
      );
    }
  }
  getInnerComponent () {

    ///////////////////////////////////////////////////////////////////////////
    // There are 3 different "states" for this WeekVis part/component:
    //
    // case 1) There is of yet no data present (i.e. not a single chart has
    //         been drawn so far). This is the initial state of the application.
    //
    // case 2) We have retrieved data at least once: but since we are currently
    //         fetching data for another region, we'll draw an empty chart/table
    //         expecting fresh data to arrive any minute.
    //
    // case 3) We have retrieved data at least once: this is data we'll be
    //         showing.

    if (this.state.data === "") {
      if (!this.state.isFetching) {
        return (
          <div className={styles.WeekVisContent}>
            <WelcomeMessage />
          </div>
        );
      } else
        return null;
    } else {
      if (this.state.isFetching) {
        return (
          <div className={styles.WeekVisContent}>
            <WeekVisTable
              utcTimestampSlugs={this.state.utcTimestampSlugs}
              data={null}
              isFetching={true}
            />
            <HarvestBarChart
              utcTimestampSlugs={this.state.utcTimestampSlugs}
              data={null}
              isFetching={true}
            />
          </div>
        );
      } else {
        return (
          <div className={styles.WeekVisContent}>
            <WeekVisTable
              utcTimestampSlugs={this.state.utcTimestampSlugs}
              data={this.state.data}
              isFetching={false}
            />
            <HarvestBarChart
              utcTimestampSlugs={this.state.utcTimestampSlugs}
              data={this.state.data}
              isFetching={false}
            />
          </div>
        );
      }
    }
  }
  render () {
    const { isFetchingMonthData } = this.props;
    return (
      <div>
        <div className={styles.GroeneBalk}>
          <div className={styles.GroeneBalkText}>
            Weekly
          </div>
          {
            this.state.isFetching
              ? <Spinner />
              : null
          }
        </div>
        { this.getInnerComponent() }
      </div>
    )
  }
}

class WelcomeMessage extends Component {
  render () {
    return (
      <div style={{
        position: "relative",
        top: "220px",
        left: "330px"
      }}>
        Please select an area
      </div>
    );
  }
}

class Spinner extends Component {
  render () {
    return (
      <div>
        <MDSpinner
          singleColor="#fff"
          style={{
            position: "relative",
            top: "-23px",
            left: "160px"
          }}
        />
      </div>
    );
  }
}

export { WeekVis };