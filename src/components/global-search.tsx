"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  GraduationCap,
  BookOpen,
  Users,
  Building,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground w-40 md:w-64 text-muted-foreground"
      >
        <span className="flex-1 text-left hidden lg:inline">Search...</span>
        <span className="flex-1 text-left lg:hidden">Search</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/students'))}>
              <Users className="mr-2 h-4 w-4" />
              <span>Manage Students</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/faculty'))}>
              <User className="mr-2 h-4 w-4" />
              <span>Manage Faculty</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/subjects'))}>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Manage Subjects</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Academic Setup">
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/colleges'))}>
              <Building className="mr-2 h-4 w-4" />
              <span>Colleges</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/departments'))}>
              <Building className="mr-2 h-4 w-4" />
              <span>Departments</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/programs'))}>
              <GraduationCap className="mr-2 h-4 w-4" />
              <span>Programs</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(() => router.push('/profile/change-password'))}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/settings'))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
