import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.js';

function requireAll(r) { r.keys().forEach(f => {
  console.log(f);
  const required = r(f);
  console.log(required);
  required.default();
}); }
requireAll(require.context('./reducers/', true, /\.js$/));


ReactDOM.render(<App />, document.getElementById('root'));
