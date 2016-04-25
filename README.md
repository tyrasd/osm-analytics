osm-analytics: data analyis tool frontend
=========================================

OSM data analysis tool user interface. See also the corresponding [backend](https://github.com/hotosm/osm-analytics-cruncher/) code.

Data Source
-----------

Data is taken from [osm-qa-tiles](http://osmlab.github.io/osm-qa-tiles/) and processed to specialized vector tiles that enable the on-the-fly calculation of worldwide OSM data statistics:

* calculation of somemeta data
* filtering out of specific OSM features by OSM tag
* high zoom levels: that's it
* low zoom levels: aggregate data to grid cells where each cell contains a sample of its constituent data -> sampling allows to reconstruct the distribution of the whole data set


// user experience

// limitations -> latest update time, binning, etc.

Functionality
-------------

* recency vs. user experience
* highlight features by time/experience interval
* buildings, roads, etc
* stats bar
* compare view


Usage
-----

Based on [tj/Frontend Boilerplate](https://github.com/tj/frontend-boilerplate).

Setup:

```
$ npm install
```

Running:

```
$ npm start
```

Build:

```
$ npm run build
```


### Early Mockups

![mockup screenshot](https://github.com/hotosm/osm-dat-frontend/raw/master/mockup.jpg)
