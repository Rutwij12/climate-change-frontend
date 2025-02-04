import React from "react"

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Header from '@/components/Header';

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Leaf: () => <div data-testid="leaf-icon">Leaf Icon</div>
}));

describe('Header Component', () => {
  it('renders the header with correct text', () => {
    render(<Header />);
    
    const headerText = screen.getByText('Climate Change Chat');
    expect(headerText).toBeInTheDocument();
    expect(headerText).toHaveClass('text-2xl');
    expect(headerText).toHaveClass('font-bold');
  });

  it('renders the Leaf icon', () => {
    render(<Header />);
    
    const leafIcon = screen.getByTestId('leaf-icon');
    expect(leafIcon).toBeInTheDocument();
  });

  it('has correct header styling', () => {
    render(<Header />);
    
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toHaveClass('bg-green-700');
    expect(headerElement).toHaveClass('text-white');
    expect(headerElement).toHaveClass('p-4');
    expect(headerElement).toHaveClass('flex');
    expect(headerElement).toHaveClass('items-center');
    expect(headerElement).toHaveClass('justify-center');
    expect(headerElement).toHaveClass('h-16');
  });
});