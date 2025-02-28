import React from "react";

export interface Challenge {
  id: string;
  name: string;
  explanation: string;
  citation: string;
  url: string;
  icon: React.ElementType;
}

export interface LLMResponse {
  summary: string;
  challenges: Challenge[];
}

export interface ChatMessage_T {
  id: number;
  type: "user" | "llm";
  content: string | LLMResponse;
}

export interface MessageInputProps {
  input: string; // `input` should be a string (the value of the textarea)
  setInput: (value: string) => void; // `setInput` is a function to update the input value
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void; // `handleSubmit` handles form submission
}

export interface Author {
  name: string;
  citations: number;
  dob: string;
  organisation_history: string[];
  orcid: string;
  hindex: number;
  grants: string[];
  grant_org_name: string;
  website: string;
  openAlexid: string;
  works_count: number;
  score: number | null; // Computed later
}

export interface AuthorCRM {
  id: number;
  created_at: string;
  name: string;
  institution: string;
  note: string;
  state: string;
  openalex_id: string;
}

export type Status = "uncontacted" | "interested" | "uninterested" | "blocked";

export interface Grant {
  organisation: string,
  title: string,
  category: string,
  value: number,
  funder: string
}

export interface Paper {
  paper_id: string;
  openalex_id: string;
  title: string;
  relevancy: number;
  authors: Author[];
  doi: string;
  abstract: string;
  publication_date: string;
}

export interface ChatHistory {
  id: number;
  created_at: string;
  type: string;
  message_count: number;
  name: string;
}