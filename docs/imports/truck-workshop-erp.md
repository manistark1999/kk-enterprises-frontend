**Prompt: Full System Integration for Truck / Workshop Management System**

Develop a fully integrated Truck / Workshop Management System where all modules, components, and data flows are automatically connected. The system must ensure seamless communication between Masters, Billing, Inventory, Accounts, Reports, and Settings so that any action in one module automatically updates the relevant sections of the system without manual intervention.

### System Modules

**1. Masters**

* Vehicle Make
* Vehicle Model
* Work Type
* Work Group
* Supplier
* Transport
* Staff

All master data must act as centralized reference data. When new records are created or edited in Masters, they must automatically appear in all relevant modules such as Labour Bill, Estimation, Purchase, Payment, and Reports.

**2. Billing**

* Labour Bill
* Estimation
* Receipt
* Payment

Billing modules must automatically:

* Use data from Masters (Vehicle Make, Work Type, Work Group).
* Generate transaction records.
* Update financial registers such as Cash Register and Bank Ledger.
* Update reports such as Receipt Register, MIS Report, and GST Report.

**3. Inventory**

* Purchase
* Sales
* Stock List
* Stock Adjustment

Inventory operations must automatically update stock levels and generate stock movement records.
For example:

* Purchase increases stock.
* Sales decreases stock.
* Stock Adjustment modifies stock quantity manually.

All stock changes must instantly update the Stock List and Stock Reports.

**4. Accounts**

* Expense Entry
* Staff Advance
* Salary Entry
* Cash Register
* Bank Ledger

Financial transactions must automatically update accounting registers:

* Receipts update the Cash Register.
* Payments update the Bank Ledger.
* Expenses update the Expense Register.
* Salary and Staff Advance update employee financial records.

**5. Reports**

* Alignment Register
* Expense Register
* Receipt Register
* Cash Register
* GST Report
* MIS Report
* Stock Report

Reports must automatically collect and display data from all related transactions without manual data entry. Reports should support filtering by date, status, and financial year.

**6. Settings**

* Company Details
* Backup
* Restore
* Financial Year
* User Management

Settings should manage system configuration and provide options for secure data backup and restoration.

### Core Integration Requirements

1. Ensure all modules share centralized data using a unified state management system or backend database.
2. All dropdowns and references must automatically fetch data from the Masters module.
3. When a transaction is created or updated, all dependent modules (Reports, Registers, Dashboard) must update automatically.
4. Maintain referential integrity so that records used in transactions cannot be deleted without validation.
5. Implement automatic calculations for totals, GST, balances, and stock values.
6. Provide validation for inputs such as GST numbers, mobile numbers, and required fields.
7. Ensure consistent UI layout, alignment, and responsive design across all modules.
8. Provide export and print functionality for invoices and reports.
9. Implement real-time dashboard updates showing revenue, expenses, pending jobs, and stock alerts.
10. Ensure the entire system works as a fully connected workflow where data flows automatically across all modules.

The final system must function as a complete integrated workshop ERP where every module communicates seamlessly and updates instantly whenever new data is created, modified, or deleted.
