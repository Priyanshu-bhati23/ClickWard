const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('UPDATE "Experiment" SET "targetSelector" = \'#hero-cta\' WHERE id = \'3f487038-1b89-45f4-833f-dc09f1f59c24\' RETURNING *')
  .then(res => console.log('UPDATED:', res.rows[0]))
  .catch(err => console.error('ERROR:', err))
  .finally(() => pool.end());
