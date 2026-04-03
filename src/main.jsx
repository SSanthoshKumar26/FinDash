import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n'
import emailjs from '@emailjs/browser'

if (import.meta.env.VITE_EMAILJS_PUBLIC_KEY) {
  emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<div className="h-screen w-screen bg-[#050505]"></div>}>
      <App />
    </Suspense>
  </React.StrictMode>,
)
