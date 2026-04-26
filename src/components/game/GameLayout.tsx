export function GameLayout({ children }: React.PropsWithChildren) {
  return (
    <main className="mx-auto min-h-screen max-w-[800px] px-4 py-6 md:px-6 md:py-8">
      <div className="grid gap-5">{children}</div>
    </main>
  );
}
