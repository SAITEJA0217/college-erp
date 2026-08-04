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

export const getColumns = (): ColumnDef<any>[] => [
  {
    accessorKey: "full_name",
    header: "Full Name",
  },
  {
    accessorKey: "students.roll_number",
    header: "Roll Number",
    cell: ({ row }) => <span className="font-semibold">{row.original.students.roll_number}</span>
  },
  {
    accessorKey: "email",
    header: "Email",
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
        if (!confirm("Reset password to 'Welcome@2024'?")) return;
        const result = await resetUserPassword(user.id);
        if (result.error) toast.error(result.error);
        else toast.success("Password reset successfully.");
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
