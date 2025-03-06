import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

interface NaturalLanguageSidebarProps {
  queryInput: string;
  setQueryInput: (value: string) => void;
  loading: boolean;
  handleNaturalLanguageQuery: () => void;
  executeSavedQuery: (query: string) => void;
  handleSaveQuery: () => void;
  savedQueries: Array<{ id: number; name: string; cipher_query: string }>;
  setSavedQueries: (
    queries: Array<{ id: number; name: string; cipher_query: string }>
  ) => void;
  currentGeneratedQuery: string | null;
  isNamingQuery: boolean;
  newQueryName: string;
  setIsNamingQuery: (value: boolean) => void;
  setNewQueryName: (value: string) => void;
}

export const NaturalLanguageSidebar: React.FC<NaturalLanguageSidebarProps> = ({
  queryInput,
  setQueryInput,
  loading,
  handleNaturalLanguageQuery,
  executeSavedQuery,
  handleSaveQuery,
  savedQueries,
  setSavedQueries,
  currentGeneratedQuery,
  isNamingQuery,
  newQueryName,
  setIsNamingQuery,
  setNewQueryName,
}) => {
  // Add new state for rename functionality
  const [isRenamingQuery, setIsRenamingQuery] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [menuOpenFor, setMenuOpenFor] = useState<number | null>(null);

  // Add refs for click-outside detection
  const menuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Add useEffect for click-outside handling
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Close menu when clicking outside
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenFor(null);
      }

      // Submit rename when clicking outside
      if (
        isRenamingQuery !== null &&
        renameInputRef.current &&
        !renameInputRef.current.contains(event.target as Node)
      ) {
        if (renameValue.trim()) {
          handleRenameQuery(isRenamingQuery);
        } else {
          setIsRenamingQuery(null);
          setRenameValue("");
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isRenamingQuery, renameValue, menuOpenFor]);

  // Add function to handle query deletion
  const handleDeleteQuery = async (queryId: number) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/queries/${queryId}`
      );

      // Update the saved queries list
      setSavedQueries(savedQueries.filter((query) => query.id !== queryId));
      setMenuOpenFor(null);
    } catch (error) {
      console.error("Error deleting query:", error);
    }
  };

  // Add function to handle query renaming
  const handleRenameQuery = async (queryId: number) => {
    try {
      if (!renameValue.trim()) return;

      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/queries/${queryId}/rename`,
        { name: renameValue }
      );

      // Update the saved queries list
      setSavedQueries(
        savedQueries.map((query) =>
          query.id === queryId ? { ...query, name: renameValue } : query
        )
      );

      setIsRenamingQuery(null);
      setRenameValue("");
      setMenuOpenFor(null);
    } catch (error) {
      console.error("Error renaming query:", error);
    }
  };

  return (
    <div className="w-64 bg-white p-4 border-l border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Natural Language Query</h3>

      <textarea
        className="w-full p-2 border border-gray-300 rounded-md mb-4"
        rows={4}
        value={queryInput}
        onChange={(e) => setQueryInput(e.target.value)}
        placeholder="Enter your query here... (e.g., 'Show me this author's coauthors who work on machine learning')"
      />

      <button
        onClick={handleNaturalLanguageQuery}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors mb-2"
        disabled={loading || !queryInput.trim()}
      >
        {loading ? "Loading..." : "Submit Query"}
      </button>

      {currentGeneratedQuery && !isNamingQuery && (
        <button
          onClick={() => setIsNamingQuery(true)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors mb-4"
        >
          Save Query
        </button>
      )}

      {isNamingQuery && (
        <div className="mb-4">
          <input
            type="text"
            value={newQueryName}
            onChange={(e) => setNewQueryName(e.target.value)}
            placeholder="Enter query name"
            className="w-full p-2 border border-gray-300 rounded-md mb-2"
          />
          <button
            onClick={handleSaveQuery}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            disabled={!newQueryName.trim()}
          >
            Save
          </button>
        </div>
      )}

      {/* Saved Queries Section moved below */}
      <div className="mt-6">
        <h4 className="text-md font-semibold mb-2">Saved Queries</h4>
        <div className="space-y-2">
          {savedQueries.map((query) => (
            <div
              key={query.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              {isRenamingQuery === query.id ? (
                <input
                  ref={renameInputRef}
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameQuery(query.id);
                    if (e.key === "Escape") {
                      setIsRenamingQuery(null);
                      setRenameValue("");
                    }
                  }}
                  className="flex-1 p-1 border border-gray-300 rounded"
                  autoFocus
                />
              ) : (
                <span className="truncate flex-1">{query.name}</span>
              )}

              <div className="flex items-center">
                <button
                  onClick={() => executeSavedQuery(query.cipher_query)}
                  className="p-1 text-green-600 hover:text-green-800"
                  title="Execute query"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>

                <div className="relative">
                  <button
                    onClick={() =>
                      setMenuOpenFor(menuOpenFor === query.id ? null : query.id)
                    }
                    className="p-1 text-gray-500 hover:text-gray-700"
                    title="More options"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>

                  {menuOpenFor === query.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                    >
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsRenamingQuery(query.id);
                            setRenameValue(query.name);
                            setMenuOpenFor(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleDeleteQuery(query.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
