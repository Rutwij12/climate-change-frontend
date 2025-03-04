"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import DynamicGraph from "@/components/DynamicGraph";
import { InteractiveNvlWrapper } from "@neo4j-nvl/react";
import type { Node, Edge } from "reactflow";
import type {
  Node as NVLNode,
  Relationship,
  HitTargets,
} from "@neo4j-nvl/base";

interface ApiResponse {
  connections: {
    authorId: string;
    name: string;
  }[];
  precomputations: Record<string, unknown>;
}

type TabType = "default" | "coauthor" | "topic" | "research" | "natural";

// Define valid node types
type NodeType = "author" | "work" | "institution" | "topic";

const NODE_COLORS: Record<NodeType, string> = {
  author: "#FFA726",
  work: "#66BB6A",
  institution: "#42A5F5",
  topic: "#EC407A",
};

// Helper function to get node color based on label
const getNodeColor = (labels: string[]): string => {
  if (!labels || labels.length === 0) return "#999";
  const nodeType = labels[0].toLowerCase() as NodeType;
  return NODE_COLORS[nodeType] || "#999";
};

// Define a helper function to get relationship label
const getRelationshipLabel = (type: string, properties: any) => {
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

export default function GraphPage() {
  const searchParams = useSearchParams();
  const authorid = searchParams.get("authorid") || "";
  const paperid = searchParams.get("paperid") || "";

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("default");
  const [nvlData, setNvlData] = useState<{
    nodes: NVLNode[];
    rels: Relationship[];
  } | null>(null);
  const [defaultNvlData, setDefaultNvlData] = useState<{
    nodes: NVLNode[];
    rels: Relationship[];
  } | null>(null);
  const [queryInput, setQueryInput] = useState<string>("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Convert initial connections to NVL format
  const convertInitialConnectionsToNvl = (
    authorId: string,
    connections: InitialConnection[]
  ): { nodes: NVLNode[]; rels: Relationship[] } => {
    // Create central node
    const centralNode = {
      id: authorId,
      size: 60,
      label: "Loading...",
      caption: "Loading...",
      type: "author",
      color: NODE_COLORS.author,
      properties: {
        nodeType: "Author",
      },
    };

    // Create connection nodes (deduplicated by authorId)
    const uniqueConnections = Array.from(
      new Map(
        connections.map((conn): [string, InitialConnection] => [
          conn.authorId,
          conn,
        ])
      ).values()
    ).filter((conn) => conn.authorId !== authorId); // Filter out self-connections

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

    // Create relationships
    const relationships: Relationship[] = connectionNodes.map(
      (node, index) => ({
        id: `rel-${index}`,
        from: authorId,
        to: node.id,
        type: "connected",
        caption: "CONNECTED",
        label: "CONNECTED",
        properties: {
          relationType: "CONNECTED",
        },
      })
    );

    return {
      nodes: [centralNode, ...connectionNodes],
      rels: relationships,
    };
  };

  // Add function to handle node expansion
  const handleDefaultGraphNodeClick = async (node: NVLNode) => {
    try {
      setLoading(true);
      const response = await axios.post<{ connections: InitialConnection[] }>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/get_next_connections`,
        { authorid: node.id }
      );

      // Convert new connections to NVL format
      const newData = convertInitialConnectionsToNvl(
        node.id,
        response.data.connections
      );

      // Add only new nodes and relationships
      if (defaultNvlData) {
        const existingNodeIds = new Set(defaultNvlData.nodes.map((n) => n.id));
        const newNodes = newData.nodes.filter(
          (n) => !existingNodeIds.has(n.id)
        );

        const existingRelIds = new Set(defaultNvlData.rels.map((r) => r.id));
        const newRels = newData.rels.filter((r) => !existingRelIds.has(r.id));

        setDefaultNvlData({
          nodes: [...defaultNvlData.nodes, ...newNodes],
          rels: [...defaultNvlData.rels, ...newRels],
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
        const response = await axios.post<{ connections: InitialConnection[] }>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/get_initial_connections`,
          { authorid, paperid }
        );

        const nvlData = convertInitialConnectionsToNvl(
          authorid,
          response.data.connections
        );
        setDefaultNvlData(nvlData);
      } catch (error) {
        console.error("Error fetching initial graph data:", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    }

    if (authorid) {
      fetchData();
    } else {
      setError("Missing authorid in query parameters.");
      setLoading(false);
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
      const nvlNodes: NVLNode[] = response.data.graph.nodes.map(
        (node: any) => ({
          id: node.id.toString(),
          size:
            node.properties.id.toString() === authorid
              ? 60
              : node.labels.includes("Author")
              ? 40
              : 30,
          label: node.properties.name || node.properties.title || node.id,
          caption: node.properties.name || node.properties.title || node.id,
          type: node.labels[0].toLowerCase(),
          color: getNodeColor(node.labels),
          properties: {
            ...node.properties,
            nodeType: node.labels[0],
          },
        })
      );
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

      const nvlNodes: NVLNode[] = response.data.graph.nodes.map(
        (node: any) => ({
          id: node.id.toString(),
          size:
            node.id.toString() === authorid
              ? 60
              : node.labels.includes("Author")
              ? 40
              : 30,
          label: node.properties.name || node.properties.title || node.id,
          caption: node.properties.name || node.properties.title || node.id,
          type: node.labels[0].toLowerCase(),
          color: getNodeColor(node.labels),
          properties: {
            ...node.properties,
            nodeType: node.labels[0],
          },
        })
      );

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

  // Add this JSX component for the natural language sidebar
  const NaturalLanguageSidebar = () => (
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

  if (loading)
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
  if (activeTab === "default" && !defaultNvlData)
    return <div>No graph data available.</div>;
  if (activeTab !== "default" && !nvlData)
    return <div>No graph data available.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Graph Data</h1>

      {/* Tabs */}
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {[
            { id: "default", name: "Default View" },
            { id: "coauthor", name: "Co-author Network" },
            { id: "topic", name: "Topic Network" },
            { id: "research", name: "Research Topics" },
            { id: "natural", name: "Natural Language" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Graph Display - Fixed layout */}
      <div className="flex h-[800px] w-full">
        <div className="flex-1">
          {/* Show default graph with click handling */}
          {activeTab === "default" && defaultNvlData && (
            <InteractiveNvlWrapper
              nodes={defaultNvlData.nodes}
              rels={defaultNvlData.rels}
              nvlOptions={{
                initialZoom: 1,
              }}
              mouseEventCallbacks={{
                onHover: (element, hitTargets, evt) =>
                  console.log("onHover", element, hitTargets, evt),
                onRelationshipRightClick: (rel, hitTargets, evt) =>
                  console.log("onRelationshipRightClick", rel, hitTargets, evt),
                onNodeClick: (node, hitTargets, evt) =>
                  console.log("onNodeClick", node, hitTargets, evt),
                onNodeRightClick: (node, hitTargets, evt) =>
                  console.log("onNodeRightClick", node, hitTargets, evt),
                onNodeDoubleClick: (node) => handleDefaultGraphNodeClick(node),
                onRelationshipClick: (rel, hitTargets, evt) =>
                  console.log("onRelationshipClick", rel, hitTargets, evt),
                onRelationshipDoubleClick: (rel, hitTargets, evt) =>
                  console.log(
                    "onRelationshipDoubleClick",
                    rel,
                    hitTargets,
                    evt
                  ),
                onCanvasClick: (evt) => console.log("onCanvasClick", evt),
                onCanvasDoubleClick: (evt) =>
                  console.log("onCanvasDoubleClick", evt),
                onCanvasRightClick: (evt) =>
                  console.log("onCanvasRightClick", evt),
                onDrag: (nodes) => console.log("onDrag", nodes),
                onPan: (evt) => console.log("onPan", evt),
                onZoom: (zoomLevel) => console.log("onZoom", zoomLevel),
              }}
            />
          )}

          {/* Show other NVL graphs without click handling */}
          {activeTab !== "default" && nvlData && (
            <InteractiveNvlWrapper
              nodes={nvlData.nodes}
              rels={nvlData.rels}
              nvlOptions={{
                initialZoom: 1,
              }}
              mouseEventCallbacks={{
                onHover: (element, hitTargets, evt) =>
                  console.log("onHover", element, hitTargets, evt),
                onRelationshipRightClick: (rel, hitTargets, evt) =>
                  console.log("onRelationshipRightClick", rel, hitTargets, evt),
                onNodeClick: (node, hitTargets, evt) =>
                  console.log("onNodeClick", node, hitTargets, evt),
                onNodeRightClick: (node, hitTargets, evt) =>
                  console.log("onNodeRightClick", node, hitTargets, evt),
                onNodeDoubleClick: (node, hitTargets, evt) =>
                  console.log("onNodeDoubleClick", node, hitTargets, evt),
                onRelationshipClick: (rel, hitTargets, evt) =>
                  console.log("onRelationshipClick", rel, hitTargets, evt),
                onRelationshipDoubleClick: (rel, hitTargets, evt) =>
                  console.log(
                    "onRelationshipDoubleClick",
                    rel,
                    hitTargets,
                    evt
                  ),
                onCanvasClick: (evt) => console.log("onCanvasClick", evt),
                onCanvasDoubleClick: (evt) =>
                  console.log("onCanvasDoubleClick", evt),
                onCanvasRightClick: (evt) =>
                  console.log("onCanvasRightClick", evt),
                onDrag: (nodes) => console.log("onDrag", nodes),
                onPan: (evt) => console.log("onPan", evt),
                onZoom: (zoomLevel) => console.log("onZoom", zoomLevel),
              }}
            />
          )}
        </div>

        {/* Natural Language Sidebar */}
        {activeTab === "natural" && <NaturalLanguageSidebar />}
      </div>
    </div>
  );
}
