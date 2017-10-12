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
      this.setState({ formattedData: this.formatData(props.data) });
    }
  }
  formatData (data) {
    return MONTH_NAMES.map((monthName, i) => {
      return { area: data[i], monthName };
    });
  }
  render () {
    const isFetching = this.props.isFetching;

    if (!isFetching && !this.props.data) {
      return null;
    }

    return (
      <div className={styles.ChartContainer}>
        <LineChart
          width={600}
          height={250}
          data={this.state.formattedData}>

          <Line
            className={`${styles.LineOpacityDefault} ${isFetching ? styles.LineOpacityInactive : ""}`}
            type="monotone"
            dataKey="area"
            stroke={ isFetching ? "#CCC" : "#00A55D" }
            strokeWidth={2}
            dot={false}
          />

          <XAxis
            dataKey="monthName"
            tickCount={8}
            tick={{ fontSize: "12px" }}
          />
          <YAxis
            tickCount={5}
            tick={{ fontSize: "12px" }}
            tickFormatter={ (x) => x + " Ha" }
          />
          <CartesianGrid strokeDasharray="3 3" />
        </LineChart>
      </div>
    );
  }
}

export { MonthVisLineChart }