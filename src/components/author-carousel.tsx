"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthorCard } from "@/components/author-card"
import { authors } from "../data/sample-authors"
import { AnimatePresence, motion } from "framer-motion"

export function AuthorCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((current) => (current === 0 ? authors.length - 1 : current - 1))
  }

  const goToNext = () => {
    setCurrentIndex((current) => (current === authors.length - 1 ? 0 : current + 1))
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto py-8">
      <div className="overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <AuthorCard author={authors[currentIndex]} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-y-0 left-0 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-[#447A48] text-white hover:bg-[#447A48]/90"
          onClick={goToPrevious}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-[#447A48] text-white hover:bg-[#447A48]/90"
          onClick={goToNext}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {authors.map((_, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={`w-3 h-3 rounded-full p-0 ${index === currentIndex ? "bg-[#447A48]" : "bg-[#447A48]/30"}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}

