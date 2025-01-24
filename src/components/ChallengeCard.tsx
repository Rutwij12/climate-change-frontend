"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Challenge } from "@/types";

/**
 * ChallengeCard Component
 *
 * Displays a clickable card representing a challenge.
 * Each card includes:
 * - An icon (if available)
 * - The challenge name
 * - A brief explanation
 * - Citation source
 * - A right arrow icon indicating navigation
 *
 * @param {Challenge} challenge - The challenge object containing details
 */
export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
  return (
    // <Link
    //   href={`/challenge/${challenge.id}`}
    //   key={challenge.id}
    //   data-testid="challenge-link"
    //   role="link"
    // >
      <Card
        className="bg-green-50 hover:bg-white transition-colors cursor-pointer border-green-200"
        data-testid="challenge-card"
      >
        <CardHeader className="flex flex-row items-center gap-2">
          {/* Renders an icon only if it exists to prevent errors */}
          {challenge.icon && (
            <challenge.icon
              className="h-5 w-5 text-green-600"
              data-testid="challenge-icon"
            />
          )}
          <CardTitle className="text-lg text-green-800">
            {challenge.name}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Footer section with citation and navigation arrow */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Source: {challenge.citation}
            </p>
            <ArrowRight className="h-4 w-4 text-green-600" />
          </div>
        </CardContent>
      </Card>
    // </Link>
  );
}
