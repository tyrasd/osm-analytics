import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as MapActions from '../../actions/map'
import style from './style.css'

class CompareBar extends Component {
  state = {
    features: [],
    hotProjects: [],
    hotProjectsModalOpen: false,
    updating: false
  }

  render() {
    return (
      <div id="compare">
        <button className="compare-toggle" onClick={::this.disableCompareView}>Close Comparison View</button>
      </div>
    )
  }

  disableCompareView() {
    this.props.actions.setView('country')
  }

}


function mapStateToProps(state) {
  return {
    map: state.map,
    stats: state.stats
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(MapActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CompareBar)
