require("dotenv").config();
const { Pool } = require("pg");
const s = require("../set");

// Get the database URL from s.DATABASE_URL or use a fallback
const dbUrl = s.DATABASE_URL || "postgres://db_7xp9_user:6hwmTN7rGPNsjlBEHyX49CXwrG7cDeYi@dpg-cj7ldu5jeehc73b2p7g0-a.oregon-postgres.render.com/db_7xp9";
const proConfig = {
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false,
  },
};

// Create a PostgreSQL connection pool
const pool = new Pool(proConfig);

// Create the 'events' table if it doesn’t exist
const createEventsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        jid TEXT UNIQUE,
        welcome TEXT DEFAULT 'off',
        goodbye TEXT DEFAULT 'off',
        antipromote TEXT DEFAULT 'off',
        antidemote TEXT DEFAULT 'off'
      );
    `);
    console.log("Events table created successfully.");
  } catch (error) {
    console.error("Error creating 'events' table:", error);
  }
};

// Initialize the table
createEventsTable();

// Function to set or update a value in the events table
async function attribuerUnevaleur(jid, row, valeur) {
  const client = await pool.connect();
  try {
    // Validate the row to prevent SQL injection
    const validRows = ['welcome', 'goodbye', 'antipromote', 'antidemote'];
    if (!validRows.includes(row)) {
      throw new Error(`Invalid column name: ${row}`);
    }

    // Check if the jid already exists
    const result = await client.query('SELECT * FROM events WHERE jid = $1', [jid]);
    const jidExists = result.rows.length > 0;

    if (jidExists) {
      // Update the existing row
      await client.query(`UPDATE events SET ${row} = $1 WHERE jid = $2`, [valeur, jid]);
      console.log(`${row} updated to ${valeur} for jid ${jid}`);
    } else {
      // Insert a new row
      await client.query(`INSERT INTO events (jid, ${row}) VALUES ($1, $2)`, [jid, valeur]);
      console.log(`New jid ${jid} added with ${row} set to ${valeur}`);
    }
  } catch (error) {
    console.error(`Error updating events for ${row}:`, error);
    throw error; // Re-throw to let the caller handle it
  } finally {
    client.release();
  }
}

// Function to retrieve a value from the events table
async function recupevents(jid, row) {
  const client = await pool.connect();
  try {
    // Validate the row
    const validRows = ['welcome', 'goodbye', 'antipromote', 'antidemote'];
    if (!validRows.includes(row)) {
      throw new Error(`Invalid column name: ${row}`);
    }

    const result = await client.query(`SELECT ${row} FROM events WHERE jid = $1`, [jid]);
    const jidExists = result.rows.length > 0;

    return jidExists ? result.rows[0][row] : 'off';
  } catch (error) {
    console.error(`Error retrieving ${row} for jid ${jid}:`, error);
    return 'off'; // Default fallback on error
  } finally {
    client.release();
  }
}

module.exports = {
  attribuerUnevaleur,
  recupevents,
};