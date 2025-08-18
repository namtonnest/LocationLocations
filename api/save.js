// api/save.js - Vercel serverless function to save map state as a private GitHub Gist
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'Server not configured (missing GITHUB_TOKEN)' });

  try {
    // Accept either a string body or an object
    const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    // Basic size guard: reject very large payloads
    const bytes = Buffer.byteLength(bodyStr, 'utf8');
    const MAX_BYTES = 2_000_000; // 2 MB limit (adjust if needed)
    if (bytes > MAX_BYTES) return res.status(413).json({ error: 'Payload too large' });

    const resp = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: 'LocationLocations map state',
        public: false,
        files: { 'map-state.json': { content: bodyStr } }
      })
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(500).json({ error: 'Failed creating gist', detail: txt });
    }

    const j = await resp.json();
    return res.status(200).json({ url: j.html_url, raw: j.files && j.files['map-state.json'] && j.files['map-state.json'].raw_url, id: j.id });
  } catch (err) {
    return res.status(500).json({ error: err && err.message ? err.message : String(err) });
  }
}
