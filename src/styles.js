import { css } from '@emotion/core'

export const globalStyles = css`
  body {
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    color: #282c34;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
      'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
      'Helvetica Neue', sans-serif;
    margin: 0;
    padding: 16px;
    padding-bottom: 0;
  }
`
export const resetElement = css`
  border: 0;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
`

export const formControl = css`
  ${resetElement}

  border: 1px solid #282c34;
  font-size: 14px;
  height: 28px;
  outline: 0;
  padding: 4px 8px;
`

export const baseGrid = css`
  display: grid;
  grid-gap: 16px;
  margin-bottom: 16px;
`
