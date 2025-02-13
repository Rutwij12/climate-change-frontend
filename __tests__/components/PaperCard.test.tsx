import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PaperCard from "@/components/PaperCard";
import { Paper } from "@/types";
import "@testing-library/jest-dom";

const mockPaper: Paper = {
  paper_id: "Mock Id",
  openalex_id: "Mock OpenAlex Id",
  relevancy: 9,
  doi: "Mock DOI",
  title: "Sample Research Paper",
  publication_date: "2025-01-01",
  abstract: "This is a sample abstract for testing purposes.",
  authors: [
    {
      name: "John Doe",
      openAlexid: "Mock ID",
      score: 10,
      citations: 120,
      dob: "13/02/2025",
      hindex: 15,
      orcid: "0000-0001-2345-6789",
      organisation_history: ["University A", "Company B"],
      grants: ["Grant 1", "Grant 2"],
      grant_org_name: "Imperial College London",
      works_count: 69,
      website: "https://example.com"
    }
  ]
};

jest.mock("lucide-react", () => ({
  ChevronDown: () => "ChevronDown",
  ChevronUp: () => "ChevronUp",
  X: () => "X",
  Check: () => "Check",
}));

describe("PaperCard Component", () => {
  
  it("renders 'Paper information not available' when no paper is provided", () => {
    render(<PaperCard paper={undefined} />);
    expect(screen.getByText(/Paper information not available/i)).toBeInTheDocument();
  });

  it("renders paper details correctly", () => {
    render(<PaperCard paper={mockPaper} />);
    expect(screen.getByText(mockPaper.title)).toBeInTheDocument();
    expect(screen.getByText(`Published on: ${mockPaper.publication_date}`)).toBeInTheDocument();
  });

  it("toggles abstract visibility when clicked", () => {
    render(<PaperCard paper={mockPaper} />);
    
    const titleElement = screen.getByText(mockPaper.title);
    expect(screen.queryByText(mockPaper.abstract)).not.toBeInTheDocument();
    
    fireEvent.click(titleElement);
    expect(screen.getByText(mockPaper.abstract)).toBeInTheDocument();
  });

  it("toggles authors visibility when button is clicked", () => {
    render(<PaperCard paper={mockPaper} />);
  
    // Click the paper title to expand the card
    fireEvent.click(screen.getByText(mockPaper.title));
  
    // Now find the "See Authors" button
    const toggleButton = screen.getByRole("button", { name: /see authors/i });
    expect(toggleButton).toBeInTheDocument();
  
    // Click the button and check if the author appears
    fireEvent.click(toggleButton);
    expect(screen.getByText(mockPaper.authors[0].name)).toBeInTheDocument();
  });

  it("renders author details correctly", () => {
    render(<PaperCard paper={mockPaper} />);

    // Click the paper title to expand the card
    fireEvent.click(screen.getByText(mockPaper.title));

    fireEvent.click(screen.getByRole("button", { name: /see authors/i }));
    
    expect(screen.getByText(mockPaper.authors[0].name)).toBeInTheDocument();
    expect(screen.getByText(`Citations: ${mockPaper.authors[0].citations}`)).toBeInTheDocument();
    expect(screen.getByText(`h-index: ${mockPaper.authors[0].hindex}`)).toBeInTheDocument();
  });
});
