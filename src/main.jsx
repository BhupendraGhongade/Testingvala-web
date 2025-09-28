import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Conditional StrictMode - only in development
const AppWrapper = import.meta.env.DEV ? StrictMode : ({ children }) => children;

createRoot(document.getElementById('root')).render(
  <AppWrapper>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </AppWrapper>,
)
