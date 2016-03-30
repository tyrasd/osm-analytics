import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import filters from './filters'

export default combineReducers({
  routing,
  filters
})
