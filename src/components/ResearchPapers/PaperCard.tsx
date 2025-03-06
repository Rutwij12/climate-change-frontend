"use client"

import React from "react"
import { ChevronDown, ChevronUp, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Paper } from "@/types"
import { motion, AnimatePresence } from "framer-motion"
import AuthorCard from "./AuthorCard"
import { useResearchContext } from "@/lib/ResearchContext"
// import axios from "axios"

export default function PaperCard({ paper }: { paper: Paper | undefined }) {
  const { paperStates, updatePaperState } = useResearchContext();

  if (!paper) {
    return (
      <Card className="mb-4 p-4">
        <p className="text-gray-500">Paper information not available.</p>
      </Card>
    )
  }

  const paperId = paper.openalex_id;

  const {
    isExpanded = false,
    showAuthors = false,
    addedAuthors = {},
    removedAuthors = {},
  } = paperStates[paperId] || {};

  const toggleExpand = () => {
    updatePaperState(paperId, { isExpanded: !isExpanded });
    updatePaperState(paperId, { showAuthors: false });
  };

  const toggleShowAuthors = () => {
    updatePaperState(paperId, { showAuthors: !showAuthors });
  };

  const addAuthor = async (authorName: string): Promise<void> => {
    updatePaperState(paperId, {
      addedAuthors: { ...addedAuthors, [authorName]: true },
    });
  };

  const removeAuthor = async (authorName: string): Promise<void> => {
    updatePaperState(paperId, {
      removedAuthors: { ...removedAuthors, [authorName]: true },
    });
  };

  // TODO: merge changes
  // const addAuthor = async (authorName: string) => {
  //   try {
  //     await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/authors/feedback`, {
  //       paper: paper,
  //       author_name: authorName,
  //       accepted: true,
  //     });
  //     setAddedAuthors((prev) => ({
  //       ...prev,
  //       [authorName]: true,
  //     }));
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       console.error("Error sending author feedback:", error.response?.data || error.message)
  //     } else {
  //       console.error("Unexpected error:", error)
  //     }
  //   }
  //   setAddedAuthors((prev) => ({
  //     ...prev,
  //     [authorName]: true,
  //   }));
  // }

  // const removeAuthor = async (authorName: string) => {
  //   try {
  //     await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/authors/feedback`, {
  //       paper: paper,
  //       author_name: authorName,
  //       accepted: false,
  //     });
  //     setRemovedAuthors((prev) => ({
  //       ...prev,
  //       [authorName]: true,
  //     }));
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       console.error("Error sending author feedback:", error.response?.data || error.message)
  //     } else {
  //       console.error("Unexpected error:", error)
  //     }
  //   }
  //   setRemovedAuthors((prev) => ({
  //     ...prev,
  //     [authorName]: true,
  //   }));
  // }

  const restoreAuthors = () => {
    updatePaperState(paperId, { removedAuthors: {} });
  };

  return (
    <Card className="mb-4 border-green-200 hover:border-green-400 transition-colors overflow-hidden">
      <CardContent className="p-4">
        <div 
          className="flex justify-between items-center w-full cursor-pointer" 
          onClick={toggleExpand}
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
                <Button size="sm" className="mr-2" onClick={toggleShowAuthors}>
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

// const addAuthor = async (authorName: string) => {
  //   // try {
  //   //   await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/authors/feedback`, {
  //   //     paper: paper,
  //   //     author_name: authorName,
  //   //     accepted: true,
  //   //   });
  //   //   setAddedAuthors((prev) => ({
  //   //     ...prev,
  //   //     [authorName]: true,
  //   //   }));
  //   // } catch (error) {
  //   //   if (axios.isAxiosError(error)) {
  //   //     console.error("Error sending author feedback:", error.response?.data || error.message)
  //   //   } else {
  //   //     console.error("Unexpected error:", error)
  //   //   }
  //   // }
  //   setAddedAuthors((prev) => ({
  //     ...prev,
  //     [authorName]: true,
  //   }));
  // }

  // const removeAuthor = async (authorName: string) => {
  //   // try {
  //   //   await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/authors/feedback`, {
  //   //     paper: paper,
  //   //     author_name: authorName,
  //   //     accepted: false,
  //   //   });
  //   //   setRemovedAuthors((prev) => ({
  //   //     ...prev,
  //   //     [authorName]: true,
  //   //   }));
  //   // } catch (error) {
  //   //   if (axios.isAxiosError(error)) {
  //   //     console.error("Error sending author feedback:", error.response?.data || error.message)
  //   //   } else {
  //   //     console.error("Unexpected error:", error)
  //   //   }
  //   // }
  //   setRemovedAuthors((prev) => ({
  //     ...prev,
  //     [authorName]: true,
  //   }));
  // }