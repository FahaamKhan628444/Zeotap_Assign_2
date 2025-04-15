// // server/index.js
// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const clickhouseRoutes = require('./clickhouseRoutes');
// const flatFileRoutes = require('./flatFileRoutes');
// const { createClient } = require('@clickhouse/client');

// const clickhouse = createClient({
//   host: 'https://mxs365to6l.asia-southeast1.gcp.clickhouse.cloud:8443',
//   username: 'default',
//   password: 'd_.SuJm.0Rd_o',
//   database: 'default', // or the one you're using
//   protocol: 'https',
// });

// dotenv.config();
// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use('/api', clickhouseRoutes);
// app.use('/api/flatfile', flatFileRoutes);
// app.use('/api', clickhouseRoutes);

// app.get('/', (req, res) => {
//   res.send('Backend is running...');
// });

// app.delete("/api/delete/:id", async (req, res) => {
//   const id = req.params.id;
//   try {
//     await db.query(`DELETE FROM users WHERE id = ?`, [id]);
//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false });
//   }
// });
// // PUT: update user by ID
// app.put("/api/update/:id", (req, res) => {
//   const { name, age } = req.body;
//   const sql = "UPDATE users SET name = ?, age = ? WHERE id = ?";
//   db.query(sql, [name, age, req.params.id], (err, result) => {
//     if (err) return res.status(500).json({ error: err });
//     return res.json({ message: "User updated successfully" });
//   });
// });


// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
// server/index.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@clickhouse/client');
const setupClickhouseRoutes = require('./clickhouseRoutes');
const setupFlatFileRoutes = require('./flatFileRoutes');
const clickhouseRoutes = require('./clickhouseRoutes');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', clickhouseRoutes); 

// ClickHouse client setup
const clickhouse = createClient({
  host: 'https://mxs365to6l.asia-southeast1.gcp.clickhouse.cloud:8443',
  username: 'default',
  password: 'd_.SuJm.0Rd_o',
  database: 'default',
  protocol: 'https',
});

// Routes setup (functions that take `app` and `clickhouse`)
setupClickhouseRoutes(app, clickhouse);
setupFlatFileRoutes(app, clickhouse);

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running...');
});

// DELETE: remove user by ID
app.delete('/api/delete/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await db.query(`DELETE FROM users WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// PUT: update user by ID
app.put('/api/update/:id', (req, res) => {
  const { name, age } = req.body;
  const sql = 'UPDATE users SET name = ?, age = ? WHERE id = ?';
  db.query(sql, [name, age, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    return res.json({ message: 'User updated successfully' });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
