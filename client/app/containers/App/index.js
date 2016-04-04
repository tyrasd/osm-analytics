import React, { Component } from 'react'
import Header from '../../components/Header'
import Map from '../../components/Map'
import style from './style.css'

class App extends Component {
  render() {
    console.log('-->', this.props.route, this.props.routeParams)
    const { actions, routeParams, children } = this.props
    return (
      <div className="main">
        <Header />
        <Map
          region={routeParams.region}
          filters={routeParams.filters}
          view={this.props.route.view}
        />
        {children}
      </div>
    )
  }
}

export default App
