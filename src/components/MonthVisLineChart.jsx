import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

import {
  MONTH_NAMES,
  LINE_COLOR_THIS_YEAR,
  LINE_COLOR_PREV_YEAR,
  LINE_COLOR_AVG,
  FETCHING_DATA_COLOR
} from "../constants.js";

import styles from "./MonthVis.css";

import includes from "lodash/includes";

class MonthVisLineChart extends Component {
  constructor() {
    super();
    this.state = { formattedData: "" };
    this.formatData = this.formatData.bind(this);
  }
  componentWillMount() {
    this.updateData(this.props);
  }
  componentWillReceiveProps(props) {
    this.updateData(props);
  }
  updateData(props) {
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
  formatData(dataCurrentYear, dataPreviousYear, dataThreeYearAvg) {
    if (includes(arguments, null)) {
      console.log(
        "[!] Cannot exec formatData since data ain't sufficiently rich!"
      );
      return this.state.formattedData;
    }

    const currentMonthIdx = new Date().getMonth();

    return MONTH_NAMES.map((monthName, i) => {
      return {
        monthName,
        dataCurrentYear: i <= currentMonthIdx ? dataCurrentYear[i] : null,
        dataPreviousYear: dataPreviousYear[i],
        dataThreeYearAvg: dataThreeYearAvg[i]
      };
    });
  }

  render() {
    const isFetching = this.props.isFetching;

    if (
      !isFetching &&
      !(
        this.props.dataCurrentYear &&
        this.props.dataPreviousYear &&
        this.props.dataThreeYearAvg
      )
    ) {
      if (!this.state.formattedData) {
        return null;
      }
    }

    const yAxisFormatter = isFetching ? _ => "..." : x => x + "";

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
          styles={styles.YAxisLabel}
        >
          <Line
            type="monotone"
            dot={false}
            className={`${styles.LineOpacityDefault} ${isFetching
              ? styles.LineOpacityInactive
              : ""}`}
            dataKey="dataCurrentYear"
            stroke={isFetching ? FETCHING_DATA_COLOR : LINE_COLOR_THIS_YEAR}
            strokeWidth={5}
          />
          <Line
            type="monotone"
            dot={false}
            className={`${styles.LineOpacityDefault} ${isFetching
              ? styles.LineOpacityInactive
              : ""}`}
            dataKey="dataPreviousYear"
            stroke={isFetching ? FETCHING_DATA_COLOR : LINE_COLOR_PREV_YEAR}
            strokeWidth={5}
          />
          <Line
            type="monotone"
            dot={false}
            className={`${styles.LineOpacityDefault} ${isFetching
              ? styles.LineOpacityInactive
              : ""}`}
            dataKey="dataThreeYearAvg"
            stroke={isFetching ? FETCHING_DATA_COLOR : LINE_COLOR_AVG}
            strokeWidth={1}
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

export { MonthVisLineChart };
