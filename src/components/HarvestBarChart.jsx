import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import forEach from 'lodash/forEach';
import find from 'lodash/find';
import reject from 'lodash/reject';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

import {
  getWeekVisUnixTimestamps,
  convertTimestampToUTC
} from '../tools/utils.js'

import { GROWTH_STAGE_COLORS, PIXEL_SIZE } from '../constants';

import { getCurrentYear } from '../tools/utils-time.js'

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
    const formattedData = this.getFormattedData(
      props.data,
      props.isFetching
    );
    this.setState({
      formattedData: formattedData.reverse(),
      isFetching: props.isFetching
    });
  }
  getFormattedData (rawData, isFetching) {
    if (isFetching) {
      return this.state.formattedData || null;
    } else {

      const results = [];

      const CURRENT_YEAR = getCurrentYear();
      const rawDataActual     = reject(rawData, { isHistorical: true });
      const rawDataHistorical = reject(rawData, { isHistorical: false });

      forEach(rawDataActual, (rd) => {

        const tsParts = rd.weekTimestamp.split('T')[0].split('-');
        const tsSlug = tsParts[1] + '-' + tsParts[2];
        const result = { timestamp: tsSlug };

        let harvestArea;

        // TODO: use other way of calculating this (ie. check lzd-client)
        try {
          harvestArea = find(rd.weekData.data, { 'label' : 'Harvest' }).data;
          harvestArea = Math.round(100 * PIXEL_SIZE * harvestArea) / 100;
        } catch (e) {
          harvestArea = 0
        }

        result.dataActual = harvestArea;
        results.push(result);
      });

      // console.log("[!] results (intermediate):", results);

      forEach(rawDataHistorical, (rd) => {

        const tsParts = rd.weekTimestamp.split('T')[0].split('-');
        const tsSlug = tsParts[1] + '-' + tsParts[2];
        const result = find(results, { timestamp: tsSlug });

        let harvestArea;

        try {
          harvestArea = find(rd.weekData.data, { 'label' : 'Harvest' }).data;
          harvestArea = Math.round(100 * PIXEL_SIZE * harvestArea) / 100;
        } catch (e) {
          harvestArea = 0
        }

        result.dataHistorical = harvestArea;
      });
      return results;
    }
  }
  getFormattedTimestamp (ts) {
    return ts;
  }
  render () {

    const { formattedData, isFetching } = this.state;

    const yAxisFormatter = isFetching
      ? (_) => '... ha.'
      : (x) => x + " ha."

    return (
      <div className={styles.TheBarChartContainer}>
        <BarChart
          width={240}
          height={390}
          data={formattedData}
          className={styles.TheBarChart}>
          <XAxis
            interval="preserveEnd"
            tickCount={6}
            dataKey="timestamp"
            tick={{ fontSize: "11px" }}
            tickFormatter={isFetching ? () => '.........' : this.getFormattedTimestamp}
          />
          <YAxis
            tickCount={5}
            tick={{ fontSize: "11px" }}
            tickFormatter={yAxisFormatter}
          />
          <CartesianGrid strokeDasharray="3 3" />

          <Bar
            className={`${styles.BarOpacityDefault} ${isFetching ? styles.BarOpacityInactive : ""}`}
            dataKey="dataActual"
            fill={isFetching ?  "#666666" : GROWTH_STAGE_COLORS.Harvest}
            stroke="#666"
            barSize={42}
          />

          <Bar
            className={`${styles.BarOpacityDefault} ${isFetching ? styles.BarOpacityInactive : ""}`}
            dataKey="dataHistorical"
            fill={isFetching ?  "#666666" : '#ffffff'}
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