"use client";

import React, { useEffect, useState } from "react";
import PaperCard from "@/components/ResearchPapers/PaperCard";
import { useResearchContext } from "@/lib/ResearchContext";
import { Paper } from "@/types";

interface ResearchPapersListProps {
  onClose: () => void;
}

export default function ResearchPapersList({
  onClose,
}: ResearchPapersListProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedChallenge, papers, setPapers, lastFetchedChallenge, setLastFetchedChallenge } = useResearchContext();

  useEffect(() => {
    console.log("Selected challenge: " + selectedChallenge?.name);
    console.log("last: " + lastFetchedChallenge?.name);
    if (!selectedChallenge || selectedChallenge === lastFetchedChallenge) return;
    
    setLoading(true);
    setPapers([]);
    setLastFetchedChallenge(selectedChallenge);

    const controller = new AbortController();

    const fetchPapers = async () => {

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/papers/search`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: selectedChallenge.name,
              top_k: 3,
            }),
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch papers");
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        let accumulatedPapers: Paper[] = [];

        // Read the stream
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          // Convert the chunk to text
          const chunk = new TextDecoder().decode(value);
          console.log("chunk", chunk);
          // Split by double newlines to get individual SSE messages
          const messages = chunk.split("\n\n");
          for (const message of messages) {
            if (!message.trim()) continue;

            // Remove "data: " prefix and parse JSON
            const data = JSON.parse(message.replace(/^data: /, ""));
            console.log("data", data);
            if (data.type === "initial") {
              accumulatedPapers = data.papers;
              setPapers(accumulatedPapers);
              setLoading(false);
            } else if (data.type === "author_details") {
              setPapers((prevPapers) =>
                prevPapers.map((paper) => ({
                  ...paper,
                  authors: paper.authors.map((author) => ({
                    ...author,
                    ...(data.updates[author.openAlexid] || {}),
                  })),
                }))
              );
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // Handle abort error silently
          return;
        }
        setError((err as Error).message);
        setLoading(false);
      }
    };

    fetchPapers();

    // Cleanup function to abort fetch if component unmounts
    return () => {
      controller.abort();
    };
  }, [selectedChallenge]);

  return (
    <div className="relative container mx-auto bg-green-50 min-h-screen">
      <button
        className="absolute top-3 right-4 px-2 py-1 border-2 border-red-600 bg-red-500 text-white rounded hover:bg-red-700"
        onClick={onClose}
      >
        Close
      </button>

      {/* Heading of Research Papers List*/}
      <header className="bg-green-700 text-white p-4 flex items-center justify-center h-16">
        <h1 className="text-2xl font-bold">Research Papers</h1>
      </header>
      {/* List of Research Papers*/}
      <div className="p-4">
        {loading ? (
          <div className="flex flex-col items-center">
            <p className="text-2xl font-bold text-gray-700 mb-4">
              Loading papers...
            </p>
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <p className="text-center mt-4 text-red-600">{error}</p>
        ) : papers.length === 0 ? (
          <p className="text-center mt-4">No research papers found.</p>
        ) : (
          papers.map((paper) => (
            <PaperCard key={paper.paper_id} paper={paper} />
          ))
        )}
      </div>
    </div>
  );
}
