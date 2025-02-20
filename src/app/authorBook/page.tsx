"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import BookComponent, { Author, Status } from "@/components/AuthorBook/Book"

// Define an interface for API response
interface AuthorResponse {
  id: number;
  name: string;
  institution: string;
  note?: string;
  state: Status;
}

export default function AuthorBook() {
  // Sample initial data
  const [authors, setAuthors] = useState<Author[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/crm/authors`);
        setAuthors(
          response.data.map((author: AuthorResponse) => ({
            id: author.id,
            name: author.name,
            institution: author.institution,
            notes: author.note, // Backend uses "note", frontend uses "notes"
            status: author.state, // Backend uses "state", frontend uses "status"
          }))
        );
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.detail || "Failed to load authors");
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  const updateNotes = async (id: number, notes: string) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/crm/authors/${id}/note`, { note: notes });
      setAuthors(authors.map((author) => (author.id === id ? { ...author, notes } : author)));
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.log("");
      }
      setError("Failed to update notes");
    }
  };

  const updateStatus = async (id: number, status: Status) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/crm/authors/${id}/state`, { state: status });
      setAuthors(authors.map((author) => (author.id === id ? { ...author, status } : author)));
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.log("");
      }
      setError("Failed to update status");
    }
  };

  if (loading) return <div className="text-center text-emerald-700">Loading authors...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

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