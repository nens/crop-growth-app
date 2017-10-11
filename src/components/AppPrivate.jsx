import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import { Header } from "./Header.jsx";
import { MonthVis } from "./MonthVis.jsx";

class AppPrivate extends Component {
  constructor () {
    super();
    this.state = { selectedRegionId: "" };
    this.handleRegionSelected = this.handleRegionSelected.bind(this);
  }
  handleRegionSelected (e) {
    this.setState({ selectedRegionId: parseInt(e.target.value) });
  }
  render () {
    const { firstName } = this.props;
    return (
      <div>
        <Header
          firstName={firstName}
          selectedRegionId={this.state.selectedRegionId}
          onRegionSelected={this.handleRegionSelected} />
        <MonthVis selectedRegionId={this.state.selectedRegionId} />
      </div>
    );
  }
}

export { AppPrivate };