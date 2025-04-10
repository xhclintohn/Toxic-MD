// Import dotenv and load environment variables from the .env file
require("dotenv").config();

const { Pool } = require("pg");

// Use the 'set' module to get the DATABASE_URL value from your configurations
const s = require("../set");

// Retrieve the database URL from the s.DATABASE_URL variable
const dbUrl = s.DATABASE_URL ? s.DATABASE_URL : "postgres://db_7xp9_user:6hwmTN7rGPNsjlBEHyX49CXwrG7cDeYi@dpg-cj7ldu5jeehc73b2p7g0-a.oregon-postgres.render.com/db_7xp9";
const proConfig = {
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false,
  },
};

// Create a PostgreSQL connection pool
const pool = new Pool(proConfig);

async function createUsersRankTable() {
  const client = await pool.connect();

  try {
    // Create the users_rank table if it doesn't already exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users_rank (
        id SERIAL PRIMARY KEY,
        jid VARCHAR(255) UNIQUE,
        xp INTEGER DEFAULT 0,
        messages INTEGER DEFAULT 0
      );
    `);
  } catch (error) {
    console.error('Error while creating the users_rank table:', error);
  } finally {
    client.release();
  }
}

async function ajouterOuMettreAJourUserData(jid) {
  const client = await pool.connect();

  try {
    // Check if the JID already exists in the 'users_rank' table
    const result = await client.query('SELECT * FROM users_rank WHERE jid = $1', [jid]);
    const jidExiste = result.rows.length > 0;

    if (jidExiste) {
      // If the JID exists, update XP (+10) and messages (+1)
      await client.query('UPDATE users_rank SET xp = xp + 10, messages = messages + 1 WHERE jid = $1', [jid]);
    } else {
      // If the JID doesn't exist, add it with XP = 10 and messages = 1
      await client.query('INSERT INTO users_rank (jid, xp, messages) VALUES ($1, $2, $3)', [jid, 10, 1]);
    }

  } catch (error) {
    console.error('Error while updating user data:', error);
  } finally {
    client.release();
  }
};

async function getMessagesAndXPByJID(jid) {
  const client = await pool.connect();

  try {
    // Select the number of messages and XP for the given JID
    const query = 'SELECT messages, xp FROM users_rank WHERE jid = $1';
    const result = await client.query(query, [jid]);

    if (result.rows.length > 0) {
      // Return the values of messages and XP
      const { messages, xp } = result.rows[0];
      return { messages, xp };
    } else {
      // If the JID doesn't exist, return default values (0 messages and 0 XP)
      return { messages: 0, xp: 0 };
    }
  } catch (error) {
    console.error('Error while retrieving user data:', error);
    return { messages: 0, xp: 0 }; // In case of error, return default values
  } finally {
    client.release();
  }
}

async function getBottom10Users() {
  const client = await pool.connect();

  try {
    // Select the top 10 users ranked by XP in descending order (highest to lowest)
    const query = 'SELECT jid, xp, messages FROM users_rank ORDER BY xp DESC LIMIT 10';
    const result = await client.query(query);

    // Return the array of users
    return result.rows;
  } catch (error) {
    console.error('Error while retrieving the top 10 users:', error);
    return []; // In case of error, return an empty array
  } finally {
    client.release();
  }
}

// Execute the table creation function during initialization
createUsersRankTable();

module.exports = {
  ajouterOuMettreAJourUserData,
  getMessagesAndXPByJID,
  getBottom10Users,
};