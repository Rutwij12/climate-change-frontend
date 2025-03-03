import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthorCard from '@/components/ResearchPapers/AuthorCard';
import { Author } from '@/types';

// Mock dependencies
jest.mock('lucide-react', () => ({
  UserPlus: () => <div data-testid="user-plus-icon">UserPlus Icon</div>,
  Trash2: () => <div data-testid="trash-icon">Trash Icon</div>
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

const mockAddAuthor = jest.fn();
const mockRemoveAuthor = jest.fn();

const mockAuthor: Author = {
  name: 'Test Author',
  citations: 100,
  hindex: 10,
  orcid: '0000-0000-0000-000X',
  organisation_history: ['University A', 'University B'],
  grants: [],
  openAlexid: 'A12345',
  website: 'https://test-author.com',
  dob: "mock dob",
  grant_org_name: "mock",
  works_count: 0
};

describe('AuthorCard', () => {
  it('renders author details correctly', () => {
    render(
      <AuthorCard 
        author={mockAuthor} 
        isAdded={false} 
        isRemoved={false} 
        addAuthor={mockAddAuthor} 
        removeAuthor={mockRemoveAuthor} 
        paperId="P123"
      />
    );

    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('Citations: 100')).toBeInTheDocument();
    expect(screen.getByText('h-index: 10')).toBeInTheDocument();
    expect(screen.getByText('ORCID: 0000-0000-0000-000X')).toBeInTheDocument();
    expect(screen.getByText('Organisation History: University A, University B')).toBeInTheDocument();
  });

  // it('calls addAuthor function when Add button is clicked', async () => {
  //   render(
  //     <AuthorCard 
  //       author={mockAuthor} 
  //       isAdded={false} 
  //       isRemoved={false} 
  //       addAuthor={mockAddAuthor} 
  //       removeAuthor={mockRemoveAuthor} 
  //       paperId="P123"
  //     />
  //   );

  //   const addButton = screen.getByRole('button', { name: /add/i });
  //   fireEvent.click(addButton);

  //   expect(mockAddAuthor).toHaveBeenCalledWith('Test Author');
  // });

  it('calls removeAuthor function when Remove button is clicked', async () => {
    render(
      <AuthorCard 
        author={mockAuthor} 
        isAdded={false} 
        isRemoved={false} 
        addAuthor={mockAddAuthor} 
        removeAuthor={mockRemoveAuthor} 
        paperId="P123"
      />
    );

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    expect(mockRemoveAuthor).toHaveBeenCalledWith('Test Author');
  });

  it('does not render if author is removed', () => {
    render(
      <AuthorCard 
        author={mockAuthor} 
        isAdded={false} 
        isRemoved={true} 
        addAuthor={mockAddAuthor} 
        removeAuthor={mockRemoveAuthor} 
        paperId="P123"
      />
    );

    expect(screen.queryByText('Test Author')).not.toBeInTheDocument();
  });
});
