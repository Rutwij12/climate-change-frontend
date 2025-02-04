"use client"

import React, { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { v4 as uuidv4 } from "uuid"  // Import UUID

interface Ranking {
  id: string  // Change id to string for UUIDs
  title: string
  authors: string[]
  link: string
}

export default function RankingPage() {
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const { ref, inView } = useInView()

  // Simulate fetching rankings data
  const fetchRankings = async (pageNum: number) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))  // Simulate API delay

    const newRankings = Array.from({ length: 10 }, (_, i) => ({
      id: uuidv4(),  // Generate a unique ID
      title: `Top Search Result ${(pageNum - 1) * 10 + i + 1}`,
      authors: ["Author A", "Author B", "Author C"].slice(0, Math.floor(Math.random() * 3) + 1),
      link: "#",
    }))

    setRankings((prev) => [...prev, ...newRankings])
    setLoading(false)
  }

  useEffect(() => {
    fetchRankings(1)
  }, [])  // Run only on mount

  useEffect(() => {
    if (inView && !loading) {
      setPage((prev) => prev + 1)
      fetchRankings(page + 1)
    }
  }, [inView, loading])  // Dependencies to trigger pagination

  return (
    <div className="min-h-screen bg-[#F0FFF0]">
      <header className="bg-[#3E7A3F] text-white p-4 mb-8">
        <h1 className="text-2xl font-bold text-center">Top Search Rankings in Aviation</h1>
      </header>

      <main className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-4">
          {rankings.map((ranking) => (
            <div key={ranking.id} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[#3E7A3F] font-bold text-xl min-w-[2rem]">•</span>
                <Link href={ranking.link} className="text-[#2F572F] hover:text-[#3E7A3F] transition-colors">
                  {ranking.title}
                </Link>
              </div>

              <div className="flex gap-2">
                {ranking.authors.map((author, idx) => (
                  <Link
                    key={`${ranking.id}-${idx}`}  // Ensure uniqueness for authors
                    href={`/author/${author.toLowerCase().replace(" ", "-")}`}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-[#3E7A3F] text-white text-sm hover:bg-[#2F572F] transition-colors"
                  >
                    {author}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div ref={ref} className="flex justify-center p-4">
            {loading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3E7A3F]" />}
          </div>
        </div>
      </main>
    </div>
  )
}
