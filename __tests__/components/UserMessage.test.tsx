import React from "react"

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserMessage from '@/components/UserMessage';

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  )
}));

describe('UserMessage Component', () => {
  const testContent = 'This is a test user message';

  it('renders message content correctly', () => {
    render(<UserMessage content={testContent} />);
    
    const messageText = screen.getByText(testContent);
    expect(messageText).toBeInTheDocument();
    expect(messageText).toHaveClass('text-sm');
    expect(messageText).toHaveClass('font-medium');
    expect(messageText).toHaveClass('break-words');
  });

  it('has correct container styling', () => {
    render(<UserMessage content={testContent} />);
    
    const outerContainer = screen.getByTestId('outer-container');
    expect(outerContainer).toHaveClass('mb-2');
    expect(outerContainer).toHaveClass('flex');
    expect(outerContainer).toHaveClass('justify-end');
  });

  it('renders card with correct styling', () => {
    render(<UserMessage content={testContent} />);
    
    const cardElement = screen.getByTestId('card');
    expect(cardElement).toHaveClass('inline-block');
    expect(cardElement).toHaveClass('max-w-md');
    expect(cardElement).toHaveClass('bg-green-100');
    expect(cardElement).toHaveClass('border-green-200');
    expect(cardElement).toHaveClass('p-0');
    expect(cardElement).toHaveClass('rounded-2xl');
    expect(cardElement).toHaveClass('shadow-sm');
  });

  it('renders card content with correct padding', () => {
    render(<UserMessage content={testContent} />);
    
    const cardContentElement = screen.getByTestId('card-content');
    expect(cardContentElement).toHaveClass('p-1');
  });
});