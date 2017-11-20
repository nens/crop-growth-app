import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import MDSpinner from "react-md-spinner";

import { fetchWeekDataForRegion } from "../tools/fetch-data-for-region.js";

import styles from './WeekVis.css';

class WeekVis extends Component {
  constructor () {
    super();
    this.state = {
      selectedRegionId: null,
      isFetching: false,
      data: ""
    };
  }
  componentWillReceiveProps (props) {
    console.log("[F] WeekVis.componentWillReceiveProps");
    this.setState({
      selectedRegionId: props.selectedRegionId,
      isFetching: props.isFetching
    });

    if (props.selectedRegionId) {
      console.log("[dbg] props.selectedRegionId is TRUTHY");
      this.setState({ isFetching: true });
      fetchWeekDataForRegion(props.selectedRegionId).then(
        (response) => {
          console.log("[+] promise resolved; response =", response);
        },
        (error) => {
          console.log("[E] promise error:", error);
        }
      );
    } else {
      console.log("[dbg] props.selectedRegionId is FALSY");
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
    return null;
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