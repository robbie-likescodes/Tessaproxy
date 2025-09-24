// Exchanges the ?code GitHub returns for an access token and
// returns { token, provider: "github" } in the format Decap expects.
// Env vars needed: OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET
export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing code");

  const client_id = process.env.OAUTH_CLIENT_ID;
  const client_secret = process.env.OAUTH_CLIENT_SECRET;
  if (!client_id || !client_secret) {
    return res.status(500).send("Missing OAuth env vars");
  }

  const r = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Accept": "application/json" },
    body: new URLSearchParams({ client_id, client_secret, code })
  });
  const data = await r.json();

  if (!data.access_token) {
    return res.status(401).json({ error: "oauth_failed", detail: data });
  }

  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ token: data.access_token, provider: "github" }));
}
