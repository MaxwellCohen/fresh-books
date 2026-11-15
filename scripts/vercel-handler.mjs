import server from "../_fresh/server.js";

export default async function handler(req, res) {
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const url = `${proto}://${req.headers.host}${req.url}`;
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: hasBody ? req : undefined,
    duplex: "half",
  });
  const response = await server.fetch(request);
  res.statusCode = response.status;
  for (const [k, v] of response.headers) {
    if (k === "set-cookie") continue;
    res.setHeader(k, v);
  }
  const cookies = response.headers.getSetCookie?.() ?? [];
  if (cookies.length) res.setHeader("set-cookie", cookies);
  if (!response.body) return res.end();
  const reader = response.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(value);
  }
  res.end();
}
