import React, { Component } from 'react'
import style from './style.css'
import glStyles from './glstyles'
import Swiper from './swiper'
import FilterButton from '../FilterButton'
import SearchBox from '../SearchBox/index.js'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as MapActions from '../../actions/map'
import { bboxPolygon, area, erase } from 'turf'
import { debounce } from 'lodash'
import regionToCoords from './regionToCoords'

// leaflet plugins
import * as _leafletmapboxgljs from '../../libs/leaflet-mapbox-gl.js'
import * as _leafleteditable from '../../libs/Leaflet.Editable.js'

var map // Leaflet map object
var glLayer // mapbox-gl layer
var glLayer2 // second mapbox-gl layer for before/after view
var boundsLayer = null // selected region layer
var moveDirectly = false

class Map extends Component {
  render() {
    const { map, view, actions } = this.props
    return (
      <div className={view+'View'}>
        <div id="map">
        </div>
        {this.props.view === 'compare'
          ? <Swiper onMoved={::this.swiperMoved}/>
          : ''
        }
        <SearchBox className="searchbox" selectedRegion={map.region} {...actions}/>
        <span className="search-alternative">or</span>
        <button className="outline" onClick={::this.setViewportRegion}>Outline Custom Area</button>
        <FilterButton enabledFilters={map.filters} {...actions}/>
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
      minZoom: 1
    })
    .setView([0, 35], 2)
    map.zoomControl.setPosition('bottomright')
    map.on('editable:editing', debounce(::this.setCustomRegion, 200))

    var mapbox_token = 'pk.eyJ1IjoidHlyIiwiYSI6ImNpbHhyNWlxNDAwZXh3OG01cjdnOHV0MXkifQ.-Bj4ZYdiph9V5J8XpRMWtw';
    //L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //    attribution: '&copy; <a href="www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    //}).addTo(map)
    L.tileLayer('https://api.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=' + mapbox_token, {
      attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        zIndex: -1
    }).addTo(map)
    glLayer = L.mapboxGL({
      updateInterval: 0,
      accessToken: mapbox_token,
      style: glStyles(this.props.map.filters),
      hash: false
    }).addTo(map)

    if (this.props.view === 'compare') {
      var glLayer2Style = JSON.parse(JSON.stringify(glStyles(this.props.map.filters)).replace(/osm-buildings-raw/g, 'osm-buildings-raw2011').replace(/osm-buildings-aggregated/g, 'osm-buildings-aggregated2011'))
      glLayer2Style.sources['osm-buildings-raw2011'].tiles[0] = glLayer2Style.sources['osm-buildings-raw2011'].tiles[0].replace('buildings', 'buildings2011')
      glLayer2Style.sources['osm-buildings-aggregated2011'].tiles[0] = glLayer2Style.sources['osm-buildings-aggregated2011'].tiles[0].replace('buildings', 'buildings2011')
      glLayer2 = L.mapboxGL({
        updateInterval: 0,
        accessToken: mapbox_token,
        style: glLayer2Style,
        hash: false
      }).addTo(map)
      this.swiperMoved(window.innerWidth/2)
    }

    if (this.props.region) {
      this.props.actions.setRegionFromUrl(this.props.region)
      moveDirectly = true
    }
    if (this.props.filters) {
      this.props.actions.setFiltersFromUrl(this.props.filters)
    }
    if (this.props.overlay) {
      this.props.actions.setOverlayFromUrl(this.props.overlay)
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
    if (nextProps.overlay !== this.props.overlay) {
      this.props.actions.setOverlayFromUrl(nextProps.overlay)
    }
    // check for changed map parameters
    if (nextProps.map.region !== this.props.map.region) {
      this.mapSetRegion(nextProps.map.region)
    }
    if (nextProps.map.filters !== this.props.map.filters) {
      glLayer._glMap.setStyle(glStyles(nextProps.map.filters, nextProps.stats.timeFilter, nextProps.stats.experienceFilter))
    }
    // check for changed time/experience filter
    if (nextProps.stats.timeFilter !== this.props.stats.timeFilter) {
      this.setTimeFilter(nextProps.stats.timeFilter)
    }
    if (nextProps.stats.experienceFilter !== this.props.stats.experienceFilter) {
      this.setExperienceFilter(nextProps.stats.experienceFilter)
    }
  }

  setViewportRegion() {
    var pixelBounds = map.getPixelBounds()
    var paddedLatLngBounds = L.latLngBounds(
      map.unproject(
        pixelBounds.getBottomLeft().add([30,-(20+212)])
      ),
      map.unproject(
        pixelBounds.getTopRight().subtract([30,-(70+52)])
      )
    ).pad(-0.15)
    this.props.actions.setRegion({
      type: 'bbox',
      coords: paddedLatLngBounds
        .toBBoxString()
        .split(',')
        .map(Number)
    })
  }

