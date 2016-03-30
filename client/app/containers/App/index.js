import React, { Component } from 'react'
import Header from '../../components/Header'
import MainSection from '../../components/MainSection'
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

export default App
