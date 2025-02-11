"use server"

import type { Node, Edge } from "reactflow"

// This is a mock database. In a real application, you'd query your actual database.
const mockDatabase: Record<string, { label: string; relatedNodes: string[] }> = {
  "1": { label: "Node 1", relatedNodes: ["4", "5"] },
  "2": { label: "Node 2", relatedNodes: ["6", "7"] },
  "3": { label: "Node 3", relatedNodes: ["8", "9"] },
  "4": { label: "Node 4", relatedNodes: ["10", "11"] },
  "5": { label: "Node 5", relatedNodes: ["12", "13"] },
  "6": { label: "Node 6", relatedNodes: [] },
  "7": { label: "Node 7", relatedNodes: [] },
  "8": { label: "Node 8", relatedNodes: [] },
  "9": { label: "Node 9", relatedNodes: [] },
  "10": { label: "Node 10", relatedNodes: [] },
  "11": { label: "Node 11", relatedNodes: [] },
  "12": { label: "Node 12", relatedNodes: [] },
  "13": { label: "Node 13", relatedNodes: [] },
}

export async function fetchRelatedNodes(nodeId: string): Promise<{ nodes: Node[]; edges: Edge[] }> {
  // Simulate a delay to mimic a database query
  await new Promise((resolve) => setTimeout(resolve, 500))

  const nodeData = mockDatabase[nodeId]
  if (!nodeData) {
    return { nodes: [], edges: [] }
  }

  const newNodes: Node[] = nodeData.relatedNodes.map((id, index) => ({
    id,
    data: { label: mockDatabase[id].label },
    position: { x: 100 + index * 100, y: 100 + index * 50 },
  }))

  const newEdges: Edge[] = nodeData.relatedNodes.map((id) => ({
    id: `${nodeId}-${id}`,
    source: nodeId,
    target: id,
  }))

  return { nodes: newNodes, edges: newEdges }
}

