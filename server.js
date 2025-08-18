const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');
async function ensureDir(){ try { await fs.mkdir(DATA_DIR, { recursive: true }); } catch(e){} }

const app = express();
// allow cross-origin requests from static site hosts (adjust if you want stricter CORS)
const cors = require('cors');
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.post('/api/save', async (req, res) => {
  try {
    const { payload } = req.body;
    if (!payload) return res.status(400).json({ error: 'missing payload' });
    await ensureDir();
    // generate a short id (12 hex chars)
    const id = crypto.randomBytes(6).toString('hex');
    const file = path.join(DATA_DIR, id + '.json');
    await fs.writeFile(file, JSON.stringify({ payload }), 'utf8');
    res.json({ id });
  } catch (err) { console.error(err); res.sendStatus(500); }
});

app.get('/api/load', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'missing id' });
    const p = path.join(DATA_DIR, id + '.json');
    const raw = await fs.readFile(p, 'utf8').catch(()=>null);
    if (!raw) return res.status(404).json({ error: 'not found' });
    const obj = JSON.parse(raw);
    res.json({ payload: obj.payload });
  } catch (err) { console.error(err); res.sendStatus(500); }
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log('short-save server listening on', port));
