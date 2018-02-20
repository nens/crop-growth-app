import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

import {
  MONTH_NAMES,
  LINE_COLOR_THIS_YEAR,
  LINE_COLOR_PREV_YEAR,
  LINE_COLOR_AVG,
  FETCHING_DATA_COLOR
} from "../constants.js";

import styles from './MonthVis.css';

import includes from 'lodash/includes';

// const LINE_COLOR_THIS_YEAR = "#FF0080";
// const LINE_COLOR_PREV_YEAR = "#FFA2FF";
// const LINE_COLOR_AVG = "#666666";

class MonthVisLineChart extends Component {
  constructor () {
    super();
    this.state = { formattedData: "" };
    this.formatData = this.formatData.bind(this);
  }
  componentWillMount () {
    this.updateData(this.props);
  }
  componentWillReceiveProps (props) {
    this.updateData(props);
  }
  updateData (props) {
    if (!props.isFetching) {
      this.setState({
        formattedData: this.formatData(
          props.dataCurrentYear,
          props.dataPreviousYear,
          props.dataThreeYearAvg
        )
      });
    }
  }
  formatData (dataCurrentYear, dataPreviousYear, dataThreeYearAvg) {
    console.log("[F] formatData:");
    console.log("*** dataCurrentYear...:", dataCurrentYear);
    console.log("*** dataPreviousYear..:", dataPreviousYear);
    console.log("*** dataThreeYearAvg..:", dataThreeYearAvg);

    if (includes(arguments, null)) {
      console.log(
        "[!] Cannot exec formatData since data ain't sufficiently rich!"
      );

      return this.state.formattedData;
    }

    const currentMonthIdx = (new Date()).getMonth()

    console.log("currentMonthIdx:", currentMonthIdx);

    const result = MONTH_NAMES.map((monthName, i) => {
      return {
        monthName,
        dataCurrentYear:  i <= currentMonthIdx ? dataCurrentYear[i] : null,
        dataPreviousYear: dataPreviousYear[i],
        dataThreeYearAvg: dataThreeYearAvg[i]
      };
    });

    console.log("RESULT:", result);

    return result;
  }

  render () {
    const isFetching = this.props.isFetching;

    if (!isFetching &&
        !(this.props.dataCurrentYear &&
          this.props.dataPreviousYear &&
          this.props.dataThreeYearAvg)) {
      console.log("..but there's no *new* data to render!");

      if (!this.state.formattedData) {
        console.log("..and no *old* data, too! Early return");
        return null;
      } else {
        console.log(
          "..but we do still have the *old* data, let's " +
          "render that instead!!1!");
      }
    }

    const yAxisFormatter = isFetching
      ? (_) => '...'
      : (x) => x + "";

    const {
      dataCurrentYear,
      dataPreviousYear,
      dataThreeYearAvg
    } = this.state.formattedData;

    return (
      <div className={styles.LineChartContainer}>
        <div className={styles.YAxisLabel}>rice area (ha.)</div>
        <LineChart
          width={600}
          height={260}
          data={this.state.formattedData}
          styles={styles.YAxisLabel}>

          <Line
            type="monotone"
            dot={false}
            className={`${styles.LineOpacityDefault} ${isFetching ? styles.LineOpacityInactive : ""}`}
            dataKey="dataCurrentYear"

            stroke={ isFetching ? FETCHING_DATA_COLOR : LINE_COLOR_THIS_YEAR }
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dot={false}
            className={`${styles.LineOpacityDefault} ${isFetching ? styles.LineOpacityInactive : ""}`}
            dataKey="dataPreviousYear"

            stroke={ isFetching ? FETCHING_DATA_COLOR : LINE_COLOR_PREV_YEAR }
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dot={false}
            className={`${styles.LineOpacityDefault} ${isFetching ? styles.LineOpacityInactive : ""}`}
            dataKey="dataThreeYearAvg"

            stroke={ isFetching ? FETCHING_DATA_COLOR : LINE_COLOR_AVG }
            strokeWidth={2}
          />

          <XAxis
            tickCount={13}
            dataKey="monthName"
            tick={{ fontSize: "11px" }}
          />
          <YAxis
            tickCount={5}
            tick={{ fontSize: "11px" }}
            tickFormatter={yAxisFormatter}
          />
          <CartesianGrid strokeDasharray="3 3" />
        </LineChart>
      </div>
    );
  }
}

export { MonthVisLineChart }