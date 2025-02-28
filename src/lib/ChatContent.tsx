"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ChatMessage_T } from "@/types";
import { CloudRain } from "lucide-react";
import axios from "axios";
import { ChatHistory } from "@/types";

// Define the shape of the context
interface ChatContextType {
  chatHistory: ChatHistory[];
  setChatHistory: (history: ChatHistory[]) => void;
  messages: ChatMessage_T[];
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  createNewMessages: (content: string) => Promise<void>;
}

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component to wrap the application
export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [messages, setMessages] = useState<ChatMessage_T[]>([]);
  const [query, setQuery] = useState("");

  // Fetch chat history (Mock API call or replace with real API call)
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get<ChatHistory[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats`);
        setChatHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };

    fetchChatHistory();
  }, []);

  const createNewMessages = async (content: string) => {
    const userMessage: ChatMessage_T = {
      id: Date.now(),
      type: "user",
      content,
    };

    const emptyLLMMessage: ChatMessage_T = {
      id: Date.now() + 1,
      type: "llm",
      content: {
        summary: "",
        challenges: [],
      },
    };
    setMessages((prev) => [...prev, userMessage, emptyLLMMessage]);

    try {
      await axios({
        method: "post",
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reports/query`,
        data: { query: content, chat_id: "1" },
        responseType: "stream",
        headers: {
          Accept: "text/event-stream",
          "Content-Type": "application/json",
        },
        onDownloadProgress: (progressEvent) => {
          const chunk = progressEvent.event.target.response;
          if (chunk) {
            console.log("chunk:", chunk);
            const accumulatedText = chunk.replace(/```|json|markdown/g, "");
            const jsonStartIndex = accumulatedText.indexOf("{");

            if (jsonStartIndex !== -1) {
              const summary = accumulatedText.substring(0, jsonStartIndex).trim();
              const jsonText = accumulatedText.substring(jsonStartIndex);

              const topicsRegex = /["']topic["']:\s*["']([^"']*)["']/g;
              const sourcesRegex = /["']source["']:\s*["']([^"']*)["']/g;
              const urlsRegex = /["']url["']:\s*["']([^"']*)["']/g;

              const topics: string[] = [];
              const sources: string[] = [];
              const urls: string[] = [];

              let match;
              while ((match = topicsRegex.exec(jsonText)) !== null) topics.push(match[1]);
              while ((match = sourcesRegex.exec(jsonText)) !== null) sources.push(match[1]);
              while ((match = urlsRegex.exec(jsonText)) !== null) urls.push(match[1]);

              const challenges = topics.map((topic, index) => ({
                id: `topic-${index}`,
                name: topic,
                explanation: "",
                citation: sources[index] || "",
                url: urls[index] || "",
                icon: CloudRain,
              }));

              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  ...newMessages[newMessages.length - 1],
                  content: { summary, challenges },
                };
                return newMessages;
              });
            } else {
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  ...newMessages[newMessages.length - 1],
                  content: { summary: accumulatedText, challenges: [] },
                };
                return newMessages;
              });
            }
          }
        },
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <ChatContext.Provider value={{ chatHistory, setChatHistory, messages, query, setQuery, createNewMessages }}>
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
