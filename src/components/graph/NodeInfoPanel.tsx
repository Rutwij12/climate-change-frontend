import React from "react";
import {
  User,
  Briefcase,
  Hash,
  BookOpen,
  FileText,
  Award,
  MapPin,
  Calendar,
} from "lucide-react";
import type { NodeInfo } from "@/types/graph";

interface NodeInfoPanelProps {
  nodeInfo: NodeInfo | null;
  loading: boolean;
  onClose: () => void;
}

export const NodeInfoPanel: React.FC<NodeInfoPanelProps> = ({
  nodeInfo,
  loading,
  onClose,
}) => {
  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <svg
          className="animate-spin h-6 w-6 text-green-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  if (!nodeInfo) return null;

  const BasePanel = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100 relative">
      {/* Add close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      {children}
    </div>
  );

  switch (nodeInfo.type) {
    case "author":
      return (
        <BasePanel>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-green-500" />
            Author Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {nodeInfo.data.name}
                </h3>
              </div>
              {nodeInfo.data.orcid && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Hash className="h-4 w-4" />
                  <span>ORCID: {nodeInfo.data.orcid}</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">Works</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {nodeInfo.data.works_count}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Citations</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {nodeInfo.data.cited_by_count}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Award className="h-4 w-4" />
                  <span className="text-sm">h-index</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {nodeInfo.data.h_index}
                </p>
              </div>
            </div>
          </div>
        </BasePanel>
      );

    case "topic":
      return (
        <BasePanel>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Hash className="h-5 w-5 text-pink-500" />
            Topic Information
          </h2>
          <div className="text-lg font-semibold text-slate-800">
            {nodeInfo.data.name}
          </div>
        </BasePanel>
      );

    case "institution":
      return (
        <BasePanel>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-500" />
            Institution Information
          </h2>
          <div className="space-y-2">
            <div className="text-lg font-semibold text-slate-800">
              {nodeInfo.data.name}
            </div>
            {nodeInfo.data.country_code && (
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="h-4 w-4" />
                <span>Country: {nodeInfo.data.country_code}</span>
              </div>
            )}
            {nodeInfo.data.type && (
              <div className="text-slate-600">Type: {nodeInfo.data.type}</div>
            )}
          </div>
        </BasePanel>
      );

    case "work":
      return (
        <BasePanel>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-500" />
            Publication Information
          </h2>
          <div className="space-y-4">
            <div className="text-lg font-semibold text-slate-800">
              {nodeInfo.data.title}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Year</span>
                </div>
                <p className="text-xl font-bold text-green-600">
                  {nodeInfo.data.publicationYear}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Citations</span>
                </div>
                <p className="text-xl font-bold text-green-600">
                  {nodeInfo.data.cited_by_count}
                </p>
              </div>
            </div>
          </div>
        </BasePanel>
      );

    default:
      return null;
  }
};
