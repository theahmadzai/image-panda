import React from 'react'
import logo from './logo.svg'
import styled from '@emotion/styled'

const LogoContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`

const LogoText = styled.span`
  color: #282c34;
  font-size: 32px;
  font-style: italic;
  font-weight: 600;
  letter-spacing: -2px;
`

const Logo = () => {
  return (
    <LogoContainer>
      <img src={logo} alt="Tinify Images" />
      <LogoText>Tinify Images</LogoText>
    </LogoContainer>
  )
}

export default Logo
