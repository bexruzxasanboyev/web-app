import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { initTelegram } from './hooks/useTelegram.js'
import { processReferralFromStartParam } from './api/client.js'
import './index.css'

initTelegram()
// Telegram start_param dagi referral'ni avtomatik ro'yxatga olamiz
processReferralFromStartParam()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
