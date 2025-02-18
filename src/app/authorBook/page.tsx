import AuthorBook from "@/components/author-book"; // ✅ Correct import
import Header from "@/components/ClimateChat/Header";
import React from "react"

const authors = [
  { id: 1, name: "Emily Johnson", isUseful: null },
  { id: 2, name: "David Chen", isUseful: null },
  { id: 3, name: "Sarah Williams", isUseful: null },
  { id: 4, name: "Michael Brown", isUseful: null },
  { id: 5, name: "Rachel Garcia", isUseful: null },
];

export default function Page() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <AuthorBook initialAuthors={authors} /> {/* Pass required prop */}
    </div>
  );
}
