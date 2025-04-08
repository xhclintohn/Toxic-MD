require("dotenv").config();
const { Pool } = require("pg");
const s = require("../set");

// Database URL with fallback
const dbUrl = s.DATABASE_URL || "postgres://db_7xp9_user:6hwmTN7rGPNsjlBEHyX49CXwrG7cDeYi@dpg-cj7ldu5jeehc73b2p7g0-a.oregon-postgres.render.com/db_7xp9";
const proConfig = {
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false,
  },
};

// Create a PostgreSQL connection pool
const pool = new Pool(proConfig);

// Function to create the 'sudo' table
async function createSudoTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS sudo (
        id SERIAL PRIMARY KEY,
        jid TEXT NOT NULL UNIQUE
      );
    `);
    console.log("Sudo table created successfully.");
  } catch (error) {
    console.error("Error creating 'sudo' table:", error);
  } finally {
    client.release();
  }
}

// Initialize the table
createSudoTable();

// Function to check if a JID is in the sudo list
async function issudo(jid) {
  const client = await pool.connect();
  try {
    const query = "SELECT EXISTS (SELECT 1 FROM sudo WHERE jid = $1)";
    const result = await client.query(query, [jid]);
    return result.rows[0].exists;
  } catch (error) {
    console.error(`Error checking sudo status for JID ${jid}:`, error);
    return false; // Default to false on error
  } finally {
    client.release();
  }
}

// Function to remove a JID from the sudo list
async function removeSudoNumber(jid) {
  const client = await pool.connect();
  try {
    const query = "DELETE FROM sudo WHERE jid = $1";
    const result = await client.query(query, [jid]);
    if (result.rowCount > 0) {
      console.log(`JID ${jid} removed from sudo list.`);
    } else {
      console.log(`JID ${jid} not found in sudo list, no changes made.`);
    }
  } catch (error) {
    console.error(`Error removing JID ${jid} from sudo list:`, error);
    throw error; // Re-throw for bot to handle
  } finally {
    client.release();
  }
}

// Function to add a JID to the sudo list
async function addSudoNumber(jid) {
  const client = await pool.connect();
  try {
    const query = "INSERT INTO sudo (jid) VALUES ($1) ON CONFLICT (jid) DO NOTHING";
    const result = await client.query(query, [jid]);
    if (result.rowCount > 0) {
      console.log(`JID ${jid} added to sudo list.`);
    } else {
      console.log(`JID ${jid} already exists in sudo list, no changes made.`);
    }
  } catch (error) {
    console.error(`Error adding JID ${jid} to sudo list:`, error);
    throw error;
  } finally {
    client.release();
  }
}

// Function to get all sudo JIDs
async function getAllSudoNumbers() {
  const client = await pool.connect();
  try {
    const query = "SELECT jid FROM sudo";
    const result = await client.query(query);
    return result.rows.map(row => row.jid);
  } catch (error) {
    console.error("Error retrieving sudo JIDs:", error);
    return []; // Return empty array on error
  } finally {
    client.release();
  }
}

// Function to check if the sudo table is not empty
async function isSudoTableNotEmpty() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT COUNT(*) FROM sudo');
    const rowCount = parseInt(result.rows[0].count, 10);
    return rowCount > 0;
  } catch (error) {
    console.error("Error checking if 'sudo' table is empty:", error);
    return false; // Default to false on error
  } finally {
    client.release();
  }
}

module.exports = {
  issudo,
  addSudoNumber,
  removeSudoNumber,
  getAllSudoNumbers,
  isSudoTableNotEmpty
};