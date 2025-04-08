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

const pool = new Pool(proConfig);

// Function to create the 'antibot' table
async function createAntibotTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS antibot (
        jid TEXT PRIMARY KEY,
        etat TEXT DEFAULT 'off',
        action TEXT DEFAULT 'supp'
      );
    `);
    console.log("Antibot table created successfully.");
  } catch (error) {
    console.error("Error creating 'antibot' table:", error);
  } finally {
    client.release();
  }
}

// Initialize the table
createAntibotTable();

// Function to add or update a JID’s state
async function atbajouterOuMettreAJourJid(jid, etat) {
  const client = await pool.connect();
  try {
    // Validate etat
    if (!['on', 'off'].includes(etat)) {
      throw new Error(`Invalid etat value: ${etat}. Use 'on' or 'off'.`);
    }

    const result = await client.query('SELECT * FROM antibot WHERE jid = $1', [jid]);
    const jidExists = result.rows.length > 0;

    if (jidExists) {
      await client.query('UPDATE antibot SET etat = $1 WHERE jid = $2', [etat, jid]);
      console.log(`JID ${jid} updated with etat ${etat} in 'antibot' table.`);
    } else {
      await client.query('INSERT INTO antibot (jid, etat, action) VALUES ($1, $2, $3)', [jid, etat, 'supp']);
      console.log(`JID ${jid} added with etat ${etat} and default action 'supp' in 'antibot' table.`);
    }
  } catch (error) {
    console.error(`Error updating or adding JID ${jid} in 'antibot' table:`, error);
    throw error; // Re-throw for bot to handle
  } finally {
    client.release();
  }
}

// Function to update a JID’s action
async function atbmettreAJourAction(jid, action) {
  const client = await pool.connect();
  try {
    // Validate action
    const validActions = ['supp', 'kick', 'ban']; // Adjust based on your bot’s logic
    if (!validActions.includes(action)) {
      throw new Error(`Invalid action value: ${action}. Use 'supp', 'kick', or 'ban'.`);
    }

    const result = await client.query('SELECT * FROM antibot WHERE jid = $1', [jid]);
    const jidExists = result.rows.length > 0;

    if (jidExists) {
      await client.query('UPDATE antibot SET action = $1 WHERE jid = $2', [action, jid]);
      console.log(`Action updated to ${action} for JID ${jid} in 'antibot' table.`);
    } else {
      await client.query('INSERT INTO antibot (jid, etat, action) VALUES ($1, $2, $3)', [jid, 'off', action]);
      console.log(`JID ${jid} added with etat 'off' and action ${action} in 'antibot' table.`);
    }
  } catch (error) {
    console.error(`Error updating action for JID ${jid} in 'antibot' table:`, error);
    throw error;
  } finally {
    client.release();
  }
}

// Function to check a JID’s state
async function atbverifierEtatJid(jid) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT etat FROM antibot WHERE jid = $1', [jid]);
    return result.rows.length > 0 ? result.rows[0].etat === 'on' : false;
  } catch (error) {
    console.error(`Error checking etat for JID ${jid} in 'antibot' table:`, error);
    return false; // Default to false on error
  } finally {
    client.release();
  }
}

// Function to retrieve a JID’s action
async function atbrecupererActionJid(jid) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT action FROM antibot WHERE jid = $1', [jid]);
    return result.rows.length > 0 ? result.rows[0].action : 'supp';
  } catch (error) {
    console.error(`Error retrieving action for JID ${jid} in 'antibot' table:`, error);
    return 'supp'; // Default on error
  } finally {
    client.release();
  }
}

module.exports = {
  atbmettreAJourAction,
  atbajouterOuMettreAJourJid,
  atbverifierEtatJid,
  atbrecupererActionJid,
};