"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar/Sidebar";
import ClimateChat from "@/components/ChatPanes/ClimateChatContent";
import ResearchPaperList from "@/components/ChatPanes/ResearchPapersList";
import { Challenge } from "@/types";
import { useChatContext } from "@/lib/ChatContent";

export default function ChatWithResearch() {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [leftPaneWidth, setLeftPaneWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Track sidebar state
  const { chatHistory } = useChatContext();
  
  const mockOnChatSelect = (title: string) => {
    console.log(`Selected chat: ${title}`);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        setLeftPaneWidth(Math.max(10, Math.min(newWidth, 90)));
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        chatHistory={chatHistory} 
        onChatSelect={mockOnChatSelect}
      />

      {/* Main Content */}
      <div
        className={`flex transition-all duration-300 w-full ${
          sidebarOpen ? "ml-[200px]" : "ml-0"
        }`}
      >
        {/* Left Pane (Chat) */}
        <motion.div
          className="bg-green-50 transition-all"
          animate={{ width: selectedChallenge ? `${leftPaneWidth}%` : "100%" }}
        >
          <ClimateChat onChallengeClick={setSelectedChallenge} />
        </motion.div>

        {/* Resizable Divider */}
        {selectedChallenge && (
          <div
            className="cursor-col-resize bg-gray-400 w-2 hover:bg-gray-500"
            onMouseDown={() => setIsResizing(true)}
          />
        )}

        {/* Right Pane (Research Papers) */}
        {selectedChallenge && (
          <motion.div
            className="overflow-y-auto"
            style={{ width: `${100 - leftPaneWidth}%` }}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ResearchPaperList
              challenge={selectedChallenge}
              onClose={() => setSelectedChallenge(null)}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
