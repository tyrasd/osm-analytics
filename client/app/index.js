import { Router, Route, useRouterHistory } from 'react-router'
import { createHashHistory } from 'history'
import { syncHistoryWithStore } from 'react-router-redux'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import React from 'react'

import App from './containers/App'
import AboutPage from './containers/AboutPage'
import MainSection from './components/MainSection'
import configure from './store'

const store = configure()
const history = syncHistoryWithStore(useRouterHistory(createHashHistory)({ queryKey: false }), store)

var routes = (
  <Route>
    <Route name='landing page' path='/about' component={AboutPage} />
    <Route name='country view' path='/show/:region(/:filters)' view='country' component={App}>
      <Route path='' component={MainSection}/>
    </Route>
    <Route name='default view' path='/' view='default' component={App}>
      <Route path='' component={MainSection} />
    </Route>
  </Route>
);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>,
  document.getElementById('root')
)
