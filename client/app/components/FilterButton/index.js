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
      <DropdownButton
        options={filters}
        btnElement={btn}
        multiple={true}
        selectedKeys={this.props.enabledFilters}
        onSelectionChange={handleDropdownChanges.bind(this)} />
    )
  }
}

function handleDropdownChanges(selectedFilters) {
  var enabledFilters = this.props.enabledFilters
  selectedFilters.filter(filter => enabledFilters.indexOf(filter) === -1).map(this.props.enableFilter)
  enabledFilters.filter(filter => selectedFilters.indexOf(filter) === -1).map(this.props.disableFilter)
}

export default FilterButton
