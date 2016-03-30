import { handleActions } from 'redux-actions'
import { createHashHistory } from 'history'

var history = createHashHistory({ queryKey: false })

const initialState = [
  'buildings' // todo: make constants for this?
]

export default handleActions({
  'enable filter' (state, action) {
    if (state.indexOf(action.payload) === -1) {
      //history.replace('/show/:region')
      return state.concat(action.payload)
    }
    return state
  },
  'disable filter' (state, action) {
    return state.filter(filter => filter !== action.payload)
  }
}, initialState)
