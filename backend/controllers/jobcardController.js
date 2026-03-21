const pool = require('../config/db');
const { logHistory } = require('../utils/history');
const { getNextDocumentNumber } = require('../utils/documentNumbers');
const { resolveCustomer, resolveVehicle, toInteger, toNumber } = require('../utils/entityResolvers');

const sanitizeValue = (value) => (value === undefined || value === '' || value === null ? null : value);

const sendResponse = (res, status, success, message, data = null) => {
  return res.status(status).json({ success, message, data });
};

const getAllJobcards = async (req, res) => {
  try {
    const query = `SELECT * FROM jobcards ORDER BY created_at DESC, id DESC`;
    const result = await pool.query(query);
    return sendResponse(res, 200, true, "Job cards fetched successfully", result.rows);
  } catch (error) {
    console.error('[Jobcard] getAll error:', error.message);
    return sendResponse(res, 500, false, error.message);
  }
};

const getNextJobcardNo = async (req, res) => {
  try {
    const nextNumber = await getNextDocumentNumber({
      db: pool,
      tableName: "jobcards",
      columnName: "jobcard_no",
      type: "jobcard",
      dateValue: req.query.date || new Date(),
    });
    return sendResponse(res, 200, true, "Next number generated", nextNumber);
  } catch (error) {
    console.error('[Jobcard] getNextNo error:', error.message);
    return sendResponse(res, 500, false, error.message);
  }
};

