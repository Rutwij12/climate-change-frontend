"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  MarkerType,
} from "reactflow";
import axios from "axios";
import "reactflow/dist/style.css";

const nodeColors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F06292",
  "#AED581",
  "#7986CB",
  "#4DB6AC",
  "#9575CD",
];

// Custom node component.
function CircleNode({ data, isConnectable }: any) {
  return (
    <div
      className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-gray-300 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-110"
      style={{ backgroundColor: data.color }}
    >
      <div className="text-xs font-semibold text-gray-700">{data.label}</div>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3" />
    </div>
  );
}

const nodeTypes = { circle: CircleNode };

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

interface DynamicGraphProps {
  initialGraphData: GraphData;
}

function Flow({ initialGraphData }: DynamicGraphProps) {
  // Normalize initial nodes (ensure type, color, and expanded flag).
  const normalizedNodes = initialGraphData.nodes.map((node) => ({
    ...node,
    type: node.type || "circle",
    data: {
      ...node.data,
      label: node.data?.label || `Node ${node.id}`,
      color: node.data?.color || nodeColors[Math.floor(Math.random() * nodeColors.length)],
      expanded: node.data?.expanded || false,
    },
    position: node.position || { x: 0, y: 0 },
  }));
  const normalizedEdges = initialGraphData.edges.map((edge) => ({
    ...edge,
    animated: edge.animated ?? true,
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(normalizedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(normalizedEdges);
  const { setCenter } = useReactFlow();

  // Precomputed connections: mapping from a node's id to its hidden (precomputed) nodes/edges.
  const [precomputedConnections, setPrecomputedConnections] = useState<
    Record<string, { nodes: Node[]; edges: Edge[] }>
  >({});

  // Set up the WebSocket connection to receive precomputed connections.
  useEffect(() => {
    let baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    if (!baseUrl) {
      console.error("NEXT_PUBLIC_BACKEND_URL is not defined");
      return;
    }
    const wsProtocol = baseUrl.startsWith("https") ? "wss" : "ws";
    baseUrl = baseUrl.replace(/^https?:\/\//, "");
    const wsUrl = `${wsProtocol}://${baseUrl}/ws/precomputations`;
    console.log("Connecting to WebSocket:", wsUrl);
    let socket: WebSocket;
    try {
      socket = new WebSocket(wsUrl);
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
      return;
    }
    socket.onmessage = (event) => {
      try {
        // Expect message format:
        // { "authorId": [ { authorId, name }, ... ] }
        const data = JSON.parse(event.data);
        const newPrecomputed: Record<string, { nodes: Node[]; edges: Edge[] }> = {};
        Object.entries(data).forEach(([parentId, connections]) => {
          // Deduplicate connections by authorId.
          const uniqueConnections = Array.from(
            new Map((connections as any[]).map((conn) => [conn.authorId, conn])).values()
          );
          const nodesForParent = uniqueConnections.map((conn) => ({
            id: conn.authorId,
            type: "circle",
            position: { x: 0, y: 0 },
            data: {
              label: conn.name,
              expanded: false,
              color: nodeColors[Math.floor(Math.random() * nodeColors.length)],
            },
          }));
          const edgesForParent = nodesForParent.map((node) => ({
            id: `e-${parentId}-${node.id}`,
            source: parentId,
            target: node.id,
            animated: true,
          }));
          newPrecomputed[parentId] = { nodes: nodesForParent, edges: edgesForParent };
        });
        // Merge new precomputed connections with any previously stored.
        setPrecomputedConnections((prev) => ({ ...prev, ...newPrecomputed }));
        console.log("Received precomputed connections:", newPrecomputed);
      } catch (e) {
        console.error("Error parsing WebSocket message:", e);
      }
    };
    socket.onopen = () => {
      console.log("WebSocket connection established.");
    };
    socket.onerror = (event) => {
      console.error("WebSocket error:", event);
    };
    socket.onclose = () => {
      console.log("WebSocket connection closed.");
    };
    return () => {
      socket.close();
    };
  }, []);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  // On node click, expand the node to reveal its connections.
  const onNodeClick = useCallback(
    async (event: React.MouseEvent, node: Node) => {
      if (node.data.expanded) return; // Skip if already expanded.

      let newNodes: Node[] = [];
      let newEdges: Edge[] = [];

      // Use precomputed connections if available.
      if (precomputedConnections[node.id]) {
        newNodes = precomputedConnections[node.id].nodes;
        newEdges = precomputedConnections[node.id].edges;
        const id = node.id;
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/get_next_connections`,
          { authorid: id }
        );
      } else {
        // Otherwise, call the get-next_connections API.
        try {
          const id = node.id;
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/get_next_connections`,
            { authorid: id }
          );
          // Expect a similar structure: { connections: [ { authorId, name }, ... ] }
          const fetched = response.data.connections;
          const uniqueConnections = Array.from(
            new Map(fetched.map((conn: any) => [conn.authorId, conn])).values()
          );
          newNodes = uniqueConnections.map((conn: any) => ({
            id: conn.authorId,
            position: { x: 0, y: 0 },
            type: "circle",
            data: {
              label: conn.name,
              expanded: false,
              color: nodeColors[Math.floor(Math.random() * nodeColors.length)],
            },
          }));
          newEdges = newNodes.map((n) => ({
            id: `e-${node.id}-${n.id}`,
            source: node.id,
            target: n.id,
            animated: true,
          }));
        } catch (error) {
          console.error("Error fetching next connections for node:", node.id, error);
          return;
        }
      }

      // Mark the node as expanded.
      setNodes((nds) =>
        nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, expanded: true } } : n))
      );

      // Calculate positions for the new nodes in a circle around the clicked node.
      const centerX = node.position.x;
      const centerY = node.position.y;
      const radius = 150;
      const angleStep = (2 * Math.PI) / (newNodes.length || 1);
      const positionedNewNodes = newNodes.map((n, index) => ({
        ...n,
        position: {
          x: centerX + radius * Math.cos(index * angleStep),
          y: centerY + radius * Math.sin(index * angleStep),
        },
      }));

      // Add the new nodes and edges to the graph.
      setNodes((nds) => [...nds, ...positionedNewNodes]);
      setEdges((eds) => [...eds, ...newEdges]);

      // Optionally, center the view on the clicked node.
      setCenter(node.position.x, node.position.y, { duration: 800 });
    },
    [precomputedConnections, setNodes, setEdges, setCenter]
  );

  const customEdgeStyles = useMemo(
    () => ({
      stroke: "#b1b1b7",
      strokeWidth: 2,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#b1b1b7",
      },
    }),
    []
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.5}
      maxZoom={2}
      defaultEdgeOptions={customEdgeStyles}
    />
  );
}

export default function DynamicGraph({ initialGraphData }: DynamicGraphProps) {
  return (
    <div className="w-full h-[600px] bg-gray-50 rounded-lg shadow-inner">
      <ReactFlowProvider>
        <Flow initialGraphData={initialGraphData} />
      </ReactFlowProvider>
    </div>
  );
}
