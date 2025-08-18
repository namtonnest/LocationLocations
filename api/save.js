export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    let body = req.body;
    if (!body) {
      // parse raw body
      body = await new Promise((resolve, reject) => {
        let d = '';
        req.on('data', c => d += c);
        req.on('end', () => {
          try { resolve(JSON.parse(d)); } catch (e) { resolve({ payload: d }); }
        });
        req.on('error', reject);
      });
    }
    const payload = body.payload || body;
    if (!payload) return res.status(400).json({ error: 'Missing payload' });
    const token = process.env.GIST_TOKEN;
    if (!token) return res.status(500).json({ error: 'Server misconfigured: missing GIST_TOKEN' });

    const resp = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        public: false,
        files: {
          'locationlocations_state.txt': { content: String(payload) }
        }
      })
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(500).json({ error: 'Failed to create gist', detail: data });
    return res.status(200).json({ id: data.id, html_url: data.html_url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
