import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Header from '../../components/Header'
import MainSection from '../../components/MainSection'
import * as FilterActions from '../../actions/filters'
import style from './style.css'

class App extends Component {
  render() {
    const { actions, children } = this.props
    return (
      <div className={style.normal}>
        {children}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    filters: state.filters
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(FilterActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
