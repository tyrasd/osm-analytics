import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import vg from 'vega'
import * as StatsActions from '../../actions/stats'
import { filters as filterOptions, compareTimes as timeOptions } from '../../settings/options'

class Timegraph extends Component {
  state = {
    vis: null
  }

  componentDidMount() {
    const { filters } = this.props

    this.initGraph(filters)
  }

  initGraph(filters) {
    const spec = this._spec(filters)

    vg.parse.spec(spec, chart => {
      const vis = chart({
        el: this.refs.chartContainer,
        renderer: 'svg'
      })

      // initialize graph data
      filters.forEach(filter => {
        vis.data(filter+'_data').insert([])
      })
      vis.update()

      const _prevWindowOnresize = window.onresize
      window.onresize = function(...args) {
        _prevWindowOnresize && _prevWindowOnresize.apply(this, args)
        vis.width(window.innerWidth-90).update()
      }
      vis.width(window.innerWidth-90).update()

      this.setState({ vis })
    })
  }


  componentDidUpdate() {
    const { vis } = this.state
    const { data, filters } = this.props

    if (vis) {
      // update data in case it changed
      filters.forEach(filter => {
        vis.data(filter+'_data').remove(() => true).insert(data[filter])
      })
      vis.update()
    }
  }

  render() {
    return (
      <div ref="chartContainer" className="chart"/>
    )
  }


  _spec() {
    const filters = filterOptions.map(filter => filter.id)
    var styleSpec = {
      "width": 1e6,
      "height": 90,
      "padding": {"top": 20, "left": 40, "bottom": 30, "right": 5},

      "signals": [],

      "data": [],
      "scales": [
        {
          "name": "x",
          "type": "time",
          "range": "width",
          "domainMin": +(timeOptions[0].timestamp),
          "domainMax": +(new Date())
        }
      ],
      "axes": [
        {
          "type": "x",
          "scale": "x",
          "tickSizeEnd": 0,
          "properties": {
             "axis": {
               "stroke": {"value": "#C2C2C2"},
               "strokeWidth": {"value": 1}
             },
             "ticks": {
               "stroke": {"value": "#C2C2C2"}
             },
             "majorTicks": {
               "strokeWidth": {"value": 2}
             },
            "labels": {
              "fontSize": {"value": 14},
              "fill": {"value": "#BCBCBC"}
            }
          }
        }
      ],
      "marks": []
    }

    styleSpec.data = filters.map(filter => ({
      "name": filter+"_data",
      "format": {"type": "json", "parse": {"day": "date"}}
    }))
    styleSpec.scales = styleSpec.scales.concat(
      filters.map(filter => ({
        "name": filter+"_y",
        "type": "linear",
        "range": "height",
        "domain": {"data": filter+"_data", "field": "value"}
      }))
    )
    styleSpec.marks = styleSpec.marks.concat(filters.map(filter => ({
      "type": "line",
      "from": {"data": filter+"_data"},
      "properties": {
        "enter": {
          "interpolate": {"value": "cardinal"},
          "tension": {"value": 0.8},
          "stroke": {"value": "#FDB863"},
          "strokeWidth": {"value": 2}
        },
        "update": {
          "x": {"scale": "x", "field": "day"},
          "y": {"scale": filter+"_y", "field": "value"}
        }
      }
    })),
    filters.map(filter => ({
      "name": filter,
      "type": "symbol",
      "from": {"data": filter+"_data"},
      "properties": {
        "enter": {
          "stroke": {"value": "#FDB863"},
          "fill": {"value": "#4B5A6A"},
          "size": {"value": 30}
        },
        "update": {
          "x": {"scale": "x", "field": "day"},
          "y": {"scale": filter+"_y", "field": "value"}
        }
      }
    })),
    filters.map(filter => ({
      "type": "text",
      "properties": {
        "enter": {
          "align": {"value": "right"},
          "fill": {"value": "#BCBCBC"}
        },
        "update": {
          "x": {"scale": "x", "signal": filter+"_tooltip.day", "offset": -8},
          "y": {"scale": filter+"_y", "signal": filter+"_tooltip.value", "offset": -5},
          "text": {"signal": filter+"_tooltip.value"},
          "fillOpacity": [
            { "test": "!"+filter+"_tooltip._id",
              "value": 0
            },
            {"value": 1}
          ]
        }
      }
    })))

    styleSpec.signals = filters.map(filter => ({
      "name": filter+"_tooltip",
      "init": {},
      "streams": [
        {"type": "@"+filter+":mouseover", "expr": "datum"},
        {"type": "@"+filter+":mouseout", "expr": "{}"}
      ]
    }))

    return styleSpec
  }

}


function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(StatsActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Timegraph)
