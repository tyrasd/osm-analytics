import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { queue } from 'd3-queue'
import { polygon } from 'turf'
import * as MapActions from '../../actions/map'
import { compareTimes as timeOptions } from '../../settings/options'
import regionToCoords from '../Map/regionToCoords'
import searchFeatures from '../Stats/searchFeatures'
import Chart from './chart'
import style from './style.css'

class CompareBar extends Component {
  state = {
    featureCounts: {},
    updating: false
  }

  render() {

    return (
      <div id="compare">
        <h3>{this.props.map.times.join(' – ')}</h3>
        <button className="compare-toggle" onClick={::this.disableCompareView}>Close Comparison View</button>

        <Chart before={this.props.map.times[0]} after={this.props.map.times[1]} data={this.state.featureCounts}/>
      </div>
    )
  }

  componentDidMount() {
    if (this.props.map.region) {
      ::this.update(this.props.map.region, this.props.map.filters)
    }
  }

  componentWillReceiveProps(nextProps) {
    // check for changed map parameters
    if (nextProps.map.region !== this.props.map.region
      || nextProps.map.filters !== this.props.map.filters) {
      ::this.update(nextProps.map.region, nextProps.map.filters)
    }
  }

  update(region, filters) {
    region = polygon(regionToCoords(region))
    this.setState({ updating: true })
    var q = queue()
    var featureCounts = {}
    filters.forEach(filter => {
      featureCounts[filter] = []
      timeOptions.forEach((timeOption, timeIdx) => {
        q.defer(function(region, filter, time, callback) {
          searchFeatures(region, filter+time.replace('now',''), function(err, data) {
            if (err) callback(err)
            else {
              featureCounts[filter][timeIdx] = {
                id: timeOption.id,
                day: +timeOption.timestamp,
                value: Math.round(data.features.reduce((prev, feature) => prev + (feature.properties._count || 1), 0))
              }
              callback(null)
            }
          })
        }, region, filter, timeOption.id)
      })
    })
    q.awaitAll(function(err) {
      if (err) throw err
      this.setState({
        featureCounts,
        updating: false
      })
    }.bind(this))
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
