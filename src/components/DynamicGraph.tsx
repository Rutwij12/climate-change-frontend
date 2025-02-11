"use client"

import type React from "react"
import { useCallback, useMemo } from "react"
import ReactFlow, {
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  type NodeProps,
  MarkerType,
} from "reactflow"
import "reactflow/dist/style.css"
import { fetchRelatedNodes } from "../actions/fetchRelatedNodes"

const initialNodes: Node[] = [
  { id: "1", data: { label: "Node 1" }, position: { x: 250, y: 5 }, type: "circle" },
  { id: "2", data: { label: "Node 2" }, position: { x: 100, y: 100 }, type: "circle" },
  { id: "3", data: { label: "Node 3" }, position: { x: 400, y: 100 }, type: "circle" },
]

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e1-3", source: "1", target: "3", animated: true },
]

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
]

function CircleNode({ data, isConnectable }: NodeProps) {
  return (
    <div
      className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-gray-300 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-110"
      style={{ backgroundColor: data.color }}
    >
      <div className="text-xs font-semibold text-gray-700">{data.label}</div>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3" />
    </div>
  )
}

const nodeTypes = {
  circle: CircleNode,
}

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const { setCenter } = useReactFlow()

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  )

  const calculateNodePositions = useCallback(
    (centerX: number, centerY: number, newNodesCount: number): { x: number; y: number }[] => {
      const radius = 100
      const angleStep = (2 * Math.PI) / newNodesCount

      return Array.from({ length: newNodesCount }, (_, index) => {
        const angle = index * angleStep
        return {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        }
      })
    },
    [],
  )

  const onNodeClick = useCallback(
    async (event: React.MouseEvent, node: Node) => {
      const { nodes: newNodes, edges: newEdges } = await fetchRelatedNodes(node.id)

      let positionedNewNodes: Node[] = []
      setNodes((nds) => {
        const existingNodeIds = new Set(nds.map((n) => n.id))
        const filteredNewNodes = newNodes.filter((n) => !existingNodeIds.has(n.id))

        const positions = calculateNodePositions(node.position.x, node.position.y, filteredNewNodes.length)

        positionedNewNodes = filteredNewNodes.map((n, index) => ({
          ...n,
          type: "circle",
          position: positions[index],
          data: {
            ...n.data,
            color: nodeColors[Math.floor(Math.random() * nodeColors.length)],
          },
          style: { opacity: 0, scale: 0.5 },
        }))

        return [...nds, ...positionedNewNodes]
      })

      setEdges((eds) => {
        const existingEdgeIds = new Set(eds.map((e) => e.id))
        const filteredNewEdges = newEdges
          .filter((e) => !existingEdgeIds.has(e.id))
          .map((e) => ({ ...e, animated: true }))
        return [...eds, ...filteredNewEdges]
      })

      // Animate new nodes appearing
      setTimeout(() => {
        setNodes((nds) =>
          nds.map((n) =>
            newNodes.some((newNode) => newNode.id === n.id) ? { ...n, style: { opacity: 1, scale: 1 } } : n,
          ),
        )
      }, 50)

      // Center the view on the clicked node
      setCenter(node.position.x, node.position.y, { duration: 800 })
    },
    [setNodes, setEdges, setCenter, calculateNodePositions],
  )

  const customEdgeStyles = useMemo(
    () => ({
      stroke: "#b1b1b7",
      strokeWidth: 2,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#b1b1b7",
      },
    }),
    [],
  )

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
      defaultEdgeOptions={customEdgeStyles}
    />
  )
}

export default function DynamicGraph() {
  return (
    <div className="w-full h-[600px] bg-gray-50 rounded-lg shadow-inner">
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  )
}

