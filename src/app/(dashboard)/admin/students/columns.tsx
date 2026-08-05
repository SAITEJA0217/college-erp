"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PowerOff, Trash, Key } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toggleUserStatus, deleteUserAccount, resetUserPassword } from "@/features/admin/user-actions";
import { toast } from "sonner";
import { DEFAULT_PASSWORD } from "@/constants/auth";

export const getColumns = (): ColumnDef<any>[] => [
  {
    accessorKey: "full_name",
    header: "Full Name",
  },
  {
    accessorFn: (row) => row.students?.roll_number,
    id: "roll_number",
    header: "Roll Number",
    cell: ({ row }) => <span className="font-semibold">{row.original.students?.roll_number}</span>
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <span>{row.original.phone || "—"}</span>
  },
  {
    accessorFn: (row) => row.students?.department?.name,
    id: "department",
    header: "Department",
    cell: ({ row }) => <span>{row.original.students?.department?.name || "—"}</span>
  },
  {
    accessorFn: (row) => row.students?.semester?.semester_number,
    id: "semester",
    header: "Semester",
    cell: ({ row }) => <span>{row.original.students?.semester ? `Semester ${row.original.students.semester.semester_number}` : "—"}</span>
  },
  {
    accessorFn: (row) => row.students?.section?.name,
    id: "section",
    header: "Section",
    cell: ({ row }) => <span>{row.original.students?.section?.name || "—"}</span>
  },
  {
    accessorFn: (row) => row.students?.batch_year,
    id: "batch",
    header: "Batch",
    cell: ({ row }) => <span>{row.original.students?.batch_year || "—"}</span>
  },
  {
    id: "password_status",
    header: "Password Status",
    cell: ({ row }) => (
      <Badge variant={row.original.must_change_password ? "destructive" : "secondary"}>
        {row.original.must_change_password ? "Default Password" : "Updated"}
      </Badge>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? "default" : "secondary"}>
        {row.original.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      const handleToggleStatus = async () => {
        const result = await toggleUserStatus(user.id, user.is_active);
        if (result.error) toast.error(result.error);
        else toast.success(`User ${user.is_active ? "deactivated" : "activated"}.`);
      };

      const handleDelete = async () => {
        if (!confirm("Are you sure you want to permanently delete this user?")) return;
        const result = await deleteUserAccount(user.id);
        if (result.error) toast.error(result.error);
        else toast.success("User deleted permanently.");
      };

      const handleResetPassword = async () => {
        if (!confirm(`Reset password to '${DEFAULT_PASSWORD}'?`)) return;
        const result = await resetUserPassword(user.id);
        if (result.error) toast.error(result.error);
        else toast.success(`Password reset successfully. Temporary Password: ${DEFAULT_PASSWORD}`);
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleResetPassword}>
              <Key className="mr-2 h-4 w-4" /> Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleStatus}>
              <PowerOff className="mr-2 h-4 w-4" /> {user.is_active ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
              <Trash className="mr-2 h-4 w-4" /> Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
