import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Change from './App.jsx' to './App' since we are using TypeScript
import './index.css';
import { HashRouter, BrowserRouter } from 'react-router-dom';

const Router =
  window.location.protocol === 'file:' ? HashRouter : BrowserRouter;

// Ensure that the root element exists and is of type HTMLElement
const rootElement = document.getElementById('root') as HTMLElement;

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Router>
        <App />
      </Router>
    </React.StrictMode>
  );
}