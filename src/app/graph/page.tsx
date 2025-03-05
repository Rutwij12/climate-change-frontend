"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { Node as NVLNode, Relationship } from "@neo4j-nvl/base";
import {
  User,
  Briefcase,
  Link2,
  Hash,
  BookOpen,
  FileText,
  Award,
  MapPin,
  Calendar,
} from "lucide-react";
import { Suspense } from "react";
type TabType = "coauthor" | "topic" | "research" | "natural" | "dynamic";
type NodeType = "author" | "work" | "institution" | "topic";

const NODE_COLORS: Record<NodeType | "mainAuthor", string> = {
  mainAuthor: "#FF0000", // Red color for main author
  author: "#FFA726",
  work: "#66BB6A",
  institution: "#42A5F5",
  topic: "#FF69B4",
};

// Helper function to get node color based on label
const getNodeColor = (
  labels: string[],
  isMainAuthor: boolean = false
): string => {
  if (!labels || labels.length === 0) return "#999";
  if (isMainAuthor) return NODE_COLORS.mainAuthor;
  const nodeType = labels[0].toLowerCase() as NodeType;
  return NODE_COLORS[nodeType] || "#999";
};

// Add custom interfaces for NVL types that aren't properly typed
interface NVLNodeProperties {
  id: string;
  name?: string;
  title?: string;
  nodeType: string;
  organisation?: string;
  website?: string;
  works_count?: number;
  citations?: number;
  hindex?: number;
  orcid?: string;
  country?: string;
  [key: string]: any; // Allow additional properties since NVL nodes can have varying data
}

interface NVLRelationshipProperties {
  relationType: string;
  authorPosition?: string;
  score?: number;
  paperCount?: number;
  [key: string]: any;
}

// Update the getRelationshipLabel function
const getRelationshipLabel = (
  type: string,
  properties: NVLRelationshipProperties
): string => {
  switch (type.toLowerCase()) {
    case "authored":
      return `AUTHORED (${properties.authorPosition || ""})`;
    case "mentions":
      return `MENTIONS (${properties.score || ""})`;
    case "researches":
      return `RESEARCHES (${properties.paperCount || ""} papers)`;
    case "affiliated_with":
      return "AFFILIATED_WITH";
    default:
      return type;
  }
};

// Add new interfaces for type safety
interface InitialConnection {
  authorId: string;
  name: string;
}

// Dynamic import with no SSR
const InteractiveNvlWrapper = dynamic(
  () => import("@neo4j-nvl/react").then((mod) => mod.InteractiveNvlWrapper),
  { ssr: false }
);

// Add new types for node info
type NodeInfo = {
  type: "work" | "author" | "topic" | "institution";
  data: any;
};

// Define the author info interface structure
interface AuthorInfo {
  name: string;
  organisation_history?: string[];
  website?: string;
  works_count?: number;
  citations?: number;
  hindex?: number;
  orcid?: string;
  profile?: {
    addresses?: {
      address?: Array<{
        country?: {
          value?: string;
        };
      }>;
    };
  };
  // Add any other properties that might come from your API
  [key: string]: any;
}

// Define the AuthorInfoPanel props interface
interface AuthorInfoPanelProps {
  authorInfo: AuthorInfo | null;
  loading: boolean;
  onClose: () => void;
}

