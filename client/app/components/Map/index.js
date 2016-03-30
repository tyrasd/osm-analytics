import React, { Component } from 'react'
import style from './style.css'
import glStyle from './buildings.json'
import OverlayButton from '../OverlayButton/index.js'
import FilterButton from '../FilterButton/index.js'
import SearchBox from '../SearchBox/index.js'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as FilterActions from '../../actions/filters'

class Map extends Component {
  render() {
    const { filters, actions } = this.props
    return (
      <div className="tmp">
      <div id="map"></div>
      <SearchBox className="searchbox" />
      <span className="search-alternative">or</span>
      <button className="outline">Outline Custom Area</button>
      <FilterButton enabledFilters={filters} {...actions}/>
      <OverlayButton />
      </div>
    )
  }

  componentDidMount() {
    if (process.env.NODE_ENV !== 'production') {
      //glStyle.sources['osm-buildings-aggregated'].tiles[0] = glStyle.sources['osm-buildings-aggregated'].tiles[0].replace('52.50.120.37', 'localhost')
      //glStyle.sources['osm-buildings-raw'].tiles[0] = glStyle.sources['osm-buildings-raw'].tiles[0].replace('52.50.120.37', 'localhost')
    }

    mapboxgl.accessToken = 'pk.eyJ1IjoidHlyIiwiYSI6ImNpbHhyNWlxNDAwZXh3OG01cjdnOHV0MXkifQ.-Bj4ZYdiph9V5J8XpRMWtw';
    var map = new mapboxgl.Map({
      container: 'map',
      center: [0, 35],
      zoom: 2,
      style: glStyle,
      hash: false
    });

    map.on("mousemove", function(e) {
      map.featuresAt(e.point, { radius: 1, includeGeometry: true }, function(err, features) {
        if (features.length)
          console.log(features[0]);
      })
    });
  }
}

function mapStateToProps(state) {
  return {
    filters: state.filters
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(FilterActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map)
