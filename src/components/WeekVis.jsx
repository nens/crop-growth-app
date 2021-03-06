import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import MDSpinner from "react-md-spinner";

import cloneDeep from "lodash/cloneDeep";
import forEach from 'lodash/forEach';

import { fetchWeekDataForRegion } from "../tools/fetch-data-for-region.js";
import { WeekVisTable } from "./WeekVisTable.jsx";
import { HarvestBarChart } from "./HarvestBarChart.jsx";
import { WeekVisPieChart } from "./WeekVisPieChart.jsx";

import { growthStageIsAllowed, pixels2hectares } from "../tools/utils.js";

import styles from './WeekVis.css';

import {
  getWeekVisUnixTimestamps,
  convertTimestampToUTC
} from '../tools/utils.js';

class WeekVis extends Component {
  constructor () {
    super();

    ///////////////////////////////////////////////////////////////////////////
    // Three types of timestamps:

    // 1) ms since 01-01-1970
    const unixTimestamps = getWeekVisUnixTimestamps().reverse();

    // 2) UTC, used for API calls to raster-aggregates
    const utcTimestamps = unixTimestamps.map(convertTimestampToUTC);

    // 3) UTC, used for 2x yAxis labeling
    const utcTimestampSlugs = utcTimestamps.map((ts) => ts.split('T')[0]);

    this.state = {
      utcTimestamps: utcTimestamps,
      utcTimestampSlugs: utcTimestampSlugs,
      selectedRegionId: null,
      isFetching: false,
      data: "",
      weeks: null,
      totalArea: null
    };

    this.convertWeekDataToHectares = this.convertWeekDataToHectares.bind(this);
  }
  convertWeekDataToHectares (response) {
    const totalArea = this.state.totalArea;

    forEach(response, (weekResponse) => {
      forEach(weekResponse.weekData.data, (d) => {
        const dataInHectares = pixels2hectares(
          d.data,
          d.total,
          totalArea
        );
        d.data = dataInHectares;
      })
    });


    return response;
  }
  componentWillReceiveProps (props) {
    this.setState({
      selectedRegionId: props.selectedRegionId,
      selectedRegionSlug: props.selectedRegionSlug,
      isFetching: props.isFetching,
      weeks: props.weeks,
      totalArea: props.totalArea
    });

    const convert = this.convertWeekDataToHectares;

    if (props.selectedRegionId) {
      this.setState({ isFetching: true });
      fetchWeekDataForRegion(props.selectedRegionId, props.weeks)
      .then(
        (response) => {
          this.setState({
            isFetching: false,
            data: convert(response)
          });
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
            <div className={styles.WeekVisContentLeftSide}>
              <HarvestBarChart
                utcTimestampSlugs={this.state.utcTimestampSlugs}
                data={null}
                isFetching={true}
                weeks={this.state.weeks}
              />
            </div>
            <div className={styles.WeekVisContentRightSide}>
              <WeekVisPieChart
                data={null}
                isFetching={true}
                selectedRegionSlug={'...'}
                latestWeek={this.state.weeks[0]}
              />
              <WeekVisTable
                utcTimestampSlugs={this.state.utcTimestampSlugs}
                data={null}
                isFetching={true}
                weeks={this.state.weeks}
              />
            </div>
          </div>
        );
      } else {
        return (
          <div className={styles.WeekVisContent}>
            <div className={styles.WeekVisContentLeftSide}>
              <HarvestBarChart
                utcTimestampSlugs={this.state.utcTimestampSlugs}
                data={this.state.data}
                isFetching={false}
                weeks={this.state.weeks}
              />
            </div>
            <div className={styles.WeekVisContentRightSide}>
              <WeekVisPieChart
                rawData={cloneDeep(this.state.data)}
                isFetching={false}
                selectedRegionSlug={this.state.selectedRegionSlug}
                latestWeek={this.state.weeks[0]}
              />
              <WeekVisTable
                utcTimestampSlugs={this.state.utcTimestampSlugs}
                data={this.state.data}
                isFetching={false}
                weeks={this.state.weeks}
              />
            </div>
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
            6-daily
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
        top: "140px",
        width: "160px",
        textAlign: "center",
        margin: "auto 50%",
        left: "-80px",
        fontSize: "12px",
        color: "#666"
      }}>
        Please select a region
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
            left: "135px"
          }}
        />
      </div>
    );
  }
}

export { WeekVis };