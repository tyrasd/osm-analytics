import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import vg from 'vega'
import { debounce } from 'lodash'
import * as StatsActions from '../../actions/stats'

class Histogram extends Component {
  state = {
    vis: null
  }

  _brushStart = null

  componentDidMount() {
    const { data } = this.props
    const spec = this._spec()

    vg.parse.spec(spec, chart => {
      const vis = chart({
        el: this.refs.chartContainer,
        renderer: 'svg'
      })

      vis.onSignal('brush_start', debounce(::this.setTimeFilter, 10))
      vis.onSignal('brush_end', debounce(::this.setTimeFilter, 200))

      vis.data('activity').insert([]) // actual data comes later ^^
      vis.update()
      this.setState({ vis })
    })
  }

  setTimeFilter(signal, time) {
    if (signal === 'brush_start') {
      this._brushStart = time
    } else {
      if (this._brushStart - time === 0) {
      // startTime === endTime -> reset time filter
        this.props.actions.setTimeFilter(null)
      } else {
        this.props.actions.setTimeFilter([
          Math.min(this._brushStart, time)/1000,
          Math.max(this._brushStart, time)/1000
        ])
      }
    }
  }


  componentDidUpdate() {
    const { vis } = this.state
    const { data } = this.props

    if (vis) {
      // update data in case it changed
      let bins = {}
      data.forEach(feature => {
        let day = new Date(feature.properties._timestamp*1000)
        day.setMilliseconds(0)
        day.setSeconds(0)
        day.setMinutes(0)
        day.setHours(0)
        day = +day
        if (!bins[day]) bins[day] = 0
        bins[day]++
      })
      bins = Object.keys(bins).map(day => ({
        day: +day,
        count_day: bins[day]
      }))

      vis.data('activity').remove(() => true).insert(bins)

      vis.update()
    }
  }

  render() {
    return (
      <div ref='chartContainer' />
    )
  }


  _spec() {
    const chartWidth = 1000
    return {
      "width": chartWidth,
      "height": 100,
      "padding": {"top": 10, "left": 40, "bottom": 30, "right": 50},

      "signals": [
        {
          "name": "brush_start",
          "init": {},
          "streams": [{
            "type": "mousedown",
            "expr": "iscale('x', clamp(eventX(), 0, width))"
          }]
        },
        {
          "name": "brush_end",
          "init": {},
          "streams": [{
            "type": "mousedown, [mousedown, window:mouseup] > window:mousemove",
            "expr": "iscale('x', clamp(eventX(), 0, width))"
          }]
        },

        // the commented out part would enable panning, but interferes with the brushing above.
        // todo: check if this can be done via some modifier key or something...
        /*{
          "name": "point",
          "init": 0,
          "streams": [{
            "type": "mousedown",
            "expr": "eventX()"
          }]
        },
        {
          "name": "delta",
          "init": 0,
          "streams": [{
            "type": "[mousedown, window:mouseup] > window:mousemove",
            "expr": "point.x - eventX()"
          }]
        },*/
        {
          "name": "xAnchor",
          "init": 0,
          "streams": [{
            "type": "mousemove",
            "expr": "+datetime(iscale('x', clamp(eventX(), 0, width)))"
          }]
        },
        {
          "name": "zoom",
          "init": 1.0,
          "verbose": true,
          "streams": [
            {"type": "wheel", "expr": "pow(1.01, event.deltaY*pow(16, event.deltaMode))"}
          ]
        },
        {
          "name": "xs",
          "streams": [{
            "type": "mousedown, mouseup, wheel",
            "expr": "{min: xMin, max: xMax}"}
          ]
        },
        {
          "name": "xMin",
          "init": +(new Date("2004-08-09")),
          "streams": [
            //{"type": "delta", "expr": "+datetime(xs.min + (xs.max-xs.min)*delta/width)"},
            {"type": "zoom", "expr": "+datetime((xs.min-xAnchor)*zoom + xAnchor)"}
          ]
        },
        {
          "name": "xMax",
          "init": +(new Date()),
          "streams": [
            //{"type": "delta", "expr": "+datetime(xs.max + (xs.max-xs.min)*delta.x/width)"},
            {"type": "zoom", "expr": "+datetime((xs.max-xAnchor)*zoom + xAnchor)"}
          ]
        },
        {
          "name": "binWidth",
          "init": 2,
          "streams": [{
            "type": "xMin",
            "expr": "max(width*86400000/(xMax-xMin), 2)"
          }]
        }
      ],

      "data": [
        {
          "name": "activity",
          "format": {"type": "json", "parse": {"day": "date"}}
        },
      ],
      "scales": [
        {
          "name": "x",
          "type": "time",
          "range": "width",
          "domainMin": {"signal": "xMin"},
          "domainMax": {"signal": "xMax"}
        },
        {
          "name": "y",
          "type": "linear",
          "range": "height",
          "domain": {"data": "activity", "field": "count_day"},
          "nice": true
        }
      ],
      "axes": [{
        "type": "x",
        "scale": "x",
        "grid": true,
        "layer": "back",
        "properties": {
          "labels": {
            "fontSize": {"value": 14}
          }
        }
      }],
      "marks": [
        {
          "type": "rect",
          "properties": {
            "enter": {
              "fill": {"value": "green"},
              "fillOpacity": {"value": 0.7}
            },
            "update": {
              "x": {"scale": "x", "signal": "brush_start"},
              "x2": {"scale": "x", "signal": "brush_end"},
              "y": {"scale": "y", "value": ""},
              "y2": {"scale": "y", "value": 9990}
            }
          }
        },
        {
          "type": "group",
          "properties": {
            "enter": {
              "x": {"value": 0},
              "width": {"field": {"group": "width"}},
              "y": {"value": 0},
              "height": {"field": {"group": "height"}},
              "clip": {"value": true}
            }
          },
          "marks": [
            {
              "type": "rect",
              "from": {"data": "activity"},
              "properties": {
                "enter": {
                },
                "update": {
                  "x": {"scale": "x", "field": "day"},
                  "width": {"signal": "binWidth"},
                  "y": {"scale": "y", "field": "count_day"},
                  "y2": {"scale": "y", "value": 0},
                  "fill": [
                    { "test": "brush_start==brush_end || inrange(datum.day, brush_start, brush_end)",
                      "value": "red"
                    },
                    {"value": "steelblue"}
                  ]
                }
              }
            }
          ]
        }
        /*{
          "type": "rect",
          "from": {"data": "activity"},
          "properties": {
            "enter": {
              "x": {"scale": "x", "field": "day"},
              "width": {"value": 2},
              "y": {"scale": "y", "field": "count_day"},
              "y2": {"scale": "y", "value": 0}
            },
            "update": {
              "fill": [
                { "test": "brush_start==brush_end || inrange(datum.day, brush_start, brush_end)",
                  "value": "red"
                },
                {"value": "steelblue"}
              ]
            }
          }
        }*/
      ]
    }
  }
}


function mapStateToProps(state) {
  return {
    // todo: handle filters & overlays via state.map.*
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(StatsActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Histogram)
