import React, { Component } from 'react'
import DropdownButton from '../DropdownButton/index.js'

const overlays = [
  {
    id: 'number',
    description: 'Number of Features'
  },
  {
    id: 'recency',
    description: 'Recency of Edits'
  },
  {
    id: 'experience',
    description: 'Editor Level of Experience'
  },
]

class OverlayButton extends Component {
  render() {
    var btn = <button className='overlay'></button>
    return (
      <DropdownButton options={overlays} btnElement={btn} onSelectionChange={() => {}}/>
    )
  }
}

export default OverlayButton
