const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createNewExp() {
  // Find userId from existing experiment
  const userRes = await pool.query('SELECT "userId" FROM "Experiment" LIMIT 1');
  const userId = userRes.rows[0]?.userId || 'demo-user';

  const expId = require('crypto').randomUUID();
  const vControlId = require('crypto').randomUUID();
  const vVariantAId = require('crypto').randomUUID();

  await pool.query(
    `INSERT INTO "Experiment" (id, "userId", name, description, goal, status, "targetSelector", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
    [
      expId,
      userId,
      'BuildFast Hero CTA Conversion Test',
      'A/B testing Hero CTA copy on https://click-ward-test-site.vercel.app/',
      'Click',
      'Active',
      '#hero-cta'
    ]
  );

  await pool.query(
    `INSERT INTO "Variant" (id, "experimentId", name, headline, description, "ctaText", allocation, visits, conversions, "createdAt", "updatedAt")
     VALUES 
     ($1, $2, 'Control', 'Ship products 10x faster', 'The AI-powered development platform', 'Get Started Free', 50, 0, 0, NOW(), NOW()),
     ($3, $2, 'Variant A - High Urgency', 'Build & Ship 10x Faster', 'Automate your workflow with AI pair programming', 'Start Shipping Now 🚀', 50, 0, 0, NOW(), NOW())`,
    [vControlId, expId, vVariantAId]
  );

  console.log('NEW_EXPERIMENT_CREATED:', expId);
}

createNewExp()
  .catch(err => console.error('ERROR:', err))
  .finally(() => pool.end());
