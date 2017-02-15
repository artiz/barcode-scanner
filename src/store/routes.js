import React from 'react';
import { IndexRoute, Route } from 'react-router';
import App from '../containers/app';
import AboutPage from '../containers/about-page';
import CounterPage from '../containers/counter-page';
import ScannerPage from '../containers/scanner-page';

export default (
  <Route path="/" component={ App }>
    <IndexRoute component={ ScannerPage }/>
    <Route path="counter" component={ CounterPage }/>
    <Route path="about" component={ AboutPage }/>
  </Route>
);
