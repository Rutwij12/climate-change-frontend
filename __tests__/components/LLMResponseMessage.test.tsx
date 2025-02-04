import React from "react"

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LLMResponseMessage from '@/components/LLMResponseMessage';
import { Challenge } from '@/types';

// Mock ChallengeCard component
jest.mock('@/components/ChallengeCard', () => {
  const MockChallengeCard = ({ challenge }: { challenge: Challenge }) => (
    <div data-testid={`challenge-card-${challenge.id}`}>{challenge.name}</div>
  );

  MockChallengeCard.displayName = "MockChallengeCard"; // Assign display name

  return MockChallengeCard;
});


// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>
}));

describe('LLMResponseMessage Component', () => {
  const mockChallenges: Challenge[] = [
    {
      id: '1',
      name: 'Challenge 1',
      explanation: 'Explanation 1',
      citation: 'Citation 1',
      icon: () => <div>Icon 1</div>
    },
    {
      id: '2',
      name: 'Challenge 2',
      explanation: 'Explanation 2',
      citation: 'Citation 2',
      icon: () => <div>Icon 2</div>
    }
  ];

  const mockSummary = 'Test summary text';

  it('renders summary text correctly', () => {
    render(<LLMResponseMessage summary={mockSummary} challenges={mockChallenges} />);
    
    const summaryElement = screen.getByText(mockSummary);
    expect(summaryElement).toBeInTheDocument();
    expect(summaryElement).toHaveClass('text-lg');
    expect(summaryElement).toHaveClass('font-semibold');
    expect(summaryElement).toHaveClass('text-green-800');
  });

  it('renders correct number of challenge cards', () => {
    render(<LLMResponseMessage summary={mockSummary} challenges={mockChallenges} />);
    
    const challengeCards = screen.getAllByTestId(/challenge-card-/);
    expect(challengeCards).toHaveLength(2);
  });

  it('renders challenge card names', () => {
    render(<LLMResponseMessage summary={mockSummary} challenges={mockChallenges} />);
    
    expect(screen.getByText('Challenge 1')).toBeInTheDocument();
    expect(screen.getByText('Challenge 2')).toBeInTheDocument();
  });

  it('has correct card styling', () => {
    render(<LLMResponseMessage summary={mockSummary} challenges={mockChallenges} />);
    
    const cardElement = screen.getByTestId('card');
    expect(cardElement).toBeInTheDocument();
  });
});