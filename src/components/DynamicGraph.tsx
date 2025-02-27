"use client";

import React, { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  MarkerType,
} from "reactflow";
import dagre from "dagre";
import axios from "axios";
import "reactflow/dist/style.css";

// Fixed node color.
const fixedColor = "#28a745";

// Custom node component.
function CircleNode({ data, isConnectable }: any) {
  return (
    <div
      className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-green-500 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-110"
      style={{ backgroundColor: data.color }}
    >
      <div className="text-xs font-semibold text-white">{data.label}</div>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
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

  // Compute initial layout.
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    normalizedNodes,
    normalizedEdges,
    "TB"
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const { setCenter } = useReactFlow();

  // State for author info.
  const [authorInfo, setAuthorInfo] = useState<any>(null);

  // Single click: fetch author information.
  const onNodeClick = useCallback(
    async (event: React.MouseEvent, node: Node) => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/get_auth_info`,
           { authorid: node.id } 
        );
        setAuthorInfo(response.data);
      } catch (error) {
        console.error("Error fetching author info for node:", node.id, error);
      }
    },
    []
  );

  // Double click: expand the node.
  const onNodeDoubleClick = useCallback(
    async (event: React.MouseEvent, node: Node) => {
      // If the node is already expanded, do nothing.
      if (node.data.expanded) return;

      let newNodes: Node[] = [];
      let newEdges: Edge[] = [];

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/get_next_connections`,
          { authorid: node.id }
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

      // Mark the node as expanded.
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, expanded: true } } : n
        )
      );

      // Position new nodes in a circle around the clicked node.
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

      // Recompute layout.
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(updatedNodes, updatedEdges, "TB");
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

      // Optionally center the view on the clicked node.
      const updatedClickedNode = layoutedNodes.find((n) => n.id === node.id);
      if (updatedClickedNode) {
        setCenter(updatedClickedNode.position.x, updatedClickedNode.position.y, {
          duration: 800,
        });
      }
    },
    [nodes, edges, setNodes, setEdges, setCenter]
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
    <div>
      <div className="relative w-full h-[600px] bg-gray-50 rounded-lg shadow-inner">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.5}
          maxZoom={2}
          defaultEdgeOptions={customEdgeStyles}
        />
      </div>
      {/* Author Information Display */}
      <div className="mt-4 p-4 bg-white rounded shadow">
        <h3 className="text-lg font-bold mb-2">Author Information</h3>
        {authorInfo ? (
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(authorInfo, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500">Click on a node to view author info.</p>
        )}
      </div>
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
