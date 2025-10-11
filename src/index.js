import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
// import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// < CSR - Original Ver. >
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// < CSR + SSR + Helmet - SEO Ver. >
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

const prerenderPaths = new Set(["/", "/signup", "/notice", "/download", "/login"]);  // '/login' 추가 (25.09.22)
const curPath = window.location.pathname;

if (rootElement.hasChildNodes() && prerenderPaths.has(curPath)){  // SSR인 경우
  // console.log('- SSR 페이지 : Pre-Rendering 적용 (hydrateRoot)');
  hydrateRoot(rootElement, element);
}
else {  // CSR인 경우
  // console.log('- CSR 페이지 : Lazy-Rendering 적용 (createRoot)');
  const root = createRoot(rootElement);
  root.render(element);  // root.render(element, rootElement);
}

reportWebVitals();
