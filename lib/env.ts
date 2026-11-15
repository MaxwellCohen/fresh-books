export function getEnv(name: string): string | undefined {
  const g = globalThis as {
    Deno?: { env: { get(k: string): string | undefined } }
    process?: { env: Record<string, string | undefined> }
  }
  if (g.Deno) return g.Deno.env.get(name)
  return g.process?.env?.[name]
}
