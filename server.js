const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());

// Open a database connection
const db = new sqlite3.Database('crypto_data.db');

// Create a table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS crypto_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    last REAL,
    buy REAL,
    sell REAL,
    volume REAL,
    base_unit TEXT
  )
`);


app.get('/', async (req, res) => {
    try {
      const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
      const data = response.data;
  
      // Sort data by last price in descending order
      const sortedData = Object.values(data).sort((a, b) => parseFloat(b.last) - parseFloat(a.last));
      
      // Get top 10 entries
      const top10 = sortedData.slice(0, 10);
  
      // Insert top 10 data into the database
      top10.forEach(entry => {
        const { name, last, buy, sell, volume, base_unit } = entry;
        db.run(
          'INSERT INTO crypto_data (name, last, buy, sell, volume, base_unit) VALUES (?, ?, ?, ?, ?, ?)',
          [name, last, buy, sell, volume, base_unit]
        );
      });
  
      res.json({ message: 'Top 10 data fetched and stored successfully', top10 });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

app.get('/fetchAndStore', async (req, res) => {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const data = response.data;

    // Sort data by last price in descending order
    const sortedData = Object.values(data).sort((a, b) => parseFloat(b.last) - parseFloat(a.last));
    
    // Get top 10 entries
    const top10 = sortedData.slice(0, 10);

    // Insert top 10 data into the database
    top10.forEach(entry => {
      const { name, last, buy, sell, volume, base_unit } = entry;
      db.run(
        'INSERT INTO crypto_data (name, last, buy, sell, volume, base_unit) VALUES (?, ?, ?, ?, ?, ?)',
        [name, last, buy, sell, volume, base_unit]
      );
    });

    res.json({ message: 'Top 10 data fetched and stored successfully', top10 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
