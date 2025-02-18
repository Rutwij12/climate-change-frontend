"use client";
import React, { useRef } from 'react';
import { SendHorizontal } from 'lucide-react';
import { MessageInputProps } from '@/types';

/**
 * MessageInput component for accepting user input and submitting a prompt.
 * This component allows users to enter text and submit it using the Enter key.
 * It also dynamically adjusts the textarea's height based on the content.
 *
 * @param {Object} props - The props for the MessageInput component.
 * @param {string} props.input - The current value of the input field.
 * @param {Function} props.setInput - The function to update the value of the input field.
 * @param {Function} props.handleSubmit - The function to handle the form submission when the Enter key is pressed.
 *
 * @returns {JSX.Element} A form containing a dynamically resizing textarea and a submit button.
 */
export default function MessageInput({ input, setInput, handleSubmit }: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handles submitting the form when Enter key is pressed
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevents new line
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>); // Submit the form
      resetTextarea(); // Reset the textarea size after submission
    }
  };

  // Adjust the height of the textarea dynamically
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto'; // Reset height before adjusting
    e.target.style.height = `${e.target.scrollHeight}px`; // Set height to content height
  };

  // Reset the height of the textarea after submission
  const resetTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset to default
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 bg-green-50"
      data-testid="message-input-form">
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="flex items-center px-4 py-2 border-2 border-green-800 rounded-3xl bg-transparent backdrop-blur-sm">
          <textarea
            ref={textareaRef} // Attach the ref to the textarea
            placeholder="Ask about climate change..."
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="flex-1 min-h-[40px] max-h-60 text-lg p-2 bg-transparent outline-none resize-none"
          />
        </div>
        <button 
          type="submit" 
          onClick={resetTextarea}
          className="absolute bottom-2 right-2 bg-green-700 text-white p-3 rounded-full hover:bg-green-800 transition"
        >
          <SendHorizontal className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
