import React, { Component } from 'react'
import style from './style.css'
import glStyle from './buildings.json'
import OverlayButton from '../OverlayButton/index.js'
import FilterButton from '../FilterButton/index.js'
import SearchBox from '../SearchBox/index.js'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as FilterActions from '../../actions/filters'
import { bboxPolygon } from 'turf'

// leaflet plugins
import * as _leafletmapboxgljs from '../../libs/leaflet-mapbox-gl.js'
import * as _leafleteditable from '../../libs/Leaflet.Editable.js'

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

    var map = L.map(
      'map', {
      editable: true,
      minZoom: 0
    })
    .setView([0, 35], 2)
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        zIndex: -1
    }).addTo(map);
    map.zoomControl.setPosition('bottomright')

    var token = 'pk.eyJ1IjoidHlyIiwiYSI6ImNpbHhyNWlxNDAwZXh3OG01cjdnOHV0MXkifQ.-Bj4ZYdiph9V5J8XpRMWtw';
    var gl = L.mapboxGL({
      updateInterval: 0,
      accessToken: token,
      style: glStyle,
      hash: false
    }).addTo(map)

    var bounds = L.polygon(bboxPolygon(map.getBounds().pad(-0.15).toBBoxString().split(',').map(Number)).geometry.coordinates.map(ring => ring.map(c => [c[1],c[0]])), {
      weight: 1,
      color: 'gray'
    }).addTo(map).enableEdit()
    /*var polyline = L.polygon([[0,0],[1,0],[1,1],[0,1],[0,0]]).addTo(map)
    polyline.enableEdit()*/

    /*map.on("mousemove", function(e) {
      map.featuresAt(e.point, { radius: 1, includeGeometry: true }, function(err, features) {
        if (features.length)
          console.log(features[0]);
      })
    });*/
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
