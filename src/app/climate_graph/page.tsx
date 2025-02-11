"use client"
import dynamic from "next/dynamic"

const DynamicGraph = dynamic(() => import("@/components/DynamicGraph"), { ssr: false })

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Dynamic Graph</h1>
      <DynamicGraph />
    </main>
  )
}

