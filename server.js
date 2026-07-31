require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const { initDb } = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.options('*', cors({ origin: true }));
app.use(express.json());
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('IPTV config backend is running. Use /api endpoints.');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

(async () => {
  try {
    await initDb();
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
