"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ChatMessage_T } from "@/types";
import { CloudRain } from "lucide-react";
import axios from "axios";
import { ChatHistory, ChatHistoryMessage } from "@/types";

// Define the shape of the context
interface ChatContextType {
  chatHistory: ChatHistory[];
  setChatHistory: (history: ChatHistory[]) => void;
  messages: ChatMessage_T[];
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  createNewMessages: (content: string) => Promise<void>;
  fetchChatMessages: (chatId: number) => Promise<void>;
  createNewChat: () => Promise<void>;
}

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Parse message content into a new message object
const parseMessageContent = (text: string) => {
  const accumulatedText = text.replace(/```|json|markdown/g, "");
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
    while ((match = sourcesRegex.exec(jsonText)) !== null)
      sources.push(match[1]);
    while ((match = urlsRegex.exec(jsonText)) !== null) urls.push(match[1]);

    const challenges = topics.map((topic, index) => ({
      id: `topic-${index}`,
      name: topic,
      explanation: "",
      citation: sources[index] || "",
      url: urls[index] || "",
      icon: CloudRain,
    }));

    return { summary, challenges };
  } else {
    return { summary: accumulatedText, challenges: [] };
  }
};

// Provider component to wrap the application
export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [messages, setMessages] = useState<ChatMessage_T[]>([]);
  const [query, setQuery] = useState("");
  const [chatId, setChatId] = useState<number | null>(null);

  // Fetch chat history (Mock API call or replace with real API call)
  useEffect(() => {
    const userEmail = localStorage.getItem("user_email");
    if (!userEmail) {
      console.warn("User not authenticated, skipping chat initialization.");
      return; // Exit early if no user is logged in
    }

    const fetchChatHistory = async () => {
      try {
        const response = await axios.get<ChatHistory[]>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats`, {
            params: {user_email: localStorage.getItem("user_email") ?? "unknown"}
          }
        );
        setChatHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };
    createNewChat();
    fetchChatHistory();
  }, []);

  const createNewChat = async () => {
    try {
      const user_email = localStorage.getItem("user_email") ?? "unknown";
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reports/chat`, {
        user_email: user_email
      });
      const newChatId: number = response.data.id;
      setChatId(newChatId); // Save new chat ID in global state
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  const fetchChatMessages = async (chatId: number) => {
    try {
      // Mock API call (replace with actual API call)
      const response = await axios.get<ChatHistoryMessage[]>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/${chatId}/messages`
      );
      
      const formattedMessages : ChatMessage_T[] = response.data.map((msg) => {
        if (msg.user_message) {
          // User message: store content directly
          return {
            id: msg.id,
            type: "user",
            content: msg.content,
          };
        } else {
          // LLM message: parse the content
          return {
            id: msg.id,
            type: "llm",
            content: parseMessageContent(msg.content),
          };
        }
      });
      setChatId(chatId);
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
    }
  };

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
        data: { query: content, chat_id: chatId?.toString() },
        responseType: "stream",
        headers: {
          Accept: "text/event-stream",
          "Content-Type": "application/json",
        },
        onDownloadProgress: (progressEvent) => {
          const chunk = progressEvent.event.target.response;
          if (chunk) {
            console.log("chunk:", chunk);
            const parsedContent = parseMessageContent(chunk);

            setMessages((prev) => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                ...newMessages[newMessages.length - 1],
                content: parsedContent,
              };
              return newMessages;
            });
          }
        },
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chatHistory,
        setChatHistory,
        messages,
        query,
        setQuery,
        createNewMessages,
        fetchChatMessages,
        createNewChat,
      }}
    >
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
