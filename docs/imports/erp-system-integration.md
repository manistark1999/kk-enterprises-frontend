My project already has the full sidebar modules created:

Billing

* Labour Bill
* Estimation
* Receipt
* Payment

Inventory

* Purchase
* Sales
* Stock List
* Stock Adjustment
* Alignment

Accounts

* Expense Entry
* Staff Advance
* Salary Entry
* Cash Entry
* Bank Ledger

Reports

* Alignment Register
* Expense Register
* Receipt Register
* Cash Register
* Stock Adjustments Register
* Stock Report
* Stock Register
* GST Report

Masters

* Customer
* Transport
* Vehicle Make
* Work Group
* Work Type
* Supplier
* Staff
* Brand
* Item
* Bank Accounts

Settings

* Company
* Backup
* Restore
* Financial Year
* User Management

Fix the project so the **entire system automatically connects and works together.**

Requirements:

1. Masters data should automatically appear in other modules.

   * Customer → Billing
   * Item / Brand → Inventory
   * Staff → Accounts
   * Bank Accounts → Payment / Bank Ledger

2. Inventory should update automatically.

   * Purchase increases stock
   * Sales decreases stock
   * Stock Adjustment updates stock list

3. Billing should connect to Accounts and Reports.

   * Receipt → Cash Register
   * Payment → Bank Ledger
   * Labour Bill → Reports

4. All Reports must automatically generate from system data.

5. Every button must work:

   * View
   * Edit
   * Delete
   * Print

6. Fix routing, API calls, and database relations so all modules are connected.

7. Do not change the UI design. Only connect the functionality and database logic.

Make the project work as a **complete ERP system where all modules sync automatically.**
