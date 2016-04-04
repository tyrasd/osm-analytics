import React, { Component } from 'react'
import Map from '../Map'
import Header from '../Header'
import style from './style.css'

class MainSection extends Component {
  constructor(props, context) {
    super(props, context)
  }

  render() {
    console.log('---->', this.props.route.foo)
    return (
      <div>
      </div>
    )
  }
}

export default MainSection
