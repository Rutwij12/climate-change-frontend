"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ChallengeCard from "./ChallengeCard";
import { Challenge } from "@/types";

export default function LLMResponseMessage({
  summary,
  challenges,
}: {
  summary: string;
  challenges: Challenge[];
}) {
  return (
    <div className="mb-4 text-left">
      <Card className="inline-block max-w-2xl border-green-200 mx-auto text-center">
        <CardContent className="p-6">
          <p className="text-lg font-semibold mb-4 text-green-800 break-words">
            {summary}
          </p>
          <div className="grid gap-4">
            {challenges.map((challenge) => (
              <ChallengeCard challenge={challenge} key={challenge.id} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
