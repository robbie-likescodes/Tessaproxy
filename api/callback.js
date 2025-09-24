export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return sendHtml(res, failHtml("Missing OAuth code."));

  const client_id = process.env.OAUTH_CLIENT_ID;
  const client_secret = process.env.OAUTH_CLIENT_SECRET;
  if (!client_id || !client_secret) {
    return sendHtml(res, failHtml("Missing OAuth env vars on server."));
  }

  try {
    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new URLSearchParams({ client_id, client_secret, code })
    });
    const data = await r.json();
    if (!data.access_token) return sendHtml(res, failHtml("OAuth exchange failed.", data));

    const token = data.access_token;
    const payload = JSON.stringify({ token, provider: "github" }).replace(/</g, "\\u003c");

    const html = `<!doctype html>
<html><meta charset="utf-8"><title>Signing in…</title>
<body>
<script>
  (function () {
    // Try to target the opener's exact origin (GitHub Pages), fall back to "*"
    var openerOrigin = (document.referrer ? new URL(document.referrer).origin : "*");
    var msg = 'authorization:github:success:${payload}';
    try { if (window.opener) window.opener.postMessage(msg, openerOrigin); } catch(e) {}
    setTimeout(function(){ try { window.opener && window.opener.postMessage(msg, openerOrigin); } catch(e) {} }, 80);
    setTimeout(function(){ window.close(); }, 160);
  })();
</script>
<p>Signed in. You can close this window.</p>
</body></html>`;
    return sendHtml(res, html);
  } catch (e) {
    return sendHtml(res, failHtml("Unexpected error.", String(e)));
  }
}

function sendHtml(res, html) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).end(html);
}
function failHtml(message, detail) {
  const safe = v => (v ? String(v) : "");
  return `<!doctype html>
<html><meta charset="utf-8"><title>Sign-in error</title>
<body>
<p>Sign-in failed: ${safe(message)}</p>
<pre style="white-space:pre-wrap">${safe(detail)}</pre>
<script>
  (function () {
    var wire = 'authorization:github:failure:' + JSON.stringify({ error: ${JSON.stringify(message)} });
    try { if (window.opener) window.opener.postMessage(wire, (document.referrer ? new URL(document.referrer).origin : "*")); } catch(e) {}
    setTimeout(function(){ window.close(); }, 600);
  })();
</script>
</body></html>`;
}
