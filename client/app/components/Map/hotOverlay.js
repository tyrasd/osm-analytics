import React, { Component } from 'react'
import hotProjects from '../../data/hotprojects.json'

var hotProjectsLayer

class HotOverlay extends Component {
  state = {}

  render() {
    return <dummy></dummy>
  }

  componentDidMount() {
    hotProjectsLayer = L.geoJson(hotProjects, {
      style: {
        fillOpacity: 0,
        weight: 2
      }
    })

    hotProjectsLayer.bindPopup(function (layer) {
      return '<p>HOT project <a href="#/show/hot:'+layer.feature.id+'">#'+layer.feature.id+'</a>:<br/>'+layer.feature.properties.name+'</p>'
    })
  }
  componentWillReceiveProps(nextProps) {
    const map = nextProps.leaflet
    if (!map) return

    if (nextProps.enabled) {
      hotProjectsLayer.addTo(map)
    } else {
      hotProjectsLayer.removeFrom(map)
    }
  }

}

export default HotOverlay
