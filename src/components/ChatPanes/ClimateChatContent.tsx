"use client";

import React, { useState, Suspense } from "react";
import { useChatContext } from "@/lib/ChatContent";
import Header from "@/components/ClimateChat/Header";
import MessageList from "@/components/ClimateChat/MessageList";
import MessageInput from "@/components/ClimateChat/MessageInput";
import { Challenge } from "@/types";

// Removed the second `export default` to ensure there is only one default export
function ClimateChatContent({
  onChallengeSelect,
}: {
  onChallengeSelect: (challenge: Challenge) => void;
}) {
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
      <Header />
      <div className="flex-1 overflow-y-auto bg-green-50">
        <MessageList 
          messages={messages} 
          onChallengeSelect={onChallengeSelect}
        />
      </div>
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

// Removed `default` from the second export
export default function ClimateChat({ onChallengeClick }: { onChallengeClick: (challenge: Challenge) => void }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClimateChatContent onChallengeSelect={onChallengeClick} />
    </Suspense>
  );
}
