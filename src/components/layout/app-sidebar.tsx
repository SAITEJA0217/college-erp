"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ROLE_LABELS, ROLE_NAVIGATION } from "@/config/navigation";
import type { DashboardRole } from "@/types/roles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { siteConfig } from "@/config/site";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { NavItem } from "@/config/navigation";

function SidebarItem({ 
  item, 
  active, 
  collapsed, 
  pathname 
}: { 
  item: NavItem; 
  active: boolean; 
  collapsed: boolean; 
  pathname: string; 
}) {
  const hasItems = item.items && item.items.length > 0;
  // Auto-expand if a child is active
  const isChildActive = hasItems && item.items?.some(
    (child) => pathname === child.href || pathname.startsWith(child.href + "/")
  );
  
  const [isOpen, setIsOpen] = useState(isChildActive);
  useEffect(() => {
    if (isChildActive && !isOpen) setIsOpen(true);
  }, [isChildActive, pathname]);

  const Icon = item.icon;

  const linkContent = (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
        active || isChildActive
          ? "bg-[#F47C20] text-white shadow-md font-bold scale-[1.02]"
          : "text-gray-300 hover:bg-white/10 hover:text-white",
        item.disabled && "pointer-events-none opacity-45",
        collapsed && "justify-center px-0",
      )}
      onClick={() => {
        if (hasItems) setIsOpen(!isOpen);
      }}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("h-4 w-4 shrink-0", (active || isChildActive) ? "text-white" : "text-[#F47C20]")} />
        {!collapsed && <span className="truncate">{item.title}</span>}
      </div>
      {!collapsed && hasItems && (
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen ? "rotate-180" : "")} />
      )}
    </div>
  );

  const mainElement = hasItems ? (
    linkContent
  ) : (
    <Link prefetch={true} href={item.disabled ? "#" : item.href} aria-disabled={item.disabled}>
      {linkContent}
    </Link>
  );

  if (collapsed) {
    // If collapsed, we don't render children inline, just show a tooltip for the main item.
    // In a full implementation you'd use a popover/dropdown, but this keeps it simple.
    return (
      <Tooltip>
        <TooltipTrigger asChild>{mainElement}</TooltipTrigger>
        <TooltipContent side="right" className="bg-[#1E2A78] text-white border border-[#F47C20]/40">
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {mainElement}
      {hasItems && isOpen && !collapsed && (
        <div className="flex flex-col gap-1 pl-9 pr-2 py-1 relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-amber-500/20" />
          {item.items!.map((child) => {
            const childActive = pathname === child.href;
            const ChildIcon = child.icon;
            return (
              <Link
                key={child.href}
                prefetch={true}
                href={child.disabled ? "#" : child.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  childActive
                    ? "text-white bg-white/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5",
                  child.disabled && "pointer-events-none opacity-45"
                )}
              >
                <ChildIcon className={cn("h-3 w-3 shrink-0", childActive ? "text-white" : "text-gray-400")} />
                <span className="truncate">{child.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface AppSidebarProps {
  role: DashboardRole;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function AppSidebar({
  role,
  collapsed,
  onCollapsedChange,
}: AppSidebarProps) {
  const pathname = usePathname();
  const items = ROLE_NAVIGATION[role];

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-svh flex-col border-r border-amber-500/20 bg-[#1E2A78] text-white transition-[width] duration-300",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white overflow-hidden p-0.5 border border-amber-500/20">
          <img src="/logo.png" alt="MRUH Logo" className="h-full w-full object-contain" />
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-wider text-[#F47C20]">MRUH ERP</p>
            <p className="truncate text-xs font-semibold text-gray-300">
              {ROLE_LABELS[role]}
            </p>
          </div>
        ) : null}
      </div>

      <Separator className="bg-amber-500/20" />

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== `/${role}` && item.href !== "#" && pathname.startsWith(item.href));
            
            return (
              <SidebarItem 
                key={item.title} 
                item={item} 
                active={active} 
                collapsed={collapsed} 
                pathname={pathname} 
              />
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-amber-500/20 p-3">
        <Button
          type="button"
          variant="ghost"
          className={cn("w-full text-gray-300 hover:text-white hover:bg-white/10", collapsed ? "px-0" : "justify-start")}
          onClick={() => onCollapsedChange(!collapsed)}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              Collapse
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
