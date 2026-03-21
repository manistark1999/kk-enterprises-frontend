const pool = require("../config/db");
const bcrypt = require("bcryptjs");

const runStatements = async (statements) => {
  for (const statement of statements) {
    await pool.query(statement);
  }
};

const ensureConstraint = async (constraintName, statement) => {
  const existing = await pool.query(
    "SELECT 1 FROM pg_constraint WHERE conname = $1 LIMIT 1",
    [constraintName]
  );

  if (!existing.rows.length) {
    await pool.query(statement);
  }
};

const ensureIndex = async (indexName, statement) => {
  const existing = await pool.query(
    "SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = $1 LIMIT 1",
    [indexName]
  );

  if (!existing.rows.length) {
    await pool.query(statement);
  }
};

let hasInitialized = false;

const initializeDatabase = async () => {
  if (hasInitialized) {
    return;
  }

  // Create users table first
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ensure columns exist if table already exists
  try {
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(100)");
  } catch (err) { }

  // Ensure default admin user exists with standard credentials
  const adminEmail = 'admin@kkenterprises.com';
  const adminUsername = 'admin';
  
  // Check if admin exists by username or email
  const checkAdmin = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $2", [adminEmail, adminUsername]);
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  if (checkAdmin.rows.length === 0) {
    await pool.query(
      "INSERT INTO users (username, name, email, password, role) VALUES ($1, $2, $3, $4, $5)",
      [adminUsername, 'Administrator', adminEmail, hashedPassword, 'admin']
    );
    console.log("[DB] Default admin user created");
  } else {
    // Update existing user to be the standard admin
    const user = checkAdmin.rows[0];
    await pool.query(
      "UPDATE users SET email = $1, username = $2, password = $3, role = 'admin', name = $4 WHERE id = $5",
      [adminEmail, adminUsername, hashedPassword, 'Administrator', user.id]
    );
    console.log("[DB] Admin user account updated and password hashed");
  }

  await runStatements([
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      table_name VARCHAR(100) NOT NULL,
      record_id VARCHAR(100),
      action VARCHAR(20) NOT NULL,
      changed_data JSONB DEFAULT '{}'::jsonb,
      performed_by VARCHAR(100) DEFAULT 'system',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS history (
      id SERIAL PRIMARY KEY,
      module_name VARCHAR(100) NOT NULL,
      action_type VARCHAR(20) NOT NULL,
      record_id VARCHAR(100),
      title VARCHAR(255),
      description TEXT,
      changed_data JSONB DEFAULT '{}'::jsonb,
      user_name VARCHAR(100) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      customer_code VARCHAR(30),
      customer_name VARCHAR(150) NOT NULL,
      contact_person VARCHAR(150),
      phone VARCHAR(30),
      alternate_phone VARCHAR(30),
      email VARCHAR(150),
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      pincode VARCHAR(20),
      gst_no VARCHAR(50),
      opening_balance NUMERIC(14,2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_code VARCHAR(30)`,
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_name VARCHAR(150)`,
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS contact_person VARCHAR(150)`,
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone VARCHAR(30)`,
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(30)`,
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS email VARCHAR(150)`,
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT`,
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS city VARCHAR(100)`,
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS state VARCHAR(100)`,
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS pincode VARCHAR(20)`,
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS gst_no VARCHAR(50)`,
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS opening_balance NUMERIC(14,2) DEFAULT 0`,
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`,
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,

    `CREATE TABLE IF NOT EXISTS suppliers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      contact_person VARCHAR(150),
      category VARCHAR(100),
      company VARCHAR(150),
      phone VARCHAR(30),
      mobile VARCHAR(30),
      email VARCHAR(150),
      gst_number VARCHAR(50),
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      pincode VARCHAR(20),
      credit_limit NUMERIC(14,2) DEFAULT 0,
      credit_days INTEGER DEFAULT 0,
      bank_account VARCHAR(100),
      ifsc_code VARCHAR(30),
      status VARCHAR(20) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS phone VARCHAR(30)`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS mobile VARCHAR(30)`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS category VARCHAR(100)`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS company VARCHAR(150)`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(14,2) DEFAULT 0`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS credit_days INTEGER DEFAULT 0`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS bank_account VARCHAR(100)`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(30)`,
    `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,

    `CREATE TABLE IF NOT EXISTS transports (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      contact_person VARCHAR(150),
      phone VARCHAR(30),
      email VARCHAR(150),
      address TEXT,
      gst_no VARCHAR(50),
      status VARCHAR(20) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE transports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,

    `CREATE TABLE IF NOT EXISTS staff (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      designation VARCHAR(120),
      mobile VARCHAR(30),
      email VARCHAR(150),
      joining_date DATE,
      salary NUMERIC(14,2) DEFAULT 0,
      address TEXT,
      bank_account VARCHAR(100),
      ifsc_code VARCHAR(30),
      status VARCHAR(20) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE staff ADD COLUMN IF NOT EXISTS designation VARCHAR(120)`,
    `ALTER TABLE staff ADD COLUMN IF NOT EXISTS mobile VARCHAR(30)`,
    `ALTER TABLE staff ADD COLUMN IF NOT EXISTS email VARCHAR(150)`,
    `ALTER TABLE staff ADD COLUMN IF NOT EXISTS joining_date DATE`,
    `ALTER TABLE staff ADD COLUMN IF NOT EXISTS salary NUMERIC(14,2) DEFAULT 0`,
    `ALTER TABLE staff ADD COLUMN IF NOT EXISTS address TEXT`,
    `ALTER TABLE staff ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active'`,
    `ALTER TABLE staff ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    `ALTER TABLE staff ADD COLUMN IF NOT EXISTS bank_account VARCHAR(100)`,
    `ALTER TABLE staff ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(30)`,

    `CREATE TABLE IF NOT EXISTS brands (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      manufacturer VARCHAR(150),
      category VARCHAR(100),
      country VARCHAR(100),
      description TEXT,
      status VARCHAR(20) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE brands ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(150)`,
    `ALTER TABLE brands ADD COLUMN IF NOT EXISTS category VARCHAR(100)`,
    `ALTER TABLE brands ADD COLUMN IF NOT EXISTS country VARCHAR(100)`,
    `ALTER TABLE brands ADD COLUMN IF NOT EXISTS description TEXT`,
    `ALTER TABLE brands ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active'`,
    `ALTER TABLE brands ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,

    `CREATE TABLE IF NOT EXISTS company_settings (
      id SERIAL PRIMARY KEY,
      company_name VARCHAR(200) NOT NULL,
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      pincode VARCHAR(20),
      phone VARCHAR(50),
      email VARCHAR(150),
      gst_number VARCHAR(50),
      website VARCHAR(150),
      logo_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS logo_url TEXT`,
    `ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,

    `CREATE TABLE IF NOT EXISTS vehicle_makes (
      id SERIAL PRIMARY KEY,
      make_name VARCHAR(120) NOT NULL,
      name VARCHAR(120),
      models JSONB DEFAULT '[]'::jsonb,
      vehicle_type VARCHAR(80),
      country VARCHAR(80),
      status VARCHAR(20) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS vehicle_models (
      id SERIAL PRIMARY KEY,
      make_id INTEGER REFERENCES vehicle_makes(id) ON DELETE CASCADE,
      model_name VARCHAR(120) NOT NULL,
      status VARCHAR(20) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE vehicle_makes ADD COLUMN IF NOT EXISTS make_name VARCHAR(120)`,
    `ALTER TABLE vehicle_makes ADD COLUMN IF NOT EXISTS name VARCHAR(120)`,
    `ALTER TABLE vehicle_makes ADD COLUMN IF NOT EXISTS models JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE vehicle_makes ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(80)`,
    `ALTER TABLE vehicle_makes ADD COLUMN IF NOT EXISTS country VARCHAR(80)`,
    `ALTER TABLE vehicle_makes ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active'`,
    `ALTER TABLE vehicle_makes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,

    `CREATE TABLE IF NOT EXISTS vehicle_register (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER,
      vehicle_number VARCHAR(30) NOT NULL,
      owner_name VARCHAR(150),
      mobile VARCHAR(30),
      vehicle_make VARCHAR(120),
      model VARCHAR(120),
      fuel_type VARCHAR(50),
      chassis_number VARCHAR(80),
      engine_number VARCHAR(80),
      color VARCHAR(50),
      year INTEGER,
      status VARCHAR(20) DEFAULT 'Active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE vehicle_register ADD COLUMN IF NOT EXISTS customer_id INTEGER`,
    `ALTER TABLE vehicle_register ADD COLUMN IF NOT EXISTS vehicle_number VARCHAR(30)`,
    `ALTER TABLE vehicle_register ADD COLUMN IF NOT EXISTS owner_name VARCHAR(150)`,
    `ALTER TABLE vehicle_register ADD COLUMN IF NOT EXISTS mobile VARCHAR(30)`,
    `ALTER TABLE vehicle_register ADD COLUMN IF NOT EXISTS vehicle_make VARCHAR(120)`,
    `ALTER TABLE vehicle_register ADD COLUMN IF NOT EXISTS model VARCHAR(120)`,
    `ALTER TABLE vehicle_register ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(50)`,
    `ALTER TABLE vehicle_register ADD COLUMN IF NOT EXISTS chassis_number VARCHAR(80)`,
    `ALTER TABLE vehicle_register ADD COLUMN IF NOT EXISTS engine_number VARCHAR(80)`,
    `ALTER TABLE vehicle_register ADD COLUMN IF NOT EXISTS color VARCHAR(50)`,
    `ALTER TABLE vehicle_register ADD COLUMN IF NOT EXISTS year INTEGER`,
    `ALTER TABLE vehicle_register ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active'`,
    `ALTER TABLE vehicle_register ADD COLUMN IF NOT EXISTS notes TEXT`,
    `ALTER TABLE vehicle_register ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,

    `CREATE TABLE IF NOT EXISTS work_groups (
      id SERIAL PRIMARY KEY,
      group_name VARCHAR(150),
      name VARCHAR(150),
      description TEXT,
      category VARCHAR(100) DEFAULT 'General',
      work_types JSONB DEFAULT '[]'::jsonb,
      work_types_arr JSONB DEFAULT '[]'::jsonb,
      status VARCHAR(20) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE work_groups ADD COLUMN IF NOT EXISTS group_name VARCHAR(150)`,
    `ALTER TABLE work_groups ADD COLUMN IF NOT EXISTS work_types JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE work_groups ADD COLUMN IF NOT EXISTS work_types_arr JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE work_groups ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General'`,
    `ALTER TABLE work_groups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,

    `CREATE TABLE IF NOT EXISTS work_types (
      id SERIAL PRIMARY KEY,
      work_type_name VARCHAR(150),
      name VARCHAR(150),
      group_id INTEGER,
      description TEXT,
      category VARCHAR(100) DEFAULT 'General',
      status VARCHAR(20) DEFAULT 'Active',
      avg_duration VARCHAR(50),
      avg_price NUMERIC(14,2) DEFAULT 0,
      rate NUMERIC(14,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE work_types ADD COLUMN IF NOT EXISTS work_type_name VARCHAR(150)`,
    `ALTER TABLE work_types ADD COLUMN IF NOT EXISTS name VARCHAR(150)`,
    `ALTER TABLE work_types ADD COLUMN IF NOT EXISTS group_id INTEGER`,
    `ALTER TABLE work_types ADD COLUMN IF NOT EXISTS description TEXT`,
    `ALTER TABLE work_types ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General'`,
    `ALTER TABLE work_types ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active'`,
    `ALTER TABLE work_types ADD COLUMN IF NOT EXISTS avg_duration VARCHAR(50)`,
    `ALTER TABLE work_types ADD COLUMN IF NOT EXISTS avg_price NUMERIC(14,2) DEFAULT 0`,
    `ALTER TABLE work_types ADD COLUMN IF NOT EXISTS rate NUMERIC(14,2) DEFAULT 0`,
    `ALTER TABLE work_types ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,

    `CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      type VARCHAR(20) DEFAULT 'Item',
      category VARCHAR(100),
      brand VARCHAR(120),
      brand_id INTEGER,
      part_number VARCHAR(80),
      hsn_code VARCHAR(50),
      unit VARCHAR(50) DEFAULT 'Nos',
      description TEXT,
      purchase_price NUMERIC(14,2) DEFAULT 0,
      selling_price NUMERIC(14,2) DEFAULT 0,
      rate NUMERIC(14,2) DEFAULT 0,
      gst_rate NUMERIC(6,2) DEFAULT 0,
      stock NUMERIC(14,2) DEFAULT 0,
      min_stock NUMERIC(14,2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE items ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'Item'`,
    `ALTER TABLE items ADD COLUMN IF NOT EXISTS category VARCHAR(100)`,
    `ALTER TABLE items ADD COLUMN IF NOT EXISTS brand VARCHAR(120)`,
    `ALTER TABLE items ADD COLUMN IF NOT EXISTS part_number VARCHAR(80)`,
    `ALTER TABLE items ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(50)`,
    `ALTER TABLE items ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT 'Nos'`,
    `ALTER TABLE items ADD COLUMN IF NOT EXISTS description TEXT`,
    `ALTER TABLE items ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(14,2) DEFAULT 0`,
    `ALTER TABLE items ADD COLUMN IF NOT EXISTS selling_price NUMERIC(14,2) DEFAULT 0`,
    `ALTER TABLE items ADD COLUMN IF NOT EXISTS gst_rate NUMERIC(6,2) DEFAULT 0`,
    `ALTER TABLE items ADD COLUMN IF NOT EXISTS stock NUMERIC(14,2) DEFAULT 0`,
    `ALTER TABLE items ADD COLUMN IF NOT EXISTS min_stock NUMERIC(14,2) DEFAULT 0`,
    `ALTER TABLE items ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active'`,
    `ALTER TABLE items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,

    `CREATE TABLE IF NOT EXISTS stock_items (
      id SERIAL PRIMARY KEY,
      item_id INTEGER,
      item_code VARCHAR(80),
      item_name VARCHAR(150) NOT NULL,
      category VARCHAR(100),
      brand VARCHAR(120),
      brand_id INTEGER,
      supplier_id INTEGER,
      supplier_name VARCHAR(150),
      location VARCHAR(100),
      current_stock NUMERIC(14,2) DEFAULT 0,
      min_stock NUMERIC(14,2) DEFAULT 0,
      max_stock NUMERIC(14,2) DEFAULT 0,
      reorder_level NUMERIC(14,2) DEFAULT 0,
      unit VARCHAR(50) DEFAULT 'Nos',
      purchase_price NUMERIC(14,2) DEFAULT 0,
      selling_price NUMERIC(14,2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'Active',
      last_purchase_date DATE,
      last_sale_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS item_id INTEGER`,
    `ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS item_code VARCHAR(80)`,
    `ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS brand VARCHAR(120)`,
    `ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(150)`,
    `ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS location VARCHAR(100)`,
    `ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS max_stock NUMERIC(14,2) DEFAULT 0`,
    `ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS reorder_level NUMERIC(14,2) DEFAULT 0`,
    `ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS last_purchase_date DATE`,
    `ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS last_sale_date DATE`,

    `CREATE TABLE IF NOT EXISTS stock_adjustments (
      id SERIAL PRIMARY KEY,
      adjustment_no VARCHAR(50),
      adjustment_date DATE NOT NULL,
      stock_item_id INTEGER,
      item_id INTEGER,
      item_code VARCHAR(80),
      item_name VARCHAR(150) NOT NULL,
      adjustment_type VARCHAR(20) NOT NULL,
      quantity NUMERIC(14,2) DEFAULT 0,
      previous_stock NUMERIC(14,2) DEFAULT 0,
      new_stock NUMERIC(14,2) DEFAULT 0,
      reason TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE stock_adjustments ADD COLUMN IF NOT EXISTS stock_item_id INTEGER`,
    `ALTER TABLE stock_adjustments ADD COLUMN IF NOT EXISTS item_id INTEGER`,
    `ALTER TABLE stock_adjustments ADD COLUMN IF NOT EXISTS item_code VARCHAR(80)`,
    `ALTER TABLE stock_adjustments ADD COLUMN IF NOT EXISTS previous_stock NUMERIC(14,2) DEFAULT 0`,
    `ALTER TABLE stock_adjustments ADD COLUMN IF NOT EXISTS new_stock NUMERIC(14,2) DEFAULT 0`,

    `CREATE TABLE IF NOT EXISTS cash_entries (
      id SERIAL PRIMARY KEY,
      entry_no VARCHAR(50),
      entry_date DATE NOT NULL,
      entry_time VARCHAR(20),
      transaction_type VARCHAR(30),
      reference_no VARCHAR(100),
      description TEXT,
      amount NUMERIC(14,2) DEFAULT 0,
      payment_type VARCHAR(50),
      notes TEXT,
      handled_by VARCHAR(120),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS bank_accounts (
      id SERIAL PRIMARY KEY,
      account_name VARCHAR(150),
      bank_name VARCHAR(150) NOT NULL,
      account_number VARCHAR(60),
      account_holder_name VARCHAR(150),
      ifsc_code VARCHAR(30),
      branch_name VARCHAR(150),
      account_type VARCHAR(40) DEFAULT 'Current',
      opening_balance NUMERIC(14,2) DEFAULT 0,
      current_balance NUMERIC(14,2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS account_name VARCHAR(150)`,
    `ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS account_type VARCHAR(40) DEFAULT 'Current'`,
    `ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active'`,
    `ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,

    `CREATE TABLE IF NOT EXISTS jobcards (
      id SERIAL PRIMARY KEY,
      jobcard_no VARCHAR(50) NOT NULL,
      customer_id INTEGER,
      customer_name VARCHAR(150) NOT NULL,
      phone VARCHAR(30),
      address TEXT,
      vehicle_id INTEGER,
      vehicle_no VARCHAR(30),
      vehicle_type VARCHAR(80),
      vehicle_make VARCHAR(120),
      vehicle_model VARCHAR(120),
      brand VARCHAR(120),
      model VARCHAR(120),
      transport_name VARCHAR(150),
      km_reading VARCHAR(50),
      service_type VARCHAR(120),
      work_type VARCHAR(120),
      technician_id INTEGER,
      technician_name VARCHAR(120),
      before_front_camber VARCHAR(50),
      before_front_caster VARCHAR(50),
      before_front_toe VARCHAR(50),
      before_rear_camber VARCHAR(50),
      before_rear_toe VARCHAR(50),
      after_front_camber VARCHAR(50),
      after_front_caster VARCHAR(50),
      after_front_toe VARCHAR(50),
      after_rear_camber VARCHAR(50),
      after_rear_toe VARCHAR(50),
      service_items JSONB DEFAULT '[]'::jsonb,
      complaint TEXT,
      work_done TEXT,
      remarks TEXT,
      status VARCHAR(30) DEFAULT 'pending',
      labour_charge NUMERIC(14,2) DEFAULT 0,
      parts_charge NUMERIC(14,2) DEFAULT 0,
      estimated_amount NUMERIC(14,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS customer_id INTEGER`,
    `ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS address TEXT`,
    `ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS vehicle_id INTEGER`,
    `ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS vehicle_make VARCHAR(120)`,
    `ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS vehicle_model VARCHAR(120)`,
    `ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS transport_name VARCHAR(150)`,
    `ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS km_reading VARCHAR(50)`,
    `ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS work_type VARCHAR(120)`,
    `ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS technician_id INTEGER`,
    `ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS technician_name VARCHAR(120)`,
    `ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS work_done TEXT`,
    `ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS remarks TEXT`,
    `ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS labour_charge NUMERIC(14,2) DEFAULT 0`,
    `ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS parts_charge NUMERIC(14,2) DEFAULT 0`,
    `ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    `ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS service_items JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE jobcards ALTER COLUMN service_items SET DEFAULT '[]'::jsonb`,

    `CREATE TABLE IF NOT EXISTS estimations (
      id SERIAL PRIMARY KEY,
      bill_no VARCHAR(50),
      estimation_number VARCHAR(50),
      estimation_date DATE NOT NULL,
      customer_id INTEGER,
      customer_name VARCHAR(150) NOT NULL,
      customer_phone VARCHAR(30),
      vehicle_id INTEGER,
      vehicle_number VARCHAR(30),
      vehicle_make VARCHAR(120),
      vehicle_model VARCHAR(120),
      total_amount NUMERIC(14,2) DEFAULT 0,
      status VARCHAR(30) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE estimations ADD COLUMN IF NOT EXISTS bill_no VARCHAR(50)`,
    `ALTER TABLE estimations ADD COLUMN IF NOT EXISTS customer_id INTEGER`,
    `ALTER TABLE estimations ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(30)`,
    `ALTER TABLE estimations ADD COLUMN IF NOT EXISTS vehicle_id INTEGER`,
    `ALTER TABLE estimations ADD COLUMN IF NOT EXISTS vehicle_make VARCHAR(120)`,
    `ALTER TABLE estimations ADD COLUMN IF NOT EXISTS vehicle_model VARCHAR(120)`,
    `ALTER TABLE estimations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,

    `CREATE TABLE IF NOT EXISTS estimation_items (
      id SERIAL PRIMARY KEY,
      estimation_id INTEGER NOT NULL,
      item_name VARCHAR(150) NOT NULL,
      description TEXT,
      quantity NUMERIC(14,2) DEFAULT 1,
      rate NUMERIC(14,2) DEFAULT 0,
      gst NUMERIC(6,2) DEFAULT 0,
      amount NUMERIC(14,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS labour_bills (
      id SERIAL PRIMARY KEY,
      bill_no VARCHAR(50),
      bill_number VARCHAR(50),
      customer_id INTEGER,
      customer_name VARCHAR(150),
      customer_phone VARCHAR(30),
      customer_address TEXT,
      vehicle_number VARCHAR(30),
      vehicle_make_id INTEGER,
      vehicle_make VARCHAR(120),
      vehicle_model VARCHAR(120),
      km_reading VARCHAR(50),
      fuel_level VARCHAR(50),
      bill_date DATE NOT NULL,
      bill_time VARCHAR(20),
      items JSONB DEFAULT '[]'::jsonb,
      subtotal NUMERIC(14,2) DEFAULT 0,
      total_gst NUMERIC(14,2) DEFAULT 0,
      discount NUMERIC(14,2) DEFAULT 0,
      grand_total NUMERIC(14,2) DEFAULT 0,
      total_amount NUMERIC(14,2) DEFAULT 0,
      status VARCHAR(30) DEFAULT 'Completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE labour_bills ADD COLUMN IF NOT EXISTS bill_no VARCHAR(50)`,
    `ALTER TABLE labour_bills ADD COLUMN IF NOT EXISTS customer_id INTEGER`,
    `ALTER TABLE labour_bills ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(30)`,
    `ALTER TABLE labour_bills ADD COLUMN IF NOT EXISTS customer_address TEXT`,
    `ALTER TABLE labour_bills ADD COLUMN IF NOT EXISTS vehicle_make VARCHAR(120)`,
    `ALTER TABLE labour_bills ADD COLUMN IF NOT EXISTS vehicle_model VARCHAR(120)`,
    `ALTER TABLE labour_bills ADD COLUMN IF NOT EXISTS km_reading VARCHAR(50)`,
    `ALTER TABLE labour_bills ADD COLUMN IF NOT EXISTS fuel_level VARCHAR(50)`,
    `ALTER TABLE labour_bills ADD COLUMN IF NOT EXISTS bill_time VARCHAR(20)`,
    `ALTER TABLE labour_bills ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE labour_bills ADD COLUMN IF NOT EXISTS subtotal NUMERIC(14,2) DEFAULT 0`,
    `ALTER TABLE labour_bills ADD COLUMN IF NOT EXISTS total_gst NUMERIC(14,2) DEFAULT 0`,
    `ALTER TABLE labour_bills ADD COLUMN IF NOT EXISTS discount NUMERIC(14,2) DEFAULT 0`,
    `ALTER TABLE labour_bills ADD COLUMN IF NOT EXISTS grand_total NUMERIC(14,2) DEFAULT 0`,
    `ALTER TABLE labour_bills ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    `ALTER TABLE labour_bills ALTER COLUMN items SET DEFAULT '[]'::jsonb`,

    `CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      sale_no VARCHAR(50) NOT NULL,
      sale_date DATE NOT NULL,
      customer_id INTEGER,
      customer_name VARCHAR(150),
      customer_phone VARCHAR(30),
      items JSONB DEFAULT '[]'::jsonb,
      subtotal NUMERIC(14,2) DEFAULT 0,
      total_gst NUMERIC(14,2) DEFAULT 0,
      discount NUMERIC(14,2) DEFAULT 0,
      grand_total NUMERIC(14,2) DEFAULT 0,
      payment_mode VARCHAR(50),
      status VARCHAR(30) DEFAULT 'Completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_id INTEGER`,
    `ALTER TABLE sales ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    `ALTER TABLE sales ALTER COLUMN items SET DEFAULT '[]'::jsonb`,

    `CREATE TABLE IF NOT EXISTS purchases (
      id SERIAL PRIMARY KEY,
      purchase_no VARCHAR(50) NOT NULL,
      purchase_date DATE NOT NULL,
      supplier_id INTEGER,
      supplier_name VARCHAR(150),
      items JSONB DEFAULT '[]'::jsonb,
      subtotal NUMERIC(14,2) DEFAULT 0,
      total_gst NUMERIC(14,2) DEFAULT 0,
      discount NUMERIC(14,2) DEFAULT 0,
      grand_total NUMERIC(14,2) DEFAULT 0,
      payment_mode VARCHAR(50),
      status VARCHAR(30) DEFAULT 'Received',
      notes TEXT,
      invoice_no VARCHAR(80),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE purchases ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    `ALTER TABLE purchases ALTER COLUMN items SET DEFAULT '[]'::jsonb`,

    `CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      payment_no VARCHAR(50) NOT NULL,
      payment_date DATE NOT NULL,
      customer_id INTEGER,
      customer_name VARCHAR(150),
      jobcard_id INTEGER,
      jobcard_no VARCHAR(50),
      bill_id INTEGER,
      bill_no VARCHAR(50),
      payment_type VARCHAR(80),
      payment_mode VARCHAR(50),
      bank_account_id INTEGER,
      bank_account_name VARCHAR(150),
      reference_no VARCHAR(100),
      amount NUMERIC(14,2) DEFAULT 0,
      remarks TEXT,
      status VARCHAR(30) DEFAULT 'Completed',
      created_by VARCHAR(120) DEFAULT 'system',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_by VARCHAR(120) DEFAULT 'system'`,
    `ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,

    `CREATE TABLE IF NOT EXISTS receipts (
      id SERIAL PRIMARY KEY,
      receipt_no VARCHAR(50) NOT NULL,
      receipt_date DATE NOT NULL,
      customer_id INTEGER,
      customer_name VARCHAR(150),
      customer_phone VARCHAR(30),
      labour_bill_id INTEGER,
      labour_bill_no VARCHAR(50),
      jobcard_id INTEGER,
      jobcard_no VARCHAR(50),
      description TEXT,
      amount NUMERIC(14,2) DEFAULT 0,
      payment_mode VARCHAR(50),
      bank_id INTEGER,
      bank_name VARCHAR(150),
      reference_no VARCHAR(100),
      status VARCHAR(30) DEFAULT 'Received',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE receipts ADD COLUMN IF NOT EXISTS customer_id INTEGER`,
    `ALTER TABLE receipts ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(30)`,
    `ALTER TABLE receipts ADD COLUMN IF NOT EXISTS labour_bill_id INTEGER`,
    `ALTER TABLE receipts ADD COLUMN IF NOT EXISTS labour_bill_no VARCHAR(50)`,
    `ALTER TABLE receipts ADD COLUMN IF NOT EXISTS jobcard_id INTEGER`,
    `ALTER TABLE receipts ADD COLUMN IF NOT EXISTS jobcard_no VARCHAR(50)`,
    `ALTER TABLE receipts ADD COLUMN IF NOT EXISTS description TEXT`,
    `ALTER TABLE receipts ADD COLUMN IF NOT EXISTS reference_no VARCHAR(100)`,
    `ALTER TABLE receipts ADD COLUMN IF NOT EXISTS bank_name VARCHAR(150)`,
    `ALTER TABLE receipts ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'Received'`,
    `ALTER TABLE receipts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,

    `CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      expense_no VARCHAR(50) NOT NULL,
      expense_date DATE NOT NULL,
      category VARCHAR(100),
      description TEXT,
      amount NUMERIC(14,2) DEFAULT 0,
      payment_mode VARCHAR(50),
      reference_no VARCHAR(100),
      status VARCHAR(30) DEFAULT 'Paid',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS financial_years (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      start_date DATE,
      end_date DATE,
      is_active BOOLEAN DEFAULT false,
      status VARCHAR(20) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS salary_records (
      id SERIAL PRIMARY KEY,
      salary_no VARCHAR(50) NOT NULL,
      staff_id INTEGER,
      staff_name VARCHAR(150),
      month VARCHAR(20),
      year INTEGER,
      basic_salary NUMERIC(14,2) DEFAULT 0,
      allowances NUMERIC(14,2) DEFAULT 0,
      deductions NUMERIC(14,2) DEFAULT 0,
      net_salary NUMERIC(14,2) DEFAULT 0,
      payment_mode VARCHAR(50),
      payment_date DATE,
      status VARCHAR(30) DEFAULT 'Paid',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS staff_advances (
      id SERIAL PRIMARY KEY,
      advance_no VARCHAR(50) NOT NULL,
      staff_id INTEGER,
      staff_name VARCHAR(150),
      advance_date DATE,
      amount NUMERIC(14,2) DEFAULT 0,
      reason TEXT,
      repayment_type VARCHAR(50),
      repayment_amount NUMERIC(14,2) DEFAULT 0,
      status VARCHAR(30) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE OR REPLACE VIEW stock AS
     SELECT
       id,
       item_id,
       item_code,
       item_name,
       category,
       brand,
       supplier_id,
       supplier_name,
       location,
       current_stock,
       min_stock,
       max_stock,
       reorder_level,
       unit,
       purchase_price,
       selling_price,
       status,
       last_purchase_date,
       last_sale_date,
       created_at,
       updated_at
     FROM stock_items`,

    `UPDATE vehicle_makes SET name = COALESCE(name, make_name) WHERE name IS NULL`,
    `UPDATE work_groups SET name = COALESCE(name, group_name) WHERE name IS NULL`,
    `UPDATE work_types SET name = COALESCE(name, work_type_name) WHERE name IS NULL`,

    `INSERT INTO stock_items (
      item_id,
      item_code,
      item_name,
      category,
      brand,
      current_stock,
      min_stock,
      max_stock,
      reorder_level,
      unit,
      purchase_price,
      selling_price,
      status,
      last_purchase_date
    )
    SELECT
      i.id,
      COALESCE(NULLIF(i.part_number, ''), 'ITM-' || LPAD(i.id::text, 3, '0')),
      i.name,
      i.category,
      i.brand,
      COALESCE(i.stock, 0),
      COALESCE(i.min_stock, 0),
      GREATEST(COALESCE(i.stock, 0), COALESCE(i.min_stock, 0)),
      COALESCE(i.min_stock, 0),
      COALESCE(i.unit, 'Nos'),
      COALESCE(i.purchase_price, 0),
      COALESCE(i.selling_price, 0),
      COALESCE(i.status, 'Active'),
      CURRENT_DATE
    FROM items i
    WHERE NOT EXISTS (
      SELECT 1
      FROM stock_items s
      WHERE s.item_id = i.id
    )`,

    `UPDATE stock_items s
     SET
       item_code = COALESCE(s.item_code, NULLIF(i.part_number, ''), 'ITM-' || LPAD(i.id::text, 3, '0')),
       category = COALESCE(s.category, i.category),
       brand = COALESCE(s.brand, i.brand),
       min_stock = COALESCE(s.min_stock, i.min_stock, 0),
       reorder_level = COALESCE(s.reorder_level, i.min_stock, 0),
       purchase_price = COALESCE(NULLIF(s.purchase_price, 0), i.purchase_price, 0),
       selling_price = COALESCE(NULLIF(s.selling_price, 0), i.selling_price, 0),
       unit = COALESCE(s.unit, i.unit, 'Nos')
     FROM items i
     WHERE s.item_id = i.id`
  ]);

  await ensureConstraint(
    "customers_customer_code_key",
    "ALTER TABLE customers ADD CONSTRAINT customers_customer_code_key UNIQUE (customer_code)"
  );
  await ensureConstraint(
    "vehicle_register_vehicle_number_key",
    "ALTER TABLE vehicle_register ADD CONSTRAINT vehicle_register_vehicle_number_key UNIQUE (vehicle_number)"
  );
  await ensureConstraint(
    "jobcards_jobcard_no_key",
    "ALTER TABLE jobcards ADD CONSTRAINT jobcards_jobcard_no_key UNIQUE (jobcard_no)"
  );
  await ensureConstraint(
    "estimations_bill_no_key",
    "ALTER TABLE estimations ADD CONSTRAINT estimations_bill_no_key UNIQUE (bill_no)"
  );
  await ensureConstraint(
    "labour_bills_bill_no_key",
    "ALTER TABLE labour_bills ADD CONSTRAINT labour_bills_bill_no_key UNIQUE (bill_no)"
  );
  await ensureConstraint(
    "purchases_purchase_no_key",
    "ALTER TABLE purchases ADD CONSTRAINT purchases_purchase_no_key UNIQUE (purchase_no)"
  );
  await ensureConstraint(
    "sales_sale_no_key",
    "ALTER TABLE sales ADD CONSTRAINT sales_sale_no_key UNIQUE (sale_no)"
  );
  await ensureConstraint(
    "payments_payment_no_key",
    "ALTER TABLE payments ADD CONSTRAINT payments_payment_no_key UNIQUE (payment_no)"
  );
  await ensureConstraint(
    "receipts_receipt_no_key",
    "ALTER TABLE receipts ADD CONSTRAINT receipts_receipt_no_key UNIQUE (receipt_no)"
  );
  await ensureConstraint(
    "estimation_items_estimation_id_fkey",
    "ALTER TABLE estimation_items ADD CONSTRAINT estimation_items_estimation_id_fkey FOREIGN KEY (estimation_id) REFERENCES estimations(id) ON DELETE CASCADE"
  );
  await ensureConstraint(
    "vehicle_register_customer_id_fkey",
    "ALTER TABLE vehicle_register ADD CONSTRAINT vehicle_register_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "jobcards_customer_id_fkey",
    "ALTER TABLE jobcards ADD CONSTRAINT jobcards_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "jobcards_vehicle_id_fkey",
    "ALTER TABLE jobcards ADD CONSTRAINT jobcards_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES vehicle_register(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "jobcards_technician_id_fkey",
    "ALTER TABLE jobcards ADD CONSTRAINT jobcards_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES staff(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "estimations_customer_id_fkey",
    "ALTER TABLE estimations ADD CONSTRAINT estimations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "estimations_vehicle_id_fkey",
    "ALTER TABLE estimations ADD CONSTRAINT estimations_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES vehicle_register(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "labour_bills_customer_id_fkey",
    "ALTER TABLE labour_bills ADD CONSTRAINT labour_bills_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "purchases_supplier_id_fkey",
    "ALTER TABLE purchases ADD CONSTRAINT purchases_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "sales_customer_id_fkey",
    "ALTER TABLE sales ADD CONSTRAINT sales_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "payments_customer_id_fkey",
    "ALTER TABLE payments ADD CONSTRAINT payments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "payments_jobcard_id_fkey",
    "ALTER TABLE payments ADD CONSTRAINT payments_jobcard_id_fkey FOREIGN KEY (jobcard_id) REFERENCES jobcards(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "payments_bill_id_fkey",
    "ALTER TABLE payments ADD CONSTRAINT payments_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES labour_bills(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "payments_bank_account_id_fkey",
    "ALTER TABLE payments ADD CONSTRAINT payments_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "receipts_customer_id_fkey",
    "ALTER TABLE receipts ADD CONSTRAINT receipts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "receipts_jobcard_id_fkey",
    "ALTER TABLE receipts ADD CONSTRAINT receipts_jobcard_id_fkey FOREIGN KEY (jobcard_id) REFERENCES jobcards(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "receipts_labour_bill_id_fkey",
    "ALTER TABLE receipts ADD CONSTRAINT receipts_labour_bill_id_fkey FOREIGN KEY (labour_bill_id) REFERENCES labour_bills(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "receipts_bank_id_fkey",
    "ALTER TABLE receipts ADD CONSTRAINT receipts_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES bank_accounts(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "stock_items_item_id_fkey",
    "ALTER TABLE stock_items ADD CONSTRAINT stock_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "stock_items_supplier_id_fkey",
    "ALTER TABLE stock_items ADD CONSTRAINT stock_items_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "stock_adjustments_stock_item_id_fkey",
    "ALTER TABLE stock_adjustments ADD CONSTRAINT stock_adjustments_stock_item_id_fkey FOREIGN KEY (stock_item_id) REFERENCES stock_items(id) ON DELETE SET NULL NOT VALID"
  );
  await ensureConstraint(
    "stock_adjustments_item_id_fkey",
    "ALTER TABLE stock_adjustments ADD CONSTRAINT stock_adjustments_item_id_fkey FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL NOT VALID"
  );

  await ensureIndex(
    "idx_jobcards_customer_id",
    "CREATE INDEX idx_jobcards_customer_id ON jobcards(customer_id)"
  );
  await ensureIndex(
    "idx_jobcards_vehicle_id",
    "CREATE INDEX idx_jobcards_vehicle_id ON jobcards(vehicle_id)"
  );
  await ensureIndex(
    "idx_payments_customer_id",
    "CREATE INDEX idx_payments_customer_id ON payments(customer_id)"
  );
  await ensureIndex(
    "idx_receipts_customer_id",
    "CREATE INDEX idx_receipts_customer_id ON receipts(customer_id)"
  );
  await ensureIndex(
    "idx_stock_items_item_id",
    "CREATE INDEX idx_stock_items_item_id ON stock_items(item_id)"
  );
  await ensureIndex(
    "idx_vehicle_register_customer_id",
    "CREATE INDEX idx_vehicle_register_customer_id ON vehicle_register(customer_id)"
  );

  hasInitialized = true;
  console.log("[DB] Schema initialization complete");
};

module.exports = {
  initializeDatabase,
};
