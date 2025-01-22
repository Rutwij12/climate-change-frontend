"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ChatMessage_T } from "@/types";

// Define the shape of the context
interface ChatContextType {
  messages: ChatMessage_T[];
  setMessages: (messages: ChatMessage_T[]) => void;
  query: string;
  setQuery: (query: string) => void;
}

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component to wrap the application
export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage_T[]>([]);
  const [query, setQuery] = useState("");

  return (
    <ChatContext.Provider value={{ messages, setMessages, query, setQuery }}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use the ChatContext
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
