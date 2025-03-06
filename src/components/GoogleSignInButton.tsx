"use client"
import React from "react";
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { useRouter } from "next/navigation";
import axios from "axios";

const GoogleSignInButton: React.FC = () => {
  const router = useRouter();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    // Decode the JWT token to get user information
    if (credentialResponse.credential) {
      // const decodedToken = JSON.parse(atob(credentialResponse.credential.split('.')[1]));

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login/gauth`, {
          params: {token: credentialResponse.credential}
        });
        // Store the information
        const email = response.data.user_email
        localStorage.setItem('user_email', email);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          // setError(error.response?.data?.detail || "Failed to load authors");
        } else {
          // setError("An unexpected error occurred");
        }
      } finally {
          // setLoading(false);
      }
        
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