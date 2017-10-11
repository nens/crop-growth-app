import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import { Header } from "./Header.jsx";
import { MonthVis } from "./MonthVis.jsx";
import { REGION_DATA } from "../constants.js";

import { fetchDataForRegion } from "../tools/fetch-data-for-region.js";

class AppPrivate extends Component {
  constructor () {
    super();
    this.state = {
      isFetching: false,
      selectedRegionId: null,
      data: null
    }
    this.handleFetchStart.bind(this);
    this.handleFetchSuccess.bind(this);
  }
  handleFetchStart (regionId) {
    this.setState({
      isFetching: true,
      selectedRegionId: regionId
    });
  }
  handleFetchSuccess (response) {
    this.setState({
      isFetching: false,
    });
  }
  render () {
    const { firstName } = this.props;
    return (
      <div>
        <Header
          firstName={firstName}
          regions={REGION_DATA.results.features}
          fetchDataForRegion={fetchDataForRegion}
          onFetchStart={this.handleFetchStart}
          onFetchSuccess={this.handleFetchSuccess}
        />
        <MonthVis />
      </div>
    );
  }
}

export { AppPrivate };