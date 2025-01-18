"use client";
import React from 'react';
import { SendHorizontal } from 'lucide-react';
import { MessageInputProps } from '@/types';

export default function MessageInput({ input, setInput, handleSubmit }: MessageInputProps) {
  return (
    <form onSubmit={handleSubmit} className="p-2 bg-green-50">
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="flex items-center px-4 py-2 border-2 border-green-800 rounded-3xl bg-transparent backdrop-blur-sm">
          <textarea
            placeholder="Ask about climate change..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            className="flex-1 min-h-[40px] max-h-60 text-lg p-2 bg-transparent outline-none resize-none"
          />
        </div>
        <button className="absolute bottom-2 right-2 bg-black text-white p-3 rounded-full hover:bg-gray-800 transition">
          <SendHorizontal className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
