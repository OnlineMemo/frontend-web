import React from 'react';
// import ReactDOM from 'react-dom/client';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
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
    <BrowserRouter>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
);
const rootElement = document.getElementById('root');

const prerenderPaths = ["/", "/signup", "/notice", "/download"];
const curPath = window.location.pathname;

if (rootElement.hasChildNodes() && prerenderPaths.includes(curPath)){  // SSR인 경우
  hydrateRoot(rootElement, element);
}
else {  // CSR인 경우
  const root = createRoot(rootElement);
  root.render(element);  // root.render(element, rootElement);
}

reportWebVitals();
