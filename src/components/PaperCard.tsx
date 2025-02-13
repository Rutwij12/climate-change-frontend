"use client"

import React, { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Paper } from "@/types"
import { motion, AnimatePresence } from "framer-motion"

export default function PaperCard({ paper }: { paper: Paper | undefined }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAuthors, setShowAuthors] = useState(false)

  if (!paper) {
    return (
      <Card className="mb-4 p-4">
        <p className="text-gray-500">Paper information not available.</p>
      </Card>
    )
  }

  // const handlePaperAction = (action: "approve" | "reject") => {
  //   console.log(`Paper ${action}d:`, paper.title)
  //   // Add your logic here for paper approval/rejection
  // }

  // Reset showAuthors when paper is collapsed
  useEffect(() => {
    if (!isExpanded) {
      setShowAuthors(false)
    }
  }, [isExpanded])

  const handleAuthorAction = (authorName: string, action: "approve" | "reject") => {
    console.log(`Author ${action}d:`, authorName)
    // Add your logic here for author approval/rejection
  }

  return (
    <Card className="mb-4 border-green-200 hover:border-green-400 transition-colors overflow-hidden">
      <CardContent className="p-4 relative">
        <div
          className="flex justify-between items-center cursor-pointer pr-20"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h2 className="text-xl font-semibold text-green-700">{paper.title}</h2>
          {isExpanded ? <ChevronUp className="text-green-600" /> : <ChevronDown className="text-green-600" />}
        </div>
        <p className="text-sm text-green-600 mt-2">Published on: {paper.publication_date}</p>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4">
                <p className="text-green-800 mb-4">{paper.abstract}</p>
                <Button size="sm" className="mr-2" onClick={() => setShowAuthors(!showAuthors)}>
                  {showAuthors ? "Hide Authors" : "See Authors"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      <AnimatePresence>
        {showAuthors && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-green-50"
          >
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-semibold text-green-700 mb-2">Authors</h3>
              {paper.authors && paper.authors.length > 0 ? (
                paper.authors.map((author, index) => (
                  <motion.div
                    key={index}
                    className="border border-green-200 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow relative"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="absolute top-2 right-2 space-x-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 rounded-full bg-red-100 hover:bg-red-200 border-red-200"
                        onClick={() => handleAuthorAction(author.name || "Unknown", "reject")}
                      >
                        <X className="h-3 w-3 text-red-600" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 rounded-full bg-green-100 hover:bg-green-200 border-green-200"
                        onClick={() => handleAuthorAction(author.name || "Unknown", "approve")}
                      >
                        <Check className="h-3 w-3 text-green-600" />
                      </Button>
                    </div>
                    <h4 className="text-lg font-semibold text-green-700 pr-16">{author.name}</h4>
                    <p className="text-sm text-green-600">Citations: {author.citations}</p>
                    <p className="text-sm text-green-600">h-index: {author.hindex}</p>
                    <p className="text-sm text-green-600">ORCID: {author.orcid}</p>
                    <p className="text-sm text-green-600">
                      Organisation History: {author.organisation_history?.join(", ")}
                    </p>
                    <p className="text-sm text-green-600">Grants: {author.grants?.join(", ")}</p>
                    <a
                      href={author.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Website
                    </a>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500">No authors found.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

