import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.js';
import createStore from './store/createStore';
import { Provider } from 'react-redux'

const store = createStore();

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>, document.getElementById('root'));
