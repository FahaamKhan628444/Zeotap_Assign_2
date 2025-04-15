require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { ClickHouse } = require('clickhouse');
const router = express.Router();
const stringify = require('csv-stringify');

// Initialize ClickHouse
const clickhouse = new ClickHouse({
  url: 'http://localhost',
  port: 8123,
  basicAuth: { username: 'default', password: '' }, // optional
  format: 'json',
});

router.get('/clickhouse-test', async (req, res) => {
  try {
    // Testing connection with the database directly via the ClickHouse client
    const result = await clickhouse.query('SELECT 1').toPromise();
    res.json({ data: result });
  } catch (error) {
    console.error('ClickHouse Error:', error);
    res.status(500).json({ error: 'Failed to connect to ClickHouse' });
  }
});

router.post('/ingest', async (req, res) => {
  try {
    const data = req.body; // assuming you're sending JSON
    console.log('Received Data:', data);
    // Insert data into DB or process here
    res.status(200).json({ message: 'Data ingested successfully!' });
  } catch (error) {
    console.error('Ingest error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/connect', (req, res) => {
  const { host, port, database, jwt } = req.body;
  const clickhouse = new ClickHouse({
    url: `http://${host}:${port}`,
    database,
    headers: { Authorization: `Bearer ${jwt}` }
  });
  // Store and return basic info
  res.json({ success: true });
});

router.get('/create-table', async (req, res) => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id UInt32,
      name String,
      age UInt8
    ) ENGINE = MergeTree()
    ORDER BY id
  `;

  try {
    const result = await clickhouse.query(createTableQuery).toPromise();
    res.send('Table created successfully!');
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({ error: 'Failed to create table' });
  }
});

router.post('/insert-user', async (req, res) => {
  const { id, name, age } = req.body;
  const insertQuery = `
    INSERT INTO users (id, name, age)
    VALUES (${id}, '${name}', ${age})
  `;

  try {
    const result = await clickhouse.query(insertQuery).toPromise();
    res.send('User inserted successfully!');
  } catch (error) {
    console.error('Insert error:', error);
    res.status(500).json({ error: 'Failed to insert user' });
  }
});

router.get('/clickhouse/preview/:table', async (req, res) => {
  const { table } = req.params;

  try {
    const resultSet = await clickhouse.query(`SELECT * FROM ${table} LIMIT 100`).toPromise();
    const preview = resultSet.data;
    const columns = preview.length > 0 ? Object.keys(preview[0]) : [];
    res.json({ columns, preview });
  } catch (error) {
    console.error('Preview fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch preview' });
  }
});

router.get('/get-users', async (req, res) => {
  const query = `SELECT * FROM users`;

  try {
    const resultSet = await clickhouse.query(query).toPromise();
    const users = resultSet.data;
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/export', async (req, res) => {
  const { query } = req.body;

  try {
    const resultSet = await clickhouse.query(query).toPromise();
    const rows = resultSet.data;
    const header = Object.keys(rows[0]);
    const dataRows = rows.map(row => Object.values(row));

    // Correct callback handling for stringify
    stringify([header, ...dataRows], (err, csv) => {
      if (err) {
        console.error('CSV stringify error:', err);
        return res.status(500).json({ error: 'CSV generation failed' });
      }

      res.setHeader('Content-disposition', 'attachment; filename=clickhouse_export.csv');
      res.setHeader('Content-Type', 'text/csv');
      res.send(csv);
    });

  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;
