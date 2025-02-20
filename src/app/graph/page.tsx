"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import DynamicGraph from "@/components/DynamicGraph";

interface ApiResponse {
  connections: {
    authorId: string;
    name: string;
  }[];
  precomputations: Record<string, any>;
}

export default function GraphPage() {
  const searchParams = useSearchParams();
  const authorid = searchParams.get("authorid") || "";
  const paperid = searchParams.get("paperid") || "";

  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] } | null>(null);
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
        const centralNode = {
          id: authorid,
          type: "circle",
          position: { x: 400, y: 300 }, // Set the center position
          data: { label: "Central Author", expanded: false },
        };

        // Deduplicate connections by authorId.
        const connectionMap = new Map<string, { authorId: string; name: string }>();
        data.connections.forEach((conn) => {
          connectionMap.set(conn.authorId, conn);
        });
        const connectionNodes = Array.from(connectionMap.values()).map((conn) => ({
          id: conn.authorId,
          type: "circle",
          position: { x: 0, y: 0 }, // Temporary position; will be laid out by DynamicGraph
          data: { label: conn.name, expanded: false },
        }));

        // Create an edge from the central node to each connection node.
        const connectionEdges = connectionNodes.map((node) => ({
          id: `e-${centralNode.id}-${node.id}`,
          source: centralNode.id,
          target: node.id,
          animated: true,
        }));

        setGraphData({
          nodes: [centralNode, ...connectionNodes],
          edges: connectionEdges,
        });
      } catch (err: any) {
        console.error("Error fetching initial graph data:", err);
        setError(err.message || "Error fetching data");
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

  if (loading) return <div>Loading graph data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!graphData) return <div>No graph data available.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Graph Data</h1>
      <DynamicGraph initialGraphData={graphData} />
    </div>
  );
}
