import React from 'react'
import styled from '@emotion/styled'
import { Input } from '../elements'

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
`

const FilePicker = props => {
  const { label, ...inputProps } = props

  return (
    <div>
      <Label>{label}</Label>
      <Input {...inputProps} type="text" readOnly />
    </div>
  )
}

export default React.memo(FilePicker)
