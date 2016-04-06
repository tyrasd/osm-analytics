import React, { Component } from 'react'
import { polygon } from 'turf'
import Map from '../Map'
import Header from '../Header'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
//import * as StatsActions from '../../actions/stats'
import regionToCoords from '../Map/regionToCoords'
import searchHotProjectsInRegion from './searchHotProjects'
import searchFeatures from './searchFeatures'
import style from './style.css'


class Stats extends Component {
  state = {
    features: [],
    hotProjects: [],
    updating: false
  }

  render() {
    // todo: loading animation if region is not yet fully loaded
    return (
      <div id="stats">
        {this.state.features.length} buildings
        <br/>
        {this.state.updating ? 'updating…' : ''}
        <br/>
        {this.state.hotProjects.map(p => '#'+p.id+' '+p.properties.name).join(' – ')}
      </div>
    )
  }

  componentDidMount() {
    if (this.props.map.region) {
      ::this.update(this.props.map.region)
    }
  }

  componentWillReceiveProps(nextProps) {
    // check for changed map parameters
    if (nextProps.map.region !== this.props.map.region) {
      ::this.update(nextProps.map.region)
    }
  }

  update(region) {
    region = polygon(regionToCoords(region))
    this.setState({ updating: true })
    searchFeatures(region, function(err, data) {
      this.setState({
        features: data.features,
        updating: false
      })
    }.bind(this))
    const hotProjects = searchHotProjectsInRegion(region)
    this.setState({ hotProjects })
  }
}


function mapStateToProps(state) {
  return {
    map: state.map
  }
}

function mapDispatchToProps(dispatch) {
  return {
    //actions: bindActionCreators(StatsActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Stats)
