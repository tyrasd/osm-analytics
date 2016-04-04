import React, { Component } from 'react'
import style from './style.css'
import glStyle from './buildings.json'
import OverlayButton from '../OverlayButton/index.js'
import FilterButton from '../FilterButton/index.js'
import SearchBox from '../SearchBox/index.js'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as MapActions from '../../actions/map'
import { bboxPolygon } from 'turf'
import { debounce } from 'lodash'

// data
import hotProjects from '../../data/hotprojectsGeometry.json'

// leaflet plugins
import * as _leafletmapboxgljs from '../../libs/leaflet-mapbox-gl.js'
import * as _leafleteditable from '../../libs/Leaflet.Editable.js'

var map // Leaflet map object
var glLayer // mapbox-gl layer
var boundsLayer = null // selected region layer
var moveDirectly = false

class Map extends Component {
  render() {
    const { map, view, actions } = this.props
    return (
      <div>
        <div id="map" className={view+'View'}></div>
        <SearchBox className="searchbox" {...actions}/>
        <span className="search-alternative">or</span>
        <button className="outline" onClick={::this.setViewportRegion}>Outline Custom Area</button>
        <FilterButton enabledFilters={map.filters} {...actions}/>
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
      this.props.actions.setRegionFromUrl(this.props.region)
      moveDirectly = true
    }
    if (this.props.filters) {
      this.props.actions.setFiltersFromUrl(this.props.filters)
    }
  }

  componentWillReceiveProps(nextProps) {
    // ceck for changed url parameters
    if (nextProps.region !== this.props.region) {
      this.props.actions.setRegionFromUrl(nextProps.region)
    }
    if (nextProps.filters !== this.props.filters) {
      this.props.actions.setFiltersFromUrl(nextProps.filters)
    }
    // check for changed map parameters
    if (nextProps.map.region !== this.props.map.region) {
      this.mapSetRegion(nextProps.map.region)
    }
  }

  setViewportRegion() {
    this.props.actions.setRegion({
      type: 'bbox',
      coords: map.getBounds()
        .pad(-0.15)
        .toBBoxString()
        .split(',')
        .map(Number)
    })
  }

  setCustomRegion() {
    // tmp: replace with action
    if (!boundsLayer) {
      throw new Error('expected bounds layer object')
    }
    this.props.actions.setRegion({
      type: 'polygon',
      coords: boundsLayer.getLatLngs()[0].map(c => [c.lat, c.lng])
    })
  }

  mapSetRegion(region) {
    if (boundsLayer !== null) {
      map.removeLayer(boundsLayer)
    }
    if (region === null) return
    var boundsLayerGeometry
    if (region.type === 'hot') {
      let projectId = region.id
      let project = hotProjects.features.filter(p => p.id === projectId)[0]
      if (!project) {
        throw new Error('unknown hot project', projectId)
      }
      boundsLayerGeometry = geojsonPolygonToLeaflet(project.geometry)
    } else if (region.type === 'bbox') {
      boundsLayerGeometry = geojsonPolygonToLeaflet(bboxPolygon(region.coords).geometry)
    } else if (region.type === 'polygon') {
      boundsLayerGeometry = region.coords
    } else {
      throw new Error('unknown region', region)
    }

    boundsLayer = L.polygon(boundsLayerGeometry, {
      weight: 1,
      color: 'gray'
    }).addTo(map)

    // set map view to region
    let fitboundsFunc
    if (moveDirectly) {
      fitboundsFunc = ::map.fitBounds
    } else if (map.getCenter().distanceTo(boundsLayer.getCenter()) > 10000) {
      fitboundsFunc = ::map.flyToBounds
    } else {
      fitboundsFunc = () => {}
    }
    fitboundsFunc(boundsLayer.getBounds(), {
      paddingTopLeft: [20, 72],
      paddingBottomRight: [20, 141],
      duration: 2.5
    })

    boundsLayer.enableEdit()
    map.on('editable:editing', debounce(::this.setCustomRegion, 400))
  }

}

function geojsonPolygonToLeaflet(geometry) {
  return geometry.coordinates.map(ring => ring.map(c => [c[1],c[0]]))
}


function mapStateToProps(state) {
  return {
    map: state.map
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
)(Map)
