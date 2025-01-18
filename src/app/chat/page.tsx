'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import MessageList from '@/components/MessageList';
import MessageInput from '@/components/MessageInput';
import { ChatMessage_T, LLMResponse } from '@/types';
import { CloudRain, Fish } from 'lucide-react';

const mockLLMResponse: LLMResponse = {
  summary: "Climate change poses significant challenges to global sustainability efforts.",
  challenges: [
    {
      id: "rising-sea-levels",
      name: "Rising Sea Levels",
      explanation: "Coastal communities are at risk due to melting ice caps and thermal expansion of oceans.",
      citation: "IPCC, 2021: Climate Change 2021: The Physical Science Basis.",
      icon: CloudRain,
    },
    {
      id: "extreme-weather-events",
      name: "Extreme Weather Events",
      explanation: "Increased frequency and intensity of hurricanes, droughts, and heatwaves threaten ecosystems and human settlements.",
      citation: "World Meteorological Organization, State of the Global Climate 2020.",
      icon: CloudRain,
    },
    {
      id: "biodiversity-loss",
      name: "Biodiversity Loss",
      explanation: "Rapid changes in temperature and precipitation patterns lead to habitat destruction and species extinction.",
      citation: "IPBES, 2019: Global Assessment Report on Biodiversity and Ecosystem Services.",
      icon: Fish,
    },
  ],
};

export default function ClimateChat() {
  const searchParams = useSearchParams(); // Hook for getting query parameters
  const [messages, setMessages] = useState<ChatMessage_T[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const initialQuery = searchParams.get('q') || ''; // Get the 'q' query parameter

    if (initialQuery) {
      const initialUserMessage: ChatMessage_T = { id: Date.now(), type: 'user', content: initialQuery };
      const initialLLMMessage: ChatMessage_T = { id: Date.now() + 1, type: 'llm', content: mockLLMResponse };
      setMessages([initialUserMessage, initialLLMMessage]);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const newUserMessage: ChatMessage_T = { id: Date.now(), type: 'user', content: input };
      const newLLMMessage: ChatMessage_T = { id: Date.now() + 1, type: 'llm', content: mockLLMResponse };
      setMessages([...messages, newUserMessage, newLLMMessage]);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-green-50">
        <MessageList messages={messages} />
      </div>

      {/* Fixed Input */}
      <MessageInput input={input} setInput={setInput} handleSubmit={handleSubmit} />
    </div>
  );
}
