import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

import { MONTH_NAMES } from "../constants.js";

import styles from './MonthVis.css';

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
        // Both actual and historical data (=required to have Recharts.js draw
        // two distinct lines simultaneously in a single charts)
        formattedData: this.formatData(props.actualData, props.historicalData),
      });
    }
  }
  formatData (dataActual, dataHistorical) {
    return MONTH_NAMES.map((monthName, i) => {
      return {
        monthName,
        areaActual: dataActual[i],
        areaHistorical: dataHistorical[i]
      };
    });
  }
  render () {
    const isFetching = this.props.isFetching;

    if (!isFetching && (!this.props.actualData || !this.props.historicalData)) {
      return null;
    }

    if (this.state.formattedData === "") {
      return null;
    } else {
      console.log("[!] formattedData (lineChart) looks like:", this.state.formattedData);
    }

    const {
      actualDataColor,
      historicalDataColor,
      fetchingDataColor
    } = this.props;

    return (
      <div className={styles.LineChartContainer}>
        <LineChart
          width={620}
          height={250}
          data={this.state.formattedData}>

          {/* Line 1 of 2: the actual year values for the selected region (12x) */}
          <Line
            className={`${styles.LineOpacityDefault} ${isFetching ? styles.LineOpacityInactive : ""}`}
            type="monotone"
            dataKey="areaActual"
            stroke={ isFetching ? fetchingDataColor : actualDataColor }
            strokeWidth={2}
            dot={false}
          />

          {/* Line 2 of 2: the historical average values for the selected region (12x) */}
          <Line
            className={`${styles.LineOpacityDefault} ${isFetching ? styles.LineOpacityInactive : ""}`}
            type="monotone"
            dataKey="areaHistorical"
            stroke={ isFetching ? fetchingDataColor : historicalDataColor }
            strokeWidth={2}
            dot={false}
          />

          <XAxis
            tickCount={13}
            dataKey="monthName"
            tick={{ fontSize: "11px" }}
          />
          <YAxis
            tickCount={5}
            tick={{ fontSize: "11px" }}
            tickFormatter={ (x) => x + " Ha" }
          />
          <CartesianGrid strokeDasharray="3 3" />
        </LineChart>
      </div>
    );
  }
}

export { MonthVisLineChart }