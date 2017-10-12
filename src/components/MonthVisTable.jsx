import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import { MONTH_NAMES } from "../constants.js";

import styles from './MonthVis.css';

class MonthVisTable extends Component {
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

    console.log("[F] render");
    console.log("*** this.state.formattedData:", this.state.formattedData);

    return (
      <table className={styles.AreaTable}>
        <thead>
          <tr>
            <th>Month</th>
            <th>Rice area (Ha)</th>
          </tr>
        </thead>
        <tbody>
        {
          this.state.formattedData.map((monthData) => {
            return (
              <tr key={Math.random()}>
                <td>{monthData.monthName}</td>
                <td>{monthData.area + " ha"}</td>
              </tr>
            );
          })
        }
        </tbody>
      </table>
    );
  }
}

export { MonthVisTable };