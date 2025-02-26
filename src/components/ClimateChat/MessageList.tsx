"use client";
import React, { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import { ChatMessage_T as ChatMessageType, Challenge } from "@/types";

/**
 * MessageList Component
 *
 * Renders a list of chat messages, including user inputs and LLM responses.
 * Positions new user messages at the absolute top of the container.
 *
 * @param {Object} props - Component props
 * @param {ChatMessageType[]} props.messages - Array of chat messages
 * @returns {JSX.Element} The rendered MessageList component
 */
export default function MessageList({
  messages,
  onChallengeSelect,
}: {
  messages: ChatMessageType[];
  onChallengeSelect: (challenge: Challenge) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const userMessageRef = useRef<HTMLDivElement>(null);
  const lastProcessedUserMsgId = useRef<number | null>(null);
  
  // Effect to position the latest user message at the top of the container
  useEffect(() => {
    // Find the last user message
    const lastUserMsg = [...messages].reverse().find(msg => msg.type === 'user');
    
    // Only scroll if this is a new user message we haven't processed yet
    if (lastUserMsg && lastUserMsg.id !== lastProcessedUserMsgId.current) {
      if (userMessageRef.current && containerRef.current) {
        // Calculate exact scroll position to place message at top
        containerRef.current.scrollTop = userMessageRef.current.offsetTop;
        
        // Mark this message as processed so we don't scroll to it again
        lastProcessedUserMsgId.current = lastUserMsg.id;
      }
    }
  }, [messages]);
  
  return (
    <div
      ref={containerRef}
      className="w-full h-[75vh] overflow-y-auto"
      data-testid="message-list-container"
    >
      <div className="max-w-4xl mx-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            ref={message.type === 'user' ? userMessageRef : null}
          >
            <ChatMessage message={message} onChallengeSelect={onChallengeSelect}/>
          </div>
        ))}
      </div>
    </div>
  );
}