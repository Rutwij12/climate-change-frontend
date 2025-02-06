"use client"

import React, { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Paper } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function PaperCard({ paper }: { paper: Paper }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Card className="mb-4 border-green-200 hover:border-green-400 transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <h2 className="text-xl font-semibold text-green-700">{paper.title}</h2>
            {isExpanded ? <ChevronUp className="text-green-600" /> : <ChevronDown className="text-green-600" />}
          </div>
          <p className="text-sm text-green-600 mt-2">Published on: {paper.publication_date}</p>
          {isExpanded && (
            <div className="mt-4">
              <p className="text-green-800 mb-4">{paper.abstract}</p>
              <Button size="sm" className="mr-2" onClick={() => setIsModalOpen(true)}>
                See Authors
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Author Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authors</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {paper.authors.length > 0 ? (
              paper.authors.map((author, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-700">{author.name}</h3>
                  <p className="text-sm text-green-600">Citations: {author.citations}</p>
                  <p className="text-sm text-green-600">h-index: {author.hindex}</p>
                  <p className="text-sm text-green-600">ORCID: {author.orcid}</p>
                  <p className="text-sm text-green-600">Organisation History: {author.organisation_history.join(", ")}</p>
                  <p className="text-sm text-green-600">Grants: {author.grants.join(", ")}</p>
                  <a href={author.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Website
                  </a>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No authors found.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
