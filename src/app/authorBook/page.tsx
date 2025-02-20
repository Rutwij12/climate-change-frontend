"use client";
import React, { useState } from "react";
import BookComponent, { Author, Status } from "@/components/AuthorBook/Book"

export default function AuthorBook() {
  // Sample initial data
  const [authors, setAuthors] = useState<Author[]>([
    {
      id: 1,
      name: "Dr. Jane Smith",
      institution: "University of Science",
      notes: "Excellent research in AI",
      status: "Uncontacted",
    },
    {
      id: 2,
      name: "Prof. John Doe",
      institution: "Tech Institute",
      notes: "Specializes in Machine Learning",
      status: "Interested",
    },
  ]);

  const updateNotes = (id: number, notes: string) => {
    setAuthors(authors.map((author) => (author.id === id ? { ...author, notes } : author)));
  };

  const updateStatus = (id: number, status: Status) => {
    setAuthors(authors.map((author) => (author.id === id ? { ...author, status } : author)));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-emerald-800">Author Book</h1>
      <BookComponent 
        authors={authors} 
        onUpdateNotes={updateNotes} 
        onUpdateStatus={updateStatus} 
      />
    </div>
  );
}