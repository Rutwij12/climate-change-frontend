"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Challenge, ChatMessage_T, LLMResponse } from '@/types';

export default function ChatMessage({ message }: { message: ChatMessage_T }) {
  if (message.type === 'user') {
    return (
      <div className="mb-4 text-right">
        <Card className="inline-block max-w-md bg-green-100 border-green-200 mx-auto text-center p-2">
          <CardContent className="p-2">
            <p className="text-lg font-medium break-words">{message.content as string}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary, challenges } = message.content as LLMResponse;

  return (
    <div className="mb-4 text-left">
      <Card className="inline-block max-w-2xl border-green-200 mx-auto text-center">
        <CardContent className="p-6">
          <p className="text-lg font-semibold mb-4 text-green-800 break-words">{summary}</p>
          <div className="grid gap-4">
            {challenges.map((challenge: Challenge) => (
              <Link href={`/challenge/${challenge.id}`} key={challenge.id}>
                <Card className="bg-white hover:bg-green-50 transition-colors cursor-pointer border-green-200">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <challenge.icon className="h-5 w-5 text-green-600" />
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
