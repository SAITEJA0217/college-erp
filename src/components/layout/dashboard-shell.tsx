"use client";

import * as React from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppNavbar } from "@/components/layout/app-navbar";
import type { DashboardRole } from "@/types/roles";
import type { Notification } from "@/types/database";

interface DashboardShellProps {
  role: DashboardRole;
  userName: string;
  userEmail?: string;
  avatarUrl?: string | null;
  userId: string;
  children: React.ReactNode;
}

export function DashboardShell({
  role,
  userName,
  userEmail,
  avatarUrl,
  userId,
  children,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex min-h-svh bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100/70 via-background to-background dark:from-sky-950/40">
      <div className="hidden lg:block">
        <AppSidebar
          role={role}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppNavbar
          role={role}
          userName={userName}
          userEmail={userEmail}
          avatarUrl={avatarUrl}
          userId={userId}
        />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
