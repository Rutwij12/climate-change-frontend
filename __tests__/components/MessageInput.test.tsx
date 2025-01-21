import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageInput from '@/components/MessageInput';

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  SendHorizontal: () => <div data-testid="send-icon">Send Icon</div>
}));

describe('MessageInput Component', () => {
  const mockSetInput = jest.fn();
  const mockHandleSubmit = jest.fn();

  const defaultProps = {
    input: '',
    setInput: mockSetInput,
    handleSubmit: mockHandleSubmit
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders textarea with correct placeholder', () => {
    render(<MessageInput {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText('Ask about climate change...');
    expect(textarea).toBeInTheDocument();
  });

  it('updates input value when typing', () => {
    render(<MessageInput {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText('Ask about climate change...');
    fireEvent.change(textarea, { target: { value: 'Test input' } });
    
    expect(mockSetInput).toHaveBeenCalledWith('Test input');
  });

  it('submits form when Enter key is pressed', () => {
    render(<MessageInput {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText('Ask about climate change...');
    fireEvent.keyDown(textarea, { key: 'Enter', preventDefault: () => {} });
    
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('does not submit form when Shift+Enter is pressed', () => {
    render(<MessageInput {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText('Ask about climate change...');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true, preventDefault: () => {} });
    
    expect(mockHandleSubmit).not.toHaveBeenCalled();
  });

  it('renders submit button with send icon', () => {
    render(<MessageInput {...defaultProps} />);
    
    const submitButton = screen.getByRole('button');
    const sendIcon = screen.getByTestId('send-icon');
    
    expect(submitButton).toBeInTheDocument();
    expect(sendIcon).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    render(<MessageInput {...defaultProps} />);
    
    const form = screen.getByTestId('message-input-form');
    const textarea = screen.getByPlaceholderText('Ask about climate change...');
    const submitButton = screen.getByRole('button');
    
    expect(form).toHaveClass('p-2');
    expect(form).toHaveClass('bg-green-50');
    expect(textarea).toHaveClass('bg-transparent');
    expect(submitButton).toHaveClass('bg-green-700');
    expect(submitButton).toHaveClass('hover:bg-green-800');
  });
});