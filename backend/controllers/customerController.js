const pool = require('../config/db');
const { logHistory } = require('../utils/history');

// @desc    Get all customers
const getCustomers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY id DESC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('[Customer] getAll error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new customer
const createCustomer = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { 
      customer_code, name, contact_person, phone, alternate_phone, 
      email, address, city, state, pincode, gst_number, opening_balance, is_active 
    } = req.body;

    if (!name || !phone) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    const balance = isNaN(parseFloat(opening_balance)) ? 0 : parseFloat(opening_balance);
    const status = is_active === false ? 'inactive' : 'active';

    const result = await client.query(
      `INSERT INTO customers (
        customer_code, customer_name, contact_person, phone, alternate_phone, 
        email, address, city, state, pincode, gst_no, opening_balance, status
      )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        customer_code || null, name, contact_person || null, phone, alternate_phone || null, 
        email || null, address || null, city || null, state || null, pincode || null, 
        gst_number || null, balance, status
      ]
    );

    const record = result.rows[0];
    
    await logHistory({
      client,
      module_name: 'Masters',
      action_type: 'CREATE',
      record_id: record.id,
      title: `Created Customer: ${record.customer_name}`,
      description: `New customer ${record.customer_name} (${record.phone}) added.`,
      changed_data: record,
      user_name: 'admin'
    });
    
    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Customer saved successfully', data: record });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Customer] create error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// @desc    Update customer
const updateCustomer = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { 
      customer_code, name, contact_person, phone, alternate_phone, 
      email, address, city, state, pincode, gst_number, opening_balance, is_active 
    } = req.body;

    if (!name || !phone) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    const balance = isNaN(parseFloat(opening_balance)) ? 0 : parseFloat(opening_balance);
    const status = is_active === false ? 'inactive' : 'active';

    const result = await client.query(
      `UPDATE customers SET
        customer_code=$1, customer_name=$2, contact_person=$3, phone=$4, alternate_phone=$5,
        email=$6, address=$7, city=$8, state=$9, pincode=$10, gst_no=$11,
        opening_balance=$12, status=$13, updated_at=CURRENT_TIMESTAMP
       WHERE id=$14 RETURNING *`,
      [
        customer_code || null, name, contact_person || null, phone, alternate_phone || null, 
        email || null, address || null, city || null, state || null, pincode || null, 
        gst_number || null, balance, status, id
      ]
    );

    if (!result.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const record = result.rows[0];
    
    await logHistory({
      client,
      module_name: 'Masters',
      action_type: 'UPDATE',
      record_id: record.id,
      title: `Updated Customer: ${record.customer_name}`,
      description: `Customer details for ${record.customer_name} were modified.`,
      changed_data: record,
      user_name: 'admin'
    });
    
    await client.query('COMMIT');
    res.json({ success: true, message: 'Customer updated successfully', data: record });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Customer] update error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// @desc    Delete customer
const deleteCustomer = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    
    const check = await client.query('SELECT customer_name FROM customers WHERE id = $1', [id]);
    if (!check.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    const customerName = check.rows[0].customer_name;

    await client.query('DELETE FROM customers WHERE id = $1', [id]);

    await logHistory({
      client,
      module_name: 'Masters',
      action_type: 'DELETE',
      record_id: id,
      title: `Deleted Customer: ${customerName}`,
      description: `Customer ${customerName} was removed.`,
      changed_data: check.rows[0],
      user_name: 'admin'
    });

    await client.query('COMMIT');
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Customer] delete error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// @desc    Get customers summary
const getCustomersSummary = async (req, res) => {
  try {
    const totalResult = await pool.query('SELECT COUNT(*) FROM customers');
    const activeResult = await pool.query("SELECT COUNT(*) FROM customers WHERE status = 'active'");
    const inactiveResult = await pool.query("SELECT COUNT(*) FROM customers WHERE status = 'inactive'");
    const vehicleResult = await pool.query('SELECT COUNT(*) FROM vehicle_register');
    
    res.json({
      success: true,
      data: {
        total: parseInt(totalResult.rows[0].count),
        active: parseInt(activeResult.rows[0].count),
        inactive: parseInt(inactiveResult.rows[0].count),
        totalVehicles: parseInt(vehicleResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('[Customer] summary error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomersSummary };
