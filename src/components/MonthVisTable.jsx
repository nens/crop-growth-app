import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import { MONTH_NAMES } from "../constants.js";

import styles from './MonthVis.css';

class MonthVisTable extends Component {
  constructor () {
    super();
    this.state = {
      currentYear: null,
      formattedData: "",
      isFetching: false
    };
    this.formatData = this.formatData.bind(this);
  }
  componentWillMount () {
    this.setState({ currentYear: this.props.currentYear });
    this.updateData(this.props);
  }
  componentWillReceiveProps (props) {
    this.updateData(props);
  }
  updateData (props) {
    if (props.isFetching) {
      this.setState({
        isFetching: true
      });
    } else {
      this.setState({
        formattedData: this.formatData(props.data),
        isFetching: false
      });
    }
  }
  formatData (data) {
    const currentMonthIdx = (new Date()).getMonth();
    let value;
    return MONTH_NAMES.map((monthName, i) => {
      value = i <= currentMonthIdx ? data[i] : undefined;
      return { area: value, monthName };
    });
  }
  render () {

    const { formattedData, isFetching, currentYear } = this.state;

    return (
      <table className={styles.AreaTable}>
        <thead>
          <tr>
            <th>date</th>
            <th>rice (ha.)</th>
          </tr>
        </thead>
        <tbody>
        {
          this.state.formattedData.map((monthData, idx) => {
            return (
              <tr key={Math.random()}>
                <td style={{'textAlign': 'center', 'minWidth': '80px'}}>
                  {currentYear}-{ idx > 8 ? idx + 1 : '0' + (idx + 1) }-01
                </td>
                <td>{isFetching ? '...' : monthData.area}</td>
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