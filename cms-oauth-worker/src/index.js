// Minimal GitHub OAuth provider for Decap CMS, deployed as its own
// Cloudflare Worker (separate from the Pages static site). Implements the
// same two-step handshake Decap's `github` backend expects:
//
//   1. GET  /auth              -> redirect to GitHub's authorize screen
//   2. GET  /callback?code=... -> exchange code for a token, post it back
//                                  to the CMS popup window via postMessage
//
// Required secrets (set with `wrangler secret put <name>`):
//   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
// Optional var (wrangler.toml [vars]): GITHUB_OAUTH_SCOPE (default "repo")

function htmlResponse(body) {
  return new Response(body, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

function renderMessage(status, provider, payload) {
  // Matches the postMessage protocol Netlify/Decap CMS's github backend
  // listens for: "authorization:<provider>:<status>:<json>"
  const message = `authorization:${provider}:${status}:${JSON.stringify(payload)}`;
  return htmlResponse(`<!doctype html>
<html>
  <body>
    <script>
      (function () {
        function receiveMessage(e) {
          window.opener.postMessage(
            ${JSON.stringify(message)},
            e.origin
          );
          window.removeEventListener('message', receiveMessage, false);
        }
        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:${provider}', '*');
      })();
    </script>
  </body>
</html>`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
      authorizeUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authorizeUrl.searchParams.set('scope', env.GITHUB_OAUTH_SCOPE || 'repo');
      authorizeUrl.searchParams.set(
        'redirect_uri',
        `${url.origin}/callback`
      );
      return Response.redirect(authorizeUrl.toString(), 302);
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) {
        return renderMessage('error', 'github', {
          error: 'missing_code',
        });
      }

      const tokenRes = await fetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
          }),
        }
      );

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || tokenData.error) {
        return renderMessage('error', 'github', {
          error: tokenData.error || 'token_exchange_failed',
          error_description: tokenData.error_description,
        });
      }

      return renderMessage('success', 'github', {
        token: tokenData.access_token,
        provider: 'github',
      });
    }

    return new Response('Not found', { status: 404 });
  },
};
