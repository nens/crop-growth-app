import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import {
  getCurrentYear,
  getMonths,
  getWeeks
} from "../tools/utils-time.js";

import { getFeatureById } from "../tools/utils.js";

import { Header } from "./Header.jsx";
import { MonthVis } from "./MonthVis.jsx";
import { WeekVis } from "./WeekVis.jsx";

import styles from "./AppPrivate.css";


class AppPrivate extends Component {
  constructor () {
    super();

    const now = Date.now();
    const currentYear = getCurrentYear();

    this.state = {
      selectedRegionId: "",
      selectedRegionSlug: "",
      isFetchingMonthData: false,
      isFetchingWeekData: false,
      currentYear: currentYear,
      now: now,
      dates: {
        // 'months' has an inverted order: 36 dates starting on
        // 01-12-<current-year>, ending with 01-01-<current-year - 2>
        months: getMonths(currentYear),
        weeks: getWeeks(now)
      }
    };

    this.handleRegionSelected =
      this.handleRegionSelected.bind(this);
    this.handleFetchWeekDataSuccces =
      this.handleFetchWeekDataSuccces.bind(this);
  }
  handleRegionSelected (e) {
    const regionId = parseInt(e.target.value);
    const feature = getFeatureById(regionId);

    this.setState({
      selectedRegionId: regionId,

      // Can be used for *displaying* the selected region's total area; it is
      // not used for calculations.
      selectedRegionArea: feature.properties.area / 10000,
      selectedRegionSlug: feature.properties.name,
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
      <div className={styles.AppPrivateContainer}>
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
          totalArea={this.state.selectedRegionArea}
        />
        <WeekVis
          selectedRegionId={this.state.selectedRegionId}
          selectedRegionSlug={this.state.selectedRegionSlug}
          onFetchSuccess={this.handleFetchWeekDataSuccces}
          isFetching={this.state.isFetchingWeekData}
          weeks={this.state.dates.weeks}
          totalArea={this.state.selectedRegionArea}
        />
      </div>
    );
  }
}

export { AppPrivate };