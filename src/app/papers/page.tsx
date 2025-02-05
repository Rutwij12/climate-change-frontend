"use client"

import PaperCard from "@/components/PaperCard"
import { Paper } from "@/types"

const papers: Paper[] = [
  {
    id: 1,
    title: "Advances in Quantum Computing",
    abstract: "This paper explores recent developments in quantum computing...",
    publishedDate: "2023-05-15",
    authors: [
      { name: "Dr. Alice Johnson", isHelpful: true },
      { name: "Prof. Bob Smith", isHelpful: true },
    ],
  },
  // Add more papers...
]

export default function ResearchPapersList() {
  return (
    <div className="container mx-auto p-4 bg-green-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-green-800">Research Papers</h1>
      {papers.map((paper) => (
        <PaperCard key={paper.id} paper={paper} />
      ))}
    </div>
  )
}