// Move NaturalLanguageSidebar outside of the main GraphPage component
const NaturalLanguageSidebar = ({
  queryInput,
  setQueryInput,
  loading,
  handleNaturalLanguageQuery,
}: {
  queryInput: string;
  setQueryInput: (value: string) => void;
  loading: boolean;
  handleNaturalLanguageQuery: () => void;
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  return (
    <div className="w-64 bg-white p-4 border-l border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Natural Language Query</h3>
      <textarea
        ref={textareaRef}
        className="w-full p-2 border border-gray-300 rounded-md mb-4"
        rows={4}
        value={queryInput}
        onChange={(e) => setQueryInput(e.target.value)}
        placeholder="Enter your query here... (e.g., 'Show me this author's coauthors who work on machine learning')"
      />
      <button
        onClick={handleNaturalLanguageQuery}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
        disabled={loading || !queryInput.trim()}
      >
        {loading ? "Loading..." : "Submit Query"}
      </button>
    </div>
  );
};

// Create a wrapper component that uses useSearchParams
function GraphPageContent() {
  const searchParams = useSearchParams();
  const authorid = searchParams.get("authorid") || "";
  const paperid = searchParams.get("paperid") || "";

  const [loading, setLoading] = useState<boolean>(true);
  const [initialConnectionsLoading, setInitialConnectionsLoading] =
    useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("coauthor");
  const [nvlData, setNvlData] = useState<{
    nodes: NVLNode[];
    rels: Relationship[];
  } | null>(null);
  const [dynamicNvlData, setDynamicNvlData] = useState<{
    nodes: NVLNode[];
    rels: Relationship[];
  } | null>(null);
  const [queryInput, setQueryInput] = useState<string>("");

  // Add a ref to track initial render
  const isInitialRender = React.useRef(true);

  // Add new state for author info
  const [selectedAuthorInfo, setSelectedAuthorInfo] =
    useState<AuthorInfo | null>(null);
  const [authorInfoLoading, setAuthorInfoLoading] = useState(false);

  // Add useRef for the panel
  const authorInfoPanelRef = React.useRef<HTMLDivElement>(null);

  // Add new state for node info (separate from dynamic graph's author info)
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<NodeInfo | null>(
    null
  );
  const [nodeInfoLoading, setNodeInfoLoading] = useState(false);
  console.log("selectedNodeInfo", selectedNodeInfo);

  // Add useRef for the panel
  const nodeInfoPanelRef = React.useRef<HTMLDivElement>(null);

  // Add useEffect to handle clicks outside the panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        authorInfoPanelRef.current &&
        !authorInfoPanelRef.current.contains(event.target as Node)
      ) {
        setSelectedAuthorInfo(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add useEffect to handle clicks outside the panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        nodeInfoPanelRef.current &&
        !nodeInfoPanelRef.current.contains(event.target as Node)
      ) {
        setSelectedNodeInfo(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Convert initial connections to NVL format
  const convertInitialConnectionsToNvl = (
    authorId: string,
    connections: InitialConnection[]
  ): { nodes: NVLNode[]; rels: Relationship[] } => {
    // Create central node with loading state
    const centralNode = {
      id: authorId,
      size: 60,
      label: "Loading...",
      caption: "Loading...",
      type: "author",
      color: NODE_COLORS.mainAuthor, // Use mainAuthor color
      properties: {
        nodeType: "Author",
      },
    };

    // Rest of the conversion logic remains the same
    const uniqueConnections = Array.from(
      new Map(
        connections.map((conn): [string, InitialConnection] => [
          conn.authorId,
          conn,
        ])
      ).values()
    ).filter((conn) => conn.authorId !== authorId);

    const connectionNodes: NVLNode[] = uniqueConnections.map((conn) => ({
      id: conn.authorId,
      size: 40,
      label: conn.name,
      caption: conn.name,
      type: "author",
      color: NODE_COLORS.author,
      properties: {
        nodeType: "Author",
      },
    }));

    const relationships: Relationship[] = connectionNodes.map((node) => ({
      id: `rel-${authorId}-${node.id}`,
      from: authorId,
      to: node.id,
      type: "connected",
      caption: "CONNECTED",
      label: "CONNECTED",
      properties: {
        relationType: "CONNECTED",
      },
    }));

    return {
      nodes: [centralNode, ...connectionNodes],
      rels: relationships,
    };
  };

  // Add useEffect to update central node info
  useEffect(() => {
    if (dynamicNvlData && dynamicNvlData.nodes.length > 0) {
      const centralNode: any = dynamicNvlData.nodes[0];
      if (centralNode.label === "Loading...") {
        (async () => {
          try {
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/get_auth_info`,
              { authorid: centralNode.id }
            );
            const authorInfo = response.data;

            setDynamicNvlData((prev: any) => ({
              nodes: [
                {
                  ...prev.nodes[0],
                  label: authorInfo.name,
                  caption: authorInfo.name,
                  properties: {
                    ...prev.nodes[0].properties,
                    name: authorInfo.name,
                    organisation: authorInfo.organisation_history?.[0],
                    website: authorInfo.website,
                    works_count: authorInfo.works_count,
                    citations: authorInfo.citations,
                    hindex: authorInfo.hindex,
                    orcid: authorInfo.orcid,
                    country:
                      authorInfo.profile?.addresses?.address?.[0]?.country
                        ?.value,
                    ...authorInfo,
                  },
                },
                ...prev.nodes.slice(1),
              ],
              rels: prev.rels,
            }));
          } catch (error) {
            console.error("Error fetching central author info:", error);
          }
        })();
      }
    }
  }, [dynamicNvlData]);

  // Update the handleDynamicGraphNodeDoubleClick function
  const handleDynamicGraphNodeDoubleClick = async (node: NVLNode) => {
    try {
      setLoading(true);
      const response = await axios.post<{ connections: InitialConnection[] }>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/get_next_connections`,
        { authorid: node.id }
      );
      console.log(
        "response for next connections",
        JSON.stringify(response.data.connections, null, 2)
      );
      // Convert new connections to NVL format
      const newData = convertInitialConnectionsToNvl(
        node.id,
        response.data.connections
      );

      // Add only new nodes and relationships
      if (dynamicNvlData) {
        const existingNodeIds = new Set(dynamicNvlData.nodes.map((n) => n.id));
        const newNodes = newData.nodes.filter(
          (n) => !existingNodeIds.has(n.id)
        );

        // Check relationships in both directions
        const existingRelSet = new Set(
          dynamicNvlData.rels
            .map((r) => `${r.from}-${r.to}`)
            .concat(dynamicNvlData.rels.map((r) => `${r.to}-${r.from}`))
        );

        const newRels = newData.rels.filter(
          (r) =>
            !existingRelSet.has(`${r.from}-${r.to}`) &&
            !existingRelSet.has(`${r.to}-${r.from}`)
        );

        setDynamicNvlData({
          nodes: [
            ...dynamicNvlData.nodes.map((n) => ({
              ...n,
              size: n.id === node.id ? 60 : 40, // Keep main author and clicked node big
              color:
                n.id === authorid ? NODE_COLORS.mainAuthor : NODE_COLORS.author, // Ensure main author keeps its color
            })),
            ...newNodes.map((n) => ({
              ...n,
              size: n.id === authorid ? 60 : 40,
              color:
                n.id === authorid ? NODE_COLORS.mainAuthor : NODE_COLORS.author,
            })),
          ],
          rels: [...dynamicNvlData.rels, ...newRels],
        });
      }
    } catch (error) {
      console.error("Error fetching next connections:", error);
    } finally {
      setLoading(false);
    }
  };

  // Modify the useEffect for initial data fetch
  useEffect(() => {
    async function fetchData() {
      try {
        // First fetch the regular NVL data
        await fetchNvlData("coauthor_network");

        setInitialConnectionsLoading(true);
        const response = await axios.post<{ connections: InitialConnection[] }>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/get_initial_connections`,
          { authorid, paperid }
        );

        const nvlData = await convertInitialConnectionsToNvl(
          authorid,
          response.data.connections
        );
        setDynamicNvlData(nvlData);
      } catch (error) {
        console.error("Error fetching initial graph data:", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
        setInitialConnectionsLoading(false);
      }
    }

    if (authorid) {
      fetchData();
    } else {
      setError("Missing authorid in query parameters.");
      setLoading(false);
      setInitialConnectionsLoading(false);
    }
  }, [authorid, paperid]);

  const fetchNvlData = async (endpoint: string) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/${endpoint}`,
        {
          author_id: authorid,
          limit: 50,
        }
      );

      // Transform Neo4j graph data to NVL format
      const nvlNodes: NVLNode[] = response.data.graph.nodes.map((node: any) => {
        const isMainAuthor = node.properties.id.toString() === authorid;
        return {
          id: node.id.toString(),
          size: isMainAuthor ? 60 : node.labels.includes("Author") ? 40 : 30,
          label: node.properties.name || node.properties.title || node.id,
          caption: node.properties.name || node.properties.title || node.id,
          type: node.labels[0].toLowerCase(),
          color: getNodeColor(node.labels, isMainAuthor),
          properties: {
            ...node.properties,
            nodeType: node.labels[0],
          },
        };
      });
      console.log("nvlNodes", nvlNodes);

      const nvlRels: Relationship[] = response.data.graph.relationships.map(
        (rel: any) => ({
          id: rel.id.toString(),
          from: rel.start_node.toString(),
          to: rel.end_node.toString(),
          type: rel.type.toLowerCase(),
          caption: getRelationshipLabel(rel.type, rel.properties),
          label: getRelationshipLabel(rel.type, rel.properties),
          properties: {
            ...rel.properties,
            relationType: rel.type,
          },
        })
      );
      console.log("nvlRels", nvlRels);

      setNvlData({ nodes: nvlNodes, rels: nvlRels });
      setError(null);
    } catch (error) {
      console.error(`Error fetching ${endpoint} data:`, error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNaturalLanguageQuery = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/natural_language_query`,
        {
          author_id: authorid,
          query: queryInput,
          limit: 50,
        }
      );

      const nvlNodes: NVLNode[] = response.data.graph.nodes.map((node: any) => {
        const isMainAuthor = node.properties.id.toString() === authorid;
        return {
          id: node.id.toString(),
          size: isMainAuthor ? 60 : node.labels.includes("Author") ? 40 : 30,
          label: node.properties.name || node.properties.title || node.id,
          caption: node.properties.name || node.properties.title || node.id,
          type: node.labels[0].toLowerCase(),
          color: getNodeColor(node.labels, isMainAuthor),
          properties: {
            ...node.properties,
            nodeType: node.labels[0],
          },
        };
      });

      const nvlRels: Relationship[] = response.data.graph.relationships.map(
        (rel: any) => ({
          id: rel.id.toString(),
          from: rel.start_node.toString(),
          to: rel.end_node.toString(),
          type: rel.type.toLowerCase(),
          caption: getRelationshipLabel(rel.type, rel.properties),
          label: getRelationshipLabel(rel.type, rel.properties),
          properties: {
            ...rel.properties,
            relationType: rel.type,
          },
        })
      );

      setNvlData({ nodes: nvlNodes, rels: nvlRels });
      setError(null);
    } catch (error) {
      console.error("Error executing natural language query:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authorid) return;

    // Skip the first render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    switch (activeTab) {
      case "coauthor":
        fetchNvlData("coauthor_network");
        break;
      case "topic":
        fetchNvlData("topic_network");
        break;
      case "research":
        fetchNvlData("author_topics");
        break;
      case "natural":
        // Don't fetch automatically for natural language tab
        break;
    }
  }, [activeTab, authorid]);

  // Add function to handle node click and fetch author info
  const handleDynamicGraphNodeClick = async (node: NVLNodeProperties) => {
    if (node.properties.nodeType !== "Author") return;

    setAuthorInfoLoading(true);
    try {
      const response = await axios.post<AuthorInfo>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/get_auth_info`,
        { authorid: node.id }
      );
      setSelectedAuthorInfo(response.data);
    } catch (error) {
      console.error("Error fetching author info:", error);
    } finally {
      setAuthorInfoLoading(false);
    }
  };

  // Update the AuthorInfoPanel component to include a close button
  const AuthorInfoPanel: React.FC<AuthorInfoPanelProps> = ({
    authorInfo,
    loading,
    onClose,
  }) => {
    if (loading) {
      return (
        <div className="h-48 flex items-center justify-center">
          <svg
            className="animate-spin h-6 w-6 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      );
    }

    if (!authorInfo) return null;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100 relative">
        {/* Add close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-green-500" />
          Author Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                {authorInfo.name}
              </h3>
              {authorInfo.organisation_history?.[0] && (
                <div className="flex items-center gap-2 text-slate-600 mt-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{authorInfo.organisation_history[0]}</span>
                </div>
              )}
            </div>

            {authorInfo.website && (
              <div className="flex items-center gap-2 text-green-600 hover:text-green-800">
                <Link2 className="h-4 w-4" />
                <a
                  href={authorInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Personal Website
                </a>
              </div>
            )}

            {authorInfo.orcid && (
              <div className="flex items-center gap-2 text-slate-600">
                <Hash className="h-4 w-4" />
                <span>ORCID: {authorInfo.orcid}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm">Works</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {authorInfo.works_count}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Citations</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {authorInfo.citations}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Award className="h-4 w-4" />
                <span className="text-sm">h-index</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {authorInfo.hindex}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add function to handle node click for regular graphs
  const handleRegularGraphNodeClick = async (node: any) => {
    if (!node.properties?.nodeType) return;

    setNodeInfoLoading(true);
    try {
      const nodeType = node.properties.nodeType.toLowerCase();
      const response = await axios.get(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/api/graph/nodes/${nodeType}/${node.properties.id.split("/").pop()}`
      );
      setSelectedNodeInfo({
        type: nodeType as NodeInfo["type"],
        data: response.data,
      });
    } catch (error) {
      console.error("Error fetching node info:", error);
    } finally {
      setNodeInfoLoading(false);
    }
  };

  // Add NodeInfoPanel component
  const NodeInfoPanel = ({
    nodeInfo,
    loading,
    onClose,
  }: {
    nodeInfo: NodeInfo | null;
    loading: boolean;
    onClose: () => void;
  }) => {
    if (loading) {
      return (
        <div className="h-48 flex items-center justify-center">
          <svg
            className="animate-spin h-6 w-6 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      );
    }

    if (!nodeInfo) return null;

    const BasePanel = ({ children }: { children: React.ReactNode }) => (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100 relative">
        {/* Add close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {children}
      </div>
    );

    switch (nodeInfo.type) {
      case "author":
        return (
          <BasePanel>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-green-500" />
              Author Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {nodeInfo.data.name}
                  </h3>
                </div>
                {nodeInfo.data.orcid && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Hash className="h-4 w-4" />
                    <span>ORCID: {nodeInfo.data.orcid}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-sm">Works</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {nodeInfo.data.works_count}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Citations</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {nodeInfo.data.cited_by_count}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <Award className="h-4 w-4" />
                    <span className="text-sm">h-index</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {nodeInfo.data.h_index}
                  </p>
                </div>
              </div>
            </div>
          </BasePanel>
        );

      case "topic":
        return (
          <BasePanel>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Hash className="h-5 w-5 text-pink-500" />
              Topic Information
            </h2>
            <div className="text-lg font-semibold text-slate-800">
              {nodeInfo.data.name}
            </div>
          </BasePanel>
        );

      case "institution":
        return (
          <BasePanel>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              Institution Information
            </h2>
            <div className="space-y-2">
              <div className="text-lg font-semibold text-slate-800">
                {nodeInfo.data.name}
              </div>
              {nodeInfo.data.country_code && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span>Country: {nodeInfo.data.country_code}</span>
                </div>
              )}
              {nodeInfo.data.type && (
                <div className="text-slate-600">Type: {nodeInfo.data.type}</div>
              )}
            </div>
          </BasePanel>
        );

      case "work":
        return (
          <BasePanel>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              Publication Information
            </h2>
            <div className="space-y-4">
              <div className="text-lg font-semibold text-slate-800">
                {nodeInfo.data.title}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Year</span>
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {nodeInfo.data.publicationYear}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Citations</span>
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {nodeInfo.data.cited_by_count}
                  </p>
                </div>
              </div>
            </div>
          </BasePanel>
        );

      default:
        return null;
    }
  };

  if (loading || (activeTab === "dynamic" && initialConnectionsLoading))
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg
          className="animate-spin h-12 w-12 text-green-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );

  if (error) return <div>Error: {error}</div>;
  if (activeTab === "dynamic" && !dynamicNvlData)
    return <div>No graph data available.</div>;
  if (activeTab !== "dynamic" && !nvlData)
    return <div>No graph data available.</div>;

  return (
    <div className="flex flex-col h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Graph Data</h1>

      {/* Tabs */}
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {[
            { id: "coauthor", name: "Co-author Network" },
            { id: "topic", name: "Topic Network" },
            { id: "research", name: "Research Topics" },
            {
              id: "dynamic",
              name: "Dynamic Graph",
              icon: (
                <svg
                  className="w-4 h-4 mr-2 inline-block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              ),
            },
            {
              id: "natural",
              name: "AI Assistant",
              icon: (
                <svg
                  className="w-4 h-4 mr-2 inline-block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              ),
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm flex items-center
                ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.icon && tab.icon}
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Graph Display - Updated layout */}
      <div className="flex flex-1 min-h-0">
        {/* Main graph area with info panel */}
        <div className="flex flex-col flex-1">
          <div className="flex-1 min-h-0">
            {/* Dynamic graph */}
            {activeTab === "dynamic" && dynamicNvlData && (
              <InteractiveNvlWrapper
                nodes={dynamicNvlData.nodes}
                rels={dynamicNvlData.rels}
                nvlOptions={{
                  initialZoom: 1,
                }}
                mouseEventCallbacks={{
                  onHover: (element) => console.log("onHover", element),
                  onRelationshipRightClick: (rel) =>
                    console.log("onRelationshipRightClick", rel),
                  onNodeClick: (node) =>
                    handleDynamicGraphNodeClick(node as NVLNodeProperties),
                  onNodeRightClick: (node) =>
                    handleDynamicGraphNodeDoubleClick(node),
                  onNodeDoubleClick: (node) =>
                    handleDynamicGraphNodeDoubleClick(node),
                  onRelationshipClick: (rel) =>
                    console.log("onRelationshipClick", rel),
                  onRelationshipDoubleClick: (rel) =>
                    console.log("onRelationshipDoubleClick", rel),
                  onCanvasClick: (evt) => console.log("onCanvasClick", evt),
                  onDrag: (nodes) => console.log("onDrag", nodes),
                  onPan: (evt) => console.log("onPan", evt),
                  onZoom: (zoomLevel) => console.log("onZoom", zoomLevel),
                }}
              />
            )}

            {/* Other NVL graphs */}
            {activeTab !== "dynamic" && nvlData && (
              <InteractiveNvlWrapper
                nodes={nvlData.nodes}
                rels={nvlData.rels}
                nvlOptions={{
                  initialZoom: 1,
                }}
                mouseEventCallbacks={{
                  onHover: (element) => console.log("onHover", element),
                  onRelationshipRightClick: (rel) =>
                    console.log("onRelationshipRightClick", rel),
                  onNodeClick: (node) => handleRegularGraphNodeClick(node),
                  onNodeRightClick: (node) =>
                    console.log("onNodeRightClick", node),
                  onNodeDoubleClick: (node) =>
                    console.log("onNodeDoubleClick", node),
                  onRelationshipClick: (rel) =>
                    console.log("onRelationshipClick", rel),
                  onRelationshipDoubleClick: (rel) =>
                    console.log("onRelationshipDoubleClick", rel),
                  onDrag: (nodes) => console.log("onDrag", nodes),
                  onPan: (evt) => console.log("onPan", evt),
                  onZoom: (zoomLevel) => console.log("onZoom", zoomLevel),
                }}
              />
            )}
          </div>

          {/* Info Panels */}
          {activeTab === "dynamic"
            ? // Dynamic graph author info panel
              (selectedAuthorInfo || authorInfoLoading) && (
                <div className="mt-4">
                  <AuthorInfoPanel
                    authorInfo={selectedAuthorInfo}
                    loading={authorInfoLoading}
                    onClose={() => setSelectedAuthorInfo(null)}
                  />
                </div>
              )
            : // Regular graph node info panel
              (selectedNodeInfo || nodeInfoLoading) && (
                <div className="mt-4" ref={nodeInfoPanelRef}>
                  <NodeInfoPanel
                    nodeInfo={selectedNodeInfo}
                    loading={nodeInfoLoading}
                    onClose={() => setSelectedNodeInfo(null)}
                  />
                </div>
              )}
        </div>

        {/* Natural Language Sidebar */}
        {activeTab === "natural" && (
          <NaturalLanguageSidebar
            queryInput={queryInput}
            setQueryInput={setQueryInput}
            loading={loading}
            handleNaturalLanguageQuery={handleNaturalLanguageQuery}
          />
        )}
      </div>
    </div>
  );
}

// Update the default export to include Suspense
export default function GraphPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <svg
            className="animate-spin h-12 w-12 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      }
    >
      <GraphPageContent />
    </Suspense>
  );
}
