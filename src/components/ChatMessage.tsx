"use client";
import React from "react";
import UserMessage from "./UserMessage";
import LLMResponseMessage from "./LLMResponseMessage";
import { ChatMessage_T, LLMResponse, Challenge } from "@/types";

export default function ChatMessage({
  message,
  onChallengeSelect,
  } : {
  message: ChatMessage_T;
  onChallengeSelect: (challenge: Challenge) => void;
  }) {
  if (message.type === "user") {
    return <UserMessage content={message.content as string} />;
  }

  const { summary, challenges } = message.content as LLMResponse;

  return <LLMResponseMessage 
    summary={summary} 
    challenges={challenges} 
    onChallengeSelect={onChallengeSelect}/>;
}

