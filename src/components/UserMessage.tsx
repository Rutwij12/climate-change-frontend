"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * UserMessage Component
 * 
 * Displays a single user message in a chat interface.
 * The message is styled inside a card and aligned to the right.
 *
 * @param {Object} props - Component properties
 * @param {string} props.content - The text content of the user's message
 *
 * @returns {JSX.Element} A right-aligned chat message inside a styled card
 */
export default function UserMessage({ content }: { content: string }) {
  return (
    <div className="mb-2 flex justify-end">
      {/* Right-aligned chat bubble with max width and rounded edges */}
      <Card className="inline-block max-w-md bg-green-100 border-green-200 p-0 rounded-2xl shadow-sm">
        <CardContent className="p-1">
          <p className="text-sm font-medium break-words">{content}</p>
        </CardContent>
      </Card>
    </div>
  );
}
