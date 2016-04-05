import React, { Component } from 'react'
import Header from '../../components/Header'
import Map from '../../components/Map'
import Stats from '../../components/Stats'
import style from './style.css'

class App extends Component {
  render() {
    const { actions, routeParams, route } = this.props
    return (
      <div className="main">
        <Header/>
        <Map
          region={routeParams.region}
          filters={routeParams.filters}
          overlay={routeParams.overlay}
          view={route.view}
        />
        {route.view === 'country' ? <Stats/> : ''}
      </div>
    )
  }
}

export default App
