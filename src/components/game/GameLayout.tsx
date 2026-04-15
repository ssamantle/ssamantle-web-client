export function GameLayout({ children }: React.PropsWithChildren) {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="grid gap-6">{children}</div>
    </main>
  );
}
