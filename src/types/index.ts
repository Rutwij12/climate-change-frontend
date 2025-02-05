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

export interface MessageInputProps {
  input: string; // `input` should be a string (the value of the textarea)
  setInput: (value: string) => void; // `setInput` is a function to update the input value
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void; // `handleSubmit` handles form submission
}

export interface Author {
  name: string
  isHelpful: boolean
}

export interface Paper {
  id: number
  title: string
  abstract: string
  publishedDate: string
  authors: Author[]
}
