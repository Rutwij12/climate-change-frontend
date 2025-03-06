"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/lib/ChatContent";
import Sidebar from "@/components/Sidebar/Sidebar";

export default function Home() {
  const [input, setInput] = useState("");
  const { createNewMessages } = useChatContext();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Example questions to cycle through
  const exampleQuestions = [
    "What are some challenges in the aviation industry?",
    "Climate Change Challenges in 2030",
    "Impact of AI on the environment",
    "Factors contributing to glacier loss",
  ];
  
  const [exampleText, setExampleText] = useState("");
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user_email");
    if (!user) {
      router.push("/login");
    } else {
      if (!hasCheckedAuth) {
        setHasCheckedAuth(true);
        router.refresh();
      }
    }

    if (input) return; // Stop auto-typing when user starts typing
    const currentText = exampleQuestions[currentExampleIndex];
    const typeSpeed = isDeleting ? 50 : 100; // Faster delete, slower typing
    const delay = isDeleting && charIndex === 0 ? 1500 : typeSpeed; // Pause before deleting
    
    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < currentText.length) {
        setExampleText((prev) => prev + currentText[charIndex]);
        setCharIndex((prev) => prev + 1);
      } else if (isDeleting && charIndex > 0) {
        setExampleText((prev) => prev.slice(0, -1));
        setCharIndex((prev) => prev - 1);
      } else if (!isDeleting && charIndex === currentText.length) {
        setIsDeleting(true);
      } else {
        setIsDeleting(false);
        setCurrentExampleIndex((prev) => (prev + 1) % exampleQuestions.length);
        setCharIndex(0);
      }
    }, delay);
    
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, currentExampleIndex, input, router, hasCheckedAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isAuthenticated = localStorage.getItem('user_email');
    console.log(isAuthenticated);
    console.log(!isAuthenticated);
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (input.trim()) {
      router.push("/chat");
      await createNewMessages(input.trim());
      setInput(""); // Clear the input
    }
  };

  return (
    <div className="relative flex">
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-[250px]" : "ml-0"}`}>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-green-100">
          <h1 className="text-4xl font-bold mb-8 text-green-800">
            What can I help you with?
          </h1>
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="flex space-x-2">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={exampleText || "Type your question here..."}
                className="flex-grow border-green-300 focus:border-green-500 focus:ring-green-500"
              />
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Ask
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}