import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageList from '@/components/MessageList';
import { ChatMessage_T } from '@/types';

// Mock scrollIntoView
const mockScrollIntoView = jest.fn();
window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

// Mock ChatMessage component
jest.mock('@/components/ChatMessage', () => {
  const MockChatMessage = function ({ message }: { message: ChatMessage_T }) {
    return <div data-testid={`chat-message-${message.id}`}>{message.content as string}</div>
  };

  MockChatMessage.displayName = "MockChatMessage"; // Assign display name

  return MockChatMessage;
});


describe('MessageList Component', () => {
  const mockMessages: ChatMessage_T[] = [
    {
      id: 1,
      type: 'user',
      content: 'User message 1'
    },
    {
      id: 2,
      type: 'llm',
      content: 'LLM response 1'
    },
    {
      id: 3,
      type: 'user',
      content: 'User message 2'
    }
  ];

  beforeEach(() => {
    mockScrollIntoView.mockClear();
  });

  it('renders all messages', () => {
    render(<MessageList messages={mockMessages} />);
    
    mockMessages.forEach(message => {
      const messageElement = screen.getByTestId(`chat-message-${message.id}`);
      expect(messageElement).toBeInTheDocument();
      expect(messageElement).toHaveTextContent(message.content as string);
    });
  });

  it('renders correct number of messages', () => {
    render(<MessageList messages={mockMessages} />);
    
    const messageElements = screen.getAllByTestId(/chat-message-/);
    expect(messageElements).toHaveLength(mockMessages.length);
  });

  it('has correct container styling', () => {
    render(<MessageList messages={mockMessages} />);
    
    const containerElement = screen.getByTestId('message-list-container');
    expect(containerElement).toHaveClass('w-full');
    expect(containerElement).toHaveClass('h-[75vh]');
    expect(containerElement).toHaveClass('overflow-y-auto');
  });

  it('renders with no messages', () => {
    render(<MessageList messages={[]} />);
    
    const messageElements = screen.queryAllByTestId(/chat-message-/);
    expect(messageElements).toHaveLength(0);
  });
});