  setCustomRegion() {
    if (!boundsLayer) return
    this.props.actions.setRegion({
      type: 'polygon',
      coords: L.polygon(boundsLayer.getLatLngs()[1]).toGeoJSON().geometry.coordinates[0].slice(0,-1)
    })
  }

  mapSetRegion(region) {
    if (boundsLayer !== null) {
      map.removeLayer(boundsLayer)
    }
    if (region === null) return
    boundsLayer = L.polygon(
      [[[-85.0511287798,-1E5],[85.0511287798,-1E5],[85.0511287798,2E5],[-85.0511287798,2E5],[-85.0511287798,-1E5]]]
      .concat(regionToCoords(region, 'leaflet')), {
      weight: 1,
      color: 'gray'
    }).addTo(map)
    boundsLayer.enableEdit()

    // set map view to region
    try { // geometry calculcation are a bit hairy for invalid geometries (which may happen during polygon editing)
      let viewPort = bboxPolygon(map.getBounds().toBBoxString().split(',').map(Number))
      let xorAreaViewPort = erase(viewPort, L.polygon(boundsLayer.getLatLngs()[1]).toGeoJSON())
      let fitboundsFunc
      if (moveDirectly) {
        fitboundsFunc = ::map.fitBounds
        moveDirectly = false
      } else if (
        !xorAreaViewPort // new region fully includes viewport
        || area(xorAreaViewPort) > area(viewPort)*(1-0.1) // region is small compared to current viewport (<10% of the area covered) or feature is outside current viewport
      ) {
        fitboundsFunc = ::map.flyToBounds
      } else {
        fitboundsFunc = () => {}
      }
      fitboundsFunc(
        L.polygon(boundsLayer.getLatLngs()[1]).getBounds(), // zoom to inner ring!
      {
        paddingTopLeft: [20, 10+52],
        paddingBottomRight: [20, 10+212]
      })
    } catch(e) {}
  }

  setTimeFilter(timeFilter) {
    const highlightLayers = glStyles(this.props.map.filters).layers.filter(l => l.id.match(/highlight/))
    if (timeFilter === null) {
      // reset time filter
      highlightLayers.forEach(highlightLayer => {
        glLayer._glMap.setFilter(highlightLayer.id, ["==", "_timestamp", -1])
      })
    } else {
      highlightLayers.forEach(highlightLayer => {
        let layerFilter = ["any",
          ["all",
            [">=", "_timestamp", timeFilter[0]],
            ["<=", "_timestamp", timeFilter[1]]
          ],
          ["all",
            [">=", "_timestampMax", timeFilter[0]],
            ["<=", "_timestampMin", timeFilter[1]]
          ]
        ]
        if (highlightLayer.densityFilter) {
          layerFilter = ["all",
            highlightLayer.densityFilter,
            layerFilter
          ]
        }
        glLayer._glMap.setFilter(highlightLayer.id, layerFilter)
      })
    }
  }

  setExperienceFilter(experienceFilter) {
    const highlightLayers = glStyles(this.props.map.filters).layers.map(l => l.id).filter(id => id.match(/highlight/))
    if (experienceFilter === null) {
      // reset time filter
      highlightLayers.forEach(highlightLayer => {
        glLayer._glMap.setFilter(highlightLayer, ["==", "_timestamp", -1])
      })
    } else {
      highlightLayers.forEach(highlightLayer => {
        glLayer._glMap.setFilter(highlightLayer, ["all",
          [">=", "_userExperience", experienceFilter[0]],
          ["<=", "_userExperience", experienceFilter[1]]
        ])
      })
    }
  }

  swiperMoved(x) {
    if (!map) return
    const mapPanePos = map._getMapPanePos()
    const nw = map.containerPointToLayerPoint([0, 0])
    const se = map.containerPointToLayerPoint(map.getSize())
    const clipX = nw.x + (se.x - nw.x) * x / window.innerWidth
    glLayer2._glContainer.style.clip = 'rect(' + [nw.y+mapPanePos.y, clipX+mapPanePos.x, se.y+mapPanePos.y, nw.x+mapPanePos.x].join('px,') + 'px)'
    glLayer._glContainer.style.clip = 'rect(' + [nw.y+mapPanePos.y, se.x+mapPanePos.x, se.y+mapPanePos.y, clipX+mapPanePos.x].join('px,') + 'px)'
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
)(Map)
