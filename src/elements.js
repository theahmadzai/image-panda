import styled from '@emotion/styled'
import { formControl } from './styles'

export const Stack = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
`

export const Input = styled.input`
  ${formControl}

  width: 100%;
`

export const Button = styled.button`
  ${formControl}

  background: #fff;
  cursor: pointer;
  margin-left: 16px;

  &:hover {
    background: #282c34;
    color: #fff;
  }
`
