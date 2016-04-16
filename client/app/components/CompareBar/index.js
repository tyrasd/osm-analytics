import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as MapActions from '../../actions/map'
import { compareTimes as timeOptions } from '../../settings/options'
import style from './style.css'

class CompareBar extends Component {
  state = {
    features: [],
    hotProjects: [],
    hotProjectsModalOpen: false,
    updating: false
  }

  render() {
    return (
      <div id="compare">
        <ul>
        {timeOptions.map(timeOption =>
          <li key={timeOption.id}>
            <button
              onClick={this.setCompareTime.bind(this,timeOption.id)}
              className={this.props.map.times.indexOf(timeOption.id) !== -1 ? 'selected' : ''}>
              {timeOption.id}
            </button>
          </li>
        )}
        </ul>
        <button className="compare-toggle" onClick={::this.disableCompareView}>Close Comparison View</button>
      </div>
    )
  }

  setCompareTime(time) {
    var clickedIndex = timeOptions.find(timeOption => timeOption.id === time).id
    var times = this.props.map.times.slice().sort()
    var beforeIndex = timeOptions.find(timeOption => timeOption.id === times[0]).id
    var afterIndex = timeOptions.find(timeOption => timeOption.id === times[1]).id
    if (clickedIndex < beforeIndex) times[0] = time
    else if (clickedIndex > afterIndex) times[1] = time
    else if (clickedIndex - beforeIndex <= afterIndex - clickedIndex) times[0] = time; else times[1] = time
    this.props.actions.setTimes(times)
  }

  disableCompareView() {
    this.props.actions.setView('country')
  }
}


function mapStateToProps(state) {
  return {
    map: state.map,
    stats: state.stats
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(MapActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CompareBar)
