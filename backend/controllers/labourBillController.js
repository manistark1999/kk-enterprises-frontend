const pool = require('../config/db');
const { logHistory } = require('../utils/history');
const { getNextDocumentNumber } = require("../utils/documentNumbers");
const { resolveCustomer, toInteger, toNumber } = require("../utils/entityResolvers");

const getNextNumber = async (req, res) => {
  try {
    const billNo = await getNextDocumentNumber({
      db: pool,
      tableName: "labour_bills",
      columnName: "bill_no",
      type: "bill",
      dateValue: req.query.date || new Date(),
    });

    res.json({ success: true, data: billNo });
  } catch (error) {
    console.error('[LabourBill] getNextNo error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
const getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM labour_bills ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const create = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      bill_no_generated,
      bill_date,
      bill_time,
      customer_id,
      customer_name,
      customer_phone,
      customer_address,
      vehicle_number,
      vehicle_make,
      vehicle_model,
      km_reading,
      fuel_level,
      items,
      subtotal,
      total_gst,
      discount,
      grand_total,
      status,
    } = req.body;
    let bill_no = req.body.bill_no || bill_no_generated;

    if (!bill_no) {
      bill_no = await getNextDocumentNumber({
        db: client,
        tableName: "labour_bills",
        columnName: "bill_no",
        type: "bill",
        dateValue: bill_date,
      });
    }

    if (!bill_date || !customer_name) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "bill_date and customer_name are required",
      });
    }

    const existing = await client.query(
      "SELECT id FROM labour_bills WHERE bill_no = $1 LIMIT 1",
      [bill_no]
    );
    if (existing.rows.length) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        success: false,
        message: `Bill ${bill_no} already exists`,
      });
    }

    const resolvedCustomer = await resolveCustomer(client, {
      customerId: customer_id,
      customerName: customer_name,
      customerPhone: customer_phone,
    });

    const safeGrandTotal = grand_total ?? subtotal ?? 0;
    const result = await client.query(
      `INSERT INTO labour_bills (
        bill_no, bill_number, bill_date, bill_time, customer_id, customer_name, customer_phone,
        customer_address, vehicle_number, vehicle_make, vehicle_model, km_reading,
        fuel_level, items, subtotal, total_gst, discount, grand_total, total_amount, status
      )
       VALUES ($1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$17,$18)
       RETURNING *`,
      [
        bill_no,
        bill_date,
        bill_time || null,
        resolvedCustomer?.id || toInteger(customer_id),
        resolvedCustomer?.customer_name || customer_name,
        resolvedCustomer?.phone || customer_phone || null,
        customer_address || resolvedCustomer?.address || null,
        vehicle_number || null,
        vehicle_make || null,
        vehicle_model || null,
        km_reading || null,
        fuel_level || null,
        JSON.stringify(items || []),
        subtotal || 0,
        total_gst || 0,
        discount || 0,
        safeGrandTotal || 0,
        status || 'Completed',
      ]
    );
    
    const record = result.rows[0];

    // Normalized Items Insertion
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await client.query(
          `INSERT INTO labour_bill_items (labour_bill_id, item_name, quantity, rate, gst_percent, gst_amount, amount, is_labour)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            record.id,
            item.itemName || item.item_name || item.name || "Item",
            toNumber(item.quantity || item.qty, 1),
            toNumber(item.rate, 0),
            toNumber(item.gst, 0),
            (toNumber(item.amount, 0) * toNumber(item.gst, 0)) / 100,
            toNumber(item.amount, 0),
            item.isLabour || false
          ]
        );
      }
    }

    await logHistory({
      client,
      module_name: 'Accounts',
      action_type: 'CREATE',
      record_id: record.id,
      title: `Created Labour Bill: ${record.bill_no}`,
      description: `New labour bill of ${record.grand_total} created for ${record.customer_name}.`,
      changed_data: record,
      user_name: 'admin'
    });
    await client.query('COMMIT');
    
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

const update = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      bill_no,
      bill_date,
      bill_time,
      customer_id,
      customer_name,
      customer_phone,
      customer_address,
      vehicle_number,
      vehicle_make,
      vehicle_model,
      km_reading,
      fuel_level,
      items,
      subtotal,
      total_gst,
      discount,
      grand_total,
      status,
    } = req.body;

    const resolvedCustomer = await resolveCustomer(client, {
      customerId: customer_id,
      customerName: customer_name,
      customerPhone: customer_phone,
    });
    const safeGrandTotal = grand_total ?? subtotal ?? 0;
    
    const result = await client.query(
      `UPDATE labour_bills SET
         bill_no=$1,
         bill_number=$1,
         bill_date=$2,
         bill_time=$3,
         customer_id=$4,
         customer_name=$5,
         customer_phone=$6,
         customer_address=$7,
         vehicle_number=$8,
         vehicle_make=$9,
         vehicle_model=$10,
         km_reading=$11,
         fuel_level=$12,
         items=$13,
         subtotal=$14,
         total_gst=$15,
         discount=$16,
         grand_total=$17,
         total_amount=$17,
         status=$18,
         updated_at=CURRENT_TIMESTAMP
       WHERE id=$19
       RETURNING *`,
      [
        bill_no,
        bill_date,
        bill_time || null,
        resolvedCustomer?.id || toInteger(customer_id),
        resolvedCustomer?.customer_name || customer_name,
        resolvedCustomer?.phone || customer_phone || null,
        customer_address || resolvedCustomer?.address || null,
        vehicle_number || null,
        vehicle_make || null,
        vehicle_model || null,
        km_reading || null,
        fuel_level || null,
        JSON.stringify(items || []),
        subtotal || 0,
        total_gst || 0,
        discount || 0,
        safeGrandTotal || 0,
        status || 'Completed',
        req.params.id,
      ]
    );

    if (!result.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Bill not found" });
    }

    const record = result.rows[0];

    // Normalized Items Sync
    await client.query("DELETE FROM labour_bill_items WHERE labour_bill_id = $1", [record.id]);
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await client.query(
          `INSERT INTO labour_bill_items (labour_bill_id, item_name, quantity, rate, gst_percent, gst_amount, amount, is_labour)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            record.id,
            item.itemName || item.item_name || item.name || "Item",
            toNumber(item.quantity || item.qty, 1),
            toNumber(item.rate, 0),
            toNumber(item.gst, 0),
            (toNumber(item.amount, 0) * toNumber(item.gst, 0)) / 100,
            toNumber(item.amount, 0),
            item.isLabour || false
          ]
        );
      }
    }

    await logHistory({
      client,
      module_name: 'Accounts',
      action_type: 'UPDATE',
      record_id: record.id,
      title: `Updated Labour Bill: ${record.bill_no}`,
      description: `Labour bill ${record.bill_no} details were modified.`,
      changed_data: record,
      user_name: 'admin'
    });
    await client.query('COMMIT');

    res.json({ success: true, data: record });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

const remove = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query('DELETE FROM labour_bills WHERE id=$1 RETURNING *', [req.params.id]);

    if (!result.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Bill not found" });
    }

    await logHistory({
      client,
      module_name: 'Accounts',
      action_type: 'DELETE',
      record_id: req.params.id,
      title: `Deleted Labour Bill: ${result.rows[0].bill_no}`,
      description: `Labour bill ${result.rows[0].bill_no} was removed.`,
      user_name: 'admin'
    });
    await client.query('COMMIT');
    res.json({ success: true, message: 'Bill deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

module.exports = { getAll, create, update, remove, getNextNumber };
