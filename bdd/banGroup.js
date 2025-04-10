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

// Function to create the "banGroup" table
const creerTableBanGroup = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banGroup (
        groupeJid text PRIMARY KEY
      );
    `);
    console.log("The 'banGroup' table has been successfully created.");
  } catch (e) {
    console.error("An error occurred while creating the 'banGroup' table:", e);
  }
};

// Call the method to create the "banGroup" table
creerTableBanGroup();

// Function to add a group to the banned groups list
async function addGroupToBanList(groupeJid) {
  const client = await pool.connect();
  try {
    // Insert the group into the "banGroup" table
    const query = "INSERT INTO banGroup (groupeJid) VALUES ($1)";
    const values = [groupeJid];

    await client.query(query, values);
    console.log(`Group JID ${groupeJid} added to the banned groups list.`);
  } catch (error) {
    console.error("Error while adding the banned group:", error);
  } finally {
    client.release();
  }
}

// Function to check if a group is banned
async function isGroupBanned(groupeJid) {
  const client = await pool.connect();
  try {
    // Check if the group exists in the "banGroup" table
    const query = "SELECT EXISTS (SELECT 1 FROM banGroup WHERE groupeJid = $1)";
    const values = [groupeJid];

    const result = await client.query(query, values);
    return result.rows[0].exists;
  } catch (error) {
    console.error("Error while checking the banned group:", error);
    return false;
  } finally {
    client.release();
  }
}

// Function to remove a group from the banned groups list
async function removeGroupFromBanList(groupeJid) {
  const client = await pool.connect();
  try {
    // Delete the group from the "banGroup" table
    const query = "DELETE FROM banGroup WHERE groupeJid = $1";
    const values = [groupeJid];

    await client.query(query, values);
    console.log(`Group JID ${groupeJid} removed from the banned groups list.`);
  } catch (error) {
    console.error("Error while removing the banned group:", error);
  } finally {
    client.release();
  }
}

module.exports = {
  addGroupToBanList,
  isGroupBanned,
  removeGroupFromBanList,
};