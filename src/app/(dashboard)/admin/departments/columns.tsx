"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Department } from "@/types/database";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Archive, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

export const getColumns = (
  onEdit: (item: Department) => void,
  onArchive: (id: string) => void,
  onDelete: (id: string) => void,
): ColumnDef<Department>[] => [
  { 
    accessorKey: "school_name", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="School" />
  },
  { 
    accessorKey: "code", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />
  },
  { 
    accessorKey: "name", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
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
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(row.original.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
