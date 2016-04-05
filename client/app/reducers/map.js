import { handleActions } from 'redux-actions'
import { createHashHistory } from 'history'
import polyline from 'polyline'

import { filters as filterOptions, overlays as overlayOptions } from '../settings/options'
import defaults from '../settings/defaults'

var history = createHashHistory({ queryKey: false })

const initialState = {
  region: null,
  filters: defaults.filters,
  overlay: defaults.overlay
}

export default handleActions({
  'set region' (state, action) {
    var newState = {
      region: action.payload,
      filters: state.filters,
      overlay: state.overlay
    }
    updateURL(newState)
    return newState
  },
  'set region from url' (state, action) {
    return {
      region: parseRegionFromUrl(action.payload),
      filters: state.filters,
      overlay: state.overlay
    }
  },

  'enable filter' (state, action) {
    var newState
    if (state.filters.indexOf(action.payload) === -1) {
      newState = {
        region: state.region,
        filters: state.filters.concat(action.payload),
        overlay: state.overlay
      }
    } else {
      newState = state
    }
    updateURL(newState)
    return newState
  },
  'disable filter' (state, action) {
    var newState = {
      region: state.region,
      filters: state.filters.filter(filter => filter !== action.payload),
      overlay: state.overlay
    }
    updateURL(newState)
    return newState
  },
  'set filters from url' (state, action) {
    if (action.payload === undefined) return state
    return {
      region: state.region,
      filters: action.payload !== 'none'
        ? action.payload.split(',').filter(filter =>
            filterOptions.some(filterOption =>
              filterOption.id === filter
            )
          )
        : [],
      overlay: state.overlay
    }
  },

  'set overlay' (state, action) {
    var newState = {
      region: state.region,
      filters: state.filters,
      overlay: action.payload
    }
    updateURL(newState)
    return newState
  },
  'set overlay from url' (state, action) {
    if (action.payload === undefined) return state
    if (!overlayOptions.some(overlayOption => overlayOption.id === action.payload)) return state
    return {
      region: state.region,
      filters: state.filters,
      overlay: action.payload
    }
  }
}, initialState)

function updateURL(state) {
  var region = state.region
  var filterPart = state.filters.length > 0
    ? state.filters.sort().join(',')
    : 'none'
  var overlayPart = state.overlay
  if (region !== null) {
    switch (region.type) {
    case 'bbox':
      history.replace('/show'
        +'/bbox:'
        +region.coords.map(x => x.toFixed(5)).join(',')
        +'/'+filterPart
        +'/'+overlayPart
      )
    break
    case 'polygon':
      history.replace('/show'
        +'/polygon:'
        +encodeURIComponent(
          polyline.encode(
            region.coords
          )
        )
        +'/'+filterPart
        +'/'+overlayPart
      )
    break
    case 'hot':
      history.replace('/show'
        +'/hot:'
        +region.id
        +'/'+filterPart
        +'/'+overlayPart
      )
    break
    default:
      throw new Error('unknown region type', region)
    }
  }
}

function parseRegionFromUrl(regionString) {
  if (!regionString) {
    return null
  }
  const [ regionType, regionContent ] = regionString.split(':')
  switch (regionType) {
    case 'bbox':
      return {
        type: 'bbox',
        coords: regionContent.split(',').map(Number)
      }
    break
    case 'polygon':
      return {
        type: 'polygon',
        coords: polyline.decode(decodeURIComponent(regionContent))
      }
    break
    case 'hot':
      return {
        type: 'hot',
        id: +regionContent
      }
    break
    default:
      throw new Error('unknown region type when parsing from URL', regionString)
  }
}
