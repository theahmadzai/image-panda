import React from 'react'
import styled from '@emotion/styled'
import { useApp } from '../contexts/AppContext'
import { formControl, baseGrid } from '../styles'
import { Input } from '../elements'

const Grid = styled.div`
  ${baseGrid}

  grid-template-columns: auto ${props => props.count && 'max-content'} max-content;
`

const Checkbox = styled.div`
  ${formControl}

  align-items: center;
  display: flex;
`

const Compressions = styled.div`
  ${formControl}
`

const TinyfyBar = () => {
  const { app, setApp } = useApp()
  const { useTinify, apiKey, compressionCount } = app

  const handleKeyChange = event => {
    const { value } = event.target

    setApp(state => ({ ...state, apiKey: value }))
  }

  const handleCheckChange = event => {
    if (!useTinify && (!apiKey || !apiKey.trim().length === 0)) {
      console.log(window.shell)
      window.shell.openTinyPngApiDocs()
    }

    const { checked } = event.target

    setApp(state => ({ ...state, useTinify: checked }))
  }

  return (
    <Grid count={useTinify}>
      <Input
        type="text"
        value={apiKey}
        onChange={handleKeyChange}
        disabled={!useTinify}
        placeholder="Enter your API Key here" />
      {useTinify && <Compressions>Compression count: <i>{compressionCount || 'Unkown'}</i></Compressions>}
      <Checkbox>
        <label>TinyPNG</label>
        <input
          type="checkbox"
          value={useTinify}
          onChange={handleCheckChange} />
      </Checkbox>
    </Grid>
  )
}

export default TinyfyBar
