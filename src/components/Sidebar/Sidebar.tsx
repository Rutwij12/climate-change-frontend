"use client";
import React from "react";
import { Menu, X, MessageSquarePlus, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatContext } from "@/lib/ChatContent";

// ChatHistoryItem Component
function ChatHistoryItem({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-emerald-700 hover:bg-emerald-600 text-white py-2 px-4 rounded-md shadow-md mb-2 overflow-hidden text-ellipsis whitespace-nowrap"
    >
      <span className="block truncate">{title}</span>
    </button>
  );
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  onChatSelect,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onChatSelect: (title: string) => void;
}) {
  const router = useRouter();
  
  const { chatHistory } = useChatContext();

  const handleNewChat = () => {
    router.push('/');
  };

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
                    onClick={handleNewChat}
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

          {/* Author Book Button */}
          <button
            onClick={() => router.push('/authorBook')}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md shadow-md text-center font-medium flex items-center justify-center gap-2"
          >
            <BookOpen size={20} />
            Author Book
          </button>

          {/* Divider */}
          <hr className="my-4 border-emerald-500" />

          {/* Chat History Section */}
          <h2 className="text-lg font-semibold mb-3">Chat History</h2>
          <div>
            {chatHistory.length > 0 ? (
              chatHistory.map((chat, index) => (
                <ChatHistoryItem key={index} title={chat.name} onClick={() => onChatSelect(chat.name)} />
              ))
            ) : (
              <p className="text-sm text-gray-300">No chat history</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}