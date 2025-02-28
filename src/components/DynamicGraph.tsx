"use client";

import React, { useCallback, useState, useEffect, useMemo, useRef } from "react";
import ReactFlow, {
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  MarkerType,
  Background,
  Controls,
  Panel,
} from "reactflow";
import dagre from "dagre";
import axios from "axios";
import PropTypes from "prop-types";
import { User, BookOpen, Award, MapPin, Link2, Hash, Briefcase, FileText } from "lucide-react";
import "reactflow/dist/style.css";

// Updated Node types and colors with green shades
const NODE_TYPES = {
  primary: "#2ecc71", // Emerald green for primary node
  standard: "#27ae60", // Nephritis green for standard nodes
  expanded: "#16a085", // Green blue for expanded nodes
  selected: "#1abc9c", // Turquoise for selected nodes
};

// Custom node component with auto-sizing text and border
function CustomNode({ data, isConnectable, selected }) {
  const fontSize = Math.max(8, Math.min(12, 14 - data.label.length / 8));

  return (
    <div
      className={`relative flex items-center justify-center rounded-full shadow-md transition-all duration-300 hover:shadow-lg ${
        selected ? "ring-2 ring-offset-2 ring-white" : ""
      }`}
      style={{
        backgroundColor: data.color,
        width: data.size || 100,
        height: data.size || 100,
        transform: selected ? "scale(1.1)" : "scale(1)",
        border: data.isExpanded || data.isPrimary ? "3px solid black" : "none",
      }}
    >
      <div
        className="text-center text-white font-medium px-2 w-full"
        style={{ fontSize: `${fontSize}px`, wordBreak: "break-word" }}
        title={data.label}
      >
        {data.label}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-white border-2"
        style={{ borderColor: data.color }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-white border-2"
        style={{ borderColor: data.color }}
      />
    </div>
  );
}

// Add PropTypes to satisfy ESLint's react/prop-types rule
CustomNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    color: PropTypes.string,
    size: PropTypes.number,
    isExpanded: PropTypes.bool,
    isPrimary: PropTypes.bool,
  }).isRequired,
  isConnectable: PropTypes.bool.isRequired,
  selected: PropTypes.bool.isRequired,
};

const nodeTypes = { custom: CustomNode };

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

interface DynamicGraphProps {
  initialGraphData: GraphData;
}

