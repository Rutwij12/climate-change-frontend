"use client"
import React from 'react';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #ffffff;
  font-family: 'Roboto', Arial, sans-serif;
`;

const LoginTitle = styled.h1`
  color: #008000;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-weight: bold;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const StyledGoogleSignInButton = styled(GoogleSignInButton)`
  background-color: #4285f4;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 15px 30px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #357ae8;
  }
`;

const LoginPage: React.FC = () => {
  return (
    <LoginContainer>
      <LoginTitle>Login</LoginTitle>
      <ButtonContainer>
        <StyledGoogleSignInButton />
      </ButtonContainer>
    </LoginContainer>
  );
};

export default LoginPage;