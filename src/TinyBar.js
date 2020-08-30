import React from 'react'
import { formControl } from './styles'
import { Stack, Input } from './elements'
import styled from '@emotion/styled'

const Checkbox = styled.div`
  ${formControl}

  align-items: center;
  display: flex;
  margin-left: 16px;
  padding: 0 8px;
`

const TinyBar = ({ apiKey, handleApiKey, byTiny, handleByTiny }) => {
  return (
    <Stack>
      <Input
        type="text"
        value={apiKey}
        onChange={handleApiKey}
        disabled={!byTiny}
        placeholder="Enter API Key here" />
      <Checkbox>
        <label>TinyPNG</label>
        <input
          type="checkbox"
          checked={byTiny}
          onChange={handleByTiny} />
      </Checkbox>
    </Stack>
  )
}

export default React.memo(TinyBar)
