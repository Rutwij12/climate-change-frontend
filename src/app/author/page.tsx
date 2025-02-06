import React from "react"
import { AuthorCarousel } from "@/components/author-carousel"
import Header from "@/components/Header";

export default function Page() {
  return (
      <div className="flex flex-col h-screen">
      
      <Header />
      <AuthorCarousel />
    </div>
  )
}