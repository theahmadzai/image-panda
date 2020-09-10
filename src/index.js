import React from 'react'
import ReactDOM from 'react-dom'
import { AppProvider } from './contexts/AppContext'
import { ImagesProvider } from './contexts/ImagesContext'
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
