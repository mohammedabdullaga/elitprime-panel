const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { initDb } = require('./db');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES_IN = '8h';

let dbPromise = initDb();

function normalizeSettings(rows) {
  return rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required.' });
    }

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !JWT_SECRET) {
      return res.status(500).json({ error: 'Authentication is not configured on the server.' });
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid.' });
  }

  const token = authHeader.slice(7).trim();
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
    req.user = decoded;
    next();
  });
}

router.use(['/hosts', '/proxies', '/settings'], authenticateJWT);

// Hosts
router.get('/hosts', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const hosts = await db.all('SELECT * FROM hosts ORDER BY priority ASC, id ASC');
    res.json(hosts);
  } catch (err) {
    next(err);
  }
});

router.post('/hosts', async (req, res, next) => {
  try {
    const { url, status = 'active', priority = 0 } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Host url is required.' });
    }
    const db = await dbPromise;
    const result = await db.run(
      'INSERT INTO hosts (url, status, priority) VALUES (?, ?, ?)',
      url,
      status,
      priority,
    );
    const host = await db.get('SELECT * FROM hosts WHERE id = ?', result.lastID);
    res.status(201).json(host);
  } catch (err) {
    next(err);
  }
});

router.put('/hosts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { url, status, priority } = req.body;
    const db = await dbPromise;
    const existing = await db.get('SELECT * FROM hosts WHERE id = ?', id);
    if (!existing) {
      return res.status(404).json({ error: 'Host not found.' });
    }

    const updatedUrl = url ?? existing.url;
    const updatedStatus = status ?? existing.status;
    const updatedPriority = priority ?? existing.priority;

    await db.run(
      'UPDATE hosts SET url = ?, status = ?, priority = ? WHERE id = ?',
      updatedUrl,
      updatedStatus,
      updatedPriority,
      id,
    );
    const host = await db.get('SELECT * FROM hosts WHERE id = ?', id);
    res.json(host);
  } catch (err) {
    next(err);
  }
});

router.delete('/hosts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    const result = await db.run('DELETE FROM hosts WHERE id = ?', id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Host not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Proxies
router.get('/proxies', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const proxies = await db.all('SELECT * FROM proxies ORDER BY id ASC');
    res.json(proxies);
  } catch (err) {
    next(err);
  }
});

router.post('/proxies', async (req, res, next) => {
  try {
    const { host } = req.body;
    if (!host) {
      return res.status(400).json({ error: 'Proxy host is required.' });
    }
    const db = await dbPromise;
    const result = await db.run(
      'INSERT INTO proxies (host) VALUES (?)',
      host,
    );
    const proxy = await db.get('SELECT * FROM proxies WHERE id = ?', result.lastID);
    res.status(201).json(proxy);
  } catch (err) {
    next(err);
  }
});

router.put('/proxies/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { host } = req.body;
    const db = await dbPromise;
    const existing = await db.get('SELECT * FROM proxies WHERE id = ?', id);
    if (!existing) {
      return res.status(404).json({ error: 'Proxy not found.' });
    }

    const updatedHost = host ?? existing.host;

    await db.run(
      'UPDATE proxies SET host = ? WHERE id = ?',
      updatedHost,
      id,
    );
    const proxy = await db.get('SELECT * FROM proxies WHERE id = ?', id);
    res.json(proxy);
  } catch (err) {
    next(err);
  }
});

router.delete('/proxies/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    const result = await db.run('DELETE FROM proxies WHERE id = ?', id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Proxy not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Settings
router.get('/settings', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const rows = await db.all('SELECT * FROM settings');
    res.json(normalizeSettings(rows));
  } catch (err) {
    next(err);
  }
});

router.put('/settings', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const body = req.body;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ error: 'Request body must be an object with key/value pairs.' });
    }

    const entries = Object.entries(body);
    if (entries.length === 0) {
      return res.status(400).json({ error: 'At least one setting key/value must be provided.' });
    }

    const insertOrUpdate = 'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value';

    await db.run('BEGIN TRANSACTION');
    for (const [key, value] of entries) {
      if (typeof value === 'undefined' || value === null) {
        continue;
      }
      await db.run(insertOrUpdate, key, String(value));
    }
    await db.run('COMMIT');

    const rows = await db.all('SELECT * FROM settings');
    res.json(normalizeSettings(rows));
  } catch (err) {
    try {
      const db = await dbPromise;
      await db.run('ROLLBACK');
    } catch (_rollbackError) {
      // ignore rollback error
    }
    next(err);
  }
});

// App config endpoint
router.get('/config', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const settings = normalizeSettings(await db.all('SELECT * FROM settings'));
    const hosts = await db.all(
      "SELECT * FROM hosts WHERE status = 'active' ORDER BY priority ASC, id ASC"
    );
    const proxyRows = await db.all('SELECT host FROM proxies ORDER BY id ASC');
    const proxyHosts = proxyRows.map((row) => row.host);

    res.json({
      tmdb_api_key: settings.tmdb_api_key || null,
      hosts,
      proxy_host: proxyHosts[0] || null,
      proxy_hosts: proxyHosts,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
