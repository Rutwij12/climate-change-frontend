"use client";
import React, { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import { ChatMessage_T as ChatMessageType } from "@/types";

export default function MessageList({ messages }: { messages: ChatMessageType[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[500px] overflow-y-auto" // Full width and scrollable height
    >
      <div className="max-w-4xl mx-auto p-4"> {/* Center messages */}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
