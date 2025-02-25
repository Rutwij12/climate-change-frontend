"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import dagre from "dagre";
import axios from "axios";
import "reactflow/dist/style.css";

// Fixed node color (green).
const fixedColor = "#28a745";

// Custom node component.
function CircleNode({ data, isConnectable }: any) {
  return (
    <div
      className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-green-500 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-110"
      style={{ backgroundColor: data.color }}
    >
      <div className="text-xs font-semibold text-white">{data.label}</div>
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

// -------------------------
// DAGRE LAYOUT CONFIGURATION
// -------------------------
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  const nodeWidth = 100;
  const nodeHeight = 100;

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// -------------------------
// MAIN FLOW COMPONENT
// -------------------------
function Flow({ initialGraphData }: DynamicGraphProps) {
  // Author info state.
  const [authorInfo, setAuthorInfo] = useState<any>(null);

  // Normalize initial nodes.
  const normalizedNodes = initialGraphData.nodes.map((node) => ({
    ...node,
    type: node.type || "circle",
    data: {
      ...node.data,
      label: node.data?.label || `Node ${node.id}`,
      color: node.data?.color || fixedColor,
      expanded: node.data?.expanded || false,
    },
    position: node.position || { x: 0, y: 0 },
  }));

  const normalizedEdges = initialGraphData.edges.map((edge) => ({
    ...edge,
    animated: edge.animated ?? true,
  }));

  // Use Dagre to compute positions.
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    normalizedNodes,
    normalizedEdges,
    "TB"
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const { setCenter } = useReactFlow();

  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Ref to control click/double-click timing.
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Example precomputed connections state (if used elsewhere)
  const [precomputedConnections, setPrecomputedConnections] = useState<
    Record<string, { nodes: Node[]; edges: Edge[] }>
  >({});

  // onNodeClick handler: sends the clicked node's id to the backend to fetch author info.
  const onNodeClick = useCallback(
    async (event: React.MouseEvent, node: Node) => {
      // Set a timeout to distinguish single click from double click.
      clickTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/get_auth_info`,
            { authorid: node.id }
          );
          setAuthorInfo(response.data);
        } catch (error) {
          console.error("Error fetching author info:", error);
        }
        clickTimeoutRef.current = null;
      }, 200);
    },
    []
  );

  // onNodeDoubleClick handler for node expansion.
  const onNodeDoubleClick = useCallback(
    async (event: React.MouseEvent, node: Node) => {
      // Prevent the single-click action.
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      if (node.data.expanded) return;
      let newNodes: Node[] = [];
      let newEdges: Edge[] = [];

      if (precomputedConnections[node.id]) {
        newNodes = precomputedConnections[node.id].nodes;
        newEdges = precomputedConnections[node.id].edges;
        const precomputedids: string[] = newNodes.map((n) => n.id);
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/get_next_connections`,
          { authorid: node.id, precomputed: precomputedids.slice(0, -1) }
        );
      } else {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/get_next_connections`,
            { authorid: node.id, precomputed: [] }
          );
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
              color: fixedColor,
            },
          }));
          newEdges = newNodes.map((n) => ({
            id: `e-${node.id}-${n.id}`,
            source: node.id,
            target: n.id,
            animated: true,
          }));
        } catch (error) {
          console.error("Error fetching connections for node:", node.id, error);
          return;
        }
      }

      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, expanded: true } } : n
        )
      );

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

      const updatedNodes = [...nodes, ...positionedNewNodes];
      const updatedEdges = [...edges, ...newEdges];

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        updatedNodes,
        updatedEdges,
        "TB"
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

      const updatedClickedNode = layoutedNodes.find((n) => n.id === node.id);
      if (updatedClickedNode) {
        setCenter(updatedClickedNode.position.x, updatedClickedNode.position.y, { duration: 800 });
      }
    },
    [precomputedConnections, nodes, edges, setNodes, setEdges, setCenter]
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
    <div className="relative w-full h-[600px] bg-gray-50 rounded-lg shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}       // Single click for author info
        onNodeDoubleClick={onNodeDoubleClick} // Double click for expansion
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={2}
        defaultEdgeOptions={customEdgeStyles}
      />
      {authorInfo && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-300">
          <textarea
            readOnly
            className="w-full h-24 p-2 text-sm"
            value={JSON.stringify(authorInfo, null, 2)}
          />
        </div>
      )}
    </div>
  );
}

export default function DynamicGraph({ initialGraphData }: DynamicGraphProps) {
  return (
    <ReactFlowProvider>
      <Flow initialGraphData={initialGraphData} />
    </ReactFlowProvider>
  );
}
