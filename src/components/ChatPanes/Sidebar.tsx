"use client";
import React from "react";
import { Menu, X, MessageSquarePlus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  return (
    <div className="relative h-screen">
      {/* Menu Button with Tooltip (only shown when sidebar is closed) */}
      {!sidebarOpen && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="absolute top-4 left-4 z-50 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-md focus:outline-none transition-colors duration-150 shadow-md"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open Sidebar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed left-0 top-0 h-full bg-emerald-800 text-white overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "w-[200px]" : "w-0"
        }`}
      >
        <div className="p-4">
          {/* Top Bar with Close and New Chat Buttons */}
          <div className="flex justify-between items-center mb-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-md focus:outline-none transition-colors duration-150 shadow-md"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X size={24} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Close Sidebar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-md focus:outline-none transition-colors duration-150 shadow-md"
                    onClick={() => console.log("New chat clicked")}
                  >
                    <MessageSquarePlus size={24} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>New Chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <h2 className="text-lg font-semibold mb-6 text-emerald-100">Menu</h2>
          <ul className="space-y-4">
            <li className="cursor-pointer hover:text-emerald-300 transition-colors duration-150">
              Option 1
            </li>
            <li className="cursor-pointer hover:text-emerald-300 transition-colors duration-150">
              Option 2
            </li>
            <li className="cursor-pointer hover:text-emerald-300 transition-colors duration-150">
              Option 3
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}