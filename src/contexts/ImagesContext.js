import React, { createContext, useContext, useReducer } from 'react'
import { imageActionType } from '../constants'

const imagesReducer = (state = new Map(), { type, payload }) => {
  switch (type) {
    case imageActionType.SET:
      return new Map(payload)

    case imageActionType.ADD:
      return new Map([...state, ...payload])

    case imageActionType.REMOVE_SELECTED:
      state.forEach(({ selected }, filePath) => {
        if (selected) state.delete(filePath)
      })
      return new Map(state)

    case imageActionType.CHECK_CHANGE:
      return new Map([
        ...state,
        [
          payload,
          {
            status: state.get(payload).status,
            selected: !state.get(payload).selected,
            meta: state.get(payload).meta,
          },
        ],
      ])

    case imageActionType.CHECK_CHANGE_ALL:
      state.forEach((image, filePath) => {
        state.set(filePath, { ...image, selected: payload })
      })
      return new Map(state)

    case imageActionType.CHANGE_STATUS:
      return new Map([
        ...state,
        [
          payload.filePath,
          {
            status: payload.status,
            selected: state.get(payload.filePath).selected,
            meta: { ...state.get(payload.filePath).meta, ...payload.meta },
          },
        ],
      ])

    default:
      return state
  }
}

export const ImagesContext = createContext()

export const useImages = () => useContext(ImagesContext)

export const ImagesProvider = ({ children }) => {
  const [images, dispatchImages] = useReducer(imagesReducer, new Map())

  return (
    <ImagesContext.Provider value={{ images, dispatchImages }}>
      {children}
    </ImagesContext.Provider>
  )
}
