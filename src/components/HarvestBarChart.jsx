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
  }
  componentWillMount () {
    this.updateData(this.props);
  }
  componentWillReceiveProps (props) {
    this.updateData(props);
  }
  updateData (props) {
    console.log("props.weeks:", props.weeks);
    const formattedData = this.getFormattedData(
      props.data,
      props.isFetching
    );
    this.setState({
      formattedData,
      isFetching: props.isFetching,
      weeks: props.weeks
    });
  }
  getFormattedData (rawData, isFetching) {
    if (isFetching || !this.state.weeks) {
      // Still fetching data...
      if (this.state.formattedData) {
        // ..but we already have the most recently retrieved data; we will use
        // that while still fetching the new data (because: smoother UX/no
        // disappearing grid/animations etc)
        return this.state.formattedData;
      } else {
        // ..and there is no previously retrieved data: we'll use dummy data
        // (because: grid/axis will be in place when we'll draw the actual data)


        return [0,1,2,3,4,5].map((week) => {
          return {
            'timestamp': '...',
            'harvestArea': null
          };
        });
      }
    } else {
      // OK, fetching data is finished: let's format that data for our BarChart:
      let results = [],
          singleResult,
          harvestArea,
          weeks = this.state.weeks;

        console.log('weeks sorta lookis like:', weeks);

      forEach(rawData, function (x, idx) {
        const week = weeks[idx];
        singleResult = {
          timestamp: week.getDate() + '-' + week.getMonth(),
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
  getFormattedTimestamp (ts, a, b, c) {
    const parts = ts.split('-');
    return parts[1] + '-' + parts[2];
  }
  render () {

    const { formattedData, isFetching } = this.state;

    const yAxisFormatter = isFetching
      ? (_) => '... ha.'
      : (x) => x + " ha."

    return (
      <div className={styles.TheBarChartContainer}>
        <BarChart
          width={280}
          height={390}
          data={formattedData}
          className={styles.TheBarChart}>
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
            tickFormatter={yAxisFormatter}
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

        <div className={styles.BarChartLegend}>
          <div className={styles.BarChartLegendColor} />
          <span className={styles.BarChartLegendText}>harvest</span>
        </div>
      </div>
    );
  }
}

export { HarvestBarChart };