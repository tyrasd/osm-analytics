import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Modal from 'react-modal';
import { polygon } from 'turf'
import { queue } from 'd3-queue'
import Map from '../Map'
import Header from '../Header'
import Histogram from './chart'
import regionToCoords from '../Map/regionToCoords'
import searchHotProjectsInRegion from './searchHotProjects'
import searchFeatures from './searchFeatures'
import { filters, overlays } from '../../settings/options'
import style from './style.css'


const hotProjectsModalStyles = {
  overlay: {
    backgroundColor: 'rgba(60,60,60, 0.5)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxHeight: '350px',
    maxWidth: '512px',
    borderRadius: '4px',
    paddingTop: '25px',
    paddingBottom: '35px',
    paddingLeft: '35px',
    paddingRight: '35px'
  }
}

class Stats extends Component {
  state = {
    features: [],
    hotProjects: [],
    hotProjectsModalOpen: false,
    updating: false
  }

  render() {
    var features = this.state.features

    // apply time and experience filters
    features.forEach(filter => {
      // do not override!
      filter.highlightedFeatures = filter.features.filter(feature =>
        this.props.stats.timeFilter === null
        || (
          feature.properties._timestamp >= this.props.stats.timeFilter[0]
          && feature.properties._timestamp <= this.props.stats.timeFilter[1]
        )
      ).filter(feature =>
        this.props.stats.experienceFilter === null
        || (
          feature.properties._userExperience >= this.props.stats.experienceFilter[0]
          && feature.properties._userExperience <= this.props.stats.experienceFilter[1]
        )
      )
    })

    // calculate number of contributors
    var _contributors = {}
    features.forEach(filter => {
      filter.highlightedFeatures.forEach(f => {
        _contributors[f.properties._uid] = true
      })
    })
    const numContribuors = Object.keys(_contributors).length

    // todo: loading animation if region is not yet fully loaded
    return (
      <div id="stats" className={this.state.updating ? 'updating' : ''}>
        <ul className="metrics">
          <li><p>{overlays.find(overlay => overlay.id === this.props.mode).description}</p></li>
        {features.map(filter => (
          <li key={filter.filter}>
            <span className="number">{
              filter.filter === 'highways'
              ? Number(filter.highlightedFeatures.reduce((prev, feature) => prev+(feature.properties._length || 0.0), 0.0)).toFixed(0)
              : filter.highlightedFeatures.length
            }</span><br/>
            <span className="descriptor">{
              (filter.filter === 'highways' ? 'km of ' : '')
              + filters.find(f => f.id === filter.filter).description
            }</span>
          </li>
        ))}
          <li><span className="number"><a className="link" onClick={::this.openHotModal}>{this.state.hotProjects.length}</a></span><br/><span className="descriptor">HOT Projects</span></li>
          <li><span className="number">{numContribuors}</span><br/><span className="descriptor">Contributors</span></li>
        </ul>

        <Modal
          isOpen={this.state.hotProjectsModalOpen}
          onRequestClose={::this.closeHotModal}
          style={hotProjectsModalStyles}>
          <h3>HOT Projects</h3>
          <ul className="hot-projects">
          {this.state.hotProjects.map(p =>
            <li key={p.id}><a className="link" href={"http://tasks.hotosm.org/project/"+p.id}>{'#'+p.id+' '+p.properties.name}</a></li>
          )}
          </ul>
        </Modal>
        <Histogram key={this.props.mode} mode={this.props.mode} data={
          features.reduce((prev, filter) => prev.concat(filter.features), [])
        }/>
      </div>
    )
  }

  componentDidMount() {
    if (this.props.map.region) {
      ::this.update(this.props.map.region, this.props.map.filters)
    }
  }

  componentWillReceiveProps(nextProps) {
    // check for changed map parameters
    if (nextProps.map.region !== this.props.map.region
      || nextProps.map.filters !== this.props.map.filters) {
      ::this.update(nextProps.map.region, nextProps.map.filters)
    }
    // todo: reset time/experience filter when changing mode from recency to experience or vv
  }

  update(region, filters) {
    region = polygon(regionToCoords(region))
    this.setState({ updating: true })
    var q = queue()
    filters.forEach(filter =>
      q.defer(searchFeatures, region, filter)
    )
    q.awaitAll(function(err, data) {
      this.setState({
        features: data.map((d,index) => ({
          filter: filters[index],
          features: d.features
        })),
        updating: false
      })
    }.bind(this))
    const hotProjects = searchHotProjectsInRegion(region)
    this.setState({ hotProjects })
  }


  openHotModal() {
    this.setState({ hotProjectsModalOpen: true });
  }

  closeHotModal() {
    this.setState({ hotProjectsModalOpen: false });
  }

}


function mapStateToProps(state) {
  return {
    map: state.map,
    stats: state.stats
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Stats)
