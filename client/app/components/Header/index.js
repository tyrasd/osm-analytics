import React, { Component } from 'react'
import { Link } from 'react-router'
import style from './style.css'

class Header extends Component {
  handleSave(text) {
    if (text.length) {
      this.props.addTodo(text)
    }
  }

  render() {
    return (
      <header>
        <h1>OSM Analytics Tool</h1>
        <ul>
          <li><Link to="/" activeClassName="active">Analysis Map</Link></li>
          <li><Link to="/about" activeClassName="active">About</Link></li>
        </ul>
      </header>
    )
  }
}

export default Header
