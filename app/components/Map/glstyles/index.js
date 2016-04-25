import buildings from './buildings.json'
import highways from './highways.json'

export default function getStyle(filters, timeFilter, experienceFilter) {
  const filterStyles = {
    buildings,
    highways
  }
  var allSources = {}
  Object.keys(filterStyles).forEach(style => {
    Object.keys(filterStyles[style].sources).forEach(source => {
      allSources[source] = filterStyles[style].sources[source]
    })
  })
  return {
    "version": 8,
    "sources": allSources,
    "layers": filters
      .map(filter => filterStyles[filter].layers.map(layer => {
        if (!layer.id.match(/highlight/)) return layer
        if (!timeFilter && !experienceFilter) {
          layer.filter = ["==", "_timestamp", -1]
        }
        if (timeFilter) {
          layer.filter = ["all",
            [">=", "_timestamp", timeFilter[0]],
            ["<=", "_timestamp", timeFilter[1]]
          ]
        }
        if (experienceFilter) {
          layer.filter = ["all",
            [">=", "_userExperience", experienceFilter[0]],
            ["<=", "_userExperience", experienceFilter[1]]
          ]
        }
        return layer
      }))
      .reduce((prev, filterSources) => prev.concat(filterSources), [])
      .sort((a,b) => {
        if (a.id.match(/highlight/) && b.id.match(/highlight/)) return 0
        if (a.id.match(/highlight/)) return +1
        if (b.id.match(/highlight/)) return -1
        return 0
      })
  }
  buildings,
  highways
}

export function getCompareStyles(filters, compareTimes) {
  var glCompareLayerStyles = {
    before: JSON.parse(JSON.stringify(getStyle(filters))),
    after: JSON.parse(JSON.stringify(getStyle(filters)))
  }
  // don't need highlight layers
  glCompareLayerStyles.before.layers = glCompareLayerStyles.before.layers.filter(layer => !layer.source.match(/highlight/))
  glCompareLayerStyles.after.layers = glCompareLayerStyles.before.layers.filter(layer => !layer.source.match(/highlight/))
  // update urls to fetch historic data
  const beforeStr = (compareTimes[0] === 'now') ? '' : compareTimes[0]
  const afterStr = (compareTimes[1] === 'now') ? '' : compareTimes[1]
  glCompareLayerStyles.before.sources['osm-buildings-raw'].tiles[0] = glCompareLayerStyles.before.sources['osm-buildings-raw'].tiles[0].replace(/\/buildings[^\/]*\//, '/buildings'+beforeStr+'/')
  glCompareLayerStyles.before.sources['osm-buildings-aggregated'].tiles[0] = glCompareLayerStyles.before.sources['osm-buildings-aggregated'].tiles[0].replace(/\/buildings[^\/]*\//, '/buildings'+beforeStr+'/')
  glCompareLayerStyles.after.sources['osm-buildings-raw'].tiles[0] = glCompareLayerStyles.after.sources['osm-buildings-raw'].tiles[0].replace(/\/buildings[^\/]*\//, '/buildings'+afterStr+'/')
  glCompareLayerStyles.after.sources['osm-buildings-aggregated'].tiles[0] = glCompareLayerStyles.after.sources['osm-buildings-aggregated'].tiles[0].replace(/\/buildings[^\/]*\//, '/buildings'+afterStr+'/')
  glCompareLayerStyles.before.sources['osm-highways-raw'].tiles[0] = glCompareLayerStyles.before.sources['osm-highways-raw'].tiles[0].replace(/\/highways[^\/]*\//, '/highways'+beforeStr+'/')
  glCompareLayerStyles.before.sources['osm-highways-aggregated'].tiles[0] = glCompareLayerStyles.before.sources['osm-highways-aggregated'].tiles[0].replace(/\/highways[^\/]*\//, '/highways'+beforeStr+'/')
  glCompareLayerStyles.after.sources['osm-highways-raw'].tiles[0] = glCompareLayerStyles.after.sources['osm-highways-raw'].tiles[0].replace(/\/highways[^\/]*\//, '/highways'+afterStr+'/')
  glCompareLayerStyles.after.sources['osm-highways-aggregated'].tiles[0] = glCompareLayerStyles.after.sources['osm-highways-aggregated'].tiles[0].replace(/\/highways[^\/]*\//, '/highways'+afterStr+'/')
  return glCompareLayerStyles
}
