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

const TinyBar = () => {
  return (
    <Stack>
      <Input type="text" placeholder="Enter API Key here" />
      <Checkbox>
        <label>TinyPNG</label>
        <input type="checkbox" value="TinyPNG" />
      </Checkbox>
    </Stack>
  )
}

export default TinyBar
