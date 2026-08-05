import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { siteConfig } from "@/config/site";

const links = [
  { href: "/help", label: "Help & Support" }
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#F47C20]/20 bg-background/75 backdrop-blur-xl h-16 flex items-center">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 max-w-[70%] sm:max-w-none">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-0.5 border border-amber-500/20 shadow-sm">
            <img src="/logo.png" alt="Malla Reddy University" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <span className="text-[#1E2A78] font-bold text-sm sm:text-lg leading-none block truncate">Malla Reddy University </span>
            <span className="text-[8px] sm:text-[10px] text-gray-500 font-semibold tracking-wider uppercase block truncate">Digital Campus Management System</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-gray-500 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[#F47C20] font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 shrink-0">
          <ThemeToggle />
          <Button asChild className="rounded-xl bg-[#F47C20] hover:bg-[#d96614] text-white font-bold transition-all duration-200 shadow-lg shadow-orange-500/20 h-9 px-3 text-xs sm:text-sm sm:h-10 sm:px-4">
            <Link href="/login">LOGIN</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#F47C20]/20 bg-[#1E2A78] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-semibold text-[#F47C20]">Malla Reddy University</p>
          <p className="text-xs text-gray-300">Hyderabad, Telangana</p>
          <p className="text-xs text-gray-400 mt-1">
            © {new Date().getFullYear()} Malla Reddy University ERP. All rights reserved.
          </p>
        </div>
        <div className="flex gap-6 text-gray-300">
          <Link href="/help" className="hover:text-[#F47C20] transition-colors">
            Support Portal
          </Link>
          <Link href="/login" className="hover:text-[#F47C20] transition-colors font-semibold">
            LOGIN
          </Link>
        </div>
      </div>
    </footer>
  );
}
