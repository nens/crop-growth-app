import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import styles from './MonthVis.css';

class MonthVis extends Component {
  render () {
    return (
      <div>
        <div className={styles.GroeneBalk}>
          <div className={styles.GroeneBalkText}>Monthly</div>
        </div>
      </div>
    );
  }
}

export { MonthVis };

