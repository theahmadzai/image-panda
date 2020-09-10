import React, { createContext, useContext, useState } from 'react'

const initialState = {
  inputPath: '',
  outputPath: '',
  compressing: false,
  uesTinify: false,
  apiKey: '',
  compressionCount: 0
}

export const AppContext = createContext()

export const useApp = () => useContext(AppContext)

export const AppProvider = ({ children }) => {
  const [app, setApp] = useState(initialState)

  return (
    <AppContext.Provider value={{ app, setApp }}>
      {children}
    </AppContext.Provider>
  )
}
