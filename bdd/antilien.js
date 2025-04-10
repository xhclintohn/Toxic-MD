require("dotenv").config();
const { Pool } = require("pg");
let s = require("../set");
var dbUrl = s.DATABASE_URL ? s.DATABASE_URL : "postgres://db_7xp9_user:6hwmTN7rGPNsjlBEHyX49CXwrG7cDeYi@dpg-cj7ldu5jeehc73b2p7g0-a.oregon-postgres.render.com/db_7xp9";

const proConfig = {
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false,
  },
};

const pool = new Pool(proConfig);

// Function to create the "antilien" table
async function createAntilienTable() {
  const client = await pool.connect();
  try {
    // Execute an SQL query to create the "antilien" table if it doesn't already exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS antilien (
        jid text PRIMARY KEY,
        etat text,
        action text
      );
    `);
    console.log("The 'antilien' table has been successfully created.");
  } catch (error) {
    console.error("An error occurred while creating the 'antilien' table:", error);
  } finally {
    client.release();
  }
}

// Call the method to create the "antilien" table
createAntilienTable();

async function ajouterOuMettreAJourJid(jid, etat) {
  const client = await pool.connect();
  
  try {
    // Check if the jid already exists in the 'antilien' table
    const result = await client.query('SELECT * FROM antilien WHERE jid = $1', [jid]);
    const jidExiste = result.rows.length > 0;

    if (jidExiste) {
      // If the jid exists, update the state with the value passed as an argument
      await client.query('UPDATE antilien SET etat = $1 WHERE jid = $2', [etat, jid]);
    } else {
      // If the jid doesn't exist, add it with the state passed as an argument and the default action 'supp'
      await client.query('INSERT INTO antilien (jid, etat, action) VALUES ($1, $2, $3)', [jid, etat, 'supp']);
    }
    
    console.log(`JID ${jid} successfully added or updated in the 'antilien' table.`);
  } catch (error) {
    console.error('Error while adding or updating the JID in the table:', error);
  } finally {
    client.release();
  }
};

async function mettreAJourAction(jid, action) {
  const client = await pool.connect();
  
  try {
    // Check if the jid already exists in the 'antilien' table
    const result = await client.query('SELECT * FROM antilien WHERE jid = $1', [jid]);
    const jidExiste = result.rows.length > 0;

    if (jidExiste) {
      // If the jid exists, update the action with the provided value (leaving the state unchanged)
      await client.query('UPDATE antilien SET action = $1 WHERE jid = $2', [action, jid]);
    } else {
      // If the jid doesn't exist, add it with the default state 'non' and the provided action
      await client.query('INSERT INTO antilien (jid, etat, action) VALUES ($1, $2, $3)', [jid, 'non', action]);
    }
    
    console.log(`Action successfully updated for JID ${jid} in the 'antilien' table.`);
  } catch (error) {
    console.error('Error while updating the action for the JID in the table:', error);
  } finally {
    client.release();
  }
};

async function verifierEtatJid(jid) {
  const client = await pool.connect();

  try {
    // Search for the JID in the 'antilien' table and retrieve its state
    const result = await client.query('SELECT etat FROM antilien WHERE jid = $1', [jid]);
    
    if (result.rows.length > 0) {
      const etat = result.rows[0].etat;
      return etat === 'oui';
    } else {
      // If the JID doesn't exist in the table, it is not recorded as "oui"
      return false;
    }
  } catch (error) {
    console.error('Error while checking the state of the JID in the table:', error);
    return false;
  } finally {
    client.release();
  }
};

async function recupererActionJid(jid) {
  const client = await pool.connect();

  try {
    // Search for the JID in the 'antilien' table and retrieve its action
    const result = await client.query('SELECT action FROM antilien WHERE jid = $1', [jid]);
    
    if (result.rows.length > 0) {
      const action = result.rows[0].action;
      return action;
    } else {
      // If the JID doesn't exist in the table, return a default value (e.g., 'supp')
      return 'supp';
    }
  } catch (error) {
    console.error('Error while retrieving the action of the JID in the table:', error);
    return 'supp'; // Error handling by returning a default value
  } finally {
    client.release();
  }
};

module.exports = {
  mettreAJourAction,
  ajouterOuMettreAJourJid,
  verifierEtatJid,
  recupererActionJid,
};