const createJobcard = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      jobcard_no, customer_id, customer_name, phone, address,
      vehicle_no, vehicle_type, vehicle_make, vehicle_model,
      brand, model, transport_name, km_reading, service_type,
      work_type, technician_name, complaint, work_done,
      remarks, status, labour_charge, parts_charge, estimated_amount,
      vehicle_id, technician_id, service_items
    } = req.body;

    if (!customer_name) {
      await client.query('ROLLBACK');
      return sendResponse(res, 400, false, 'customer_name is required');
    }

    let finalJobcardNo = jobcard_no;
    if (!finalJobcardNo) {
      finalJobcardNo = await getNextDocumentNumber({
        db: client,
        tableName: "jobcards",
        columnName: "jobcard_no",
        type: "jobcard",
        dateValue: req.body.date || new Date(),
      });
    }

    const checkResult = await client.query('SELECT id FROM jobcards WHERE jobcard_no = $1', [finalJobcardNo]);
    if (checkResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return sendResponse(res, 409, false, `Job card number ${finalJobcardNo} already exists`);
    }

    const resolvedCustomer = await resolveCustomer(client, {
      customerId: customer_id,
      customerName: customer_name,
      customerPhone: phone,
    });
    const resolvedVehicle = await resolveVehicle(client, {
      vehicleId: vehicle_id,
      vehicleNumber: vehicle_no,
    });

    const finalCustomerName = resolvedCustomer?.customer_name || customer_name;
    const finalPhone = sanitizeValue(resolvedCustomer?.phone || phone);
    const finalAddress = sanitizeValue(address || resolvedCustomer?.address);
    const finalVehicleNo = sanitizeValue(resolvedVehicle?.vehicle_number || vehicle_no);
    const finalVehicleType = sanitizeValue(vehicle_type || resolvedVehicle?.fuel_type);
    const finalVehicleMake = sanitizeValue(vehicle_make || resolvedVehicle?.vehicle_make || brand);
    const finalVehicleModel = sanitizeValue(vehicle_model || resolvedVehicle?.model || model);

    const query = `
      INSERT INTO jobcards (
        jobcard_no, customer_name, phone, address, vehicle_no, vehicle_type,
        vehicle_make, vehicle_model, brand, model, transport_name,
        km_reading, service_type, work_type, technician_name, complaint,
        work_done, remarks, status, labour_charge, parts_charge, estimated_amount,
        vehicle_id, customer_id, technician_id, service_items
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
      ) RETURNING *
    `;

    const values = [
      finalJobcardNo, finalCustomerName, finalPhone, finalAddress, finalVehicleNo, finalVehicleType,
      finalVehicleMake, finalVehicleModel, finalVehicleMake, finalVehicleModel,
      sanitizeValue(transport_name), sanitizeValue(km_reading), sanitizeValue(service_type),
      sanitizeValue(work_type), sanitizeValue(technician_name), sanitizeValue(complaint),
      sanitizeValue(work_done), sanitizeValue(remarks), status || 'pending',
      parseFloat(labour_charge) || 0, parseFloat(parts_charge) || 0, parseFloat(estimated_amount) || 0,
      sanitizeValue(resolvedVehicle?.id || toInteger(vehicle_id)),
      sanitizeValue(resolvedCustomer?.id || toInteger(customer_id)),
      sanitizeValue(toInteger(technician_id)), JSON.stringify(service_items || [])
    ];

    const result = await client.query(query, values);
    const record = result.rows[0];

    // Normalized Service Items
    if (service_items && Array.isArray(service_items)) {
      for (const item of service_items) {
        await client.query(
          `INSERT INTO job_card_items (job_card_id, item_name, quantity, rate, gst_percent, gst_amount, amount, is_labour)
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
      module_name: 'JobCard',
      action_type: 'CREATE',
      record_id: record.id,
      title: `Created JobCard: ${finalJobcardNo}`,
      description: `New job card created for vehicle ${finalVehicleNo}.`,
      changed_data: record,
      user_name: 'admin'
    });

    await client.query('COMMIT');
    return sendResponse(res, 201, true, 'Job card created successfully', record);
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('[Jobcard] create error:', error);
    return sendResponse(res, 500, false, error.message);
  } finally {
    if (client) client.release();
  }
};

const updateJobcard = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const {
      jobcard_no, customer_name, phone, address,
      vehicle_no, vehicle_type, vehicle_make, vehicle_model,
      brand, model, transport_name, km_reading, service_type,
      work_type, technician_name, complaint, work_done,
      remarks, status, labour_charge, parts_charge, estimated_amount,
      vehicle_id, customer_id, technician_id, service_items
    } = req.body;

    await client.query('BEGIN');

    const resolvedCustomer = await resolveCustomer(client, {
      customerId: customer_id,
      customerName: customer_name,
      customerPhone: phone,
    });
    const resolvedVehicle = await resolveVehicle(client, {
      vehicleId: vehicle_id,
      vehicleNumber: vehicle_no,
    });

    const query = `
      UPDATE jobcards SET
        jobcard_no=COALESCE($1, jobcard_no),
        customer_name=COALESCE($2, customer_name),
        phone=COALESCE($3, phone),
        address=COALESCE($4, address),
        vehicle_no=COALESCE($5, vehicle_no),
        vehicle_type=COALESCE($6, vehicle_type),
        vehicle_make=COALESCE($7, vehicle_make),
        vehicle_model=COALESCE($8, vehicle_model),
        brand=COALESCE($9, brand),
        model=COALESCE($10, model),
        transport_name=COALESCE($11, transport_name),
        km_reading=COALESCE($12, km_reading),
        service_type=COALESCE($13, service_type),
        work_type=COALESCE($14, work_type),
        technician_name=COALESCE($15, technician_name),
        complaint=COALESCE($16, complaint),
        work_done=COALESCE($17, work_done),
        remarks=COALESCE($18, remarks),
        status=COALESCE($19, status),
        labour_charge=COALESCE($20, labour_charge),
        parts_charge=COALESCE($21, parts_charge),
        estimated_amount=COALESCE($22, estimated_amount),
        vehicle_id=COALESCE($23, vehicle_id),
        customer_id=COALESCE($24, customer_id),
        technician_id=COALESCE($25, technician_id),
        service_items=COALESCE($26, service_items),
        updated_at=CURRENT_TIMESTAMP
      WHERE id=$27 RETURNING *
    `;

    const values = [
      sanitizeValue(jobcard_no),
      sanitizeValue(resolvedCustomer?.customer_name || customer_name),
      sanitizeValue(resolvedCustomer?.phone || phone),
      sanitizeValue(address || resolvedCustomer?.address),
      sanitizeValue(resolvedVehicle?.vehicle_number || vehicle_no),
      sanitizeValue(vehicle_type || resolvedVehicle?.fuel_type),
      sanitizeValue(vehicle_make || resolvedVehicle?.vehicle_make || brand),
      sanitizeValue(vehicle_model || resolvedVehicle?.model || model),
      sanitizeValue(vehicle_make || resolvedVehicle?.vehicle_make || brand),
      sanitizeValue(vehicle_model || resolvedVehicle?.model || model),
      sanitizeValue(transport_name), sanitizeValue(km_reading), sanitizeValue(service_type),
      sanitizeValue(work_type), sanitizeValue(technician_name), sanitizeValue(complaint),
      sanitizeValue(work_done), sanitizeValue(remarks), status,
      sanitizeValue(labour_charge), sanitizeValue(parts_charge), sanitizeValue(estimated_amount),
      sanitizeValue(resolvedVehicle?.id || toInteger(vehicle_id)),
      sanitizeValue(resolvedCustomer?.id || toInteger(customer_id)),
      sanitizeValue(toInteger(technician_id)),
      service_items !== undefined ? JSON.stringify(service_items || []) : null,
      id
    ];

    const result = await client.query(query, values);
    if (!result.rows.length) {
      await client.query('ROLLBACK');
      return sendResponse(res, 404, false, 'Job card not found');
    }

    const record = result.rows[0];

    // Normalized Items Sync
    await client.query("DELETE FROM job_card_items WHERE job_card_id = $1", [record.id]);
    if (service_items && Array.isArray(service_items)) {
      for (const item of service_items) {
        await client.query(
          `INSERT INTO job_card_items (job_card_id, item_name, quantity, rate, gst_percent, gst_amount, amount, is_labour)
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
      module_name: 'JobCard',
      action_type: 'UPDATE',
      record_id: record.id,
      title: `Updated JobCard: ${record.jobcard_no}`,
      description: `Job card details for ${record.vehicle_no} were modified.`,
      changed_data: record,
      user_name: 'admin'
    });

    await client.query('COMMIT');
    return sendResponse(res, 200, true, 'Job card updated successfully', record);
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('[Jobcard] update error:', error.message);
    return sendResponse(res, 500, false, error.message);
  } finally {
    if (client) client.release();
  }
};

const deleteJobcard = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    
    const check = await client.query('SELECT jobcard_no FROM jobcards WHERE id = $1', [id]);
    if (!check.rows.length) {
      await client.query('ROLLBACK');
      return sendResponse(res, 404, false, 'Job card not found');
    }
    const jobNo = check.rows[0].jobcard_no;

    await client.query('DELETE FROM jobcards WHERE id = $1', [id]);

    await logHistory({
      client,
      module_name: 'JobCard',
      action_type: 'DELETE',
      record_id: id,
      title: `Deleted JobCard: ${jobNo}`,
      description: `Job card ${jobNo} was removed.`,
      user_name: 'admin'
    });

    await client.query('COMMIT');
    return sendResponse(res, 200, true, 'Job card deleted successfully');
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('[Jobcard] delete error:', error.message);
    return sendResponse(res, 500, false, error.message);
  } finally {
    if (client) client.release();
  }
};

module.exports = { createJobcard, updateJobcard, deleteJobcard, getAllJobcards, getNextJobcardNo };


