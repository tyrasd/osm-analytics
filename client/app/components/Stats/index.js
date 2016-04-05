import React, { Component } from 'react'
import Map from '../Map'
import Header from '../Header'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
//import * as StatsActions from '../../actions/stats'
import style from './style.css'


class Stats extends Component {
  constructor(props, context) {
    super(props, context)
  }

  render() {
    return (
      <div id="stats">
      </div>
    )
  }
}


function mapStateToProps(state) {
  return {
    map: state.map
  }
}

function mapDispatchToProps(dispatch) {
  return {
    //actions: bindActionCreators(StatsActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Stats)
