// Deploy-button test: reports whether every binding the real bot needs arrived.
interface Env { DB: D1Database; KV: KVNamespace; AI: Ai; GREETING: string; TELEGRAM_BOT_TOKEN?: string }

export default {
  async fetch(_req: Request, env: Env): Promise<Response> {
    const check = async (name: string, fn: () => Promise<unknown>) => {
      try { await fn(); return `ok    ${name}` } catch (e) { return `FAIL  ${name}: ${(e as Error).message}` }
    };
    const lines = [
      await check("var GREETING", async () => { if (!env.GREETING) throw new Error("missing") }),
      await check("secret TELEGRAM_BOT_TOKEN", async () => { if (!env.TELEGRAM_BOT_TOKEN) throw new Error("missing") }),
      await check("D1 (migration ran)", () => env.DB.prepare("INSERT INTO hits (ts) VALUES (?)").bind(new Date().toISOString()).run()),
      await check("KV", () => env.KV.put("last", new Date().toISOString())),
      await check("Workers AI binding", async () => { if (!env.AI) throw new Error("missing") }),
    ];
    return new Response(`[▮_▮] touchgrass deploy-button test\n\n${lines.join("\n")}\n`, { headers: { "content-type": "text/plain; charset=utf-8" } });
  },
};
