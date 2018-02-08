import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import MDSpinner from "react-md-spinner";

import filter from "lodash/filter";
import reject from "lodash/reject";

import { MonthVisLineChart } from "./MonthVisLineChart";
import { MonthVisTable} from "./MonthVisTable";
import { fetchMonthDataForRegion } from "../tools/fetch-data-for-region.js";
import { calculateAverage, growthStageIsAllowed } from "../tools/utils.js";
import { PIXEL_SIZE, FIRST_YEAR, THE_YEAR, MONTH_NAMES } from "../constants.js";
import styles from './MonthVis.css';

const COLOR_DATA_ACTUAL     = "#E08724"; // "ACI green"
const COLOR_DATA_HISTORICAL = "#666666";
const COLOR_DATA_FETCHING   = "#CCCCCC";

class MonthVis extends Component {
  constructor () {
    super();
    this.state = {
      selectedRegionId: null,
      isFetching: false,
      months: null,
      data: ""
    };
  }
  getTotalRicePerMonthActual (responseActualYear) {
    const result = [];
    const currentMonthIdx = (new Date()).getMonth();
    let totalRiceSingleMonth, monthData;

    responseActualYear.forEach((monthDataObj, idx) => {
      if (idx > currentMonthIdx)
        return;
      monthData = monthDataObj.monthData;
      totalRiceSingleMonth = 0;
      monthData.data.forEach((regionData) => {
        if (growthStageIsAllowed(regionData.class)) {
          totalRiceSingleMonth += regionData.data;
        }
      });
      result.push(Math.round(totalRiceSingleMonth * PIXEL_SIZE));
    });
    return result;
  }
  getTotalRicePerMonthHistorical (responsePreviousYears) {
    const result = [];
    let j, monthData, totalRiceSingleMonth;

    responsePreviousYears.forEach((monthDataObj, i) => {
      monthData = monthDataObj.monthData;
      j = i % 12;
      result[j] = result[j] || [];
      totalRiceSingleMonth = 0;
      monthData.data.forEach((regionData) => {
        if (regionData === null) {
          console.error("Oops! region data => NULL... average just became less reliable (time=" + monthDataObj.month + ")");
          return;
        }
        if (growthStageIsAllowed(regionData.class)) {
          totalRiceSingleMonth += regionData.data;
        }
      });
      result[j].push(Math.round(totalRiceSingleMonth));
    });

    const finalResult = [];
    result.forEach((monthValues, i) => {
      finalResult.push(PIXEL_SIZE * calculateAverage(monthValues, true));
    });

    return finalResult;
  }
  componentWillReceiveProps (props) {
    this.setState({
      selectedRegionId: props.selectedRegionId,
      isFetching: props.isFetching,
      months: props.months,
      currentYear: props.currentYear
    });
    const currentYear = props.months[0].getFullYear();
    if (props.months && props.selectedRegionId) {
      this.setState({ isFetching: true });
      fetchMonthDataForRegion(props.selectedRegionId, props.months)
      .then(
        (response) => {
          console.log("total responses:", response);
          const responseActualYear = filter(response, { year: currentYear });
          console.log("responseActualYear:", responseActualYear);
          const responsePreviousYears = reject(response, { year: currentYear });
          console.log("responsePreviousYears:", responsePreviousYears);

          this.setState({
            isFetching: false,
            data: {
              totalRicePerMonthActual:
                this.getTotalRicePerMonthActual(responseActualYear),
              totalRicePerMonthHistorical:
                this.getTotalRicePerMonthHistorical(responsePreviousYears)
            }
          });
          this.render();
        },
        (error) => {
          console.error("[E] Promises didn't resolve properly:", error);
          this.setState({ isFetching: false });
        }
      );
    }
  }
  getInnerComponent () {
    ///////////////////////////////////////////////////////////////////////////
    // There are 3 different "states" for this MonthVis part/component:
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
          <div className={styles.MonthVisContent}>
            <WelcomeMessage />
          </div>
        );
      }
    } else {
      if (this.state.isFetching) {
        return (
          <div className={styles.MonthVisContent}>
            <MonthVisLegend
              actualDataColor={COLOR_DATA_ACTUAL}
              historicalDataColor={COLOR_DATA_HISTORICAL}
              currentYear={this.state.currentYear || '...'}
            />
            <MonthVisLineChart
              data={null}
              actualDataColor={COLOR_DATA_ACTUAL}
              fetchingDataColor={COLOR_DATA_FETCHING}
              historicalDataColor={COLOR_DATA_HISTORICAL}
              isFetching={true}
            />
            {
            <MonthVisTable
              data={null}
              isFetching={true}
              currentYear={this.state.currentYear || '...'}
            />
            }
          </div>
        );
      } else {
        return (
          <div className={styles.MonthVisContent}>
            <MonthVisLegend
              actualDataColor={COLOR_DATA_ACTUAL}
              historicalDataColor={COLOR_DATA_HISTORICAL}
              currentYear={this.state.currentYear || '...'}
            />
            <MonthVisLineChart
              actualData={this.state.data.totalRicePerMonthActual}
              actualDataColor={COLOR_DATA_ACTUAL}
              historicalData={this.state.data.totalRicePerMonthHistorical}
              historicalDataColor={COLOR_DATA_HISTORICAL}
              fetchingDataColor={COLOR_DATA_FETCHING}
              isFetching={false}
            />
            <MonthVisTable
              data={this.state.data.totalRicePerMonthActual}
              isFetching={false}
              currentYear={this.state.currentYear || '...'}
            />
          </div>
        );
      }
    }
  }
  render () {
    const { isFetchingMonthData } = this.props;
    return (
      <div className={styles.MonthVisContent}>
        <div className={styles.GroeneBalk}>
          <div className={styles.GroeneBalkText}>
            monthly
          </div>
          {
            this.state.isFetching
              ? <Spinner />
              : null
          }
        </div>
        { this.getInnerComponent() }
      </div>
    );
  }
}

class MonthVisLegend extends Component {
  render () {
    const { currentYear } = this.props;
    return (
      <div className={styles.LegendContainer}>

        <div className={styles.LegendLeftHalf}>
          <div
            className={styles.LegendColorIndicator}
            style={{ backgroundColor: COLOR_DATA_ACTUAL }}>
          </div>
          <div className={styles.LegendText}>{currentYear}</div>
        </div>

        <div className={styles.LegendRightHalf}>
          <div
            className={styles.LegendColorIndicator}
            style={{ backgroundColor: COLOR_DATA_HISTORICAL }}>
          </div>
          <div className={styles.LegendText}>
            {(currentYear - 2) + "-" + (currentYear - 1) + " (average)"}
          </div>
        </div>

      </div>
    );
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

export { MonthVis };

