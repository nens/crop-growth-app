import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import forEach from 'lodash/forEach';
import find from 'lodash/find';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

import { GROWTH_STAGE_COLORS, PIXEL_SIZE } from '../constants';

import styles from "./HarvestBarChart.css";

class HarvestBarChart extends Component {
  constructor () {
    super();
    this.formatData = this.formatData.bind(this);
  }
  formatData (rawData) {
    console.log("[F] formatData; arg 'rawData' =", rawData);

    const results = [];
    let singleResult, harvestArea;

    forEach(rawData, function (x) {
      singleResult = {
        timestamp: x.weekTimestamp.split('T')[0]
      }

      try {
        harvestArea = find(x.weekData.data, { 'label' : 'Harvest' }).data;
      } catch (e) {
        harvestArea = 0;
      }

      singleResult.harvestArea = PIXEL_SIZE * harvestArea;
      results.push(singleResult);
    });

    return results;
  }
  render () {
    const formattedData = this.formatData(this.props.data);
    const BAR_COLOR = GROWTH_STAGE_COLORS.Harvest;

    function _timestampFormatter (ts) {
      // if (ts === formattedData[0].timestamp) {
      //   return ts;
      // } else {
      const parts = ts.split('-');
      return parts[1] + '-' + parts[2];
      // }
    }

    console.log("...formattedData looks like:", formattedData);

    return (
      <div className={styles.TheBarChartContainer}>
        <div className={styles.BarChartLegend}>
          <div className={styles.BarChartLegendColor}></div>
          <span className={styles.BarChartLegendText}>
            Harvest
          </span>
        </div>

        <BarChart width={300} height={240} data={formattedData}>
          <XAxis
            interval="preserveStart"
            tickCount={6}
            dataKey="timestamp"
            tick={{ fontSize: "11px" }}
            tickFormatter={_timestampFormatter}
          />
          <YAxis
            tickCount={5}
            tick={{ fontSize: "11px" }}
            tickFormatter={ (x) => x + " Ha" }
          />
          <CartesianGrid strokeDasharray="3 3" />
          <Bar
            dataKey="harvestArea"
            fill={BAR_COLOR}
            stroke="#666"
            barSize={42}
          />
        </BarChart>
      </div>
    );
  }
}

export { HarvestBarChart };