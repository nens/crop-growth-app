import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import { PieChart, Pie, Cell } from 'recharts';

import reduce from 'lodash/reduce';
import map from 'lodash/map';
import find from 'lodash/find';

import {
  BARREN_GROWTH_STAGES,
  NON_BARREN_GROWTH_STAGES
} from "../constants.js";

import { dateToSlug } from "../tools/utils-time.js";

import styles from './WeekVisPieChart.css';

class WeekVisPieChart extends Component {
  constructor () {
    super();
    this.state = {
      isFetching: null,
      formattedData: null
    };

    this.preprocessWeekData = this.preprocessWeekData.bind(this);
    this.getFormattedData = this.getFormattedData.bind(this);
  }
  componentWillMount () {
    this.updateData(this.props);
  }
  componentWillReceiveProps (props) {
    this.updateData(props);
  }
  updateData (props) {
    const { isFetching, rawData, selectedRegionSlug, latestWeek } = props;
    if (isFetching) {
      this.setState({
        isFetching: true,
        selectedRegionSlug: selectedRegionSlug,
        latestWeekSlug: latestWeek ? dateToSlug(latestWeek) : '...'
      });
    } else {
      this.setState({
        isFetching: false,
        formattedData: this.getFormattedData(rawData),
        selectedRegionSlug: selectedRegionSlug,
        latestWeekSlug: dateToSlug(latestWeek)
      });
    }
  }
  preprocessWeekData (weekData) {
    // We sort the week data by growthstage, filtering out barren growth-stages;
    // however, we'll add the amount of measured pixels for those two barren
    // stages to the "other" category.
    let weekDataSorted = [];

    [...NON_BARREN_GROWTH_STAGES, -1].forEach((gs) => {
      const weekDataForGS = find(weekData, { label: gs });
      if (weekDataForGS) {
        weekDataSorted.push(weekDataForGS);
      }
    });

    const weekDataUncategorized = find(weekDataSorted, { label: -1 });
    if (weekDataUncategorized) {
      BARREN_GROWTH_STAGES.forEach((gs) => {
        const weekDataBarrenGS = find(weekData, { label: gs });
        if (weekDataBarrenGS) {
          weekDataUncategorized.data += weekDataBarrenGS.data;
        }
      });
    }

    console.log('weekDataSorted:', weekDataSorted)

    if (weekDataSorted.length === 0) {
      weekDataSorted.push({
        class: -1,
        color: '#ffffff',
        data: 1,
        label: "other"
      })
    }
    return weekDataSorted;
  }

  getFormattedData (rawData) {
    // We select a single (=most recent) week of data:
    const weekData = rawData[0].weekData.data;

    // We know the total amount pixels for the region (inc. NO_DATA pixels)
    const totalPixelCount = weekData[0].total;
    const weekDataSorted = this.preprocessWeekData(weekData);

    // The sum of pixels that have a measured value (i.e. not NO_DATA), for all
    // growthstages (barren & non-barren & uncategorized):
    const totalPixelCountWithData = reduce(
      map(weekDataSorted, 'data'),
      (a, b) => a + b
    );

    // Now we know the scaling factor for every measured amount of pixels:
    const multiplier = totalPixelCount / totalPixelCountWithData;

    weekDataSorted.forEach((weekData) => {
      weekData.data = Math.floor(weekData.data * multiplier);
    });

    return weekDataSorted.map((r) => {
      const growthStage = r.label === -1 ? 'other' : r.label.toLowerCase();
      return { name: growthStage, value: r.data, color: r.color }
    });
  }
  render () {

    let { formattedData, isFetching, selectedRegionSlug, latestWeekSlug }
      = this.state;

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
      const MULTIPLIER = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + 2.75 * radius * Math.cos(-midAngle * MULTIPLIER);
      const y = cy + 2.75 * radius * Math.sin(-midAngle * MULTIPLIER);

      return (
        <text
          x={x}
          y={y}
          fill="#666"
          fontSize={11}
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central">
          {`${(percent * 100).toFixed(1)}%`}
        </text>
      );

      return null;
    };

    return (
      <div className={styles.PieChartContainer}>
        <PieChart
          width={364}
          height={300}
          className={styles.ThePieChart}>
          <text x={8} y={15} fill="#666" fontSize={11}>
            {latestWeekSlug}
          </text>
          <Pie
            startAngle={180}
            endAngle={0}
            data={formattedData}
            cx={182}
            cy={150}
            outerRadius={91}
            label={renderCustomizedLabel}
            labelLine={{stroke: '#666'}}
            className={`${styles.PieOpacityDefault} ${isFetching ? styles.PieOpacityInactive : ""}`}
          >
          {
            formattedData.map((entry, index) =>
              <Cell
                key={index}
                fill={isFetching ? '#666' : entry.color}
                stroke="#666"
              />
            )
          }
          </Pie>
        </PieChart>
      </div>
    );
  }
}

export { WeekVisPieChart };
