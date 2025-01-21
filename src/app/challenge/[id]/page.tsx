"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Leaf, CloudRain, Fish, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface Challenge {
  id: string;
  name: string;
  explanation: string;
  citation: string;
  icon: React.ElementType;
}

const challenges: Challenge[] = [
  {
    id: "rising-sea-levels",
    name: "Rising Sea Levels",
    explanation:
      "Coastal communities are at risk due to melting ice caps and thermal expansion of oceans. This phenomenon threatens to displace millions of people living in low-lying areas and small island nations. The rising seas also increase the risk of storm surges and coastal erosion, potentially causing significant economic and environmental damage.",
    citation: "IPCC, 2021: Climate Change 2021: The Physical Science Basis.",
    icon: CloudRain,
  },
  {
    id: "extreme-weather-events",
    name: "Extreme Weather Events",
    explanation:
      "Increased frequency and intensity of hurricanes, droughts, and heatwaves threaten ecosystems and human settlements. These events can lead to loss of life, damage to infrastructure, and disruption of food and water supplies. The economic impact of these disasters can be severe, particularly for vulnerable communities and developing nations.",
    citation: "World Meteorological Organization, State of the Global Climate 2020.",
    icon: CloudRain,
  },
  {
    id: "biodiversity-loss",
    name: "Biodiversity Loss",
    explanation:
      "Rapid changes in temperature and precipitation patterns lead to habitat destruction and species extinction. This loss of biodiversity can disrupt ecosystems, affecting food chains and reducing nature's resilience to environmental changes. It also has implications for human well-being, including the loss of potential sources for new medicines and reduced crop diversity.",
    citation: "IPBES, 2019: Global Assessment Report on Biodiversity and Ecosystem Services.",
    icon: Fish,
  },
];

/**
 * ChallengePage Component
 * Displays details of a selected climate change challenge
 *
 * @returns {JSX.Element} The ChallengePage component
 */
export default function ChallengePage() {
  const params = useParams(); // Access dynamic route params
  const router = useRouter();
  const challenge = challenges.find((c) => c.id === params.id);

  if (!challenge) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl text-red-500 font-bold mb-4">Challenge not found</h1>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Chat
            </Button>
        </div>
      </div>
    );
  }

  const Icon = challenge.icon; // Extract icon component for reusability

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">

      <header className="bg-green-700 text-white p-4 flex items-center">
        <Leaf className="mr-2" />
        <h1 className="text-2xl font-bold">Climate Change Challenge</h1>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-green-200">

          <CardHeader className="flex flex-row items-center gap-2 border-b border-green-100">
            <Icon className="h-6 w-6 text-green-600" />
            <CardTitle className="text-2xl text-green-800">{challenge.name}</CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <p className="mb-6 text-gray-700 leading-relaxed">{challenge.explanation}</p>
            <p className="text-sm text-gray-500 mb-6">Source: {challenge.citation}</p>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Chat
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
