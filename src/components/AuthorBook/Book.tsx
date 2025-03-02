"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AuthorCRM, Status } from "@/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  onDeleteAuthor: (id: number) => void;
}

export default function BookComponent({ authors, onUpdateNotes, onUpdateStatus, onDeleteAuthor }: BookComponentProps) {
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  return (
    <div className="rounded-lg border border-emerald-300 overflow-hidden shadow-md">
      <Table>
        <TableHeader className="bg-emerald-100">
          <TableRow>
            <TableHead className="text-emerald-900 font-bold text-center text-lg py-4">Author Name</TableHead>
            <TableHead className="text-emerald-900 font-bold text-center text-lg py-4">Author Institution</TableHead>
            <TableHead className="text-emerald-900 font-bold text-center text-lg py-4">Notes</TableHead>
            <TableHead className="text-emerald-900 font-bold text-center text-lg py-4">Status</TableHead>
            <TableHead className="text-emerald-900 font-bold text-center text-lg py-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {authors.map((author) => (
            <TableRow key={author.id} className="hover:bg-emerald-50">
              <TableCell className="font-medium text-center text-base">{author.name}</TableCell>
              <TableCell className="text-center text-base">{author.institution}</TableCell>
              <TableCell className="text-center">
                <Textarea
                  value={author.note}
                  onChange={(e) => onUpdateNotes(author.id, e.target.value)}
                  className="min-h-[80px] border-emerald-200 focus:ring-emerald-500 focus:border-emerald-500 text-base mx-auto w-full"
                  style={{ fontSize: '1rem' }}
                />
              </TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className={`w-32 ${statusConfig[author.state]} text-base`} variant="ghost">
                      {statusOutput[author.state]}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {Object.keys(statusConfig).map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => onUpdateStatus(author.id, status as Status)}
                        className={`${statusConfig[status as Status]} cursor-pointer text-base`}
                      >
                        {statusOutput[status]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white text-base px-6 py-2"
                  onClick={() => setConfirmDelete(author.id)}
                >
                  Remove Author
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Confirmation Dialog */}
      {confirmDelete !== null && (
        <Dialog open={true} onOpenChange={() => setConfirmDelete(null)}>
          <DialogContent className="text-center border-emerald-300 border-2">
            <DialogHeader>
              <DialogTitle className="text-emerald-800 text-lg">Are you sure you want to remove this author?</DialogTitle>
            </DialogHeader>
            <DialogFooter className="flex justify-center gap-4">
              <Button variant="outline" className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-base px-6" onClick={() => setConfirmDelete(null)}>No</Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white text-base px-6"
                onClick={() => {
                  onDeleteAuthor(confirmDelete);
                  setConfirmDelete(null);
                }}
              >
                Yes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export { statusConfig };