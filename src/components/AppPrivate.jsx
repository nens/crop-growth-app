import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import { Header } from "./Header.jsx";
import { MonthVis } from "./MonthVis.jsx";

import { REGION_DATA } from "../constants.js";

class AppPrivate extends Component {
  componentWillMount () {
    console.log("[F] AppPrivate.componentWillMount; REGION_DATA =", REGION_DATA);
  }
  render() {
    const { firstName } = this.props;
    return (
      <div>
        <Header firstName={firstName} />
        <MonthVis />
      </div>
    );
  }
}

export { AppPrivate };