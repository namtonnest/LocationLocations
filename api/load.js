export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const id = req.query && (req.query.id || req.query.gist) || (new URL(req.url, 'http://localhost')).searchParams.get('id');
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const resp = await fetch('https://api.github.com/gists/' + encodeURIComponent(id), {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(500).json({ error: 'Failed to fetch gist', detail: data });
    // find the file with the state
    const files = data.files || {};
    const first = Object.values(files)[0];
    if (!first) return res.status(404).json({ error: 'No files in gist' });
    const content = first.content;
    return res.status(200).json({ id: data.id, content, html_url: data.html_url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
