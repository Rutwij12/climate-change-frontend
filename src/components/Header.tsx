"use client";
import React from 'react';
import { Leaf } from 'lucide-react';
import SignInComponent from './SignInComponent';

export default function Header() {
  return (
    <header className="bg-green-700 text-white p-4 flex items-center h-16">
      {/* Left section with logo */}
      <div className="flex items-center mr-auto">
        <Leaf className="mr-1" /> {/* Reduced margin-right */}
      </div>

      {/* Centered title */}
      <h1 className="text-2xl font-bold flex-grow text-center">Climate Change Chat</h1>

      {/* Right section with SignInComponent */}
      <div className="flex items-center ml-auto">
        <SignInComponent />
      </div>
    </header>
  );
}
