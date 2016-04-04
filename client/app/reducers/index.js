import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import map from './map'

export default combineReducers({
  routing,
  map
})
