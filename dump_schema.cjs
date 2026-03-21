const pool = require('./backend/config/db');

async function dumpSchema() {
  try {
    const res = await pool.query(`
      SELECT 
        table_name, 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);
    
    const tables = {};
    res.rows.forEach(r => {
      if (!tables[r.table_name]) tables[r.table_name] = [];
      tables[r.table_name].push({
        column: r.column_name,
        type: r.data_type,
        nullable: r.is_nullable,
        default: r.column_default
      });
    });
    
    console.log(JSON.stringify(tables, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error dumping schema:', err.message);
    process.exit(1);
  }
}

dumpSchema();
