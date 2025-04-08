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

// Function to create the 'alive' table
const createAliveTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alive (
        id SERIAL PRIMARY KEY,
        message TEXT,
        lien TEXT
      );
    `);
    console.log("Alive table created successfully.");
  } catch (error) {
    console.error("Error creating 'alive' table:", error);
  }
};

// Initialize the table
createAliveTable();

// Function to add or update data in the 'alive' table
async function addOrUpdateDataInAlive(message, lien) {
  const client = await pool.connect();
  try {
    // Validate inputs
    if (typeof message !== 'string' || typeof lien !== 'string') {
      throw new Error("Message and lien must be strings.");
    }

    const query = `
      INSERT INTO alive (id, message, lien)
      VALUES (1, $1, $2)
      ON CONFLICT (id)
      DO UPDATE SET message = EXCLUDED.message, lien = EXCLUDED.lien;
    `;
    const values = [message, lien];

    await client.query(query, values);
    console.log("Data added or updated in 'alive' table successfully.");
  } catch (error) {
    console.error("Error adding or updating data in 'alive' table:", error);
    throw error; // Re-throw for bot to handle
  } finally {
    client.release();
  }
}

// Function to retrieve data from the 'alive' table
async function getDataFromAlive() {
  const client = await pool.connect();
  try {
    const query = "SELECT message, lien FROM alive WHERE id = 1";
    const result = await client.query(query);

    if (result.rows.length > 0) {
      const { message, lien } = result.rows[0];
      return { message, lien };
    } else {
      console.log("No data found in 'alive' table.");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving data from 'alive' table:", error);
    return null;
  } finally {
    client.release();
  }
}

module.exports = {
  addOrUpdateDataInAlive,
  getDataFromAlive,
};