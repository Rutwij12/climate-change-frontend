"use client"

import React, { useState } from "react"
import { UserPlus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import axios from "axios"
import { Author } from "@/types"

interface AuthorCardProps {
  author: Author
  isAdded: boolean
  isRemoved: boolean
  addAuthor: (authorName: string) => void
  removeAuthor: (authorName: string) => void
}

export default function AuthorCard({ author, isAdded, isRemoved, addAuthor, removeAuthor }: AuthorCardProps) {
  const [isAdding, setIsAdding] = useState(false)

  if (isRemoved) return null

  const handleAddAuthor = async () => {
    setIsAdding(true)
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/crm/authors`, {
        name: author.name,
        institution: author.organisation_history?.[0] ?? "Unknown",
        note: author.grants?.join(", ") ?? null,
        openalex_id: author.openAlexid || "", // Ensure a string is sent
      })
      addAuthor(author.name) // Update UI
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error adding author:", error.response?.data || error.message)
      } else {
        console.error("Unexpected error:", error)
      }
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <motion.div
      className="border border-green-200 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow flex justify-between items-start"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-1">
        <h4 className="text-lg font-semibold text-green-700">{author.name}</h4>
        <p className="text-sm text-green-600">Citations: {author.citations}</p>
        <p className="text-sm text-green-600">h-index: {author.hindex}</p>
        <p className="text-sm text-green-600">ORCID: {author.orcid}</p>
        <p className="text-sm text-green-600">
          Organisation History: {author.organisation_history?.join(", ") || "Unknown"}
        </p>
        <p className="text-sm text-green-600">Grants: {author.grants?.join(", ") || "None"}</p>
        <a
          href={author.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Website
        </a>
      </div>

      <div className="flex flex-col space-y-2 ml-4">
        <Button
          size="sm"
          className="bg-green-100 border-green-400 text-green-600"
          variant="outline"
          onClick={handleAddAuthor}
          disabled={isAdded || isAdding}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {isAdded ? "Author Added" : isAdding ? "Adding Author..." : "Add"}
        </Button>

        <Button
          size="sm"
          className="bg-red-100 border-red-400 text-red-600"
          variant="outline"
          onClick={() => removeAuthor(author.name)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Remove
        </Button>
      </div>
    </motion.div>
  )
}
