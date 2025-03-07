export type TabType = "coauthor" | "topic" | "research" | "natural" | "dynamic";
export type NodeType = "author" | "work" | "institution" | "topic";

// Add custom interfaces for NVL types that aren't properly typed
export interface NVLNodeProperties {
  id: string;
  name?: string;
  title?: string;
  nodeType: string;
  organisation?: string;
  website?: string;
  works_count?: number;
  citations?: number;
  hindex?: number;
  orcid?: string;
  country?: string;
  [key: string]: any; // Allow additional properties since NVL nodes can have varying data
}

export interface NVLRelationshipProperties {
  relationType: string;
  authorPosition?: string;
  score?: number;
  paperCount?: number;
  [key: string]: any;
}

// Add new interfaces for type safety
export interface InitialConnection {
  authorId: string;
  name: string;
}

// Add new types for node info
export type NodeInfo = {
  type: "work" | "author" | "topic" | "institution";
  data: any;
};

// Define the author info interface structure
export interface AuthorInfo {
  name: string;
  organisation_history?: string[];
  website?: string;
  works_count?: number;
  citations?: number;
  hindex?: number;
  orcid?: string;
  profile?: {
    addresses?: {
      address?: Array<{
        country?: {
          value?: string;
        };
      }>;
    };
  };
  // Add any other properties that might come from your API
  [key: string]: any;
}

export interface GraphQuery {
  authorid: string;
  paperid: string;
}
