"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useChatContext } from "@/lib/ChatContent";
import Header from "@/components/Header";
import MessageList from "@/components/MessageList";
import MessageInput from "@/components/MessageInput";
import { ChatMessage_T, LLMResponse, Challenge } from "@/types";
import { CloudRain, Fish } from "lucide-react";
import axios from "axios";

const mockLLMResponse: LLMResponse = {
  summary:
    "Climate change poses significant challenges to global sustainability efforts.",
  challenges: [
    {
      id: "rising-sea-levels",
      name: "Rising Sea Levels",
      explanation:
        "Coastal communities are at risk due to melting ice caps and thermal expansion of oceans.",
      citation: "IPCC, 2021: Climate Change 2021: The Physical Science Basis.",
      icon: CloudRain,
    },
    {
      id: "extreme-weather-events",
      name: "Extreme Weather Events",
      explanation:
        "Increased frequency and intensity of hurricanes, droughts, and heatwaves threaten ecosystems and human settlements.",
      citation:
        "World Meteorological Organization, State of the Global Climate 2020.",
      icon: CloudRain,
    },
    {
      id: "biodiversity-loss",
      name: "Biodiversity Loss",
      explanation:
        "Rapid changes in temperature and precipitation patterns lead to habitat destruction and species extinction.",
      citation:
        "IPBES, 2019: Global Assessment Report on Biodiversity and Ecosystem Services.",
      icon: Fish,
    },
  ],
};

function ClimateChatContent() {
  const { query, setQuery, messages, setMessages } = useChatContext();
  const [input, setInput] = useState("");
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState("");

  const createNewMessages = async (content: string) => {
    const userMessage: ChatMessage_T = {
      id: Date.now(),
      type: "user",
      content,
    };
    // Add user message and empty LLM message
    setCurrentStreamingMessage((prev) => "");
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
      const response = await axios({
        method: "post",
        url: "http://0.0.0.0:8000/api/reports/query",
        data: { query: content, chat_id: "1" },
        responseType: "stream",
        headers: {
          Accept: "text/event-stream",
          "Content-Type": "application/json",
        },
        onDownloadProgress: (progressEvent) => {
          const chunk = progressEvent.event.target.response;
          if (chunk) {
            setCurrentStreamingMessage(chunk);
            let accumulatedText = chunk;
            // Find where the JSON-like structure starts
            const jsonStartIndex = accumulatedText.indexOf("{");

            if (jsonStartIndex !== -1) {
              const summary = accumulatedText
                .substring(0, jsonStartIndex)
                .trim();
              const jsonText = accumulatedText.substring(jsonStartIndex);

              // Separately match topics and sources
              const topicsRegex = /'topic':\s*'([^']*)'/g;
              const sourcesRegex = /'source':\s*'([^']*)'/g;

              const topics: string[] = [];
              const sources: string[] = [];

              // Find all topics
              let topicMatch;
              while ((topicMatch = topicsRegex.exec(jsonText)) !== null) {
                topics.push(topicMatch[1]);
              }
              console.log("topics: ", topics);

              // Find all sources
              let sourceMatch;
              while ((sourceMatch = sourcesRegex.exec(jsonText)) !== null) {
                sources.push(sourceMatch[1]);
              }
              console.log("sources: ", sources);

              // Create challenges array using available data
              const challenges: Challenge[] = topics.map((topic, index) => ({
                id: `topic-${index}`,
                name: topic,
                explanation: "",
                citation: sources[index] || "", // Use source if available, empty string if not
                icon: CloudRain,
              }));

              // Update the last message
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  ...newMessages[newMessages.length - 1],
                  content: {
                    summary,
                    challenges,
                  },
                };
                return newMessages;
              });
            } else {
              // No JSON structure yet, just update summary
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  ...newMessages[newMessages.length - 1],
                  content: {
                    summary: accumulatedText,
                    challenges: [],
                  },
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

  useEffect(() => {
    if (query) {
      createNewMessages(query);
      setQuery(""); // Clear query after processing
    }
  }, [query, setMessages, setQuery]);

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
