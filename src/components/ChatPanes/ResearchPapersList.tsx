"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import PaperCard from "@/components/ResearchPapers/PaperCard";
import { Paper, Challenge } from "@/types";

interface ResearchPapersListProps {
  challenge: Challenge;
  onClose: () => void;
}

export default function ResearchPapersList({ challenge, onClose }: ResearchPapersListProps) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPapers = async () => {
      setLoading(true);
      setPapers([]);

      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/papers/search`, {
          query: challenge.name,
          top_k: 2,
        });
      
        setPapers(response.data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [challenge]);

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
            <p className="text-2xl font-bold text-gray-700 mb-4">Loading papers...</p>
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <p className="text-center mt-4 text-red-600">{error}</p>
        ) : papers.length === 0 ? (
          <p className="text-center mt-4">No research papers found.</p>
        ) : (
          papers.map((paper) => <PaperCard key={paper.paper_id} paper={paper} />)
        )}
      </div>
    </div>
  );
}
