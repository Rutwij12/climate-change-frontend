"use client";
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AuthorCRM, Status } from "@/types";

// Define the status types and their colors
const statusConfig: Record<string, string> = {
  uncontacted: "bg-gray-200 hover:bg-gray-300 text-gray-700",
  interested: "bg-emerald-200 hover:bg-emerald-300 text-emerald-700",
  uninterested: "bg-amber-200 hover:bg-amber-300 text-amber-700",
  blocked: "bg-red-200 hover:bg-red-300 text-red-700",
};

const statusOutput: Record<string, string> = {
  uncontacted: "Uncontacted",
  interested: "Interested",
  uninterested: "Uninterested",
  blocked: "Blocked",
};

interface BookComponentProps {
  authors: AuthorCRM[];
  onUpdateNotes: (id: number, notes: string) => void;
  onUpdateStatus: (id: number, status: Status) => void;
}

export default function BookComponent({ authors, onUpdateNotes, onUpdateStatus }: BookComponentProps) {
  return (
    <div className="rounded-lg border border-emerald-200 overflow-hidden">
      <Table>
        <TableHeader className="bg-emerald-50">
          <TableRow>
            <TableHead className="text-emerald-900 font-semibold">Author Name</TableHead>
            <TableHead className="text-emerald-900 font-semibold">Author Institution</TableHead>
            <TableHead className="text-emerald-900 font-semibold">Notes</TableHead>
            <TableHead className="text-emerald-900 font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {authors.map((author) => (
            <TableRow key={author.id}>
              <TableCell className="font-medium">{author.name}</TableCell>
              <TableCell>{author.institution}</TableCell>
              <TableCell>
                <Textarea
                  value={author.note}
                  onChange={(e) => onUpdateNotes(author.id, e.target.value)}
                  className="min-h-[80px] border-emerald-200 focus:ring-emerald-500"
                />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className={`w-32 ${statusConfig[author.state]}`} variant="ghost">
                      {statusOutput[author.state]}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {Object.keys(statusConfig).map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => onUpdateStatus(author.id, status as Status)}
                        className={`${statusConfig[status as Status]} cursor-pointer`}
                      >
                        {statusOutput[status]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export { statusConfig };