import React, { useState } from 'react'
import styled from '@emotion/styled'
import { Input } from './elements'

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
`

const useFilePicker = (label, defaultState = '') => {
  const [path, setPath] = useState(defaultState)

  const FilePicker = (props) => (
    <div>
      <Label>{label}</Label>
      <Input
        {...props}
        value={path}
        type="text"
        readOnly />
    </div>
  )

  return [FilePicker, path, setPath]
}

export default useFilePicker
