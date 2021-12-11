import React from 'react';
import ReactDOM from 'react-dom';
// import 'bootstrap-dark-5/dist/css/bootstrap-blackbox.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { setThemePreferenceOnLoad } from 'lib/DarkMode';
import registerServiceWorker from 'serviceWorkerRegistration';

setThemePreferenceOnLoad(); // Load dark mode preference

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

registerServiceWorker();
