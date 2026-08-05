import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-background to-background dark:from-sky-950/50">
      <MarketingHeader />
      <main className="flex-1 flex flex-col justify-center overflow-hidden min-h-0 bg-gradient-to-br from-[#1E2A78] via-[#121948] to-[#0A0D26]">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
