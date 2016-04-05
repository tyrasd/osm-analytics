import React, { Component } from 'react'
import DropdownButton from '../DropdownButton'

import { overlays } from '../../consts/options'


class OverlayButton extends Component {
  render() {
    var btn = <button className='overlay'></button>
    return (
      <DropdownButton
        options={overlays}
        multiple={false}
        selectedKeys={['number']}
        btnElement={btn}
        selectedKeys={[this.props.enabledOverlay]}
        onSelectionChange={::this.handleDropdownChanges}
      />
    )
  }

  handleDropdownChanges(selectedKeys) {
    this.props.setOverlay(selectedKeys[0])
  }
}

export default OverlayButton
