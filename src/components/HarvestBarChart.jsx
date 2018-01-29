import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import forEach from 'lodash/forEach';
import find from 'lodash/find';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

import {
  getWeekVisUnixTimestamps,
  convertTimestampToUTC
} from '../tools/utils.js'

import { GROWTH_STAGE_COLORS, PIXEL_SIZE } from '../constants';

import styles from "./HarvestBarChart.css";

class HarvestBarChart extends Component {
  constructor () {
    super();
    this.state = {
      isFetching: null,
      formattedData: null,
    };

    // WHY CAN THIS REMAIN COMMENTED W/O CRASHING????
    ///////////////////////////////////////////////////////////////////////////
    // this.updateData = this.updateData.bind(this);
    // this.getFormattedData = this.getFormattedData.bind(this);
    // this.getFormattedTimestamp = this.getFormattedTimestamp.bind(this);


  }
  componentWillMount () {
    this.updateData(this.props);
  }
  componentWillReceiveProps (props) {
    this.updateData(props);
  }
  updateData (props) {
    const formattedData = this.getFormattedData(
      props.data,
      props.isFetching
    );
    this.setState({ formattedData, isFetching: props.isFetching });
  }
  getFormattedData (rawData, isFetching) {
    if (isFetching) {
      // Still fetching data...
      if (this.state.formattedData) {
        // ..but we already have the most recently retrieved data; we will use
        // that while still fetching the new data (because: smoother UX/no
        // disappearing grid/animations etc)
        return this.state.formattedData;
      } else {
        // ..and there is no previously retrieved data: we'll use dummy data
        // (because: grid/axis will be in place when we'll draw the actual data)
        let unixTimestamps = getWeekVisUnixTimestamps(true), // TODO: set arg to false for non-dev environments
            weekTimestamps = unixTimestamps.map(convertTimestampToUTC);

        return weekTimestamps.map((ts) => {
          return {
            'timestamp': ts.split('T')[0],
            'harvestArea': null
          };
        });
      }
    } else {
      // OK, fetching data is finished: let's format that data for our BarChart:
      let results = [],
          singleResult,
          harvestArea;

      forEach(rawData, function (x) {
        singleResult = {
          timestamp: x.weekTimestamp.split('T')[0]
        }
        try {
          harvestArea = find(x.weekData.data, { 'label' : 'Harvest' }).data;
        } catch (e) {
          harvestArea = 0;
        }
        singleResult.harvestArea = Math.round(100 * PIXEL_SIZE * harvestArea) / 100;
        results.push(singleResult);
      });
      return results;
    }
  }
  getFormattedTimestamp (ts) {
    const parts = ts.split('-');
    return parts[1] + '-' + parts[2];
  }
  render () {

    const { formattedData, isFetching } = this.state;

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
            tickFormatter={this.getFormattedTimestamp}
          />
          <YAxis
            tickCount={5}
            tick={{ fontSize: "11px" }}
            tickFormatter={ (x) => x + " Ha" }
          />
          <CartesianGrid strokeDasharray="3 3" />

          <Bar
            className={`${styles.BarOpacityDefault} ${isFetching ? styles.BarOpacityInactive : ""}`}
            dataKey="harvestArea"
            fill={isFetching ?  "#666666" : GROWTH_STAGE_COLORS.Harvest}
            stroke="#666"
            barSize={42}
          />

        </BarChart>
      </div>
    );
  }
}

export { HarvestBarChart };