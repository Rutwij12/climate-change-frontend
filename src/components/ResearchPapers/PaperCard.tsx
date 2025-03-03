"use client"

import React, { useState } from "react"
import { ChevronDown, ChevronUp, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Paper } from "@/types"
import { motion, AnimatePresence } from "framer-motion"
import AuthorCard from "./AuthorCard"

export default function PaperCard({ paper }: { paper: Paper | undefined }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAuthors, setShowAuthors] = useState(false)
  const [addedAuthors, setAddedAuthors] = useState<Record<string, boolean>>({})
  const [removedAuthors, setRemovedAuthors] = useState<Record<string, boolean>>({})

  if (!paper) {
    return (
      <Card className="mb-4 p-4">
        <p className="text-gray-500">Paper information not available.</p>
      </Card>
    )
  }

  const addAuthor = (authorName: string) => {
    setAddedAuthors((prev) => ({
      ...prev,
      [authorName]: true,
    }))
  }

  const removeAuthor = (authorName: string) => {
    setRemovedAuthors((prev) => ({
      ...prev,
      [authorName]: true,
    }))
  }

  const restoreAuthors = () => {
    setRemovedAuthors({})
  }

  return (
    <Card className="mb-4 border-green-200 hover:border-green-400 transition-colors overflow-hidden">
      <CardContent className="p-4">
        <div 
          className="flex justify-between items-center w-full cursor-pointer" 
          onClick={() => {
            setIsExpanded(!isExpanded);
            if (isExpanded) setShowAuthors(false); // Hide authors when collapsing
          }}
        >
          <h2 className="text-xl font-semibold text-green-700 flex-1">{paper.title}</h2>
          <div className="flex justify-end w-10">
            {isExpanded ? <ChevronUp className="text-green-600" size={20} /> : <ChevronDown className="text-green-600" size={20} />}
          </div>
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
                <>
                  {paper.authors.map((author, index) => (
                    <AuthorCard
                      key={index}
                      author={author}
                      isAdded={addedAuthors[author.name]}
                      isRemoved={removedAuthors[author.name]}
                      addAuthor={addAuthor}
                      removeAuthor={removeAuthor}
                      paperId = {paper.openalex_id}
                    />
                  ))}
                  <Button
                    size="sm"
                    className="mt-4 bg-yellow-100 border-yellow-400 text-yellow-700 w-full"
                    variant="outline"
                    onClick={restoreAuthors}
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Restore Authors
                  </Button>
                </>
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
