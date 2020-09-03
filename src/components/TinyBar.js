import React from 'react'
import styled from '@emotion/styled'
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

const TinyBar = ({ compressionCount, apiKey, handleApiKey, tinify, handleTinify }) => {
  return (
    <Grid count={tinify}>
      <Input
        type="text"
        value={apiKey}
        onChange={handleApiKey}
        disabled={!tinify}
        placeholder="Enter your API Key here" />
      {tinify && <Compressions>Compression count: <i>{compressionCount || 'Unkown'}</i></Compressions>}
      <Checkbox>
        <label>TinyPNG</label>
        <input
          type="checkbox"
          checked={tinify}
          onChange={handleTinify} />
      </Checkbox>
    </Grid>
  )
}

export default React.memo(TinyBar)
