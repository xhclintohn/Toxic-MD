// Import dotenv and load environment variables from the .env file
require("dotenv").config();

const { Pool } = require("pg");

// Use the 'set' module to get the DATABASE_URL value from your configurations
const s = require("../set");

// Retrieve the database URL from the s.DATABASE_URL variable
var dbUrl = s.DATABASE_URL ? s.DATABASE_URL : "postgres://db_7xp9_user:6hwmTN7rGPNsjlBEHyX49CXwrG7cDeYi@dpg-cj7ldu5jeehc73b2p7g0-a.oregon-postgres.render.com/db_7xp9";
const proConfig = {
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false,
  },
};

// Create a PostgreSQL connection pool
const pool = new Pool(proConfig);

// You can now use 'pool' to interact with your PostgreSQL database.
const creerTableBanUser = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banUser (
        jid text PRIMARY KEY
      );
    `);
    console.log("The 'banUser' table has been successfully created.");
  } catch (e) {
    console.error("An error occurred while creating the 'banUser' table:", e);
  }
};

// Call the method to create the "banUser" table
creerTableBanUser();

// Function to add a user to the banned list
async function addUserToBanList(jid) {
  const client = await pool.connect();
  try {
    // Insert the user into the "banUser" table
    const query = "INSERT INTO banUser (jid) VALUES ($1)";
    const values = [jid];

    await client.query(query, values);
    console.log(`JID ${jid} added to the banned list.`);
  } catch (error) {
    console.error("Error while adding the banned user:", error);
  } finally {
    client.release();
  }
}

// Function to check if a user is banned
async function isUserBanned(jid) {
  const client = await pool.connect();
  try {
    // Check if the user exists in the "banUser" table
    const query = "SELECT EXISTS (SELECT 1 FROM banUser WHERE jid = $1)";
    const values = [jid];

    const result = await client.query(query, values);
    return result.rows[0].exists;
  } catch (error) {
    console.error("Error while checking the banned user:", error);
    return false;
  } finally {
    client.release();
  }
}

// Function to remove a user from the banned list
async function removeUserFromBanList(jid) {
  const client = await pool.connect();
  try {
    // Delete the user from the "banUser" table
    const query = "DELETE FROM banUser WHERE jid = $1";
    const values = [jid];

    await client.query(query, values);
    console.log(`JID ${jid} removed from the banned list.`);
  } catch (error) {
    console.error("Error while removing the banned user:", error);
  } finally {
    client.release();
  }
}

module.exports = {
  addUserToBanList,
  isUserBanned,
  removeUserFromBanList,
};