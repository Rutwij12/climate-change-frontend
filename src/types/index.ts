import React from 'react';

export interface Challenge {
  id: string;
  name: string;
  explanation: string;
  citation: string;
  icon: React.ElementType;
}

export interface LLMResponse {
  summary: string;
  challenges: Challenge[];
}

export interface ChatMessage_T {
  id: number;
  type: 'user' | 'llm';
  content: string | LLMResponse;
}
