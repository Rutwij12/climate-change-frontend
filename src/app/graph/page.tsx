"use client";
export const dynamic = "force-dynamic";

import React, { Suspense, useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import DynamicGraph from "@/components/DynamicGraph";
import type { Node, Edge } from "reactflow";

interface ApiResponse {
  connections: {
    authorId: string;
    name: string;
  }[];
  precomputations: Record<string, unknown>;
}

function GraphPageContent() {
  // useSearchParams must be used in a client component that's wrapped in Suspense.
  const searchParams = useSearchParams();
  const authorid = searchParams.get("authorid") || "";
  const paperid = searchParams.get("paperid") || "";

  const [graphData, setGraphData] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.post<ApiResponse>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/get_initial_connections`,
          { authorid, paperid }
        );
        const data = response.data;

        // Create a central node for the original author.
        const centralNode: Node = {
          id: authorid,
          type: "circle",
          position: { x: 400, y: 300 },
          data: { label: "CENTRAL", expanded: false },
        };

        // Deduplicate connections by authorId.
        const connectionMap = new Map<string, { authorId: string; name: string }>();
        data.connections.forEach((conn) => {
          connectionMap.set(conn.authorId, conn);
        });
        const connectionNodes: Node[] = Array.from(connectionMap.values()).map((conn) => ({
          id: conn.authorId,
          type: "circle",
          position: { x: 0, y: 0 },
          data: { label: conn.name, expanded: false },
        }));

        // Create an edge from the central node to each connection node.
        const connectionEdges: Edge[] = connectionNodes.map((node) => ({
          id: `e-${centralNode.id}-${node.id}`,
          source: centralNode.id,
          target: node.id,
          animated: true,
        }));

        setGraphData({
          nodes: [centralNode, ...connectionNodes],
          edges: connectionEdges,
        });
      } catch (error: unknown) {
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
  if (!graphData) return <div>No graph data available.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Graph Data</h1>
      <DynamicGraph initialGraphData={graphData} />
    </div>
  );
}

export default function GraphPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading Graph...
        </div>
      }
    >
      <GraphPageContent />
    </Suspense>
  );
}
