import { handleActions } from 'redux-actions'
import { createHashHistory } from 'history'
import polyline from 'polyline'

var history = createHashHistory({ queryKey: false })

const initialState = {
  filters: [
    'buildings' // todo: make constants for this?
  ],
  region: null
}

export default handleActions({
  'enable filter' (state, action) {
    if (state.filters.indexOf(action.payload) === -1) {
      return {
        filters: state.filters.concat(action.payload),
        region: state.region
      }
    }
    var newState = {
      filters: state.filters,
      region: state.region
    }
    updateURL(newState)
    return newState
  },
  'disable filter' (state, action) {
    var newState = {
      filters: state.filters.filter(filter => filter !== action.payload),
      region: state.region
    }
    updateURL(newState)
    return newState
  },
  'set region' (state, action) {
    var newState = {
      filters: state.filters,
      region: action.payload
    }
    updateURL(newState)
    return newState
  },
  'set region from url' (state, action) {
    var newState = {
      filters: state.filters,
      region: parseRegionFromUrl(action.payload)
    }
    return newState
  }
}, initialState)

function updateURL(state) {
  var region = state.region
  if (region !== null) {
    switch (region.type) {
    case 'bbox':
      history.replace('/show'
        +'/bbox:'
        +region.coords.map(x => x.toFixed(5)).join(',')
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
      )
    break
    case 'hot':
      history.replace('/show'
        +'/hot:'
        +region.id
      )
    break
    default:
      throw new Error('unknown region type', region)
    }
  }
}

function parseRegionFromUrl(regionString) {
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
        coords: [polyline.decode(decodeURIComponent(regionContent))]
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
