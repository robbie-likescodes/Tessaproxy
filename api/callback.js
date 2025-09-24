export default async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.status(400).send("Missing code");

  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Accept": "application/json" },
    body: new URLSearchParams({ client_id, client_secret, code })
  }).then(r => r.json());

  if (!tokenRes.access_token) {
    return res.status(401).json({ error: "oauth_failed", detail: tokenRes });
  }

  // Decap expects JSON with { token, provider }
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ token: tokenRes.access_token, provider: "github" }));
}
