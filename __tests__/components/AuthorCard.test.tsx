import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AuthorCard from "@/components/ResearchPapers/AuthorCard";
import "@testing-library/jest-dom";

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
  UserPlus: () => "UserPlus",
  Trash2: () => "Trash2",
}));

const mockAuthor = {
  name: "John Doe",
  citations: 120,
  hindex: 15,
  orcid: "0000-0001-2345-6789",
  organisation_history: ["University A", "Company B"],
  grants: ["Grant 1", "Grant 2"],
  website: "https://example.com"
};

describe("AuthorCard Component", () => {
  it("does not render when isRemoved is true", () => {
    const { container } = render(
      <AuthorCard author={mockAuthor} isAdded={false} isRemoved={true} addAuthor={jest.fn()} removeAuthor={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders author details correctly", () => {
    render(
      <AuthorCard author={mockAuthor} isAdded={false} isRemoved={false} addAuthor={jest.fn()} removeAuthor={jest.fn()} />
    );
    expect(screen.getByText(mockAuthor.name)).toBeInTheDocument();
    expect(screen.getByText(`Citations: ${mockAuthor.citations}`)).toBeInTheDocument();
    expect(screen.getByText(`h-index: ${mockAuthor.hindex}`)).toBeInTheDocument();
    expect(screen.getByText(`ORCID: ${mockAuthor.orcid}`)).toBeInTheDocument();
    expect(screen.getByText(/Organisation History:/)).toBeInTheDocument();
    expect(screen.getByText(/Grants:/)).toBeInTheDocument();
    expect(screen.getByText("Website")).toHaveAttribute("href", mockAuthor.website);
  });
});
