import React from 'react'
import styled from '@emotion/styled'
import { Input } from './elements'

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
`

const FilePicker = (props) => {
  const { label } = props
  const inputProps = { ...props }
  delete inputProps.label

  return (
    <div>
      <Label>{label}</Label>
      <Input
        {...inputProps}
        type="text"
        readOnly />
    </div>
  )
}

export default React.memo(FilePicker)
