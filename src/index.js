import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { AppProvider } from './AppContext'
import { ImagesProvider } from './ImagesContext'
import App from './components/App'

ReactDOM.render(
  <React.StrictMode>
    <AppProvider>
      <ImagesProvider>
        <App />
      </ImagesProvider>
    </AppProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
