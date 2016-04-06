import React, { Component } from 'react'
import * as request from 'superagent'
import osmtogeojson from 'osmtogeojson'
import { simplify, polygon } from 'turf'
import Fuse from 'fuse.js'
import Autosuggest from 'react-autosuggest'
import hotProjects from '../../data/hotprojects.json'
import style from './style.css'

function fuse (data) {
  return new Fuse(data, {
    keys: ['name'],
    include: ['score'],
    threshold: 0.4,
    shouldSort: false
  });
}

class SearchBox extends Component {
  state = {
    active: true,
    currentValue: '',
    fuse: fuse(hotProjects)
  }

  onClick() {
    this.setState({active: true})
  }
  onKeyPress(event) {
    if (event.which === 13) {
      var regionName = this.state.currentValue
      // enter key
      if (regionName.match(/^\d+$/)) {
        let best = this.getSuggestions(regionName)[0]
        this.setState({currentValue: best.name})
        this.go(best)
      } else {
        this.goOSM(regionName)
      }
    }
  }
  getSuggestions(input, callback) {
    let suggestions = this.state.fuse.search(input)
    suggestions.sort((a, b) => {
      let diff = a.score - b.score
      return diff || (a.item.name < b.item.name ? -1 : 1)
    })
    suggestions = suggestions.map(s => s.item)

    if (input.match(/^\d+$/)) {
      suggestions = hotProjects.filter(p => p.id === +input).concat(suggestions)
    }

    if (callback) {
      callback(null, suggestions);
    }
    return suggestions
  }

  go(where) {
    this.props.setRegion({
      type: 'hot',
      id: where.id
    })
  }
  goOSM(where) {
    var setRegion = this.props.setRegion
    request
    .get('https://nominatim.openstreetmap.org/search')
    .query({
      format: 'json',
      q: where
    })
    .end(function(err, res) {
      if (err) throw new Error(err)
      var hits = res.body.filter(r => r.osm_type !== 'node')
      if (hits.length === 0) throw new Error('nothing found for place name '+regionName)
      request
      .get('https://overpass-api.de/api/interpreter')
      .query({
        data: '[out:json][timeout:3];'+hits[0].osm_type+'('+hits[0].osm_id+');out geom;'
      })
      .end(function(err, res) {
        if (err) throw new Error(err)
        let osmFeature = osmtogeojson(res.body).features[0]
        if (!(osmFeature.geometry.type === 'Polygon' || osmFeature.geometry.type === 'MultiPolygon')) throw new Error('invalid geometry')
        let coords = osmFeature.geometry.coordinates[0]
        if (osmFeature.geometry.type === 'MultiPolygon') coords = coords[0]
        const maxNodeCount = 40 // todo: setting
        if (coords.length > maxNodeCount) {
          for (let simpl = 0.00001; simpl<1; simpl*=1.4) {
            let simplifiedFeature = simplify(polygon([coords]), simpl)
            if (simplifiedFeature.geometry.coordinates[0].length <= maxNodeCount) {
              coords = simplifiedFeature.geometry.coordinates[0]
              break;
            }
          }
        }
        setRegion({
          type: 'polygon',
          coords: coords.slice(0,-1)
        })
      })
    })
  }

  render() {
    return (
      <div className="search">
        <Autosuggest
          suggestions={::this.getSuggestions}
          suggestionRenderer={s => ('#'+s.id+' '+s.name)}
          suggestionValue={s => s.name}
          onSuggestionSelected={s => this.go(s)}
          value={this.state.currentValue}
          scrollBar
          inputAttributes={{
            className: 'searchbox',
            placeholder: 'Search by region or HOT Project ID',
            type: 'search',
            onKeyPress: ::this.onKeyPress,
            onChange: value => ::this.setState({ currentValue: value })
          }}
        />
      </div>
    )
  }

  componentDidMount() {
    if (this.props.selectedRegion) {
      if (this.props.selectedRegion.type === 'hot') {
        this.setState({
          currentValue: hotProjects.find(p => p.id === this.props.selectedRegion.id).name
        })
      } else {
        this.setState({ currentValue: '' })
      }
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedRegion) {
      if (nextProps.selectedRegion.type === 'hot') {
        this.setState({
          currentValue: hotProjects.find(p => p.id === nextProps.selectedRegion.id).name
        })
      } else {
        this.setState({ currentValue: '' })
      }
    }
  }
}

export default SearchBox
