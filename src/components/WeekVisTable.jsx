import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import find from 'lodash/find';
import map from 'lodash/map';
import forEach from 'lodash/forEach';

import {
  GROWTH_STAGES,
  NON_BARREN_GROWTH_STAGES,
  GROWTH_STAGE_COLORS,
  PIXEL_SIZE
} from '../constants.js';

import { objToTuples } from '../tools/utils.js';
import { lighten } from '../tools/color-conversion.js';

import styles from './WeekVisTable.css';

class WeekVisTable extends Component {
  constructor () {
    super();
    this.state = { formattedData: "" };
    this.formatData = this.formatData.bind(this);
  }
  componentWillMount () {
    this.updateData(this.props);
  }
  componentWillReceiveProps (props) {
    this.updateData(props);
  }
  updateData (props) {
    console.log("[F] updateData; props =", props);
    if (!props.isFetching) {
      this.setState({ formattedData: this.formatData(props.data) });
    }
  }
  formatData (_allWeekData) {
    const allTimestamps = map(_allWeekData, 'weekTimestamp');
    const allWeekData = map(_allWeekData, 'weekData');

    let dataForSingleWeek,
        dataForGrowthStage,
        dictForSingleWeek,
        dictPerWeekCollection = [];

    allTimestamps.forEach((timestamp, i) => {

      dataForSingleWeek = allWeekData[i].data;
      dictForSingleWeek = { timestamp, data: {} };

      GROWTH_STAGES.forEach((growthStage) => {
        dataForGrowthStage = find(
          dataForSingleWeek, { 'label': growthStage }
        );
        dictForSingleWeek.data[growthStage] =
          dataForGrowthStage ? dataForGrowthStage.data : 0;
      });

      dictPerWeekCollection.push(dictForSingleWeek);
    });

    return objToTuples(dictPerWeekCollection);
  }
  render () {
    const { isFetching, utcTimestampSlugs } = this.props;

    return (
      <table className={styles.TheTable}>
        <WeekTableHeader />
        >>> HIER WAS Ik <<<
        <tbody>
        {
          isFetching
            ? [0,1,2,3,4,5].map((_, i) => {
                return (
                  <WeekTableRow
                    rowIsEmpty={true}
                    timestamp={utcTimestampSlugs[0]}
                    key={i}
                  />
                );
              })
            : this.state.formattedData.map((tuple, i) => {
                return (
                  <WeekTableRow
                    rowIsEmpty={false}
                    key={i}
                    timestamp={utcTimestampSlugs[0]}
                    weekData={tuple[1]}
                  />
                );
              })
        }
        </tbody>
      </table>
    );
  }
}

class WeekTableHeader extends Component {
  render () {
    let bgColor,
        rgbaString;

    return (
      <thead>
        <tr>
          <th key={0} style={{'width': '70px', 'textAlign': 'center' }}>
            Date
          </th>
          {
            NON_BARREN_GROWTH_STAGES.map(function (gs, i) {
              bgColor = GROWTH_STAGE_COLORS[gs];
              rgbaString = lighten(bgColor);
              return (
                <th
                  key={i + 1}
                  style={{'backgroundColor': bgColor }}
                  className={styles.VerticalColumn}>

                  <div
                    style={{'backgroundColor': rgbaString }}
                    className={styles.VerticalColumnName}>
                    {gs}
                  </div>
                </th>
              );
            })
          }
        </tr>
      </thead>
    );
  }
}

class WeekTableRow extends Component {
  render () {
    const { timestamp, weekData, rowIsEmpty } = this.props;
    return (
      <tr className={styles.TableRow}>
        <td key={0} style={{'color': '#666'}}>
          { timestamp }
        </td>
        {
          NON_BARREN_GROWTH_STAGES.map((gs, i) => {
            const area = rowIsEmpty
              ? '...'
              : Math.round(weekData[gs] * PIXEL_SIZE * 100) / 100
            return (
              <td key={i + 1} className={styles.TableCell}>
                {area}
              </td>
            );
          })
        }
      </tr>
    );
  }
}

export { WeekVisTable };