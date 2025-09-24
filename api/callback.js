// api/callback.js
// Handles GitHub OAuth callback for Decap CMS.
// Env vars required in Vercel: OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET

export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) {
    return sendHtml(res, failureHtml("Missing OAuth code."));
  }

  const client_id = process.env.OAUTH_CLIENT_ID;
  const client_secret = process.env.OAUTH_CLIENT_SECRET;
  if (!client_id || !client_secret) {
    return sendHtml(res, failureHtml("Server missing OAuth env vars."));
  }

  try {
    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new URLSearchParams({ client_id, client_secret, code })
    });
    const data = await r.json();

    if (!data.access_token) {
      return sendHtml(res, failureHtml("OAuth exchange failed.", data));
    }

    const token = data.access_token;
    // Decap listens for: 'authorization:github:success:{"token":"..."}'
    const payload = JSON.stringify({ token }).replace(/</g, "\\u003c");

    const html = `<!doctype html>
<html>
  <meta charset="utf-8">
  <title>Signing in…</title>
  <body>
    <script>
      (function () {
        var msg = 'authorization:github:success:${payload}';
        try {
          if (window.opener) {
            // Using "*" for compatibility; tighten to your site origin if you prefer.
            window.opener.postMessage(msg, "*");
          }
        } catch (e) {}
        // fire twice just in case, then close
        setTimeout(function(){ try{ window.opener && window.opener.postMessage(msg, "*"); }catch(e){} }, 80);
        setTimeout(function(){ window.close(); }, 160);
      })();
    </script>
    <p>Signed in. You can close this window.</p>
  </body>
</html>`;
    return sendHtml(res, html);
  } catch (err) {
    return sendHtml(res, failureHtml("Unexpected error during OAuth.", { error: String(err) }));
  }
}

function sendHtml(res, html) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).end(html);
}

function failureHtml(message, detail) {
  const safe = (v) => JSON.stringify(v || "").replace(/</g, "\\u003c");
  const msg = safe(message);
  const det = safe(detail);
  return `<!doctype html>
<html><meta charset="utf-8"><title>Sign-in error</title><body>
<script>
  (function () {
    var msg = 'authorization:github:failure:' + ${JSON.stringify('"')} + ${JSON.stringify('"')} ; // placeholder
    try {
      var payload = { error: ${msg}, detail: ${det} };
      var wire = 'authorization:github:failure:' + JSON.stringify(payload);
      if (window.opener) window.opener.postMessage(wire, "*");
    } catch (e) {}
    setTimeout(function(){ window.close(); }, 300);
  })();
</script>
<p>Sign-in failed: ${msg}</p>
</body></html>`;
}
