"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Section } from "@/types/database";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export const getColumns = (
  onEdit: (item: Section) => void,
  onArchive: (id: string) => void,
): ColumnDef<Section>[] => [
  { accessorKey: "semester_id", header: "SEMESTER ID" },
  { accessorKey: "name", header: "NAME" },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => format(new Date(row.getValue("created_at")), "MMM d, yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(row.original)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onArchive(row.original.id)}><Archive className="mr-2 h-4 w-4" /> Archive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
