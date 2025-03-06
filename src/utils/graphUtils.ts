import type { NodeType } from "@/types/graph";

export const NODE_COLORS: Record<NodeType | "mainAuthor", string> = {
  mainAuthor: "#FF0000", // Red color for main author
  author: "#FFA726",
  work: "#66BB6A",
  institution: "#42A5F5",
  topic: "#FF69B4",
};

// Helper function to get node color based on label
export const getNodeColor = (
  labels: string[],
  isMainAuthor: boolean = false
): string => {
  if (!labels || labels.length === 0) return "#999";
  if (isMainAuthor) return NODE_COLORS.mainAuthor;
  const nodeType = labels[0].toLowerCase() as NodeType;
  return NODE_COLORS[nodeType] || "#999";
};

// Update the getRelationshipLabel function
export const getRelationshipLabel = (type: string, properties: any): string => {
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
