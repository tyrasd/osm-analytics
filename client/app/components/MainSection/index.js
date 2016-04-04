import React, { Component } from 'react'
import Map from '../Map'
import Header from '../Header'
import style from './style.css'

class MainSection extends Component {
  constructor(props, context) {
    super(props, context)
  }

  render() {
    return (
      <section className="main">
        <Header />
        <Map
          region={this.props.routeParams.region}
          filters={this.props.routeParams.filters}
        />
      </section>
    )
  }
}

export default MainSection
