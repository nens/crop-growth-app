import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import MDSpinner from "react-md-spinner";

import filter from "lodash/filter";
import reject from "lodash/reject";
import map from "lodash/map";

import { MonthVisLineChart } from "./MonthVisLineChart";
import { MonthVisTable} from "./MonthVisTable";
import { fetchMonthDataForRegion } from "../tools/fetch-data-for-region.js";
import { calculateAverage, growthStageIsAllowed, pixels2hectares }
  from "../tools/utils.js";
import { getCurrentYear } from "../tools/utils-time.js"

import {
  PIXEL_SIZE,
  FIRST_YEAR,
  THE_YEAR,
  MONTH_NAMES,
  LINE_COLOR_THIS_YEAR,
  LINE_COLOR_PREV_YEAR,
  LINE_COLOR_AVG
} from "../constants.js";


import styles from './MonthVis.css';


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
    // const currentMonthIdx = (new Date()).getMonth();
    let totalRiceSingleMonth, monthData;

    responseActualYear.forEach((monthDataObj, idx) => {
      monthData = monthDataObj.monthData;
      totalRiceSingleMonth = 0;
      monthData.data.forEach((regionData) => {
        if (growthStageIsAllowed(regionData.class)) {
          totalRiceSingleMonth += regionData.data;
        }
      });

      result.push(Math.round(totalRiceSingleMonth * PIXEL_SIZE));
    });

    const totalArea = this.state.totalArea;
    const totalPixels = responseActualYear[0].monthData.data[0].total;
    const resultHa = map(result, (pxCount) => pixels2hectares(pxCount, totalPixels, totalArea));
    return resultHa;
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
          console.error("[E] Oops! region data => NULL... average just became less reliable (time=" + monthDataObj.month + ")");
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

    const totalArea = this.state.totalArea;
    const totalPixels = responsePreviousYears[0].monthData.data[0].total;

    const finalResultHa =  map(finalResult,
      (pxCount) => pixels2hectares(pxCount, totalPixels, totalArea));

    return finalResultHa;
  }
  componentWillReceiveProps (props) {
    this.setState({
      selectedRegionId: props.selectedRegionId,
      isFetching: props.isFetching,
      months: props.months,
      currentYear: props.currentYear,
      totalArea: props.totalArea
    });
    const currentYear = props.months[0].getFullYear();

    if (props.months && props.selectedRegionId) {
      this.setState({ isFetching: true });
      fetchMonthDataForRegion(props.selectedRegionId, props.months)
      .then(
        (response) => {

          // YearN; e.g. 2018 (used "literally" to draw single line in chart)
          const responseYearN = filter(response, { year: currentYear });
          const dataYearN = this.getTotalRicePerMonthActual(responseYearN);

          // YearN_1; e.g 2017 (used "literally" to draw single line in chart)
          const responseYearN_1 = filter(response, { year: currentYear - 1});
          const dataYearN_1 = this.getTotalRicePerMonthActual(responseYearN_1);

          // YearN_2; e.g. 2016 (used only to calc. historical average)
          const responseYearN_2 = filter(response, { year: currentYear - 2});
          const dataYearN_2 = this.getTotalRicePerMonthActual(responseYearN_2);

          const currentMonthIdx = (new Date()).getMonth();
          const dataThreeYearAvg = [];

          let monthValueN,
              monthValueN_1,
              monthValueN_2,
              monthValueAvg,
              threeYearAvg = [];

          for (let i = 0; i < 12; i++) {

            monthValueN_2 = dataYearN_2[i];
            monthValueN_1 = dataYearN_1[i];

            if (i <= currentMonthIdx) {
              // We also use this month value for current year (for calculating
              // the average): the month is not in the future
              monthValueN = dataYearN[i];
              monthValueAvg = Math.round(
                (monthValueN + monthValueN_1 + monthValueN_2) / 3);
            } else {
              // We skip this month value for the current year (for calculating
              // the average) because it is from the future:
              monthValueAvg = Math.round((monthValueN_1 + monthValueN_2) / 2);
            }

            threeYearAvg.push(monthValueAvg);
          }

          this.setState({
            isFetching: false,
            data: {
              currentYear: dataYearN,
              previousYear: dataYearN_1,
              threeYearAvg: threeYearAvg
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
              currentYear={this.state.currentYear || '...'}
            />
            <MonthVisLineChart
              isFetching={true}
              dataCurrentYear={null}
              dataPreviousYear={null}
              dataThreeYearAvg={null}
            />
            <MonthVisTable
              data={null}
              isFetching={true}
              currentYear={this.state.currentYear || '...'}
            />
          </div>
        );
      } else {
        return (
          <div className={styles.MonthVisContent}>
            <MonthVisLegend
              currentYear={this.state.currentYear || '...'}
            />
            <MonthVisLineChart
              isFetching={false}
              dataCurrentYear={this.state.data.currentYear}
              dataPreviousYear={this.state.data.previousYear}
              dataThreeYearAvg={this.state.data.threeYearAvg}
            />
            <MonthVisTable
              data={this.state.data.currentYear}
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

        <div className={styles.LegendLeftPart}>
          <div
            className={styles.LegendColorIndicator}
            style={{ backgroundColor: LINE_COLOR_THIS_YEAR }}>
          </div>
          <div className={styles.LegendText}>
            {currentYear}
          </div>
        </div>

        <div className={styles.LegendCenterPart}>
          <div
            className={styles.LegendColorIndicator}
            style={{ backgroundColor: LINE_COLOR_PREV_YEAR }}>
          </div>
          <div className={styles.LegendText}>
            {currentYear - 1}
          </div>
        </div>

        <div className={styles.LegendRightHalf}>
          <div
            className={styles.LegendColorIndicator}
            style={{ backgroundColor: LINE_COLOR_AVG }}>
          </div>
          <div className={styles.LegendText}>
            average
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

