"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Challenge, Paper } from "@/types";

interface PaperState {
  isExpanded: boolean;
  showAuthors: boolean;
  addedAuthors: Record<string, boolean>;
  removedAuthors: Record<string, boolean>;
}

interface ResearchContextType {
  selectedChallenge: Challenge | null;
  setSelectedChallenge: (challenge: Challenge | null) => void;
  papers: Paper[];
  setPapers: React.Dispatch<React.SetStateAction<Paper[]>>;
  lastFetchedChallenge: Challenge | null;
  setLastFetchedChallenge: (challenge: Challenge | null) => void;
  paperStates: Record<string, PaperState>; // Paper state stored by paper ID
  updatePaperState: (paperId: string, updates: Partial<PaperState>) => void;
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

export function ResearchProvider({ children }: { children: React.ReactNode }) {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("selectedChallenge") || "null");
    }
    return null;
  });

  const [papers, setPapers] = useState<Paper[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("papers") || "[]");
    }
    return [];
  });

  // Persist this value across navigations
  const [lastFetchedChallenge, setLastFetchedChallenge] = useState<Challenge | null>(
    null
  );

  const [paperStates, setPaperStates] = useState<Record<string, PaperState>>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("paperStates") || "{}");
    }
    return {};
  });

  useEffect(() => {
    if (selectedChallenge) {
      localStorage.setItem("selectedChallenge", JSON.stringify(selectedChallenge));
    }
  }, [selectedChallenge]);

  useEffect(() => {
    localStorage.setItem("papers", JSON.stringify(papers));
  }, [papers]);

  useEffect(() => {
    localStorage.setItem("papers", JSON.stringify(papers));
  }, [papers]);

  useEffect(() => {
    localStorage.setItem("paperStates", JSON.stringify(paperStates));
  }, [paperStates]);

  const updatePaperState = (paperId: string, updates: Partial<PaperState>) => {
    setPaperStates((prev) => ({
      ...prev,
      [paperId]: {
        ...prev[paperId],
        ...updates,
      },
    }));
  };

  return (
    <ResearchContext.Provider value={{
      selectedChallenge,
      setSelectedChallenge,
      papers,
      setPapers,
      lastFetchedChallenge,
      setLastFetchedChallenge,
      paperStates,
      updatePaperState,
    }}>
      {children}
    </ResearchContext.Provider>
  );
}

export function useResearchContext() {
  const context = useContext(ResearchContext);
  if (!context) {
    throw new Error("useResearchContext must be used within a ResearchProvider");
  }
  return context;
}
