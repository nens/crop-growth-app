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

const COLOR_HARVEST_LAST_YEAR = 'rgb(244, 162, 130)';

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
      formattedData: props.isFetching ? formattedData : formattedData.reverse(),
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

        try {
          harvestArea = find(rd.weekData.data, { 'label' : 'Harvest' }).data;
          harvestArea = Math.round(100 * PIXEL_SIZE * harvestArea) / 100;
        } catch (e) {
          harvestArea = 0
        }

        result.dataActual = harvestArea;
        results.push(result);
      });

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
    // Apparently this fn is now redudnant:
    return ts;
  }
  getLegendLabels () {
    // We'll visualize the year in the legend e.g. not as 2018, but as '18:
    const currentYear = getCurrentYear();
    const prevYear = currentYear - 1;
    return [currentYear, prevYear];
  }

  render () {

    const { formattedData, isFetching } = this.state;

    const yAxisFormatter = isFetching
      ? (_) => '...'
      : (x) => x

    const legendLabels = this.getLegendLabels();

    return (
      <div className={styles.TheBarChartContainer}>
        <div className={styles.BarChartLegend}>
          <div className={styles.BarChartLegendLeftPart}>
            <div className={styles.BarChartLegendColor} />
            <div className={styles.BarChartLegendText}>{legendLabels[0]}</div>
          </div>

          <div className={styles.BarChartLegendRightPart}>
            <div className={styles.BarChartLegendColorOld} />
            <div className={styles.BarChartLegendTextOld}>{legendLabels[1]}</div>
          </div>
        </div>
        <div className={styles.YAxisLabel}>harvest area (ha.)</div>
        <BarChart
          width={320}
          height={420}
          data={formattedData}
          className={styles.TheBarChart}>
          <XAxis
            interval="preserveEnd"
            tickCount={6}
            dataKey="timestamp"
            tick={{ fontSize: "11px" }}
            tickFormatter={this.getFormattedTimestamp}
          />
          <YAxis
            width={80}
            tickCount={8}
            tick={{ fontSize: "11px" }}
            tickFormatter={yAxisFormatter}
          />
          <CartesianGrid strokeDasharray="3 3" />

          <Bar
            className={`${styles.BarOpacityDefault} ${isFetching ? styles.BarOpacityInactive : ""}`}
            dataKey="dataActual"
            fill={isFetching ?  "#666666" : GROWTH_STAGE_COLORS.Harvest }
            stroke="#666"
          />

          <Bar
            className={`${styles.BarOpacityDefault} ${isFetching ? styles.BarOpacityInactive : ""}`}
            dataKey="dataHistorical"
            fill={isFetching ?  "#666666" : COLOR_HARVEST_LAST_YEAR }
            stroke="#666"
            barSize={42}
          />
        </BarChart>
      </div>
    );
  }
}

export { HarvestBarChart };