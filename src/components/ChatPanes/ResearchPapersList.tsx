"use client"

import PaperCard from "@/components/PaperCard"
import { Paper, Challenge } from "@/types"

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

interface ResearchPapersListProps {
  challenge: Challenge; // Accept the selected challenge as a prop
  onClose: () => void; // Optional close handler
}

export default function ResearchPapersList({ challenge, onClose }: ResearchPapersListProps) {

  //  // Filter the papers based on the selected challenge
  //  const relatedPapers = papers.filter((paper) =>
  //   paper.challenges?.some((c) => c.id === challenge.id)
  // );
  
  return (
    <div className="container mx-auto p-4 bg-green-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-green-800">Research Papers</h1>
      {papers.map((paper) => (
        <PaperCard 
          key={paper.id} 
          paper={paper} 
        />
      ))}
    </div>
  )
}
