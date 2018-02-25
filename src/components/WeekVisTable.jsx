import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import find from 'lodash/find';
import map from 'lodash/map';
import reject from 'lodash/reject';
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
    if (!props.isFetching) {
      this.setState({ formattedData: this.formatData(props.data) });
    }
  }
  formatData (_allWeekData) {
    const _allWeekDataActual = reject(_allWeekData, { isHistorical: true });

    const allTimestamps = map(_allWeekDataActual, 'weekTimestamp');
    const allWeekData = map(_allWeekDataActual, 'weekData');

    let dataForSingleWeek,
        dataForGrowthStage,
        dictForSingleWeek,
        dictPerWeekCollection = [];

    allTimestamps.forEach((timestamp, i) => {

      dataForSingleWeek = allWeekData[i].data;
      dictForSingleWeek = { timestamp, data: {} };

      GROWTH_STAGES.forEach((growthStage) => {
        dataForGrowthStage = find(
          dataForSingleWeek, { label: growthStage }
        );
        dictForSingleWeek.data[growthStage] =
          dataForGrowthStage ? PIXEL_SIZE * dataForGrowthStage.data : 0;
      });
      dictPerWeekCollection.push(dictForSingleWeek);
    });

    return objToTuples(dictPerWeekCollection);
  }

  render () {
    const { isFetching, weeks } = this.props;

    const pad = (n) => n > 9 ? '' + n : '0' + n;

    const utcTimestampSlugs = weeks.map((week) => {
      const year = week.getFullYear();
      const month = pad(week.getMonth() + 1);
      const day = pad(week.getDate());
      return day + '-' + month + '-' + year;
    });

    return (
      <div className={styles.TheTableContainer}>
        <table className={styles.TheTable}>
          <WeekTableHeader />
          <tbody>
          {
            isFetching
              ? [0,1,2,3,4,5].map((_, i) => {
                  return (
                    <WeekTableRow
                      rowIsEmpty={true}
                      isFirstRow={false}
                      timestamp={utcTimestampSlugs[i]}
                      key={i}
                    />
                  );
                })
              : this.state.formattedData.map((tuple, i) => {
                  return (
                    <WeekTableRow
                      rowIsEmpty={false}
                      isFirstRow={i === 0}
                      key={i}
                      timestamp={utcTimestampSlugs[i]}
                      weekData={tuple[1]}
                    />
                  );
                })
          }
          </tbody>
        </table>
      </div>
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
          <th key={0} style={{width: '100px', textAlign: 'center', fontWeight: 'normal'}}>
            6-days (ha.)
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
                    {gs.toLowerCase()}
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
    const { timestamp, weekData, rowIsEmpty, isFirstRow } = this.props;

    const parts = timestamp.split('-');
    const tsEuro = parts[1] + '-' + parts[0];

    return (
      <tr className={styles.TableRow}>
        <td key={0} style={{color: '#666', textAlign: 'center'}}>{tsEuro}</td>
        {
          NON_BARREN_GROWTH_STAGES.map((gs, i) => {
            const area = rowIsEmpty
              ? '...'
              : Math.round(weekData[gs])
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