"use server"

import type { Node, Edge } from "reactflow"

let nodeCounter = 13 // Starting after our initial nodes

export async function fetchRelatedNodes(nodeId: string): Promise<{ nodes: Node[]; edges: Edge[] }> {
  // Create 5 new nodes
  const newNodes: Node[] = Array.from({ length: 5 }, (_, index) => {
    nodeCounter++
    return {
      id: nodeCounter.toString(),
      data: { label: `Node ${nodeCounter}` },
      position: { x: 0, y: 0 }, // Position will be set by the component
    }
  })

  // Create edges connecting the clicked node to each new node
  const newEdges: Edge[] = newNodes.map((node) => ({
    id: `e${nodeId}-${node.id}`,
    source: nodeId,
    target: node.id,
    animated: true,
  }))

  return { nodes: newNodes, edges: newEdges }
}

