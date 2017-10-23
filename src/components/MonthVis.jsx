import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import MDSpinner from "react-md-spinner";

import filter from "lodash/filter";
import reject from "lodash/reject";

import { MonthVisLineChart } from "./MonthVisLineChart";
import { MonthVisTable} from "./MonthVisTable";
import { fetchMonthDataForRegion } from "../tools/fetch-data-for-region.js";
import { calculateAverage } from "../tools/utils.js";
import { PIXEL_SIZE, FIRST_YEAR, THE_YEAR, MONTH_NAMES } from "../constants.js";
import styles from './MonthVis.css';

const COLOR_DATA_ACTUAL     = "#E08724"; // "ACI green"
const COLOR_DATA_HISTORICAL = "#666666";
const COLOR_DATA_FETCHING   = "#CCCCCC";

class MonthVis extends Component {
  constructor () {
    super();
    this.state = {
      isFetching: false,
      data: ""
    };
  }
  getTotalRicePerMonthActual (responseActualYear) {
    // console.log("[F] getTotalRicePerMonthActual; responseActualYear =", responseActualYear);
    const result = [];
    let totalRiceSingleMonth;
    responseActualYear.forEach((monthData) => {
      totalRiceSingleMonth = 0;
      monthData.data.forEach((regionData) => {
        if (regionData.class > 2) {
          totalRiceSingleMonth += regionData.data;
        }
      });
      result.push(Math.round(totalRiceSingleMonth * PIXEL_SIZE));
    });

    // console.log("*** result (actual):", result);
    return result;
  }
  getTotalRicePerMonthHistorical (responsePreviousYears) {
    // console.log("[F] getTotalRicePerMonthHistorical; responsePreviousYears =", responsePreviousYears);

    if (responsePreviousYears.length % 12 !== 0) {
      console.error("Historical avg not determined; historical data was for an incorrect amt of months");
    }

    const result = [];
    let totalRiceSingleMonth;
    let j;

    responsePreviousYears.forEach((monthData, i) => {
      j = i % 12;
      result[j] = result[j] || [];
      totalRiceSingleMonth = 0;
      monthData.data.forEach((regionData) => {
        if (regionData.class > 2) {
          totalRiceSingleMonth += regionData.data;
        }
      });
      result[j].push(Math.round(totalRiceSingleMonth * PIXEL_SIZE));
    });

    const finalResult = [];
    result.forEach((monthValues, i) => {
      finalResult.push(calculateAverage(monthValues, true));
    });

    return finalResult;
  }
  componentWillReceiveProps (props) {
    this.setState({
      selectedRegionId: props.selectedRegionId,
      isFetching: props.isFetching
    });
    if (props.selectedRegionId) {
      this.setState({ isFetching: true });
      fetchMonthDataForRegion(props.selectedRegionId).then(
        (response) => {

          const responseActualYear = filter(response, { year: THE_YEAR }).map(
            (obj) => obj.monthData);

          const responsePreviousYears = reject(response, { year: THE_YEAR }).map(
            (obj) => obj.monthData);

          this.setState({
            isFetching: false,
            data: {
              // raw: responseActualYear,
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
    if (this.state.data === "") {
      if (!this.state.isFetching) {
        return <WelcomeMessage />
      }
    } else {
      if (this.state.isFetching) {
        return (
          <div>
            <MonthVisLegend
              actualDataColor={COLOR_DATA_ACTUAL}
              historicalDataColor={COLOR_DATA_HISTORICAL}
            />
            <MonthVisLineChart
              data={null}
              actualDataColor={COLOR_DATA_ACTUAL}
              fetchingDataColor={COLOR_DATA_FETCHING}
              historicalDataColor={COLOR_DATA_HISTORICAL}
              isFetching={true}
            />
            <MonthVisTable
              data={null}
              isFetching={true}
            />
          </div>
        );
      } else {
        return (
          <div>
            <MonthVisLegend
              actualDataColor={COLOR_DATA_ACTUAL}
              historicalDataColor={COLOR_DATA_HISTORICAL}
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
            Monthly
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
    return (
      <div className={styles.LegendContainer}>

        <div className={styles.LegendLeftHalf}>
          <div
            className={styles.LegendColorIndicator}
            style={{ backgroundColor: COLOR_DATA_ACTUAL }}>
          </div>
          <div className={styles.LegendText}>{THE_YEAR}</div>
        </div>

        <div className={styles.LegendRightHalf}>
          <div
            className={styles.LegendColorIndicator}
            style={{ backgroundColor: COLOR_DATA_HISTORICAL }}>
          </div>
          <div className={styles.LegendText}>
            {FIRST_YEAR + "-" + (THE_YEAR - 1) + " (Average)"}
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

export { MonthVis };

