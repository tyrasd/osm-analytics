import { handleActions } from 'redux-actions'

const initialState = {
  timeFilter: null
}

export default handleActions({
  'set time filter' (state, action) {
    return {
      timeFilter: action.payload
    }
  }
}, initialState)
