import React from 'react';
// import ReactDOM from 'react-dom/client';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

const element = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
const rootElement = document.getElementById('root');

if (rootElement.hasChildNodes()){  // SSR인 경우
  hydrateRoot(rootElement, element);
}
else {  // CSR인 경우
  const root = createRoot(rootElement);
  root.render(element, rootElement);
}

reportWebVitals();
