import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import MainApp from './MainApp';  // ✅ Import MainApp correctly
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);

reportWebVitals();
