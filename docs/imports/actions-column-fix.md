Fix the **Actions column buttons functionality** so that the **View, Print, and Edit icons work correctly when clicked** for each record in the table. The **existing UI design, colors, layout, alignment, width, height, spacing, and styling must remain exactly the same and must not be modified.**

Functional Requirements:

1. **View Button (Eye Icon)**

   * When the user clicks the **View icon**, the system must open the **full record details** of that specific entry.
   * The details can open in a **popup modal or side panel**.
   * All saved information for that record must be displayed in **read-only mode**.

2. **Print Button (Printer Icon)**

   * When the user clicks the **Print icon**, the system must:

     * Open a **print preview window** for that specific record.
     * Show only the **document/report content**.
     * Exclude **sidebar, navigation menu, and action buttons** from the print layout.
   * The **print dialog must open automatically**.

3. **Edit Button (Pencil Icon)**

   * When the user clicks the **Edit icon**, the system must:

     * Open the **edit form for that specific record**.
     * Pre-fill the form with the existing data.
     * Allow the user to **update and save changes**.

4. **Row-Based Functionality**

   * Each row must perform actions only for **its own record**.
   * Clicking icons in one row must not affect other rows.

5. **Data Synchronization**

   * After editing and saving:

     * The table must **update automatically**.
     * Any connected reports or dashboards must also **refresh with the updated data**.

6. **Error Handling**

   * If a record cannot be loaded, display a **clear error message**.

7. **UI Protection**
   Do **not modify**:

   * Icon design
   * Button size
   * Button position
   * Layout
   * Alignment
   * Margins / Spacing
   * Table structure
   * Colors

Goal:

Ensure the **View, Print, and Edit action buttons work correctly for every row in the table**, performing their respective functions while keeping the **entire existing UI design unchanged**.
