import { handleActions } from 'redux-actions'

const initialState = {
  timeFilter: null,
  experienceFilter: null
}

export default handleActions({
  'set time filter' (state, action) {
    return {
      timeFilter: action.payload,
      experienceFilter: null
    }
  },
  'set experience filter' (state, action) {
    return {
      timeFilter: null,
      experienceFilter: action.payload
    }
  }
}, initialState)
