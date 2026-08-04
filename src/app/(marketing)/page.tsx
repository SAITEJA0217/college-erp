import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-40" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {siteConfig.name}
          </p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            A calmer operating system for campus academics.
          </h1>
          <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
            Unified portals for students, faculty, HODs, placement teams, and
            administrators — built for clarity, speed, and accountability.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl">
              <Link href="/login">
                Enter ERP
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link href="/admissions">Explore admissions</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: Users,
              title: "Role-based portals",
              body: "Every user lands in the right workspace automatically.",
            },
            {
              icon: ShieldCheck,
              title: "Institutional access",
              body: "Accounts are provisioned by admin — login only, no public signup.",
            },
            {
              icon: Sparkles,
              title: "Premium experience",
              body: "Glass surfaces, clear hierarchy, and responsive dashboards.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur-xl sm:last:col-span-2"
            >
              <item.icon className="mb-3 h-5 w-5 text-primary" />
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
