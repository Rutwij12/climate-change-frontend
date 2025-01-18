"use client";
import React from 'react';
import ChatMessage from './ChatMessage';
import { ChatMessage_T as ChatMessageType } from '@/types';

export default function MessageList({ messages }: { messages: ChatMessageType[] }) {
  return (
    <div className="max-w-4xl mx-auto p-4">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
}
