"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PowerOff, Trash, Key, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  toggleUserStatus,
  deleteUserAccount,
  resetUserPassword,
} from "@/features/admin/user-actions";
import { toast } from "sonner";
import { DEFAULT_PASSWORD } from "@/constants/auth";

interface GetColumnsOptions {
  departments: Array<{ id: string; name: string }>;
  onEdit: (faculty: any) => void;
}

export const getColumns = ({ departments, onEdit }: GetColumnsOptions): ColumnDef<any>[] => [
  {
    accessorFn: (row) => row.employee_or_student_id,
    id: "employee_id",
    header: "Employee ID",
    cell: ({ row }) => (
      <span className="font-semibold font-mono text-xs">
        {row.original.employee_or_student_id || "—"}
      </span>
    ),
  },
  {
    accessorKey: "full_name",
    header: "Full Name",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className="text-xs">{row.original.email}</span>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <span>{row.original.phone || "—"}</span>,
  },
  {
    id: "department",
    header: "Department",
    cell: ({ row }) => <span>{row.original.faculty?.department?.name || "—"}</span>,
  },
  {
    id: "designation",
    header: "Designation",
    cell: ({ row }) => <span>{row.original.faculty?.designation || "—"}</span>,
  },
  {
    id: "qualification",
    header: "Qualification",
    cell: ({ row }) => <span>{row.original.faculty?.qualification || "—"}</span>,
  },
  {
    id: "experience_years",
    header: "Experience",
    cell: ({ row }) => {
      const exp = row.original.faculty?.experience_years;
      return <span>{exp != null ? `${exp} yrs` : "—"}</span>;
    },
  },
  {
    id: "employment_type",
    header: "Employment Type",
    cell: ({ row }) => <span>{row.original.faculty?.employment_type || "—"}</span>,
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
        else toast.success(`Faculty ${user.is_active ? "deactivated" : "activated"}.`);
      };

      const handleDelete = async () => {
        if (!confirm("Are you sure you want to permanently delete this faculty member?")) return;
        const result = await deleteUserAccount(user.id);
        if (result.error) toast.error(result.error);
        else toast.success("Faculty deleted permanently.");
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
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Faculty
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleResetPassword}>
              <Key className="mr-2 h-4 w-4" /> Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleStatus}>
              <PowerOff className="mr-2 h-4 w-4" />
              {user.is_active ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleDelete}
            >
              <Trash className="mr-2 h-4 w-4" /> Delete Faculty
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
