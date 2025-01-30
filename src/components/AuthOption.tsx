"use client";
import React from "react";
import { ChevronRight } from "lucide-react";

interface AuthOptionProps {
  title: string;
  isActive: boolean;
  onClick: () => void;
}

export default function AuthOption({ title, isActive, onClick }: AuthOptionProps) {
  return (
    <div
      className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-lg"
      onClick={onClick}
    >
      <h3 className="font-medium">{title}</h3>
      <ChevronRight className={`transform transition-transform ${isActive ? "rotate-90" : ""}`} />
    </div>
  );
}
