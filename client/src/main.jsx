import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import './index.css'

// 에러 확인을 위한 로그
console.log('🚀 App starting...');
console.log('🚀 React version:', React.version);

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found!');
  }
  
  console.log('🚀 Root element found');
  
  const root = ReactDOM.createRoot(rootElement);
  console.log('🚀 React root created');
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('🚀 App rendered');
} catch (error) {
  console.error('🚀 Fatal error during app initialization:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1>앱 초기화 오류</h1>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
    </div>
  `;
}



