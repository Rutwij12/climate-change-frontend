'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useChatContext } from '@/lib/ChatContent';

export default function Home() {
  const {query, setQuery, setMessages} = useChatContext();
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setMessages([]); // Clear messages before navigating
      router.push('/chat');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <h1 className="text-4xl font-bold mb-8 text-green-800">What can I help you with?</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question here..."
            className="flex-grow border-green-300 focus:border-green-500 focus:ring-green-500"
          />
          <Button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Ask
          </Button>
        </div>
      </form>
    </div>
  )
}
