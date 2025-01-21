"use client";
import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Challenge } from "@/types";

export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
  return (
    <Link 
      href={`/challenge/${challenge.id}`} key={challenge.id}
      data-testid="challenge-link"
    >
      <Card 
        className="bg-white hover:bg-green-50 transition-colors cursor-pointer border-green-200"
        data-testid="challenge-card"
      >
        <CardHeader className="flex flex-row items-center gap-2">
          <challenge.icon 
            className="h-5 w-5 text-green-600" 
            data-testid="challenge-icon" 
          />
          <CardTitle className="text-lg text-green-800">{challenge.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2 text-gray-600">{challenge.explanation}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Source: {challenge.citation}</p>
            <ArrowRight className="h-4 w-4 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
