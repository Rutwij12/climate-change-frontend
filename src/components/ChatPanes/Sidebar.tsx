"use client";

import React from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  return (
    <div className="relative h-screen">
      {/* Sidebar Toggle Button */}
      <button
        className="absolute top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-md focus:outline-none"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Panel */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: sidebarOpen ? 200 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-full bg-gray-900 text-white overflow-hidden"
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Menu</h2>
          <ul>
            <li className="mb-2 cursor-pointer hover:text-gray-300">Option 1</li>
            <li className="mb-2 cursor-pointer hover:text-gray-300">Option 2</li>
            <li className="mb-2 cursor-pointer hover:text-gray-300">Option 3</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
