"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function UserMessage({ content }: { content: string }) {
  return (
    <div className="mb-2 text-right">
      <Card className="inline-block max-w-md bg-green-100 border-green-200 mx-auto text-center p-1 rounded-full">
        <CardContent className="p-1">
          <p className="text-sm font-medium break-words">{content}</p>
        </CardContent>
      </Card>
    </div>
  );
}
