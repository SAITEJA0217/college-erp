"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROLE_NAVIGATION } from "@/config/navigation";
import type { DashboardRole } from "@/types/roles";

export function AppBreadcrumbs({ role }: { role: DashboardRole }) {
  const pathname = usePathname();
  
  const navItems = ROLE_NAVIGATION[role] || [];
  
  // Find the matching path
  let currentTitle = "Dashboard";
  let parentTitle = "";
  
  // Basic exact match or parent match
  navItems.forEach(item => {
    if (pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href))) {
      currentTitle = item.title;
      
      // Check children
      if (item.items) {
        item.items.forEach(child => {
          if (pathname === child.href || pathname.startsWith(child.href + '/')) {
            parentTitle = item.title;
            currentTitle = child.title;
          }
        });
      }
    }
  });

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {parentTitle && (
          <>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-muted-foreground font-medium">{parentTitle}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        <BreadcrumbItem>
          <BreadcrumbPage className="font-semibold text-foreground">{currentTitle}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
