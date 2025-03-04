"use client"
import React from "react";
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { useRouter } from "next/navigation";

const GoogleSignInButton: React.FC = () => {
  const router = useRouter();

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    // Decode the JWT token to get user information
    if (credentialResponse.credential) {
      const decodedToken = JSON.parse(atob(credentialResponse.credential.split('.')[1]));

      // Extract name and email from the decoded token
      const name = decodedToken.name;
      const email = decodedToken.email;
      
      // Store the information
      localStorage.setItem('authToken', credentialResponse.credential);
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      
      console.log('Name:', name);
      console.log('Email:', email);

      router.push('/');
    }
  };

  const handleError = () => {
    console.log('Login Failed');
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
};

export default GoogleSignInButton;