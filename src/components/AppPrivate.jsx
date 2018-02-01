import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import {
  getCurrentYear,
  getMonths,
  getWeeks
} from "../tools/utils-time.js";

import { Header } from "./Header.jsx";
import { MonthVis } from "./MonthVis.jsx";
import { WeekVis } from "./WeekVis.jsx";

class AppPrivate extends Component {
  constructor () {
    super();

    const now = Date.now();
    const currentYear = getCurrentYear();

    this.state = {
      selectedRegionId: "",
      isFetchingMonthData: false,
      isFetchingWeekData: false,
      currentYear: currentYear,
      now: now,
      dates: {
        months: getMonths(currentYear - 1),
        weeks: getWeeks(now)
      }
    };

    this.handleRegionSelected =
      this.handleRegionSelected.bind(this);
    this.handleFetchWeekDataSuccces =
      this.handleFetchWeekDataSuccces.bind(this);
  }
  handleRegionSelected (e) {
    this.setState({
      selectedRegionId: parseInt(e.target.value),
      isFetchingMonthData: true,
      isFetchingWeekData: true
    });
  }
  handleFetchMonthDataSuccces () {
    this.setState({ isFetchingMonthData: false });
  }
  handleFetchWeekDataSuccces () {
    this.setState({ isFetchingWeekData: false });
  }
  render () {
    const { firstName } = this.props;
    return (
      <div>
        <Header
          firstName={firstName}
          selectedRegionId={this.state.selectedRegionId}
          onRegionSelected={this.handleRegionSelected}
        />
        <MonthVis
          selectedRegionId={this.state.selectedRegionId}
          onFetchSuccess={this.handleFetchMonthDataSuccces}
          isFetching={this.state.isFetchingMonthData}
          currentYear={this.state.currentYear}
          months={this.state.dates.months}
        />
        <WeekVis
          selectedRegionId={this.state.selectedRegionId}
          onFetchSuccess={this.handleFetchWeekDataSuccces}
          isFetching={this.state.isFetchingWeekData}
          weeks={this.state.dates.weeks}
        />

      </div>
    );
  }
}

export { AppPrivate };