import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

navigator.serviceWorker.register('/sw.js')
  .then((registration) => {
    console.log('Service Worker registered:', registration)
  })
  .catch((error) => {
    console.error('Service Worker registration failed:', error)
  })

Notification.requestPermission()
  .then((permission) => {
    console.log('Notification permission:', permission)
  })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)