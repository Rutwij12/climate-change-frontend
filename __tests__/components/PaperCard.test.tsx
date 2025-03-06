import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PaperCard from "@/components/ResearchPapers/PaperCard";
import { Paper } from "@/types";
import "@testing-library/jest-dom";
import { ResearchProvider } from "@/lib/ResearchContext";

// Mock framer-motion to avoid animation issues
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => (
      <div data-testid="motion-div" {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ChevronDown: () => "ChevronDown",
  ChevronUp: () => "ChevronUp",
  RefreshCcw: () => "RefreshCcw",
}));

// Mock AuthorCard component
jest.mock("@/components/ResearchPapers/AuthorCard", () => {
  return ({ author, addAuthor, removeAuthor }: any) => (
    <div data-testid={`author-card-${author.name}`}>
      <p>{author.name}</p>
      <button onClick={() => addAuthor(author.name)}>Add Author</button>
      <button onClick={() => removeAuthor(author.name)}>Remove Author</button>
    </div>
  );
});

const mockPaper: Paper = {
  openalex_id: "Mock OpenAlex Id",
  title: "Sample Research Paper",
  publication_date: "2025-01-01",
  abstract: "This is a sample abstract for testing purposes.",
  paper_id: "Mock ID", 
  relevancy: 10, 
  doi: "Mock DOI",
  authors: [
    {
      name: "Test Author",
      citations: 100,
      hindex: 10,
      orcid: "0000-0000-0000-000X",
      organisation_history: "University A, University B",
      grants: [],
      openAlexid: "A12345",
      website: "https://test-author.com",
      dob: "mock dob",
      grant_org_name: "mock",
      works_count: 0,
    },
  ],
};

// Helper function to wrap components with ResearchProvider
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<ResearchProvider>{ui}</ResearchProvider>);
};

describe("PaperCard Component", () => {
  it("renders 'Paper information not available' when no paper is provided", () => {
    renderWithProvider(<PaperCard paper={undefined} />);
    expect(screen.getByText(/Paper information not available/i)).toBeInTheDocument();
  });

  it("renders paper details correctly", () => {
    renderWithProvider(<PaperCard paper={mockPaper} />);
    expect(screen.getByText(mockPaper.title)).toBeInTheDocument();
    expect(screen.getByText(`Published on: ${mockPaper.publication_date}`)).toBeInTheDocument();
  });

  it("toggles abstract visibility when clicked", () => {
    renderWithProvider(<PaperCard paper={mockPaper} />);
    const titleElement = screen.getByText(mockPaper.title);
    fireEvent.click(titleElement);
    expect(screen.getByText(mockPaper.abstract)).toBeInTheDocument();
    fireEvent.click(titleElement);
    expect(screen.queryByText(mockPaper.abstract)).not.toBeInTheDocument();
  });

  it("toggles authors visibility when button is clicked", () => {
    renderWithProvider(<PaperCard paper={mockPaper} />);
    fireEvent.click(screen.getByText(mockPaper.title));
    const toggleButton = screen.getByRole("button", { name: /see authors/i });
    fireEvent.click(toggleButton);
    expect(screen.getByText(mockPaper.authors[0].name)).toBeInTheDocument();
  });

  it("handles author management correctly", () => {
    renderWithProvider(<PaperCard paper={mockPaper} />);
    fireEvent.click(screen.getByText(mockPaper.title));
  });
});