// Layout utilities
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  // Use different node sizes based on type
  nodes.forEach((node) => {
    const nodeSize = node.data?.size || 100; // Increased default size
    dagreGraph.setNode(node.id, { width: nodeSize, height: nodeSize });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const nodeSize = node.data?.size || 100; // Increased default size
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeSize / 2,
        y: nodeWithPosition.y - nodeSize / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Arrange nodes in a circle around a center point
const arrangeNodesInCircle = (centerNode: Node, newNodes: Node[], radius = 250) => {
  const centerX = centerNode.position.x;
  const centerY = centerNode.position.y;
  const angleStep = (2 * Math.PI) / newNodes.length;

  return newNodes.map((node, index) => ({
    ...node,
    position: {
      x: centerX + radius * Math.cos(index * angleStep),
      y: centerY + radius * Math.sin(index * angleStep),
    },
  }));
};

function Flow({ initialGraphData }: DynamicGraphProps) {
  // Format initial nodes with proper styling
  const normalizedNodes = initialGraphData.nodes.map((node, index) => ({
    ...node,
    type: "custom",
    data: {
      ...node.data,
      label: node.data?.label || `Node ${node.id}`,
      color: index === 0 ? NODE_TYPES.primary : NODE_TYPES.standard,
      expanded: false,
      isPrimary: index === 0,
      size: index === 0 ? 120 : 100,
    },
    position: node.position || { x: 0, y: 0 },
  }));

  const normalizedEdges = initialGraphData.edges.map((edge, index) => ({
    ...edge,
    id: edge.id || `e${index}`,
    animated: true,
    style: {
      stroke: "#2ecc71", // Updated to a green shade
      strokeWidth: 2,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#2ecc71", // Updated to a green shade
    },
  }));

  // Compute initial layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(normalizedNodes, normalizedEdges);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  // Removed unused selectedNode state
  const [authorInfo, setAuthorInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { fitView, setCenter } = useReactFlow();

  // Apply layout when nodes or edges change
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 800 });
    }, 100);
    return () => clearTimeout(timer);
  }, [fitView]);

  const clickTimeoutRef = useRef(null);

  // Function to handle single click
  const handleSingleClick = useCallback(
    async (node) => {
      setIsLoading(true);
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/get_auth_info`, {
          authorid: node.id,
        });
        setAuthorInfo(response.data);
        // Update the node's label with the correct author name
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id ? { ...n, data: { ...n.data, label: response.data.name || n.data.label } } : n,
          ),
        );
      } catch (error) {
        console.error("Error fetching author info:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [setNodes],
  );

  // Function to handle double click
  const handleDoubleClick = useCallback(
    async (event, node) => {
      // Prevent re-expansion of already expanded nodes
      if (node.data.expanded) return;

      setIsLoading(true);

      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graph/get_next_connections`, {
          authorid: node.id,
        });

        const connections = response.data.connections;

        // Filter out duplicates and already existing nodes
        const existingNodeIds = new Set(nodes.map((n) => n.id));
        const uniqueConnections = connections.filter((conn) => !existingNodeIds.has(conn.authorId));

        if (uniqueConnections.length === 0) {
          console.log("No new connections found");
          return;
        }

        // Create new nodes
        const newNodes = uniqueConnections.map((conn) => ({
          id: conn.authorId,
          type: "custom",
          position: { x: 0, y: 0 },
          data: {
            label: conn.name,
            color: NODE_TYPES.standard,
            expanded: false,
            isPrimary: false,
            size: 100,
          },
        }));

        // Create new edges
        const newEdges = newNodes.map((n) => ({
          id: `e-${node.id}-${n.id}`,
          source: node.id,
          target: n.id,
          animated: true,
          style: {
            stroke: "#2ecc71", // Updated to a green shade
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#2ecc71", // Updated to a green shade
          },
        }));

        // Mark the current node as expanded and change its color
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    expanded: true,
                    isExpanded: true,
                    color: NODE_TYPES.expanded,
                  },
                }
              : {
                  ...n,
                  data: {
                    ...n.data,
                    isExpanded: false,
                  },
                },
          ),
        );

        // Position new nodes in a circle around the clicked node
        const positionedNewNodes = arrangeNodesInCircle(node, newNodes);

        // Update the graph with new nodes and edges
        const updatedNodes = [...nodes, ...positionedNewNodes];
        const updatedEdges = [...edges, ...newEdges];

        // Apply layout to ensure clean arrangement
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(updatedNodes, updatedEdges);

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        // Center view on the expanded node
        setCenter(node.position.x, node.position.y, { duration: 800 });
      } catch (error) {
        console.error("Error fetching connections:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [nodes, edges, setNodes, setEdges, setCenter],
  );

  // Single click handler - fetch author info
  const onNodeClick = useCallback(
    (event, node) => {
      event.preventDefault();

      if (clickTimeoutRef.current) {
        // Double click detected
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
        handleDoubleClick(event, node);
      } else {
        // Set timeout for single click
        clickTimeoutRef.current = setTimeout(() => {
          clickTimeoutRef.current = null;
          handleSingleClick(node);
        }, 250); // 250ms delay
      }
    },
    [handleSingleClick, handleDoubleClick],
  );

  // Format author information for display
  const formattedAuthorInfo = useMemo(() => {
    if (!authorInfo) return null;

    return {
      name: authorInfo.name || "Unknown",
      organisation: authorInfo.organisation_history?.[0] || "No organization listed",
      website: authorInfo.website || null,
      works_count: authorInfo.works_count || 0,
      citations: authorInfo.citations || 0,
      hindex: authorInfo.hindex || 0,
      orcid: authorInfo.orcid || null,
      country: authorInfo.profile?.addresses?.address?.[0]?.country?.value || null,
    };
  }, [authorInfo]);

  const [fetchedCentral, setFetchedCentral] = useState(false);
  useEffect(() => {
    if (!fetchedCentral) {
      const centralNode = nodes.find((node) => node.data.label === "CENTRAL");
      if (centralNode) {
        handleSingleClick(centralNode);
        setFetchedCentral(true);
      }
    }
  }, [nodes, fetchedCentral, handleSingleClick]);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative w-full h-[600px] bg-slate-50 rounded-xl shadow-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 z-10 flex items-center justify-center">
            <div className="bg-white p-3 rounded-full animate-pulse">
              <svg
                className="animate-spin h-6 w-6 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.5}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#e2e8f0" gap={16} size={1} />
          <Controls position="bottom-right" showInteractive={false} />
          <Panel position="top-left" className="bg-white/80 p-2 rounded shadow-md backdrop-blur-sm">
            <div className="text-sm text-slate-700">
              <p>
                <span className="font-medium">Single click:</span> View author details
              </p>
              <p>
                <span className="font-medium">Double click:</span> Expand connections
              </p>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Author Information Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-green-500" />
          Author Information
        </h2>

        {formattedAuthorInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{formattedAuthorInfo.name}</h3>
                {formattedAuthorInfo.organisation && (
                  <div className="flex items-center gap-2 text-slate-600 mt-1">
                    <Briefcase className="h-4 w-4" />
                    <span>{formattedAuthorInfo.organisation}</span>
                  </div>
                )}
                {formattedAuthorInfo.country && (
                  <div className="flex items-center gap-2 text-slate-600 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{formattedAuthorInfo.country}</span>
                  </div>
                )}
              </div>

              {formattedAuthorInfo.website && (
                <div className="flex items-center gap-2 text-green-600 hover:text-green-800">
                  <Link2 className="h-4 w-4" />
                  <a href={formattedAuthorInfo.website} target="_blank" rel="noopener noreferrer" className="underline">
                    Personal Website
                  </a>
                </div>
              )}

              {formattedAuthorInfo.orcid && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Hash className="h-4 w-4" />
                  <span>ORCID: {formattedAuthorInfo.orcid}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">Works</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{formattedAuthorInfo.works_count}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Citations</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{formattedAuthorInfo.citations}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Award className="h-4 w-4" />
                  <span className="text-sm">h-index</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{formattedAuthorInfo.hindex}</p>
              </div>
            </div>

            {authorInfo && authorInfo.profile && (
              <div className="col-span-1 md:col-span-2 mt-2">
                <button
                  className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
                  onClick={() => {
                    const detailsEl = document.getElementById("author-details");
                    if (detailsEl) {
                      detailsEl.open = !detailsEl.open;
                    }
                  }}
                >
                  <span>View full profile data</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                <details id="author-details" className="mt-2">
                  <summary className="cursor-pointer text-sm text-slate-500">Raw profile data</summary>
                  <pre className="mt-2 p-4 bg-slate-50 rounded-lg text-xs overflow-auto max-h-60">
                    {JSON.stringify(authorInfo, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        ) : (
          <div className="text-slate-500 flex items-center justify-center h-40 text-center">
            <div>
              <p>Click on a node to view author information</p>
              <p className="text-sm mt-2">Double-click to expand connections</p>
            </div>
          </div>
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
