import React, { Component } from 'react'
import DropdownButton from '../DropdownButton/index.js'

const filters = [
  {
    id: 'buildings',
    description: 'Buildings'
  },
  {
    id: 'highways',
    description: 'Roads'
  },
]

class FilterButton extends Component {
  render() {
    var btn = <button className='filter'>Filter Map Features</button>
    return (
      <DropdownButton options={filters} btnElement={btn} multiple={true} onSelectionChange={() => {}}/>
    )
  }
}

export default FilterButton
