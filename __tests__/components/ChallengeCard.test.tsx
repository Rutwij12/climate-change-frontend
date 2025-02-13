import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react';
import ChallengeCard from '@/components/ChallengeCard';
import { Challenge } from '@/types';

// Mock the entire Lucide React library
jest.mock('lucide-react', () => ({
  Star: () => <div data-testid="icon-mock">Star Icon</div>,
  ArrowRight: () => <div data-testid="arrow-mock">Arrow Icon</div>
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode, href: string }) => {
    return <div data-testid="mocked-link" data-href={href}>{children}</div>;
  };
});

describe('ChallengeCard', () => {
  const mockChallenge: Challenge = {
    id: '1',
    name: 'Test Challenge',
    explanation: 'This is a test challenge explanation',
    citation: 'Test Source',
    url: 'Test URL',
    icon: () => <div>Mocked Icon</div> // Use a simple function component
  };

  const mockOnClick = jest.fn();

  it('renders challenge card with correct information', async () => {
    render(<ChallengeCard challenge={mockChallenge} onClick={mockOnClick}/>);

    // Check challenge name
    const nameElement = screen.getByText('Test Challenge');
    expect(nameElement).toBeInTheDocument();

    // Check citation
    const citationElement = screen.getByText('Source: Test Source');
    expect(citationElement).toBeInTheDocument();
  });
});
