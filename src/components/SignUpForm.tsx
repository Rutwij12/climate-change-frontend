"use client";
import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

const topics = [
  "Renewable Energy",
  "Carbon Capture",
  "Sustainable Agriculture",
  "Electric Vehicles",
  "Ocean Conservation",
  "Green Building",
  "Waste Management",
  "Climate Policy",
  "Forest Conservation",
  "Clean Technology",
];

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    institution: "",
    selectedTopics: [] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleTopic = (topic: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTopics: prev.selectedTopics.includes(topic)
        ? prev.selectedTopics.filter((t) => t !== topic)
        : [...prev.selectedTopics, topic],
    }));
  };

  return (
    <form className="mt-6 space-y-6 max-w-2xl mx-auto w-full">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" type="text" placeholder="Enter your full name" className="border rounded-md w-full p-3" onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input id="signup-email" name="email" type="email" placeholder="Enter your email" className="border rounded-md w-full p-3" onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input id="signup-password" name="password" type="password" placeholder="Create a password" className="border rounded-md w-full p-3" onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="institution">Associated Institution</Label>
          <Input id="institution" name="institution" type="text" placeholder="Enter your institution" className="border rounded-md w-full p-3" onChange={handleChange} />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Select your topics of interest</Label>
        <div className="grid grid-cols-3 gap-3">
          {topics.map((topic) => (
            <div
              key={topic}
              onClick={() => toggleTopic(topic)}
              className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors duration-200
                ${formData.selectedTopics.includes(topic) ? "bg-[#1B7A3E] text-white border-[#1B7A3E]" : "hover:border-[#1B7A3E] hover:text-[#1B7A3E]"}
              `}
            >
              <span>{topic}</span>
              {formData.selectedTopics.includes(topic) && <Check className="h-4 w-4" />}
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full bg-[#1B7A3E] hover:bg-[#156032] p-3 text-lg">Create Account</Button>
    </form>
  );
}
