import '@testing-library/jest-dom' // to use .toBeInTheDocument()
import React, { render, screen } from '@testing-library/react'
import ChatMessage from '@/components/ClimateChat/ChatMessage'
import { ChatMessage_T, LLMResponse } from '@/types'

// Mock the child components
jest.mock('@/components/ClimateChat/UserMessage', () => {
  return function MockUserMessage({ content }: { content: string }) {
    return <div data-testid="user-message">{content}</div>
  }
})

jest.mock('@/components/ClimateChat/LLMResponseMessage', () => {
  return function MockLLMResponse({ summary, challenges }: { summary: string, challenges: any[] }) {
    return <div data-testid="llm-response">{summary}</div>
  }
})

describe('ChatMessage', () => {
  test('renders UserMessage when message type is user', () => {
    const userMessage: ChatMessage_T = {
      id: 1,
      type: 'user',
      content: 'Hello world'
    }
    
    render(<ChatMessage message={userMessage} />)
    expect(screen.getByTestId('user-message')).toBeInTheDocument()
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  test('renders LLMResponseMessage when message type is llm', () => {
    const llmMessage: ChatMessage_T = {
      id: 2,
      type: 'llm',
      content: {
        summary: 'Test summary',
        challenges: []
      } as LLMResponse
    }
    
    render(<ChatMessage message={llmMessage} />)
    expect(screen.getByTestId('llm-response')).toBeInTheDocument()
    expect(screen.getByText('Test summary')).toBeInTheDocument()
  })
})