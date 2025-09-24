// Redirects the browser to GitHub's OAuth authorize screen.
// Env var needed: OAUTH_CLIENT_ID
export default function handler(req, res) {
  const client_id = process.env.OAUTH_CLIENT_ID;
  if (!client_id) {
    return res.status(500).send("Missing OAUTH_CLIENT_ID");
  }

  // Use current deployment's host so callback stays on the same origin
  const origin = `https://${req.headers.host}`;
  const redirect_uri = `${origin}/api/callback`;

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", client_id);
  url.searchParams.set("redirect_uri", redirect_uri);
  url.searchParams.set("scope", "repo,user:email"); // repo access so Decap can commit

  res.writeHead(302, { Location: url.toString() }).end();
}
