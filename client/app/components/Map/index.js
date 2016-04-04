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
import { debounce } from 'lodash'
import polyline from 'polyline'

// tmp: replace with action
import { createHashHistory } from 'history'
var history = createHashHistory({ queryKey: false })
// end tmp

// data
import hotProjects from '../../data/hotprojectsGeometry.json'

// leaflet plugins
import * as _leafletmapboxgljs from '../../libs/leaflet-mapbox-gl.js'
import * as _leafleteditable from '../../libs/Leaflet.Editable.js'

var map // Leaflet map object
var glLayer // mapbox-gl layer
var boundsLayer = null // selected region layer

class Map extends Component {
  render() {
    const { filters, actions } = this.props
    return (
      <div>
        <div id="map"></div>
        <SearchBox className="searchbox" />
        <span className="search-alternative">or</span>
        <button className="outline" onClick={setViewportRegion}>Outline Custom Area</button>
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

    map = L.map(
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
    glLayer = L.mapboxGL({
      updateInterval: 0,
      accessToken: token,
      style: glStyle,
      hash: false
    }).addTo(map)

    if (this.props.region) {
      setRegion(this.props.region)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.region !== this.props.region) {
      setRegion(nextProps.region)
    }
  }

}

function geojsonPolygonToLeaflet(geometry) {
  return geometry.coordinates.map(ring => ring.map(c => [c[1],c[0]]))
}

function setViewportRegion() {
  // tmp: replace with action
  history.replace(
    '/show/bbox:'
    +map.getBounds()
    .pad(-0.15)
    .toBBoxString()
    .split(',')
    .map(Number)
    .map(x => x.toFixed(5))
    .join(',')
  )
}

function setCustomRegion() {
  // tmp: replace with action
  if (!boundsLayer) {
    throw new Error('expected bounds layer object')
  }
  console.log(boundsLayer.getLatLngs(), boundsLayer.getLatLngs()[0].map(c => [c.lat, c.lng]))
  history.replace(
    '/show/polygon:'
    +encodeURIComponent(
      polyline.encode(
        boundsLayer.getLatLngs()[0].map(c => [c.lat, c.lng])
      )
    )
  )
}

function setRegion(region) {
  if (boundsLayer !== null) {
    map.removeLayer(boundsLayer)
  }
  var boundsLayerGeometry
  if (region.slice(0,4) === 'hot:') {
    let projectId = +region.slice(4)
    let project = hotProjects.features.filter(p => p.id === projectId)[0]
    if (!project) {
      throw new Error('unknown hot project', projectId)
    }
    boundsLayerGeometry = geojsonPolygonToLeaflet(project.geometry)
  } else if (region.slice(0,5) === 'bbox:') {
    boundsLayerGeometry = geojsonPolygonToLeaflet(bboxPolygon(region.slice(5).split(',').map(Number)).geometry)
  } else if (region.slice(0,8) === 'polygon:') {
    console.log(polyline.decode(region.slice(8)))
    boundsLayerGeometry = [polyline.decode(decodeURIComponent(region.slice(8)))]
  } else {
    throw new Error('unknown region', region)
  }

  boundsLayer = L.polygon(boundsLayerGeometry, {
    weight: 1,
    color: 'gray'
  }).addTo(map)

  if (map.getCenter().distanceTo(boundsLayer.getCenter()) > 10000) {
    map.flyToBounds(boundsLayer.getBounds(), {
      paddingTopLeft: [20, 72],
      paddingBottomRight: [20, 141],
      duration: 2.5
    })
  }


  boundsLayer.enableEdit()
  map.on('editable:editing', debounce(setCustomRegion, 400))
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
