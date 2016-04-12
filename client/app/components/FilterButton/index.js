import React, { Component } from 'react'
import DropdownButton from '../DropdownButton'
import { filters } from '../../settings/options'


class FilterButton extends Component {
  render() {
    var btn = <button className='filter'>Select Map Features</button>
    return (
      <DropdownButton
        options={filters}
        btnElement={btn}
        multiple={true}
        selectedKeys={this.props.enabledFilters}
        onSelectionChange={::this.handleDropdownChanges}
      />
    )
  }

  handleDropdownChanges(selectedFilters) {
    var enabledFilters = this.props.enabledFilters
    selectedFilters.filter(filter => enabledFilters.indexOf(filter) === -1).map(this.props.enableFilter)
    enabledFilters.filter(filter => selectedFilters.indexOf(filter) === -1).map(this.props.disableFilter)
  }
}


export default FilterButton
