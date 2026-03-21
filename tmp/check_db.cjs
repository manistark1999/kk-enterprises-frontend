const pool = require('../backend/config/db');

async function checkTables() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables:', res.rows.map(r => r.table_name).join(', '));
    
    // Check if vehicle_makes has data
    const makes = await pool.query('SELECT * FROM vehicle_makes');
    console.log('Vehicle Makes count:', makes.rowCount);
    console.log('Vehicle Makes sample:', makes.rows.slice(0, 2));
    
    // Check if vehicle_models exists
    try {
      const models = await pool.query('SELECT * FROM vehicle_models');
      console.log('Vehicle Models count:', models.rowCount);
    } catch (e) {
      console.log('Vehicle Models table NOT FOUND');
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    pool.end();
  }
}

checkTables();
