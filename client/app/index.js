import { Router, Route, useRouterHistory } from 'react-router'
import { createHashHistory } from 'history'
import { syncHistoryWithStore } from 'react-router-redux'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import React from 'react'

import App from './containers/App'
import About from './components/About'
import MainSection from './components/MainSection'
import configure from './store'

const store = configure()
const history = syncHistoryWithStore(useRouterHistory(createHashHistory)({ queryKey: false }), store)

var routes = (
  <Route name='app' path='' component={App}>
    {/*<Route name='country view'
      path='/show/:region/:filters/:overlay'
      component={…}/>
    <Route name='compare view'
      path='/compare/:region/:times'
      component={…}/>*/}
    <Route name='country view'
      path='/show/:region(/:filters)'
      component={MainSection}/>
    <Route name='landing page'
      path='/about'
      component={About} />
    <Route name='default view'
      path='/'
      component={MainSection} />
  </Route>
);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>,
  document.getElementById('root')
)
