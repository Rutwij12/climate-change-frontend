"use client";
import React from 'react';
import { Leaf } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-green-700 text-white p-4 flex items-center justify-center h-16">
      <Leaf className="mr-2" />
      <h1 className="text-2xl font-bold">Climate Change Chat</h1>
    </header>
  );
}
