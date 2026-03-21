const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const runMigrations = require('./utils/migrate');

const app = express();

// Configure CORS
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "KK Enterprises API is healthy", timestamp: new Date() });
});

app.get("/", (req, res) => {
  res.send("KK Enterprises Backend running");
});

// Auth
app.use("/api/auth", require("./routes/authRoutes"));

// Core entities
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/transports", require("./routes/transportRoutes"));
app.use("/api/suppliers", require("./routes/supplierRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));

// Vehicle masters
app.use("/api/vehicle-makes", require("./routes/vehicleMakeRoutes"));
app.use("/api/vehicle-registry", require("./routes/vehicleRegistryRoutes"));

// Work masters
app.use("/api/work", require("./routes/workRoutes"));

// Financial
app.use("/api/bank-accounts", require("./routes/bankAccountRoutes"));
app.use("/api/financial-years", require("./routes/financialYearRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/hr", require("./routes/hrRoutes"));

// Items & Stock
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/brands", require("./routes/brandRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));

// Billing
app.use("/api/jobcards", require("./routes/jobcardRoutes"));
app.use("/api/receipts", require("./routes/receiptRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/alignments", require("./routes/alignmentRoutes"));
app.use("/api/estimations", require("./routes/estimationRoutes"));
app.use("/api/labour-bills", require("./routes/labourBillRoutes"));

// Company & Dashboard
app.use("/api/company", require("./routes/companyRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));



// Audit logs (history trail)
app.use("/api/audit-logs", require("./routes/auditRoutes"));

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Execute all pending migrations successfully establishing schemas securely
    await runMigrations();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("[Server] Failed to execute database migrations:", error.message);
    process.exit(1);
  }
};

startServer();
