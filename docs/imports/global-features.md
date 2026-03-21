Enhance the entire workshop management system by implementing **three global features: Refresh, Export to Excel, and Import Data**, and ensure these functions work properly across all modules and pages.

1. **Page Refresh Function**

   * Add a **Refresh button** on every module page (Labour Bill, Receipt, Payment, Purchase, Sales, Stock List, Reports, etc.).
   * When the user clicks the **Refresh button**, the system should automatically reload the **current page data only**, without refreshing the entire website.
   * The refresh action must re-fetch the latest data from the system state or database and update the visible table or form instantly.

2. **Export to Excel Function**

   * Add an **Export to Excel button** on all data pages such as:

     * Labour Bill
     * Receipt Register
     * Expense Register
     * Cash Register
     * Stock List
     * Stock Report
     * Purchase
     * Sales
     * MIS Report
   * When clicked, the system should:

     * Convert the visible table data into a **proper Excel (.xlsx) file**.
     * Maintain correct **column headers, alignment, number format, and currency format**.
     * Automatically **download the Excel file** to the user’s computer.

3. **Import Data Function**

   * Add an **Import button** that allows the user to upload **Excel or CSV files**.
   * The system should:

     * Read the uploaded file.
     * Validate the column structure.
     * Automatically insert the data into the correct module (Stock List, Items, Suppliers, etc.).
   * If errors occur, show a **validation message** explaining the problem.

4. **Global Button Behavior**
   Ensure all buttons across the system work correctly:

   * Refresh Button → Reloads the current module data.
   * Export Button → Downloads data as Excel.
   * Import Button → Uploads and processes files.
   * Save Button → Stores data and updates related reports automatically.

5. **UI Requirements**

   * Place **Refresh, Export, and Import buttons at the top-right corner** of each module page.
   * Buttons must have consistent styling, proper spacing, and clear icons.

Final Result:

The entire system should support **instant page refresh, professional Excel export, and secure data import**, ensuring smooth data management and efficient reporting across the full workshop management platform.
