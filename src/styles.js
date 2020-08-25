import { css } from '@emotion/core'

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
