const { logHistory } = require('./history');

/**
 * Write an audit log entry.
 * Now consolidated to use the 'history' table via logHistory.
 */
const writeAuditLog = async ({ client, tableName, recordId, action, changedData, performedBy = 'system' }) => {
  try {
    await logHistory({
      client,
      module_name: tableName,
      action_type: action,
      record_id: recordId,
      title: `${action} on ${tableName}`,
      description: `Action ${action} performed on ${tableName} record ${recordId}`,
      changed_data: changedData || {},
      user_name: performedBy
    });
  } catch (err) {
    console.error('[AuditLog Migration] Failed to write to history:', err.message);
  }
};

module.exports = { writeAuditLog };
