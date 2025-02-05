"use client"

import { Check, X } from "lucide-react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Author {
  id: number
  name: string
  isUseful: boolean | null
}

interface AuthorBookProps {
  initialAuthors: Author[]
  onStatusChange?: (id: number, status: boolean) => void
}

export default function AuthorBook({ initialAuthors, onStatusChange }: AuthorBookProps) {
  const [authors, setAuthors] = useState<Author[]>(initialAuthors)

  const setAuthorStatus = (id: number, status: boolean) => {
    const updatedAuthors = authors.map((author) =>
      author.id === id ? { ...author, isUseful: status } : author
    )
    setAuthors(updatedAuthors)
    if (onStatusChange) {
      onStatusChange(id, status)
    }
  }

  return (
    <div className="min-h-screen bg-[#F2FFF2]">
      <Card className="min-h-screen border-none rounded-none bg-[#F2FFF2]">
        <CardContent className="p-6">
          <div className="space-y-4 max-w-6xl mx-auto">
            {authors.map((author) => (
              <div
                key={author.id}
                className="flex items-center justify-between p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <span className="text-xl text-[#4F8749] font-medium flex-1">{author.name}</span>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setAuthorStatus(author.id, true)}
                    className={`p-3 rounded-full transition-all duration-200 hover:bg-green-50 
                      ${author.isUseful === true ? "bg-green-100" : "bg-transparent"}`}
                  >
                    <Check
                      className={`w-8 h-8 transition-all duration-200 
                        ${author.isUseful === true ? "text-[#2E7D32]" : "text-gray-400"}`}
                    />
                  </button>
                  <button
                    onClick={() => setAuthorStatus(author.id, false)}
                    className={`p-3 rounded-full transition-all duration-200 hover:bg-red-50
                      ${author.isUseful === false ? "bg-red-100" : "bg-transparent"}`}
                  >
                    <X
                      className={`w-8 h-8 transition-all duration-200
                        ${author.isUseful === false ? "text-[#D32F2F]" : "text-gray-400"}`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
