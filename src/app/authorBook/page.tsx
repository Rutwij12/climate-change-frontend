"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import BookComponent from "@/components/AuthorBook/Book"
import { AuthorCRM, Status } from "@/types";
import Sidebar from "@/components/Sidebar/Sidebar";

export default function AuthorBook() {
  const [authors, setAuthors] = useState<AuthorCRM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/crm/authors`);
        setAuthors(
          response.data.map((author: AuthorCRM) => ({
            id: author.id,
            name: author.name,
            institution: author.institution,
            note: author.note,
            state: author.state,
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
      await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/crm/authors/${id}/note`, { 
        author_id: id,
        note: notes 
      });
      setAuthors((prev) =>
        prev.map((author) => (author.id === id ? { ...author, note: notes } : author))
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.log("");
      }
      setError("Failed to update notes");
    }
  };

  const updateStatus = async (id: number, status: Status) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/crm/authors/${id}/state`, { 
        author_id: id,
        state: status
      });
  
      setAuthors((prev) =>
        prev.map((author) => (author.id === id ? { ...author, state: status } : author))
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Axios Error:", error.response?.data); // Log actual error
      }
      setError("Failed to update status");
    }
  };  

  const deleteAuthor = async (id: number) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/crm/authors/${id}`, {});
  
      // Remove the deleted author from the state
      setAuthors((prev) => prev.filter((author) => author.id !== id));
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Axios Error:", error.response?.data); // Log actual error
      }
      setError("Failed to delete auhtor");
    }
  }; 

  if (loading) return <div className="text-center text-emerald-700">Loading authors...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />

      {/* Main Content (shifts when sidebar opens) */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-[200px]" : "ml-0"
        } p-8`}
      >
        <h1 className="text-3xl font-bold text-center mb-8 text-emerald-800">
          Author Book
        </h1>
        <BookComponent authors={authors} onUpdateNotes={updateNotes} onUpdateStatus={updateStatus} onDeleteAuthor={deleteAuthor} />
      </div>
    </div>
  );
}