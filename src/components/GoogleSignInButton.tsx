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
    const email = decodedToken.email;
    
    // TODO: Api call to users db - verify if valid id - return id of user or NULL.
    
    // Store the information
    localStorage.setItem('user_email', email);
    console.log('Email:', email);

      router.push('/');
    }
  };

  const handleError = () => {
    console.log('Login Failed');
  };

  return (
    <div style={{transform: 'scale(1.2)'}}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
};

export default GoogleSignInButton;