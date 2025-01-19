"use client";
import React from "react";
import UserMessage from "./UserMessage";
import LLMResponseMessage from "./LLMResponseMessage";
import { ChatMessage_T, LLMResponse } from "@/types";

export default function ChatMessage({ message }: { message: ChatMessage_T }) {
  if (message.type === "user") {
    return <UserMessage content={message.content as string} />;
  }

  const { summary, challenges } = message.content as LLMResponse;

  return <LLMResponseMessage summary={summary} challenges={challenges} />;
}
