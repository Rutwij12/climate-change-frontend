import React, { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LLMResponseMessage from '@/components/ClimateChat/LLMResponseMessage'
import { Challenge } from '@/types';

// Mock ChallengeCard component
jest.mock('@/components/ClimateChat/ChallengeCard', () => {
  return ({ challenge, onClick }: { challenge: Challenge; onClick: () => void }) => (
    <div data-testid={`challenge-card-${challenge.id}`} onClick={onClick}>
      {challenge.name}
    </div>
  );
});

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>
}));

// Mock react-markdown
jest.mock('react-markdown', () => ({ children }: { children: React.ReactNode }) => (
  <div className="text-green-800">{children}</div>
));

describe('LLMResponseMessage Component', () => {
  const mockChallenges: Challenge[] = [
    {
      id: '1',
      name: 'Challenge 1',
      explanation: 'Explanation 1',
      citation: 'Citation 1',
      url: 'URL 1',
      icon: () => <div>Icon 1</div>
    },
    {
      id: '2',
      name: 'Challenge 2',
      explanation: 'Explanation 2',
      citation: 'Citation 2',
      url: 'URL 2',
      icon: () => <div>Icon 2</div>
    }
  ];

  const mockSummary = 'Test summary text';
  const mockOnChallengeSelect = jest.fn();

  it('renders summary text correctly', () => {
    render(<LLMResponseMessage summary={mockSummary} challenges={mockChallenges} onChallengeSelect={mockOnChallengeSelect} />);
    
    const summaryElement = screen.getByText(mockSummary);
    expect(summaryElement).toBeInTheDocument();
    expect(summaryElement).toHaveClass('text-green-800');
  });

  it('renders correct number of challenge cards', () => {
    render(<LLMResponseMessage summary={mockSummary} challenges={mockChallenges} onChallengeSelect={mockOnChallengeSelect} />);
    
    const challengeCards = screen.getAllByTestId(/challenge-card-/);
    expect(challengeCards).toHaveLength(2);
  });

  it('renders challenge card names', () => {
    render(<LLMResponseMessage summary={mockSummary} challenges={mockChallenges} onChallengeSelect={mockOnChallengeSelect} />);
    
    expect(screen.getByText('Challenge 1')).toBeInTheDocument();
    expect(screen.getByText('Challenge 2')).toBeInTheDocument();
  });

  it('has correct card styling', () => {
    render(<LLMResponseMessage summary={mockSummary} challenges={mockChallenges} onChallengeSelect={mockOnChallengeSelect} />);
    
    const cardElement = screen.getByTestId('card');
    expect(cardElement).toBeInTheDocument();
  });

  it('calls onChallengeSelect when a challenge is clicked', () => {
    render(<LLMResponseMessage summary={mockSummary} challenges={mockChallenges} onChallengeSelect={mockOnChallengeSelect} />);

    const firstChallengeCard = screen.getByTestId(/challenge-card-1/);
    firstChallengeCard.click();

    expect(mockOnChallengeSelect).toHaveBeenCalledWith(mockChallenges[0]);
  });
});
