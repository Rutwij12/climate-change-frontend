"use client";

import React, { useState, Suspense } from "react";
import { useChatContext } from "@/lib/ChatContent";
import Header from "@/components/Header";
import MessageList from "@/components/MessageList";
import MessageInput from "@/components/MessageInput";

function ClimateChatContent() {
  const { messages, createNewMessages } = useChatContext();
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      createNewMessages(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-green-50">
        <MessageList messages={messages} />
      </div>

      {/* Fixed Input */}
      <div className="bg-green-50 pb-6">
        <MessageInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

export default function ClimateChat() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClimateChatContent />
    </Suspense>
  );
}
