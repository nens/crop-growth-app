import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import { Header } from "./Header.jsx";
import { MonthVis } from "./MonthVis.jsx";

class AppPrivate extends Component {
  constructor () {
    super();
    this.state = {
      selectedRegionId: "",
      isFetchingMonthData: false,
      isFetchingWeekData: false
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
        />
      </div>
    );
  }
}

export { AppPrivate };