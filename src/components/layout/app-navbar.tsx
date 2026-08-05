"use client";

import Link from "next/link";
import { LogOut, Menu, UserRound } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { GlobalSearch } from "@/components/global-search";
import { AppBreadcrumbs } from "./app-breadcrumbs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS, ROLE_NAVIGATION } from "@/config/navigation";
import type { DashboardRole } from "@/types/roles";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/features/auth/sign-out";

export interface AppNavbarProps {
  role: DashboardRole;
  userName: string;
  userEmail?: string;
  avatarUrl?: string | null;
  userId: string;
}

export function AppNavbar({
  role,
  userName,
  userEmail,
  avatarUrl,
  userId,
}: AppNavbarProps) {
  const pathname = usePathname();
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b px-4 py-4 text-left">
              <SheetTitle>{ROLE_LABELS[role]} Menu</SheetTitle>
            </SheetHeader>
            <nav className="space-y-1 p-3" aria-label="Mobile navigation">
              {ROLE_NAVIGATION[role].map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== `/${role}` && item.href !== "#" && pathname.startsWith(item.href));
                const Icon = item.icon;
                const hasItems = item.items && item.items.length > 0;
                
                return (
                  <div key={item.title} className="flex flex-col gap-1">
                    <Link
                      href={item.disabled ? "#" : item.href}
                      aria-current={active && !hasItems ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent",
                        item.disabled && "pointer-events-none opacity-45",
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.title}
                    </Link>
                    {hasItems && (
                      <div className="flex flex-col gap-1 pl-7 relative border-l ml-5 mt-1">
                        {item.items!.map(child => {
                          const childActive = pathname === child.href;
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.href}
                              href={child.disabled ? "#" : child.href}
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium",
                                childActive
                                  ? "text-foreground bg-accent"
                                  : "text-muted-foreground hover:text-foreground",
                                child.disabled && "pointer-events-none opacity-45"
                              )}
                            >
                              <ChildIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
                              {child.title}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="hidden md:flex items-center ml-2 border-l pl-4 border-border/60">
          <AppBreadcrumbs role={role} />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <GlobalSearch />
        <NotificationBell userId={userId} />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="relative h-10 gap-2 rounded-xl px-2"
              aria-label={`Account menu for ${userName}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl ?? undefined} alt={userName} />
                <AvatarFallback>{initials || "U"}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[120px] truncate text-sm md:inline">
                {userName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{userName}</p>
                {userEmail ? (
                  <p className="text-xs font-normal text-muted-foreground">
                    {userEmail}
                  </p>
                ) : null}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${role}/profile`}>
                <UserRound className="h-4 w-4" aria-hidden="true" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={async (e) => {
                e.preventDefault();
                await signOut();
              }}
              className="flex w-full items-center gap-2 text-sm cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
