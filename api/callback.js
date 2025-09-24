// Exchanges the ?code for a GitHub access token and posts it back to Decap CMS.
// Returns a small HTML page that postMessages the token and closes the popup.

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
    headers: { Accept: "application/json" },
    body: new URLSearchParams({ client_id, client_secret, code })
  });
  const data = await r.json();

  if (!data.access_token) {
    return res.status(401).json({ error: "oauth_failed", detail: data });
  }

  const token = data.access_token;

  // IMPORTANT: Decap listens for a postMessage in this format:
  // 'authorization:github:success:{"token":"..."}'
  const payload = JSON.stringify({ token }).replace(/</g, "\\u003c");

  const html = `<!doctype html>
<html><body>
<script>
  (function() {
    var msg = 'authorization:github:success:${payload}';
    function send() {
      try {
        if (window.opener) {
          window.opener.postMessage(msg, '*');
        }
      } catch (e) {}
    }
    send();
    // Try a couple of times for safety, then close.
    setTimeout(send, 100);
    setTimeout(function(){ window.close(); }, 200);
  })();
</script>
<p>Login successful. You can close this window.</p>
</body></html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).end(html);
}
