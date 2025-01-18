"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SendHorizontal, Leaf, CloudRain, Fish, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Challenge {
  id: string
  name: string
  explanation: string
  citation: string
  icon: React.ElementType
}

interface LLMResponse {
  summary: string
  challenges: Challenge[]
}

interface ChatMessage {
  id: number
  type: 'user' | 'llm'
  content: string | LLMResponse
}

const mockLLMResponse: LLMResponse = {
  summary: "Climate change poses significant challenges to global sustainability efforts.",
  challenges: [
    {
      id: "rising-sea-levels",
      name: "Rising Sea Levels",
      explanation: "Coastal communities are at risk due to melting ice caps and thermal expansion of oceans.",
      citation: "IPCC, 2021: Climate Change 2021: The Physical Science Basis.",
      icon: CloudRain
    },
    {
      id: "extreme-weather-events",
      name: "Extreme Weather Events",
      explanation: "Increased frequency and intensity of hurricanes, droughts, and heatwaves threaten ecosystems and human settlements.",
      citation: "World Meteorological Organization, State of the Global Climate 2020.",
      icon: CloudRain
    },
    {
      id: "biodiversity-loss",
      name: "Biodiversity Loss",
      explanation: "Rapid changes in temperature and precipitation patterns lead to habitat destruction and species extinction.",
      citation: "IPBES, 2019: Global Assessment Report on Biodiversity and Ecosystem Services.",
      icon: Fish
    }
  ]
}

export default function ClimateChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      const newUserMessage: ChatMessage = { id: Date.now(), type: 'user', content: input }
      const newLLMMessage: ChatMessage = { id: Date.now() + 1, type: 'llm', content: mockLLMResponse }
      setMessages([...messages, newUserMessage, newLLMMessage])
      setInput('')
    }
  }

  return (
    <div className="flex flex-col h-screen w-screen">
      {/* Header */}
      <header className="bg-green-700 text-white p-4 flex items-center justify-center h-16">
        <Leaf className="mr-2" />
        <h1 className="text-2xl font-bold">Climate Change Chat</h1>
      </header>

      {/* Scrollable Content Area */}
      <ScrollArea className="flex-1 w-full bg-green-50">
        <div className="max-w-4xl mx-auto p-4">
          {messages.map((message) => (
            <div key={message.id} className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
              {message.type === 'user' ? (
                <Card className="inline-block max-w-md bg-green-100 border-green-200 mx-auto text-center">
                  <CardContent className="p-2">
                    <p className="text-lg font-medium break-words">{message.content as string}</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="inline-block max-w-2xl border-green-200 mx-auto text-center">
                  <CardContent className="p-6">
                    <p className="text-lg font-semibold mb-4 text-green-800 break-words">
                      {(message.content as LLMResponse).summary}
                    </p>
                    <div className="grid gap-4">
                      {(message.content as LLMResponse).challenges.map((challenge) => (
                        <Link href={`/challenge/${challenge.id}`} key={challenge.id}>
                          <Card className="bg-white hover:bg-green-50 transition-colors cursor-pointer border-green-200">
                            <CardHeader className="flex flex-row items-center gap-2">
                              <challenge.icon className="h-5 w-5 text-green-600" />
                              <CardTitle className="text-lg text-green-800">{challenge.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm mb-2 text-gray-600">{challenge.explanation}</p>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">Source: {challenge.citation}</p>
                                <ArrowRight className="h-4 w-4 text-green-600" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-2 bg-green-50">
          <div className="relative w-full max-w-4xl mx-auto">
            {/* Input Box */}
            <div className="flex items-center px-4 py-2 border-2 border-green-800 rounded-3xl bg-transparent backdrop-blur-sm">
              <textarea
                placeholder="Ask about climate change..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  e.target.style.height = "auto"
                  e.target.style.height = `${e.target.scrollHeight}px`
                }}
                className="flex-1 min-h-[40px] max-h-60 text-lg p-2 bg-transparent outline-none resize-none"
              />
            </div>

            {/* Send Button */}
            <button className="absolute bottom-2 right-2 bg-black text-white p-3 rounded-full hover:bg-gray-800 transition">
              <SendHorizontal className="h-5 w-5" />
            </button>
          </div>
        </form>
    </div>
  )
}
