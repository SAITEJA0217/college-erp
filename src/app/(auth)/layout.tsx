export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-background to-background p-4 dark:from-sky-950/40">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
