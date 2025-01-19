"use client";
import React, { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import { ChatMessage_T as ChatMessageType } from "@/types";

/**
 * Displays user prompt and LLM responses
 * @param param0 
 * @returns 
 */
export default function MessageList({ messages }: { messages: ChatMessageType[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const userMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userMessageRef.current) {
      userMessageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[500px] overflow-y-auto" // Full width and scrollable height
    >
      <div className="max-w-4xl mx-auto p-4"> {/* Center messages */}
      {messages.map((message) => (
          <div
            key={message.id}
            ref={message.type === 'user' ? userMessageRef : null} // Attach ref only to user messages
          >
            <ChatMessage message={message} />
          </div>
        ))}
      </div>
    </div>
  );
}
