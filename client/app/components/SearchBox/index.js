import React, { Component } from 'react'
import style from './style.css'
//import Autocomplete from 'react-autocomplete'
import Autosuggest from 'react-autosuggest'
import hotProjects from '../../data/hotprojects.json'
import Fuse from 'fuse.js'

// tmp: replace with action
import { createHashHistory } from 'history'
var history = createHashHistory({ queryKey: false })
// end tmp

function fuse (data) {
  return new Fuse(data, {
    keys: ['name'],
    include: ['score']
  });
}

class SearchBox extends Component {
  state = {
    active: true,
    currentValue: '',
    fuse: fuse(hotProjects)
  }

  onClick() {
    this.setState({active: true})
  }
  onKeyPress(event) {
    if (event.which === 13) {
      // enter key
      let best = this.getSuggestions(this.state.currentValue)[0]
      this.setState({currentValue: best.name})
      this.go(best)
    }
  }
  getSuggestions(input, callback) {
    let suggestions = this.state.fuse.search(input)
    suggestions.sort((a, b) => {
      let diff = a.score - b.score
      return diff || (a.item.name < b.item.name ? -1 : 1)
    })
    suggestions = suggestions.map(s => s.item)

    if (input.match(/^\d+$/))
      suggestions = hotProjects.filter(p => p.id === +input).concat(suggestions)

    if (callback) {
      callback(null, suggestions);
    }
    return suggestions
  }
  go (where) {
    // tmp: replace with action
    history.replace('/show/hot:'+where.id)
  }

  render() {
    return (
      <div className="search">
        <Autosuggest
          suggestions={::this.getSuggestions}
          suggestionRenderer={s => ('#'+s.id+' '+s.name)}
          suggestionValue={s => s.name}
          onSuggestionSelected={s => this.go(s)}
          value={this.state.currentValue}
          scrollBar
          inputAttributes={{
            className: 'searchbox',
            placeholder: 'Search by region or HOT Project ID',
            type: 'search',
            onKeyPress: ::this.onKeyPress,
            onChange: value => ::this.setState({ currentValue: value })
          }}
        />
      </div>
    )
  }
}

export default SearchBox
