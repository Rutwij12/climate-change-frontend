"use client"

import React, { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Paper } from "@/types"

export default function PaperCard({ paper }: { paper: Paper }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="mb-4 border-green-200 hover:border-green-400 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <h2 className="text-xl font-semibold text-green-700">{paper.paper_title}</h2>
          {isExpanded ? <ChevronUp className="text-green-600" /> : <ChevronDown className="text-green-600" />}
        </div>
        <p className="text-sm text-green-600 mt-2">Published on: {paper.publication_date}</p>
        {isExpanded && (
          <div className="mt-4">
            <p className="text-green-800 mb-4">{paper.content}</p>
            <ul>
              <Button size="sm" className="mr-2">
                See Authors
              </Button>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
