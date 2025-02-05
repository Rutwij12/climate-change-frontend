"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ClimateChat from "@/components/ChatPanes/ClimateChatContent";
import ResearchPaperList from "@/components/ChatPanes/ResearchPapersList";
import { Challenge } from "@/types";

export default function ChatWithResearch() {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Pane (Chat) */}
      <motion.div
        className="transition-all ease-in-out duration-500 bg-green-50"
        animate={{ width: selectedChallenge ? "50%" : "100%" }} // Shrinks when challenge is selected
      >
        <ClimateChat onChallengeClick={setSelectedChallenge} />
      </motion.div>

      {/* Right Pane (Research Papers) */}
      {selectedChallenge && (
        <motion.div
          className="w-1/2 overflow-y-auto bg-white p-4"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ResearchPaperList challenge={selectedChallenge} onClose={() => setSelectedChallenge(null)} />
        </motion.div>
      )}
    </div>
  );
}
